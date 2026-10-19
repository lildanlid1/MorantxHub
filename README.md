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

The release builder checks each protected Lua payload against its original source and checks asset integrity. These tests establish content equivalence, **not** compatibility with every current Roblox game or executor.

See [test candidates and instructions](TESTING.md). Sell Lemons was reported functional in its readable form; the obfuscated build and the other games still require live in-game testing.

Obfuscation is not a DRM system and does not guarantee source secrecy.
