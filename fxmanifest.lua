fx_version 'cerulean'
description 'FiveM Blipsmanager'
author 'Thomas | TS  Scripts'
lua54 'yes'
game 'gta5'

shared_script '@ox_lib/init.lua'

client_scripts {
    'config/client.lua',
    'client/*.lua'
}

ui_page 'web/build/index.html'

files {
	'web/build/*.html',
    'web/build/**/*.js'
}