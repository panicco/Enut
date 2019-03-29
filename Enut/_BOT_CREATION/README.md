#Bot Creation Tool
Created by: Maoci
Modified by: panickode

#How To Use
```
1)Create character loadout in game
2)Remove all items from stash (can leave cash here)
3)back to main menu, exit game
4)Copy profile to BotProfile folder (client/profile/list.json)
5)Edit Settings as needed
6)start run.bat
7)output.json(new bot) / randomz.json(id tags randomized)
```

#Known Issues
```
1)PanicRandom will only work if output/randomz file is blank and exsists
	- Need to create files if not there
	- Clear files or learn to read breaks between bots

2)Unable to clear stash
	- Script working to find header items in stash and remove
	- Not able to use hideout id's to removed other items (hideout _id to removed item by parentId)
		- need to list _id's to var then itterate through list and remove matching parentId
		
```

#Change Log
```
- Updated hideout removal to be recursive
	- issue: need to remove items based on hideout id's - stash still needs to be cleared
	
- Removed Header Id changes for equiptment,stash,etc.
	-Id's need to be unique and matching
	
- Added Id Ranomization and replacement
	-PanicRandom addition added. Bot Id's and matching ids will be replaced so all top ids are unique
````