# EmuTarkov - modded by TheMaoci version 0.2
Escape From Tarkov backend emulator written in JS.
themaoci: i copy all code from polivilas 

# changelog:
- rewrited trader implementations:
  * using recursive attachments assignation
  * traders are readed from client/trading/api/<folder>/<TraderID>.json
  * unable to implement greater than 1 lvl items cuz no dump of it need to be dumped from character with all maxed out (?retry=<1-4> - means level)
- abit changed console display to be more cleared using DisplayStatus(url,body) to display status and data
- some basic functions added like setID() with greater ID increased to 999999999 to lower changes of hitting same id (you can add date like 10012019<randomint> to be more sure it will not 
- rework file placement
  * client/ -> base directory
  * client/game/ -> bot + version + login fake data (not need propably)
  * client/handbook -> template of handbook
  * client/locale/ -> language directory
  * client/menu/locale -> all mainmenu texts language
  * client/profile/<uniqueID>/ -> player data list.json status etc. now <uniqueID> = name
  * client/quest/ -> list of quests
  * client/server -> list of servers
  * client/trading/api
    - getTrader -> traders infos (with specific player data need to be rewrited to diffrent table + taken if u want to made an server
      * allTraders.json -> not used just for refference
    - getTraderAssort -> assortiment list
    - getUserAssortPrice -> price of the items
    - getTradersList.json -> not used just for refference
  * globals.json -> global settings into game you can change exping speed etc.
  * items.json -> all items list - spawn chances etc.
  * languages.json -> aviable languages
  * locations.json -> maps accesing
  * weather.json -> weather settings need to be done in a fly
  
  
# How to use?
Run 'install.bat', then run 'run.bat'.
You will also need to modify one file in your install ->
Open 'client.config.json' in your EFT folder and change 'https://prod.escapefromtarkov.com' to 'http://localhost:1337'.
After you done all that, launch the game and enjoy :)

# Contributions
All bugfixes/contributions/pull requests welcome.

# LICENSE
CC BY-NC-SA 3.0 ( https://creativecommons.org/licenses/by-nc-sa/3.0/ )

# Base Version - Creator 
( https://github.com/polivilas/EmuTarkov ) by polivilas
