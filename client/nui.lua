RegisterNuiCallback('hideFrame', function(data, cb)
    ShowNUI(data.name, false)
    cb(true)
end) 

ShowNUI = function(action, shouldShow)
    SetNuiFocus(shouldShow, shouldShow)
    SendNUIMessage({ action = action, data = shouldShow })
end

SendNUI = function(action, data)
    SendNUIMessage({ action = action, data = data })
end