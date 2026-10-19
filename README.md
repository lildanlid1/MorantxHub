# MorantxHub

Protected public release of **188 Roblox game scripts**, plus the Universal fallback. Every published Lua script has a readable counterpart in [MorantxHub-Scripts](https://github.com/lildanlid1/MorantxHub-Scripts).

## Loader

```lua
loadstring(game:HttpGet("https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/loader.lua"))()
```

The loader chooses the appropriate script using place/universe IDs and a game-name fallback, then loads the matching MorantxUI interface.

| Path | Purpose |
| --- | --- |
| `loader.lua` | Protected game-detection loader |
| `scripts/` | Protected game scripts and compatibility shims |
| `library/MorantxUI.lua` | Protected shared UI |
| `games.json` | Game and ID mappings |
| `games.md` | Supported games and feature descriptions |
| `assets/` | Original images, icons and attribution |
| `TESTING.md` | Known verification limits and in-game testing checklist |

## Source and release integrity

`MorantxHub-Scripts` contains the **readable source**. `MorantxHub` contains the **obfuscated distribution**. Script contents are preserved through the encoding layer, with remote source URLs redirected to this release repository so the published loader does not require access to private source code.

The published Lua files use **encrypted Base85 payloads, shuffled 4 KB blocks, randomized identifiers and keys, and a custom compressed LZ instruction stream**. Each protected block was checked against the source bytes during generation. Eight representative GitHub-hosted files were also independently decoded and compared byte-for-byte against the readable source. These checks establish data equivalence, **not** live Roblox compatibility.

See [test candidates and instructions](TESTING.md). Sell Lemons was reported functional in its readable form; the obfuscated build and the other games still require live in-game testing.

Obfuscation is not a DRM system and does not guarantee source secrecy.

## Advanced obfuscation pipeline

The **next release pipeline** stages source with a pinned [Obscura Luau obfuscator](https://github.com/vo3pal/obscura) (MIT-licensed) before encrypting and scrambling each Lua payload. VM-mode output is used only when the source parses and compiles; larger or unsupported Luau uses a separately reported native-AST or encrypted transport fallback. This is **not** a Luraph build, and not every file can be guaranteed to be virtualized.

Build sources: [`tools/vm_stage.py`](tools/vm_stage.py), [`tools/build.mjs`](tools/build.mjs), and [`tools/verify.mjs`](tools/verify.mjs). Per-file results will be published in `protection-report.json` **only after the pipeline succeeds**. The currently published files are **not full-program Luau VM-obfuscated**. A future AST/VM workflow is configured separately, but it has not successfully produced a verified VM release. The current direct-upload validation is recorded in [VALIDATION.json](VALIDATION.json).

For a private [readable source repository](https://github.com/lildanlid1/MorantxHub-Scripts), create an Actions secret named `SOURCE_REPO_TOKEN` in this release repository using a fine-grained token limited to that source repository with **Contents: Read** permission. GitHub Actions must also have an available runner; a zero-step run cannot execute the build.
