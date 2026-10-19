#!/usr/bin/env python3
"""Stage Luau AST/VM protection without modifying the readable source repository.

This script uses a pinned public Obscura checkout. Unsupported/large Luau falls
back to the project's separate encrypted Base85 transport layer; it does not
pretend fallback scripts have been virtualized.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

OLD = "https://raw.githubusercontent.com/lildanlid1/MorantxHub-Scripts/main/"
NEW = "https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/"


def transform(src, dest, engine, timeout, vm_limit, native_limit):
    scripts = [src / "loader.lua", src / "library/MorantxUI.lua",
               *sorted((src / "scripts").glob("*.lua"))]
    luau_compiler = shutil.which("luau-compile")
    details = []
    counts = {"vm": 0, "native": 0, "encrypted-fallback": 0}
    for i, file in enumerate(scripts, 1):
        rel = file.relative_to(src)
        target = dest / rel
        original = file.read_text(encoding="utf-8")
        revised = original.replace(OLD, NEW)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(revised, encoding="utf-8")
        byte_count = len(revised.encode("utf-8"))
        # High-frequency Roblox UI or large files must not be run through a
        # slow interpreted VM; try native AST transforms first.
        modes = (["vm", "native"] if byte_count <= vm_limit else
                 ["native"] if byte_count <= native_limit else [])
        mode = "encrypted-fallback"
        errors = []
        for candidate in modes:
            output = target.with_suffix(".candidate.lua")
            try:
                args = [
                    sys.executable, str(engine / "main.py"), str(target),
                    "--mode", candidate, "--quiet", "-o", str(output),
                ]
                if candidate == "vm":
                    args.extend(["--vm-hardening", "client-max", "--vm-cached"])
                proc = subprocess.run(args, text=True, capture_output=True,
                                      timeout=timeout, check=False, cwd=engine)
                if proc.returncode != 0:
                    raise RuntimeError((proc.stderr or proc.stdout or
                                       f"status={proc.returncode}")[-350:])
                if not output.is_file() or output.stat().st_size < 30:
                    raise RuntimeError("No usable output")
                # Compile-check with genuine Luau when available; failure
                # downgrades the script rather than silently shipping bad code.
                if luau_compiler:
                    syntax = subprocess.run([luau_compiler, str(output)],
                                            capture_output=True, text=True,
                                            timeout=30, check=False)
                    if syntax.returncode:
                        raise RuntimeError("Luau compile: " +
                                           (syntax.stderr or syntax.stdout)[-250:])
                output.replace(target)
                mode = candidate
                break
            except (OSError, RuntimeError, subprocess.TimeoutExpired) as err:
                errors.append(f"{candidate}: {str(err)[:350]}")
            finally:
                output.unlink(missing_ok=True)
        counts[mode] += 1
        details.append({"path": rel.as_posix(), "mode": mode,
                        "sourceBytes": byte_count, "releaseInputBytes":
                        target.stat().st_size, "notes": errors})
        if i % 20 == 0 or i == len(scripts):
            print(f"Staged {i}/{len(scripts)}: {counts}", flush=True)
    return details, counts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("obscura", type=Path)
    parser.add_argument("--timeout", type=int, default=35)
    parser.add_argument("--vm-max-bytes", type=int, default=90000)
    parser.add_argument("--native-max-bytes", type=int, default=320000)
    args = parser.parse_args()
    src, dest, engine = (p.resolve() for p in
                         (args.source, args.destination, args.obscura))
    if not (src / "games.json").is_file():
        parser.error("Source games.json is missing")
    if not (engine / "main.py").is_file():
        parser.error("Obscura checkout missing main.py")
    if dest == src or dest in src.parents or src in dest.parents:
        parser.error("Destination must be separate from source")
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    details, counts = transform(src, dest, engine, args.timeout,
                                args.vm_max_bytes, args.native_max_bytes)
    report = {
        "engine": "Obscura v1.1.0, pinned checkout",
        "layers": "VM/native AST then per-script encrypted Base85, shuffled chunks",
        "modeCounts": counts,
        "totalLua": len(details),
        "unverifiedInRoblox": True,
        "files": details,
    }
    (dest / "protection-report.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "files"}, indent=2))
    if counts["vm"] + counts["native"] == 0:
        raise SystemExit("No AST/VM protections succeeded. Refusing to label the release VM-protected.")


if __name__ == "__main__":
    main()
