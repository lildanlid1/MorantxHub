# Live-game compatibility testing

This repository publishes **188 game-specific scripts plus Universal**, corresponding to the readable [source repository](https://github.com/lildanlid1/MorantxHub-Scripts). The build/verification tooling checks encoded source integrity and assets; a human must still confirm live-game behavior.

| Game | Priority | What to test | Live status |
| --- | --- | --- | --- |
| **Sell Lemons** | Baseline | Loader, MorantxUI, purchase/sell automation, toggle shutdown | Readable version reported working; protected version not yet live-tested |
| **Sell Ores** | High | Identification, UI, selling automation, error handling | Unverified |
| **RIVALS** | High | Correct game selection, UI, unload/cleanup | Unverified |
| **Blox Fruits** | High | Each supported sea/place ID, character initialization, UI, non-destructive options | Unverified |
| **Anime Dice** | High | UI startup, settings and automation toggles | Unverified |
| **Steal An Egg** | High | Item pickup/return and toggle shutdown | Unverified |
| **Arsenal** | Medium | UI initialization, one visual feature, unload | Unverified |
| **Flee the Facility** | Medium | Game state/role detection and UI | Unverified |
| **Grow a Beehive** | Medium | Load/enable/disable loop, missing-instance handling | Unverified |
| **Prospecting** | Medium | UI and current remote compatibility | Unverified |

## Testing procedure

1. Open the named Roblox game and note the current PlaceId and GameId.
2. Use the public **MorantxHub** loader URL shown in the README.
3. Check the game-specific script loads rather than the Universal fallback.
4. Confirm MorantxUI displays **once** and controls are responsive.
5. Test one non-destructive feature. Enable it, verify the expected behavior, then disable it.
6. Check the executor console for warnings/errors. When available, inspect `getgenv().__MorantxLoaderState.lastError`.
7. Test re-execution, unload, and respawn as appropriate. Verify toggles do not leave runaway loops.
8. Report the game, PlaceId/GameId, observed behavior, executor, and exact first error line.

**Limitations:** GitHub-based source/decoder tests cannot run Roblox services, remotes, UI, character lifecycle events, or executor-specific APIs. Unverified entries should not be advertised as fully working.
