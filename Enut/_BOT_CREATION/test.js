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
	var PanicRandom = Settings.PanicRandom; //PK
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

//PK :: Clear Files Before Run
if(PanicRandom == true){
	var emptyf		= "";
	fs.writeFileSync('randomz.json', emptyf, 'utf8');
	fs.writeFileSync('Output.json', emptyf, 'utf8');
}
var count = 0;
for(var i in listFiles){
	
	if(PanicRandom == true){
		//PK Clear Output Between Bots
		fs.writeFileSync('Output.json', emptyf, 'utf8');
	}
	
	
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
	var outJson2 = ReadJson('randomz.json');
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
				//console.log("No Hideouts found");
				hloop = false;
			}
		}
	}

	//deleted from stash - "hideout"
	var out='';
	var UniqID = "bot_" + botType + "_" + botDiff + "" + setID();
	
	//Switch Added for PanicRandom
	if(PanicRandom == false) {
	
		var hash_eq = profileList.Inventory.equipment;
		var hash_st = profileList.Inventory.stash;
		var hash_qr = profileList.Inventory.questRaidItems;
		var hash_qs = profileList.Inventory.questStashItems;
		var new_hash_eq = UniqID + "_EQ";
		var new_hash_st = UniqID + "_ST";
		var new_hash_qr = UniqID + "_QR";
		var new_hash_qs = UniqID + "_QS";
		profileList.Inventory.equipment = new_hash_eq;
		profileList.Inventory.stash = new_hash_st;
		profileList.Inventory.questRaidItems = new_hash_qr;
		profileList.Inventory.questStashItems = new_hash_qs;
		
		var prepareInventory = JSON.stringify(profileList.Inventory);
		prepareInventory = prepareInventory.replace(hash_eq, new_hash_eq).replace(hash_st, new_hash_st).replace(hash_qr, new_hash_qr).replace(hash_qs, new_hash_qs);
	}
	else {
		var prepareInventory = JSON.stringify(profileList.Inventory);
	}
	
	if(voice == "")
		voice = profileList.Info.Voice;
	if(prepareCustomization == "")
		prepareCustomization = JSON.stringify(profileList.Customization) + ", ";

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
	//////////////START TO RANDOMIZE IDS /////////////////
