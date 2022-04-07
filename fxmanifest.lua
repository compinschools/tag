fx_version 'cerulean'
game 'gta5'
ui_page 'main.html'
author 'Bomberman'
description 'Play tag with multiple other players'
version '1.23.0'

resource_type 'gametype' { name = 'Tag' }
files{
    'permissions.json',
    'containerData.json',
}
client_script 'tag_client.js'
client_script 'readytext_client.js'
server_script 'tag_server.js'

