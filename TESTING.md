# MorantxHub release verification

## Current status

This repository contains the obfuscation builder and a GitHub Actions publishing workflow. A build passing the encoder/decoder test does not prove Roblox gameplay works. The publisher must complete successfully before scripts are distributed.

## Live game test queue

| Game | Focus | Status |
| --- | --- | --- |
| Sell Lemons | Baseline loader, UI, and one working toggle | Reported working before release obfuscation; re-test required |
| Sell Ores | Detection, UI, collection automation | Unverified |
| RIVALS | Game-specific selection (not Universal), UI, unload | Unverified |
| Blox Fruits | All supported sea place IDs, character initialization, UI | Unverified |
| Anime Dice | UI load, settings, toggles | Unverified |
| Steal An Egg | Egg detection, pickup, delivery, speed controls | Unverified |
| Arsenal | UI load, aim/visual feature, unload | Unverified |
| Flee the Facility | UI load and game state detection | Unverified |
| Grow a Beehive | Instance availability and automation start/stop | Unverified |
| Prospecting | Loading and one feature against current remotes | Unverified |

## Minimum acceptance checks

1. Confirm the loader picks the intended script rather than Universal.
2. Confirm the game-specific UI opens exactly once with no ordinary/default UI duplication.
3. Enable one non-destructive feature; verify the effect and disable it.
4. Check the executor console and the Morantx loader's lastError state.
5. Repeat using the release repository's obfuscated URL.
6. Verify scripts do not fetch code from the source repository, particularly before changing the source to private.
7. Confirm no keys, secrets, or private source URLs are required at runtime.

Never claim a script passed merely because it compiled, decoded, or displayed a UI.