if (PanicRandom == true) {
	var profileList2 = JSON.parse(ReadJson('Output.json'));
	var out2='';
	var prepareInventory2 = JSON.stringify(profileList2.Inventory);
	
	
	//Read, Collect and Randomize ID
	//Strip Location Codes not needed
	//Strip UDP -stack ammount

		//MAIN ID
		var mainid = profileList2.Inventory.items[0]._id;
		var nmainid = randomString(24, 'abcdef1234567890');
		prepareInventory2 = prepareInventory2.replace(new RegExp(mainid, 'g'), nmainid);
		profileList2.Inventory.equipment = nmainid;
		
		//STASH ID
		var stashid = profileList2.Inventory.stash;
		var nstashid = randomString(24, 'abcdef1234567890');
		prepareInventory2 = prepareInventory2.replace(new RegExp(stashid, 'g'), nstashid);
		profileList2.Inventory.stash = nstashid;
		
		//Quest Raid
		var questid = profileList2.Inventory.questRaidItems;
		var nquestid = randomString(24, 'abcdef1234567890');
		prepareInventory2 = prepareInventory2.replace(new RegExp(questid, 'g'), nquestid);
		profileList2.Inventory.questRaidItems = nquestid;
		
		//Quest Inventory
		var questid2 = profileList2.Inventory.questStashItems;
		var nquestid2 = randomString(24, 'abcdef1234567890');
		prepareInventory2 = prepareInventory2.replace(new RegExp(questid2, 'g'), nquestid2);
		profileList2.Inventory.questStashItems = nquestid2;

		
		//Itterate Through Sub Items
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
				//Remove location/UDP
				var FPWS = '"slotId":"FirstPrimaryWeapon","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var FPWR = '"slotId":"FirstPrimaryWeapon"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(FPWS, 'g'), FPWR);
				
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
				//Remove location/UDP
				var TVS = '"slotId":"TacticalVest","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var TVR = '"slotId":"TacticalVest"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(TVS, 'g'), TVR);
			}
			//ArmorVest Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "ArmorVest") {
				var AVid = profileList2.Inventory.items[tmpKey2]._id;
				var nAVid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(AVid, 'g'), nAVid);
				//ArmorVest parent id
				var AVPid = profileList2.Inventory.items[tmpKey2].parentId;
				//Remove location/UDP
				var AVS = '"slotId":"ArmorVest","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var AVR = '"slotId":"ArmorVest"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(AVS, 'g'), AVR);
			}
			//Backpack Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Backpack") {
				var BPid = profileList2.Inventory.items[tmpKey2]._id;
				var nBPid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(BPid, 'g'), nBPid);
				//Backpack parent id
				var BPPid = profileList2.Inventory.items[tmpKey2].parentId;
				//Remove location/UDP
				var BPS = '"slotId":"Backpack","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var BPR = '"slotId":"Backpack"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(BPS, 'g'), BPR);
			}
			//Headwear Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Headwear") {
				var HWid = profileList2.Inventory.items[tmpKey2]._id;
				var nHWid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(HWid, 'g'), nHWid);
				//Headwear parent id
				var HWPid = profileList2.Inventory.items[tmpKey2].parentId;
				//Remove location/UDP
				var HWS = '"slotId":"Headwear","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var HWR = '"slotId":"Headwear"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(HWS, 'g'), HWR);
			}
			//FaceCover Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "FaceCover") {
				var FCid = profileList2.Inventory.items[tmpKey2]._id;
				var nFCid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(FCid, 'g'), nFCid);
				//FaceCover parent id
				var FCPid = profileList2.Inventory.items[tmpKey2].parentId;
				//Remove location/UDP
				var FCS = '"slotId":"FaceCover","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var FCR = '"slotId":"FaceCover"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(FCS, 'g'), FCR);
			}
			//Scabbard Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Scabbard") {
				var SCid = profileList2.Inventory.items[tmpKey2]._id;
				var nSCid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(SCid, 'g'), nSCid);
				//Scabbard parent id
				var SCPid = profileList2.Inventory.items[tmpKey2].parentId;
			}
			//Eyewear Id
			if (profileList2.Inventory.items[tmpKey2].slotId == "Eyewear") {
				var EWid = profileList2.Inventory.items[tmpKey2]._id;
				var nEWid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(EWid, 'g'), nEWid);
				//Scabbard parent id
				var EWPid = profileList2.Inventory.items[tmpKey2].parentId;
				//Remove location/UDP
				var EWS = '"slotId":"Eyewear","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var EWR = '"slotId":"Eyewear"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(EWS, 'g'), EWR);
			}
			//Pockets
			var str1 = profileList2.Inventory.items[tmpKey2].slotId;
			var rgx1 = /pocket*/;
			if (rgx1.test(str1)) {
				var pktid = profileList2.Inventory.items[tmpKey2]._id;
				var npkid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(pktid, 'g'), npkid);
				//Remove location/UDP
				var pckname = profileList2.Inventory.items[tmpKey2].slotId;
				console.log("pocket found:" + pckname);
				var PKTS = '"slotId":"'+ pckname +'","location":{"x":0,"y":0,"r":"Horizontal","isSearched":true},"upd":{"StackObjectsCount":1}';
				var PKTR = '"slotId":"'+ pckname +'","location":{"x":0,"y":0,"r":0}';
				prepareInventory2 = prepareInventory2.replace(new RegExp(PKTS, 'g'), PKTR);
			}
			//Slots
			if (profileList2.Inventory.items[tmpKey2].slotId == "1" || "2" || "3" || "4" || "5" || "6" || "7" || "8" || "9" || "10") {
				var Sltid = profileList2.Inventory.items[tmpKey2]._id;
				var nSltid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(Sltid, 'g'), nSltid);
			}
			//MODS
			var str2 = profileList2.Inventory.items[tmpKey2].slotId;
			var rgx2 = /mod_.*/;
			if (rgx2.test(str2)) {
				var modid = profileList2.Inventory.items[tmpKey2]._id;
				var nmodid = randomString(24, 'abcdef1234567890');
				prepareInventory2 = prepareInventory2.replace(new RegExp(modid, 'g'), nmodid);
				//Remove location/UDP
				var modname = profileList2.Inventory.items[tmpKey2].slotId;
				console.log("mod found:" + modname);
				var MODS = '"slotId":"'+ modname +'","location":{"x":0,"y":0,"r":0},"upd":{"StackObjectsCount":1}';
				var MODR = '"slotId":"'+ modname +'"';
				prepareInventory2 = prepareInventory2.replace(new RegExp(MODS, 'g'), MODR);
				
				
			//Correct Remaining Location Codes
			var LOCS = '"r":"Horizontal","isSearched":true';
			var LOCR = '"r":0';
			prepareInventory2 = prepareInventory2.replace(new RegExp(LOCS, 'g'), LOCR);
				
			}
			
			// END Pull and Randomize
				//cartridges? needs Testing
		}
		
		//Re prep bot file	
		out2 += '{"_id": "' + UniqID + '", "aid": 0,"savage": null,"Info": {' + 
		'"Nickname": "' + botName + '","LowerNickname": "","Side": "Savage","Voice": "' + voice + '","Level": 1,"Experience": 0,"RegistrationDate": 0,"GameVersion": "","AccountType": 0,"MemberCategory": 0,"lockedMoveCommands": false,"LastTimePlayedAsSavage": 0,' + 
		'"Settings":{"Role": "' + botType + '","BotDifficulty": "' + botDiff + '","Experience": -1},"NeedWipe": false,"GlobalWipe": false,"NicknameChangeDate": 0},' + 
		'"Customization": ' + prepareCustomization + ' ' + '"Health": ' + JSON.stringify(profileList.Health) + ',"Inventory": ' + prepareInventory2 + ',"Skills": {"Common": null,"Mastering": [],"Points": 0},"Stats": {"SessionCounters": {"Items": []},"OverallCounters": {"Items": []}},"Encyclopedia": null,"ConditionCounters": {"Counters": []}, "BackendCounters": {},"InsuredItems": []}';
		
		//write new file (new lines possible after each?)
		outJson2 = ((outJson2 != "")?(outJson2 + ","):"") + out2;
		fs.writeFileSync('randomz.json', outJson2, 'utf8');
}
	
}
console.log("-> Finished Creation of " + count + " bots.")

})('https://uinames.com/');