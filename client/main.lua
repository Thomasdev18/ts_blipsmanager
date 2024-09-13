local config = require 'config.client'
local blips = {}

---@class Message
---@field Action: string
---@field Data: any 

---@param message message
---@param shouldShow? boolean
local HandleNUI = function(message, shouldShow)
    if not(type(message) == 'table') then return end
    shouldShow = shouldShow or false
    SetNuiFocus(shouldShow, shouldShow)
    SendNUIMessage(message)
end

local getBlipEnabled = function(k)
    if config == nil or config.blips == nil or config.blips[k] == nil then
        return false
    end

    local kvp = GetResourceKvpString(tostring(k))
    return (kvp ~= nil and kvp == 'true') or (not kvp and config.blips[k].defaultEnabled)
end

local getIndividualBlipEnabled = function(category, index)
    local key = category .. '_' .. tostring(index)
    local kvp = GetResourceKvpString(key)
    return (kvp ~= nil and kvp == 'true')
end

local createBlip = function(coords, sprite, display, scale, color, label)
    local blip = AddBlipForCoord(coords.x, coords.y, coords.z)
    SetBlipSprite(blip, sprite)
    SetBlipDisplay(blip, display)
    SetBlipAsShortRange(blip, true)
    SetBlipScale(blip, scale)
    SetBlipColour(blip, color)
    BeginTextCommandSetBlipName("STRING")
    AddTextComponentSubstringPlayerName(label)
    EndTextCommandSetBlipName(blip)
    return blip
end

local refreshBlips = function ()
    SetTimeout(1000, function()
        for _, blipList in pairs(blips) do
            for _, blip in pairs(blipList) do
                RemoveBlip(blip)
            end
        end
        blips = {}

        for k, v in pairs(config.blips) do
            blips[k] = {}
            local categoryEnabled = getBlipEnabled(k)

            for index, coords in pairs(v.locations) do
                local individualEnabled = getIndividualBlipEnabled(k, index)

                if individualEnabled then
                    blips[k][index] = createBlip(coords, v.sprite, v.display, v.scale, v.color, v.label .. ' ' .. tostring(index))
                elseif categoryEnabled then
                    blips[k][index] = createBlip(coords, v.sprite, v.display, v.scale, v.color, v.label .. ' ' .. tostring(index))
                else
                    if blips[k][index] then
                        RemoveBlip(blips[k][index])
                        blips[k][index] = nil
                    end
                end
            end
        end
    end)
end

CreateThread(refreshBlips)

RegisterNUICallback('blipVisibility', function(data)
    SetResourceKvp(data.id, tostring(data.enable))
    refreshBlips()
end)

RegisterNuiCallback('hideFrame', function(data, cb)
    HandleNUI({action = data.name, data = false})
    cb(true)
end)

RegisterCommand('blips', function()
    local categorizedBlips = {}

    for k, v in pairs(config.blips) do
        if not categorizedBlips[k] then
            categorizedBlips[k] = {
                label = v.label,
                enabled = getBlipEnabled(k),
                id = k,
                blips = {}
            }
        end

        for i, _ in ipairs(v.locations) do
            local blipId = k .. '_' .. tostring(i)
            local individualEnabled = getIndividualBlipEnabled(k, i)

            table.insert(categorizedBlips[k].blips, {
                id = blipId,
                label = v.label .. ' ' .. tostring(i),
                enabled = individualEnabled or categorizedBlips[k].enabled
            })
        end
    end
    HandleNUI({action = 'blipsMenu', data = categorizedBlips})
    HandleNUI({action = 'setVisibleMenu', data = true}, true)
end)
