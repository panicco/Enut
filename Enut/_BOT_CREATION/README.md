# Bot Creation script v0.2
###### Script to helps in creation bots

_Folders:_
```
_bots from Йурасзка - contain custom marksman bots (count 5)
_bots from polivilas - contains base assault bots (count 19)
```

- Info:
  - you just need to create user profile with equipment and other needed data such as health changes (if any) and customization changes (if any)
  - use `InsuredItems": []},` to add new like `\n` at the end of it
  - BotProfile -> you put there an list.json from player profile
  - Start script from file  run.bat
  - Configuration of bot making located in same directory with name Settings.json

```
{
	"BotType": "assault",
	"BotDifficulty": "easy",
	"RandomLookForSavage": true,
	"IsThatBoss": false,
	"BossName": "Reshala",
	"DumpToConsoleOnly": false,
	"ClearFileB4dump": true
}
```

##### More explanation about the code working

step by step:
* grab settings from line 44 and below
* display them using console.log
* grab files from `BotProfile` folder and make table with names
* loop through the files
* creating randomize Customizablez from default scavs if `randomizeS` == true
* grab russian name and surname from website if `isBoss` == false if true grab BossName as name
* delete items which has slotId equals to hideout
* create unique ID's to equipment/stash/and other needed shit
* replace it in inventory and _id of bot to make it unique
* create json table for one record and drop it in file
* if `saveSingle` == true deletes all Output.json content on first record and push new records
* on all done push `-> Finished Creation of`
