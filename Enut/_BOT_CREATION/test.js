/*
Created by TheMaoci to be unreadable ;) - i mean, i dont use code formating there like, i used to normally 
it must work not be beauty.

*** Version 0.2 ***
*/

'use strict'
var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
} // stolen off StackOverflow
function setID(){
	return getRandomInt(10000, 99999).toString(); 
}

const getScript = (url) => {
    return new Promise((resolve, reject) => {
        const http  = require('http'),
              https = require('https');
        let client = http;
        if (url.toString().indexOf("https") === 0) {
            client = https;
        }
        client.get(url, (resp) => {
            let data = '';
            // Connect chunk to data
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                resolve(data);
            });

        }).on("error", (err) => {
            reject(err);
        });
    });
};

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

//main script starts here
(async (url) => {
	
	var Settings = JSON.parse(ReadJson('Settings.json'));
	
	var botType 	= Settings.BotType;
	var botDiff 	= Settings.BotDifficulty;
	var randomizeS	= Settings.RandomLookForSavage;
	var isBoss		= Settings.IsThatBoss;
	var BossName	= Settings.BossName;
	var toConsole	= Settings.DumpToConsoleOnly;
	var saveSingle	= Settings.ClearFileB4dump;
	console.log("Settings:");
	console.log("botType = " + botType + " / botDiff = " + botDiff + " / randomizeS= " + randomizeS + " / isBoss = " + isBoss + ((isBoss)?(" / BossName = " + BossName):"") + " / toConsole = " + toConsole + " / saveSingle = " + saveSingle);

// - list of list.jsons	
	var profilesAvailable = require('fs');
	var Folders = profilesAvailable.readdirSync('BotProfile/');
	var listFiles = [];
	for(var i in Folders){
			listFiles[i] = Folders[i];
	}
// finished list
var count = 0;
for(var i in listFiles){
console.log("} Start creating for file: " + listFiles[i])
	if(randomizeS){
		//for savages only
			var voice 	= "Scav_" + getRandomInt(1, 6);
			var head	= "assets/content/characters/character/prefabs/wild_head_" + getRandomInt(1, 3) + ".bundle";
		var randomBody = getRandomInt(0, 3);
			var body	= "assets/content/characters/character/prefabs/wild_body" + ((randomBody == 0)?"":("_" + randomBody)) + ".bundle";
			var hand	= "assets/content/hands/wild/wild_body" + ((randomBody == 0)?"":("_" + randomBody)) + "_firsthands.bundle";
		var randomFeets = getRandomInt(0, 2);
			var legs	= "assets/content/characters/character/prefabs/wild_feet" + ((randomFeets == 0)?"":("_" + randomFeets)) + ".bundle"
		var prepareCustomization = '{"Head": {"path": "' + head + '","rcid": null},"Body": {"path": "' + body + '","rcid": ""},"Feet": {"path": "' + legs + '","rcid": null},"Hands": {"path": "' + hand + '","rcid": null}},';
	} else {
		var voice = "";
		var prepareCustomization = "";
	}
	if(!isBoss){
		var botName = await getScript('https://uinames.com/api/?gender=male&region=Russia');
		botName = JSON.parse(botName);
		botName = botName.name + " " + botName.surname;
	} else {
		var botName = BossName;
	}
	var profileList = JSON.parse(ReadJson('BotProfile/' + listFiles[i]));
	var outJson = ReadJson('Output.json');
	var hloop = true; //added for hideout
	
	profileList = profileList.data[1];
	//delete all from stash not recursive - bullshit code should be expanded later
		//////////////PANICKODE /////////////////
		//Add recursive and collect id tags -REMOVE ALL STATSH ITEMS (doesnt work on some items)
	while ( hloop == true) {
		for (var tmpKey in profileList.Inventory.items) {	
			if (profileList.Inventory.items[tmpKey].slotId == "hideout") {
				var hideId = profileList.Inventory.items[tmpKey]._id;
				profileList.Inventory.items.splice(tmpKey, 1);
				//console.log("Hideout Found: " + hideId);
				//need to create list here of id's (to match to parentId and splice)
				hloop = true;
			}
			else {
				console.log("No Hideouts found");
				hloop = false;
			}
		}
	}

	//deleted from stash - "hideout"
	var out='';
	var UniqID = "bot_" + botType + "_" + botDiff + "" + setID();
	
//Should not edit header tags without matching to rest of bot
//Removed for now. ids will remain : use panicRandom 
	
	//var hash_eq = profileList.Inventory.equipment;
	//var hash_st = profileList.Inventory.stash;
	//var hash_qr = profileList.Inventory.questRaidItems;
	//var hash_qs = profileList.Inventory.questStashItems;
	//var new_hash_eq = UniqID + "_EQ";
	//var new_hash_st = UniqID + "_ST";
	//var new_hash_qr = UniqID + "_QR";
	//var new_hash_qs = UniqID + "_QS";
	//profileList.Inventory.equipment = new_hash_eq;
	//profileList.Inventory.stash = new_hash_st;
	//profileList.Inventory.questRaidItems = new_hash_qr;
	//profileList.Inventory.questStashItems = new_hash_qs;

	var prepareInventory = JSON.stringify(profileList.Inventory);

	if(voice == "")
		voice = profileList.Info.Voice;
	if(prepareCustomization == "")
		prepareCustomization = JSON.stringify(profileList.Customization) + ", ";

	//prepareInventory = prepareInventory.replace(hash_eq, new_hash_eq).replace(hash_st, new_hash_st).replace(hash_qr, new_hash_qr).replace(hash_qs, new_hash_qs);
	out += '{"_id": "' + UniqID + '", "aid": 0,"savage": null,"Info": {' + 
	'"Nickname": "' + botName + '","LowerNickname": "","Side": "Savage","Voice": "' + voice + '","Level": 1,"Experience": 0,"RegistrationDate": 0,"GameVersion": "","AccountType": 0,"MemberCategory": 0,"lockedMoveCommands": false,"LastTimePlayedAsSavage": 0,' + 
	'"Settings":{"Role": "' + botType + '","BotDifficulty": "' + botDiff + '","Experience": -1},"NeedWipe": false,"GlobalWipe": false,"NicknameChangeDate": 0},' + 
	'"Customization": ' + prepareCustomization + ' ' + '"Health": ' + JSON.stringify(profileList.Health) + ',"Inventory": ' + prepareInventory + ',"Skills": {"Common": null,"Mastering": [],"Points": 0},"Stats": {"SessionCounters": {"Items": []},"OverallCounters": {"Items": []}},"Encyclopedia": null,"ConditionCounters": {"Counters": []}, "BackendCounters": {},"InsuredItems": []}';
	//out += ']}';
	if(saveSingle && count == 0)
		outJson = out;
	else
		outJson = ((outJson != "")?(outJson + ", "):"") + out
	if(toConsole)
		console.log(out);
	else
		fs.writeFileSync('Output.json', outJson, 'utf8');
	count++;//basic counter ;) - could help to set things up !
	
	//////////////PANICKODE /////////////////
	//////////////START TO RANDOMIZE IDS (only working if output/randomz.jsn file is blank before start??)
	var profileList2 = JSON.parse(ReadJson('Output.json'));
	var out2='';
	var prepareInventory2 = JSON.stringify(profileList2.Inventory);
	
	
	//ID TO REPLACE
		//MAIN ID
		var mainid = profileList2.Inventory.items[0]._id;
		var nmainid = randomString(24, 'abcdef1234567890');
		prepareInventory2 = prepareInventory2.replace(new RegExp(mainid, 'g'), nmainid);
		
		//Collect Id Numbers and Generate New ones
		for (var tmpKey2 in profileList2.Inventory.items) {	
			//Pockets id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Pockets") {
				var pocketid = profileList2.Inventory.items[tmpKey2]._id;
				var npocketid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(pocketid, 'g'), npocketid);
				//pockets parent id
				var pocketPid = profileList2.Inventory.items[tmpKey2].parentId;
			}
			//FirstPrimaryWeapon Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "FirstPrimaryWeapon") {
				var FPWid = profileList2.Inventory.items[tmpKey2]._id;
				var nFPWid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(FPWid, 'g'), nFPWid);
				//FirstPrimaryWeapon parent id
				var FPWPid = profileList2.Inventory.items[tmpKey2].parentId;
			}
			//TacticalVest Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "TacticalVest") {
				var TVid = profileList2.Inventory.items[tmpKey2]._id;
				var nTVid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(TVid, 'g'), nTVid);
				//TacticalVest parent id
				var TVPid = profileList2.Inventory.items[tmpKey2].parentId;
			}
			//ArmorVest Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "ArmorVest") {
				var AVid = profileList2.Inventory.items[tmpKey2]._id;
				var nAVid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(AVid, 'g'), nAVid);
				//ArmorVest parent id
				var AVPid = profileList2.Inventory.items[tmpKey2].parentId;
			}
			//Backpack Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Backpack") {
				var BPid = profileList2.Inventory.items[tmpKey2]._id;
				var nBPid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(BPid, 'g'), nBPid);
				//Backpack parent id
				var BPPid = profileList2.Inventory.items[tmpKey2].parentId;
			}
			//Headwear Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Headwear") {
				var HWid = profileList2.Inventory.items[tmpKey2]._id;
				var nHWid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(HWid, 'g'), nHWid);
				//Headwear parent id
				var HWPid = profileList2.Inventory.items[tmpKey2].parentId;	
			}
			//FaceCover Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "FaceCover") {
				var FCid = profileList2.Inventory.items[tmpKey2]._id;
				var nFCid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(FCid, 'g'), nFCid);
				//FaceCover parent id
				var FCPid = profileList2.Inventory.items[tmpKey2].parentId;	
			}
			//Scabbard Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Scabbard") {
				var SCid = profileList2.Inventory.items[tmpKey2]._id;
				var nSCid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(SCid, 'g'), nSCid);
				//Scabbard parent id
				var SCPid = profileList2.Inventory.items[tmpKey2].parentId;
			}
			
			//Possible new ids needed
			//Maby Still need Mod_**
			//Maby Need to Random Cartridges
			//maby need to random 1-10 (slotid:1-10)
			//maby need to random pocket1-10
			
		}
		//output all ID Results - DEBUGGING
		//console.log("main                     " + mainid);
		//console.log("new main                 " + nmainid);
		//console.log("pocket                   " + pocketid);
		//console.log("new pocket               " + npocketid);
		//console.log("pocketParent             " + pocketPid);
		//console.log("FirstPrimaryWeapon       " + FPWid);
		//console.log("new FirstPrimaryWeapon   " + nFPWid);
		//console.log("FirstPrimaryWeaponParent " + FPWPid);
		//console.log("TacticalVest             " + TVid);
		//console.log("new TacticalVest         " + nTVid);
		//console.log("TacticalVest Parent      " + TVPid);
		//console.log("ArmorVest                " + AVid);
		//console.log("new ArmorVest            " + nAVid);
		//console.log("ArmorVest Parent         " + AVPid);
		//console.log("Backpack                 " + BPid);
		//console.log("new Backpack             " + nBPid);
		//console.log("Backpack Parent          " + BPPid);
		//console.log("Headwear                 " + HWid);
		//console.log("new Headwear             " + nHWid);
		//console.log("Headwear Parent          " + HWPid);
		//console.log("FaceCover                " + FCid);
		//console.log("new FaceCover            " + nFCid);
		//console.log("FaceCover Parent         " + FCPid);
		//console.log("Scabbard                 " + SCid);
		//console.log("new Scabbard             " + nSCid);
		//console.log("Scabbard Parent          " + SCPid);
		
		//Re prep bot file	
		out2 += '{"_id": "' + UniqID + '", "aid": 0,"savage": null,"Info": {' + 
		'"Nickname": "' + botName + '","LowerNickname": "","Side": "Savage","Voice": "' + voice + '","Level": 1,"Experience": 0,"RegistrationDate": 0,"GameVersion": "","AccountType": 0,"MemberCategory": 0,"lockedMoveCommands": false,"LastTimePlayedAsSavage": 0,' + 
		'"Settings":{"Role": "' + botType + '","BotDifficulty": "' + botDiff + '","Experience": -1},"NeedWipe": false,"GlobalWipe": false,"NicknameChangeDate": 0},' + 
		'"Customization": ' + prepareCustomization + ' ' + '"Health": ' + JSON.stringify(profileList.Health) + ',"Inventory": ' + prepareInventory2 + ',"Skills": {"Common": null,"Mastering": [],"Points": 0},"Stats": {"SessionCounters": {"Items": []},"OverallCounters": {"Items": []}},"Encyclopedia": null,"ConditionCounters": {"Counters": []}, "BackendCounters": {},"InsuredItems": []}';
		//write new file
		fs.writeFileSync('randomz.json', out2, 'utf8');
	
}
console.log("-> Finished Creation of " + count + " bots.")

})('https://uinames.com/');