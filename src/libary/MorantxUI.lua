-- Luminous Hub transition entry. This module contains no legacy GUI renderer.
local env=(getgenv and getgenv()) or _G
local loader=env.__LuminousHubLoad
assert(type(loader)=="function","Luminous Hub loader must initialize before game UI")
local ui=loader()
assert(type(ui)=="table" and type(ui.GameAPI)=="function","Luminous Hub is unavailable")
ui.Compatibility=ui.GameAPI
ui.MorantxUIRecoveredBridge=ui.GameRecoveredBridge
ui.TemplateId="MorantxUI" -- transition check required by the previous loader
return ui
