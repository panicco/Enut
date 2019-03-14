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
//main script starts here
(async (url) => {
	// ----------------------------CHANGE THIS VALUES DEPENDS ON BOT
	// ----------------------------CHANGE THIS VALUES DEPENDS ON BOT
	// ----------------------------CHANGE THIS VALUES DEPENDS ON BOT
	var botType 	= "marksman";	// bot type
	var botDiff 	= "impossible";	// bot difficulty
	var isBoss		= false;		// if boss set true (flag)
	var BossName	= "cykaBlyat"	// if bos selectred will use this name
	var toConsole	= false;		// dump data to console (only for testing)
	var saveSingle	= false;		// while dumped again file will be cleared b4 dump
	// ---------------^^^^^^^^^^^--CHANGE THIS VALUES DEPENDS ON BOT
	// ----------------------------CHANGE THIS VALUES DEPENDS ON BOT
	// ----------------------------CHANGE THIS VALUES DEPENDS ON BOT
// - list of list.jsons	
	var profilesAvailable = require('fs');
	var Folders = profilesAvailable.readdirSync('BotProfile/');
	var listFiles = [];
	for(var i in Folders){
			listFiles[i] = Folders[i];
	}
// finished list
for(var i in listFiles){
	if(!isBoss){
		var botName = await getScript('https://uinames.com/api/?gender=male&region=Russia');
		botName = JSON.parse(botName);
		botName = botName.name + " " + botName.surname;
	} else {
		var botName = BossName;
	}
	var profileList = JSON.parse(ReadJson('BotProfile/' + listFiles[i]));
	var outJson = ReadJson('Output.json');
	profileList = profileList.data[1];
	//delete all from stash not recursive
	//"slotId": "hideout",
		for (var tmpKey in profileList.Inventory.items) {	
			if (profileList.Inventory.items[tmpKey].slotId == "hideout") {
				profileList.Inventory.items.splice(tmpKey, 1);
			}
		}
	//deleted from stash
	var out='';
	var UniqID = "bot_" + botType + "_" + botDiff + "" + setID();
	//console.log(UniqID);
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
	//console.log(prepareInventory);
	prepareInventory = prepareInventory.replace(hash_eq, new_hash_eq).replace(hash_st, new_hash_st).replace(hash_qr, new_hash_qr).replace(hash_qs, new_hash_qs);
	out += '{"_id": "' + UniqID + '", "aid": 0,"savage": null,"Info": {' + 
	'"Nickname": "' + botName + '","LowerNickname": "","Side": "Savage","Voice": "' + profileList.Info.Voice + '","Level": 1,"Experience": 0,"RegistrationDate": 0,"GameVersion": "","AccountType": 0,"MemberCategory": 0,"lockedMoveCommands": false,"LastTimePlayedAsSavage": 0,' + 
	'"Settings":{"Role": "' + botType + '","BotDifficulty": "' + botDiff + '","Experience": -1},"NeedWipe": false,"GlobalWipe": false,"NicknameChangeDate": 0},' + 
	'"Customization": ' + JSON.stringify(profileList.Customization) + ', ' + '"Health": ' + JSON.stringify(profileList.Health) + ',"Inventory": ' + prepareInventory + ',"Skills": {"Common": null,"Mastering": [],"Points": 0},"Stats": {"SessionCounters": {"Items": []},"OverallCounters": {"Items": []}},"Encyclopedia": null,"ConditionCounters": {"Counters": []}, "BackendCounters": {},"InsuredItems": []}';
	//out += ']}';
	if(saveSingle)
		outJson = out;
	else
		outJson = ((outJson != "")?(outJson + ", "):"") + out
	if(toConsole)
		console.log(out);
	else
		fs.writeFileSync('Output.json', outJson, 'utf8');
}
})('https://uinames.com/');