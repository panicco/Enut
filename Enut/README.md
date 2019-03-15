
# EmuTarkov - modded by TheMaoci version 0.6
##### This version could be broken untill its reach 1.0 version or greater - im live working on it cause of changing places
```
Escape From Tarkov backend emulator written in JS.
TheMaoci: i copy base code from polivilas first version + extends it abit ;) 
Additionally tries to hold it up to date with polivilas fixes
```

# ChangeLog:
##### V0.6
- Polivilas Trader - deleted not preset weapons magazines and ammo (all displayed in TheMaoci Trader with preset weapons)
- _MAOCI_deleteItemsFromTrader.bat - this deletes items from ToDelete/list.json from player profile and trader 
- disable not working maps from locations.json
- folder "files" stores now all traders icons
- added "Help info.txt" to insert there informations i will need in the future
- created Clear Profile files which u can use to start from scratch located in mail folder "clearProfile.7z"
- starting recreation of other bots based on memory ;) (Marksman(sniper), Bully, Killa, BossSquad, pmcBot's - with all difficulties so game will not throw an errors) - after this i will made presets of bots to each map so it will for sure not throw errors + bots will be very hard to kill ;) ya know EQ
- Examine non performant script implemented
- no mo unhandled exception if `?retry=XXXX happend`
- pseudo updated images (just use copy paste function with some checks will replace it later)
- default pokets "557ffd194bdc2d28148b457f" boss pokets "5af99e9186f7747c447120b8"
- one more item added "MaociPoketsVersion1" pokets with 1x2 x2 and 1x1 x2 pokets
- added list of available profiles specified by names to enter in email area
- fixed trader buying / attachments adding to bought gun - polivilas performance script
- fixed deleting items with childs - by polivilas
- TRADERS:
 * traders icons now working and will be automaticly added into temp folder
 * trader Polivilas - has every item ingame (all accesable)
 * trader TheMaoci - has all guns, magazines, ammo (with premaded guns to use)
 * trader Jeager - has unreleased items will add more later
- login changes - use email/name as specified below to get access to premaded accounts
 * by default game uses maoci folder
 * more added: name, name2, name3, nameru, windel (if u want to add more use clearProfile.7z)
 * now i dont use client/game for storing login data it has been moved to profile folder
- starting fixing examine
- non released weapons added into global items list (aka new items.json)
- better setID(0 function with date and random int as specified in older changelog
- some bugs apear in switching levels from none to crown ( its been causing because "loyal_level_items": {} not added to trader)

##### V0.2 - V0.5
- client/game/bot trying to write automated generation of bots (propably fails but sript is still in code) v0.5
- rewrited trader implementations:
  * using recursive attachments assignation
  * traders are readed from client/trading/api/<folder>/<TraderID>.json
  * unable to implement greater than 1 lvl items cuz no dump of it need to be dumped from character with all maxed out (?retry=<1-4> - means retryies of retrived data meh...)
- abit changed console display to be more cleared using DisplayStatus(url,body) to display status and data
- some basic functions added like setID() with greater ID increased to 999999999 to lower changes of hitting same id (you can add date like 10012019<randomint> to be more sure it will not 
- rework file placement
  * client/ -> base directory
  * client/game/ -> bot + version + login fake data (login data transfered to profile in v0.5)
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
  
  
## How to use?
Run 'install.bat', then run 'run.bat'.
You will also need to modify one file in your install ->
Open 'client.config.json' in your EFT folder and change 'https://prod.escapefromtarkov.com' to 'http://localhost:1337'.
After you done all that, launch the game and enjoy :)

## Contributions
All bugfixes/contributions/pull requests welcome.

## LICENSE
CC BY-NC-SA 3.0 ( https://creativecommons.org/licenses/by-nc-sa/3.0/ )

## Base Version - Creator 
( https://github.com/polivilas/EmuTarkov ) by polivilas

#### Thanks to:
- Windel
- MrRuss
- Polivilas ( as a creator and a great guy )
- Йурасзка ( for testing and nice ideas )
- propably UC but who knows
