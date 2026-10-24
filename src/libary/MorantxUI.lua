-- Luminous Hub transition entry; no legacy renderer is bundled here.
local env=(getgenv and getgenv()) or _G
local getUI=env.__LuminousHubLoad
assert(type(getUI)=="function","Run the Luminous Hub loader before game scripts")
local ui=getUI()
assert(type(ui)=="table" and type(ui.GameAPI)=="function","Luminous Hub is not available")
if not ui.__LuminousWindowNames then
    ui.__LuminousWindowNames=true
    local original=ui.CreateWindow
    function ui:CreateWindow(options)
        options=options or {}
        local oldName=tostring(options.Name or options.name or options.Title or "")
        if oldName:find("Morant",1,true) then
            local gameName=oldName:match("|%s*(.+)$")
            local converted={}
            for key,value in pairs(options) do converted[key]=value end
            converted.Name="Luminous Hub"
            converted.BrandSubtitle=converted.BrandSubtitle or gameName or "Control Center"
            options=converted
        end
        return original(self,options)
    end
end
ui.Compatibility=ui.GameAPI
ui.MorantxUIRecoveredBridge=ui.GameRecoveredBridge
ui.TemplateId="MorantxUI" -- only for checks in the previous loader
return ui
