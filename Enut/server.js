'use strict'
var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var server = http.createServer();
var FinalOutput = "";
var tmpTrader = "{}";
var LoginData = {};
var ItemOutput = "";
var tmpItem = {};
var tmpSize = {};
var toDo = [];
var PORT = 1337;
var hideoutSign = "5c71b934354682353958ea35";
var assort = new RegExp('/client/trading/api/getTraderAssort/([a-z0-9])+', 'i');
var prices = new RegExp('/client/trading/api/getUserAssortPrice/([a-z0-9])+', 'i');
var getTrader = new RegExp('/client/trading/api/getTrader/', 'i');
var traderImg = new RegExp('/files/([a-z0-9/\.jpng])+', 'i');
var content = new RegExp('/uploads/([a-z0-9/\.jpng_])+', 'i');
var pushNotifier = new RegExp('/push/notifier/get/', 'i');
var LoginName = "maoci";
var playerListJson = "client/profile/" + LoginName + "/list.json";
var ItemOutput = "";
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}

var itemJSON = JSON.parse(ReadJson('client/items.json'));
itemJSON = itemJSON.data;
function noMoreCyrlic(word){
    var answer = "";
    var A = new Array();A["Ё"]="YO";A["Й"]="I";A["Ц"]="TS";A["У"]="U";A["К"]="K";A["Е"]="E";A["Н"]="N";A["Г"]="G";A["Ш"]="SH";A["Щ"]="SCH";A["З"]="Z";A["Х"]="H";A["Ъ"]="'";A["ё"]="yo";A["й"]="i";A["ц"]="ts";A["у"]="u";A["к"]="k";A["е"]="e";A["н"]="n";A["г"]="g";A["ш"]="sh";A["щ"]="sch";A["з"]="z";A["х"]="h";A["ъ"]="'";A["Ф"]="F";A["Ы"]="I";A["В"]="V";A["А"]="A";A["П"]="P";A["Р"]="R";A["О"]="O";A["Л"]="L";A["Д"]="D";A["Ж"]="ZH";A["Э"]="E";A["ф"]="f";A["ы"]="i";A["в"]="v";A["а"]="a";A["п"]="p";A["р"]="r";A["о"]="o";A["л"]="l";A["д"]="d";A["ж"]="zh";A["э"]="e";A["Я"]="YA";A["Ч"]="CH";A["С"]="S";A["М"]="M";A["И"]="I";A["Т"]="T";A["Ь"]="'";A["Б"]="B";A["Ю"]="YU";A["я"]="ya";A["ч"]="ch";A["с"]="s";A["м"]="m";A["и"]="i";A["т"]="t";A["ь"]="'";A["б"]="b";A["ю"]="yu";
for (var i in word){
    if (word[i] === 'undefined' || word[i] === ' ' )
	{
        answer += " ";
    }
    else 
	{
        answer += A[word[i]];
    }
}
return answer;
}
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
} // stolen off StackOverflow
function setID(){
	return Math.floor(new Date() / 1000) + getRandomInt(0, 999999999).toString(); 
}
function DisplayStatus(url,body){
		console.log("->" + url + " " + body);	
}
function getItem(template){
	for(var itm in itemJSON) {
		if (itemJSON[itm]._id && itemJSON[itm]._id == template) {
			var item = itemJSON[itm];
			return [true, item];
		}
	}
	return [false, {}];
}//from polivilas work well so i add it
function getSize(itemtpl, itemID, location){
	toDo = [itemID];
	tmpItem = getItem(itemtpl);
	if (!tmpItem[0])
	{
		console.log("SHITS FUCKED GETSIZE1", itemID);
		return;
	} else {
		tmpItem = tmpItem[1];
	}
	var outX = 0, outY = 0, outL = 0, outR = 0, outU = 0, outD = 0, tmpL = 0, tmpR = 0, tmpU = 0, tmpD = 0;
	outX = tmpItem._props.Width;
	outY = tmpItem._props.Height;
	while(true){
		if(toDo[0] != undefined){
			for (var tmpKey in location) {
				if (location[tmpKey].parentId && location[tmpKey].parentId == toDo[0]) {
					toDo.push(location[tmpKey]._id);
					
					tmpItem = getItem(location[tmpKey]._tpl);
					if (!tmpItem[0])
					{
						console.log("SHITS FUCKED GETSIZE2", tmpItem, location[tmpKey]._tpl);
						return;
					} else {
						tmpItem = tmpItem[1];
					}
					if(tmpItem._props.ExtraSizeLeft != undefined && tmpItem._props.ExtraSizeLeft > tmpL){
						tmpL = tmpItem._props.ExtraSizeLeft; 
					}
					if(tmpItem._props.ExtraSizeRight != undefined && tmpItem._props.ExtraSizeRight > tmpR){
						tmpR = tmpItem._props.ExtraSizeRight; 
					}
					if(tmpItem._props.ExtraSizeUp != undefined && tmpItem._props.ExtraSizeUp > tmpU){
						tmpU = tmpItem._props.ExtraSizeUp; 
					}
					if(tmpItem._props.ExtraSizeDown != undefined && tmpItem._props.ExtraSizeDown > tmpD){
						tmpD = tmpItem._props.ExtraSizeDown; 
					}
				}
			}
			outL += tmpL; outR += tmpR; outU += tmpU; outD += tmpD;
			tmpL = 0; tmpR = 0; tmpU = 0; tmpD = 0;
			toDo.splice(0, 1);
			continue;
		}
		break;
	}
	return [outX, outY, outL, outR, outU, outD];
}//from polivilas work well so i add it
function handleMoving(body) {
	var tmpList = JSON.parse(ReadJson(playerListJson));
	switch(body.Action) {
		case "QuestAccept":
			tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": 1337, "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
			fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
			FinalOutput = "OK";
			break;
		case "Examine"://still testing cuz not adding right ID to examine
			console.log(body);
			console.log(body.item);
			var item = body.item;//need to graw with it tmp id - propably  Enut\client\handbook\templates.json
			tmpList.data[1].Encyclopedia[item] = true;
			fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
			FinalOutput = "OK";
			break;
		case "Move":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].parentId = body.to.id;
					tmpList.data[1].Inventory.items[key].slotId = body.to.container;
					if (body.to.location) {
						tmpList.data[1].Inventory.items[key].location = body.to.location;
					} else {
						if (tmpList.data[1].Inventory.items[key].location) {
							tmpList.data[1].Inventory.items[key].location = {"x": 0, "y": 0, "r": 0};
						}
					}
					fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Remove"://fix from polivilas
				toDo = [body.item];
				while(true){
					if(toDo[0] != undefined){
						while(true){ // needed else iterator may decide to jump over stuff
							var tmpEmpty = "yes";
							for (var tmpKey in tmpList.data[1].Inventory.items) {	
								if ((tmpList.data[1].Inventory.items[tmpKey].parentId && tmpList.data[1].Inventory.items[tmpKey].parentId == toDo[0]) || (tmpList.data[1].Inventory.items[tmpKey]._id && tmpList.data[1].Inventory.items[tmpKey]._id == toDo[0])) {
									ItemOutput.data.items.del.push({"_id": tmpList.data[1].Inventory.items[tmpKey]._id});
									toDo.push(tmpList.data[1].Inventory.items[tmpKey]._id);
									tmpList.data[1].Inventory.items.splice(tmpKey, 1);
									tmpEmpty = "no";
								}
							}
							if(tmpEmpty == "yes"){
								break;
							};
						}
						toDo.splice(0, 1);
						continue;
					}
					break;
				}
				fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
				FinalOutput = "OK";
			break;
		case "Split":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.StackObjectsCount -= body.count;
					var newItem = setID(); 
					ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Merge":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.with) {
					for (var key2 in tmpList.data[1].Inventory.items) {
						if (tmpList.data[1].Inventory.items[key2]._id && tmpList.data[1].Inventory.items[key2]._id == body.item) {
							tmpList.data[1].Inventory.items[key].upd.StackObjectsCount = (tmpList.data[1].Inventory.items[key].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key].upd.StackObjectsCount : 1) + (tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount : 1);
							ItemOutput.data.items.del.push({"_id": tmpList.data[1].Inventory.items[key2]._id});
							tmpList.data[1].Inventory.items.splice(key2, 1);
							fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
							FinalOutput = "OK";
							break;
						}
					}
				}
			}
			break;
		case "TradingConfirm":
			if(body.type == "buy_from_trader") {
				tmpTrader = JSON.parse('{"err": 0,"errmsg": null,"data": ' + ReadJson('client/trading/api/getTraderAssort/' + body.tid.replace(/[^a-zA-Z0-9]/g, '') + '.json') + '}');
				for (var key in tmpTrader.data.items) {
					if (tmpTrader.data.items[key]._id && tmpTrader.data.items[key]._id == body.item_id) {
						var Stash2D = Array(stashY).fill(0).map(x => Array(stashX).fill(0));
						for (var key2 in tmpList.data[1].Inventory.items) {
							if(tmpList.data[1].Inventory.items[key2].parentId == "5c71b934354682353958ea35" && tmpList.data[1].Inventory.items[key2].location != undefined) { // hideout
								tmpItem = getItem(tmpList.data[1].Inventory.items[key2]._tpl);
								if (!tmpItem[0])
								{
									console.log("SHITS FUCKED");
									return;
								} else {
									tmpItem = tmpItem[1];
								}
								tmpSize = getSize(tmpList.data[1].Inventory.items[key2]._tpl,tmpList.data[1].Inventory.items[key2]._id, tmpList.data[1].Inventory.items);
								//			x			L				r
								var iW = tmpSize[0] + tmpSize[2] + tmpSize[3];
								//			y			u				d
								var iH = tmpSize[1] + tmpSize[4] + tmpSize[5];
								var fH = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iW : iH);
								var fW = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iH : iW);
								for (var x = 0; x < fH; x++) {
									Stash2D[tmpList.data[1].Inventory.items[key2].location.y + x].fill(1, tmpList.data[1].Inventory.items[key2].location.x, tmpList.data[1].Inventory.items[key2].location.x + fW);
								}
							}
						}
						var tmpSizeX = 0; var tmpSizeY = 0;
						tmpItem = getItem(tmpTrader.data.items[key]._tpl);
						if (!tmpItem[0])
						{
							console.log("SHITS FUCKED BUY_FROM_TRADER");
							return;
						} else {
							tmpItem = tmpItem[1];
						}
						tmpSize = getSize(tmpTrader.data.items[key]._tpl,tmpTrader.data.items[key]._id, tmpTrader.data.items);
						tmpSizeX = tmpSize[0] + tmpSize[2] + tmpSize[3];
						tmpSizeY = tmpSize[1] + tmpSize[4] + tmpSize[5];
						//console.log(tmpSizeX, tmpSizeY);
						var badSlot = "no";
						console.log(Stash2D);
						for (var y = 0; y < stashY; y++) {
							for (var x = 0; x < stashX; x++) {
								badSlot = "no";
								for (var itemY = 0; itemY < tmpSizeY; itemY++) {
									for (var itemX = 0; itemX < tmpSizeX; itemX++) {
										if(Stash2D[y + itemY][x + itemX] != 0){
											badSlot = "yes";
											break;
										}
									}
									if(badSlot == "yes"){
										break;
									}
								}
								if(badSlot == "no"){
									var newItem = setID();
									ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
									tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
									toDo = [[tmpTrader.data.items[key]._id, newItem]];
									while(true){
										if(toDo[0] != undefined){
											for (var tmpKey in tmpTrader.data.items) {
												if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId == toDo[0][0]) {
													newItem = setID();
													ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
													tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
													toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
												}
											}
											toDo.splice(0, 1);
											continue;
										}
										break;
									}
									fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
									FinalOutput = "OK";
									return;
								}
							}
						}
						break;
					}
				}
			}
			if(body.type == "sell_to_trader") {
				//not figure out why i cant sell shit ... // if id exist in trader then i can sell it ..
				var tmpTrader = JSON.parse('{"err": 0,"errmsg": null,"data": ' + ReadJson('client/trading/api/getTraderAssort/' + body.tid.replace(/[^a-zA-Z0-9]/g, '') + '.json') + '}');
				for (var key in tmpTrader.data.items) {
					if (tmpTrader.data.items[key]._id && tmpTrader.data.items[key]._id == body.item_id) {
						var vall = JSON.parse(tmpTrader.data.items[key].scheme_items);				
					for (var key in body.items){
						for (var ListKey in tmpList.data[1].Inventory.items) {
							if(body.items[key].id == tmpList.data[1].Inventory.items[ListKey]._id){
							console.log("we delete item now");
							ItemOutput.data.items.del.push({"_id": body.items[key].id});
							tmpList.data[1].Inventory.items.splice(key, 1);
							
							}
						}
					}
					fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
					}
				FinalOutput = "OK";
				return;
				}
			}
			break;
		case "Fold":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.Foldable = {"Folded": body.value};
					fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Toggle":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.Togglable = {"On": body.value};
					fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		default:
			console.log("UNHANDLED ACTION");
			break;
	}
}

function getTradersInfo(url){
	//custom trader table assigns
	if (url.match("/client/trading/api/getTradersList")){
		//we dont need to do var here but fuck it
		//now we creating full traders body
		var output = '{"err": 0,"errmsg": null,"data": [' + 
				ReadJson("client/trading/api/getTrader/54cb50c76803fa8b248b4571.json") + ', ' + /* Prapor */
                ReadJson("client/trading/api/getTrader/54cb57776803fa99248b456e.json") + ', ' + /* Therapist */
                ReadJson("client/trading/api/getTrader/579dc571d53a0658a154fbec.json") + ', ' + /* Fence */
                ReadJson("client/trading/api/getTrader/58330581ace78e27b8b10cee.json") + ', ' + /* Skier */
                ReadJson("client/trading/api/getTrader/5935c25fb3acc3127c3d8cd9.json") + ', ' + /* Peacekeeper */
                ReadJson("client/trading/api/getTrader/5a7c2eca46aef81a7ca2145d.json") + ', ' + /* Mechanic */
                ReadJson("client/trading/api/getTrader/5ac3b934156ae10c4430e83c.json") + ', ' + /* Ragman */
                ReadJson("client/trading/api/getTrader/polivilasTrader.json") + ', ' + 			/* Polivilas */
                ReadJson("client/trading/api/getTrader/jeagerTrader.json") + ', ' + 			/* Jaeger */
                ReadJson("client/trading/api/getTrader/MasterMaoci.json") + ']}';				/* TheMaoci */
		return output;
	}
	// if not fullbody return exact trader table for all 3 states
	// console.log(url.replace('/client', 'client').replace('/trader/', '/') + ".json");
	return '{"err": 0,"errmsg": null,"data": ' + ReadJson(url.replace('/client', 'client').replace('/trader/', '/') + ".json") + '}';
}

function prepareRandomBot(body){
	//use premaded bots for now still working on creating
	return ReadJson('client/game/bot/bot_generate2.json');
	//have an error with reading created data like this
	if(body != "{}")
	var BODY = JSON.parse(body);
	else
	var BODY = JSON.parse('{"conditions":[{"Role":"assault","Limit":9,"Difficulty":"normal"},{"Role":"assault","Limit":4,"Difficulty":"hard"}]}');//to test via browser its faster
	var botTable = JSON.parse(ReadJson('client/game/bot/bot_generate.json'));
	var maxIndex = botTable.database.length;
	var out='{"err": 0,"errmsg": null,"data": [';
	for (var n in BODY.conditions){
		for(var j = 0; j < BODY.conditions[n].Limit; j++){
			var index = getRandomInt(0, maxIndex-1);
			var tempTable = botTable.database[index];
			var hash_eq = tempTable.Inventory.equipment;
			var hash_st = tempTable.Inventory.stash;
			var hash_qr = tempTable.Inventory.questRaidItems;
			var hash_qs = tempTable.Inventory.questStashItems;
			var new_hash_eq = setID();
			var new_hash_st = setID();
			var new_hash_qr = setID();
			var new_hash_qs = setID();
			var prepareInventory = JSON.stringify(tempTable.Inventory);
			prepareInventory = prepareInventory.replace(hash_eq, new_hash_eq).replace(hash_st, new_hash_st).replace(hash_qr, new_hash_qr).replace(hash_qs, new_hash_qs);
			out += '{"_id": "' + setID() + '", "aid": 0,"savage": null,"Info": {"Nickname": "' + tempTable.Info.Nickname + '","LowerNickname": "","Side": "' + tempTable.Info.Side + '","Voice": "' + tempTable.Info.Voice + '","Level": 1,"Experience": 0,"RegistrationDate": 0,"GameVersion": "","AccountType": 0,"MemberCategory": 0,"lockedMoveCommands": false,"LastTimePlayedAsSavage": 0,"Settings":{"Role": "' + tempTable.Info.Settings.Role + '","BotDifficulty": "' + tempTable.Info.Settings.BotDifficulty + '","Experience": -1},"NeedWipe": false,"GlobalWipe": false,"NicknameChangeDate": 0},"Customization": ' + JSON.stringify(tempTable.Customization) + ', ' + '"Health": ' + JSON.stringify(tempTable.Health) + ',"Inventory": ' + prepareInventory + ',"Skills": {"Common": null,"Mastering": [],"Points": 0},"Stats": {"SessionCounters": {"Items": []},"OverallCounters": {"Items": []}},"Encyclopedia": null,"ConditionCounters": {"Counters": []}, "BackendCounters": {},"InsuredItems": []}';
			if(n != (BODY.conditions.length - 1) || (n == (BODY.conditions.length - 1) && j != BODY.conditions[n].Limit))
			out += ',';
		}
	}
	out += ']}';
	//console.log(out);
	return out;
}

function handleRequest(req, body, url) {
	var info = JSON.parse("{}");
	if (body != "") {
		try {
			info = JSON.parse(body);
		} catch(err) {
			console.error(err);
		}
	}
	//special events handler
	//this deletes loading of levels in traders delete 2 lines below - then u will get dumped all level items
	//if(url.indexOf("?retry=1") > -1 || url.indexOf("?retry=2") > -1 || url.indexOf("?retry=3") > -1) 
	//return;
	//creating custom trader tables
	if (url.match(assort) || url.match(prices) || url.match(getTrader)){
		FinalOutput = getTradersInfo(url);
		return;
	}
	if (url.match(traderImg) || url.match(content)) {
		FinalOutput = "DEAD";
		return;
	}
	//propably for server information pusher ( i mean getting server infos
	if (url.match(pushNotifier)) {
		FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
		return;
	}
	// well known events handler
	switch(url) {
		case "/":
			FinalOutput = 'EFT backend emulator for Escape From Tarkov version 0.11.2.2680 by polivilas @ UnKnoWnCheaTs.me';
			break;
		case "/favicon.ico":
		case "/client/match/group/status":
		case "/client/match/group/looking/stop":
		case "/client/match/group/exit_from_menu":
			break;
		case "/client/friend/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
			break;
		case "/client/game/profile/items/moving":
			DisplayStatus(url,body)
			for (var a = 0; a < info.data.length; a++) {
				handleMoving(info.data[a]);
			}
			if(FinalOutput == "OK") {
				FinalOutput = JSON.stringify(ItemOutput);
			}
			break;
		case "/client/mail/dialog/list":
		case "/client/friend/request/list/outbox":
		case "/client/friend/request/list/inbox":
			FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
			break;
		case "/client/languages":
			FinalOutput = ReadJson('client/languages.json');
			break;
		case "/client/menu/locale/en":
			FinalOutput = ReadJson('client/menu/locale/en.json');
			break;
		case "/client/menu/locale/ru":
			FinalOutput = ReadJson('client/menu/locale/ru.json');
			break;
		case "/client/game/version/validate":
			FinalOutput = ReadJson('client/game/version/validate.json');
			break;
		case "/client/game/login":
			LoginData = JSON.parse(body);
			LoginName = (LoginData.email != "")?LoginData.email:LoginName;
			console.log('Data retrived from user: ' + LoginName)
			playerListJson = "client/profile/" + LoginName + "/list.json";
			FinalOutput = ReadJson('client/profile/' + LoginName + '/login.json');
			break;
		case "/client/items":
			FinalOutput = ReadJson('client/items.json');
			break;
		case "/client/globals":
			FinalOutput = ReadJson('client/globals.json');
			break;
		case "/client/game/profile/list":
			FinalOutput = ReadJson('client/profile/' + LoginName + '/list.json');
			break;
		case "/client/game/profile/select":
			FinalOutput = ReadJson('client/profile/' + LoginName + '/select.json');
			break;
		case "/client/profile/status":
			FinalOutput = ReadJson('client/profile/' + LoginName + '/status.json');
			break;
		case "/client/game/keepalive":
			console.log("> Keep Alive <");
			break;
		case "/client/weather":
			FinalOutput = ReadJson('client/weather.json');
			break;
		case "/client/locale/en":
			FinalOutput = ReadJson('client/locale/en.json');
			break;
		case "/client/locale/ru":
			FinalOutput = ReadJson('client/locale/ru.json');
			break;
		case "/client/locations":
			FinalOutput = ReadJson('client/locations.json');
			break;
		case "/client/handbook/templates":
			FinalOutput = ReadJson('client/handbook/templates.json');
			break;
		case "/client/quest/list":
			FinalOutput = ReadJson('client/quest/list.json');
			break;
		case "/client/game/bot/generate":
			DisplayStatus(url,body)
			FinalOutput = prepareRandomBot(body);
			break;
		case "/client/trading/api/getTradersList":
			DisplayStatus(url,body)
			FinalOutput = getTradersInfo(url);
			break;
		case "/client/server/list":
			DisplayStatus(url,body)
			FinalOutput = ReadJson('client/server/list.json');
			break;
		default:
			console.log("UNHANDLED REQUEST " + req.url);
			break;
	}
}

server.on('request', function(req, resp) {
	// Get the IP address of the client
	FinalOutput = "";
	ItemOutput = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[]}}');
	var remote = req.connection.remoteAddress;
	//console.log('REQ: %s -> %s', remote, req.url);
	if(req.method == "POST") {
		req.on('data', function(data) {
			//URL = req.url;
				zlib.inflate(data, function(error, body) {
					if(error) {
						console.log(error);
					} else {
						handleRequest(req, body.toString(), req.url);
						DisplayStatus(req.url,body)
						if (FinalOutput == "DEAD") {
							resp.writeHead(301, 
								{Location: 'http://prod.escapefromtarkov.com'+req.url}
							);
							console.log("Redirecting");
							resp.end();
							return;
						}
						resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
						zlib.deflate(FinalOutput, function(err, buf) {
							resp.end(buf);
						});
						return;
					}
			});
		});
	}
	else
	{
		handleRequest(req, "{}", req.url);
		if (FinalOutput == "DEAD") {
			resp.writeHead(301, 
				{Location: 'http://prod.escapefromtarkov.com'+req.url}
			);
			console.log("Redirecting");
			resp.end();
			return;
		}
		resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
		//console.log(FinalOutput);
		zlib.deflate(FinalOutput, function(err, buf) {
			resp.end(buf);
		});
	}


});

//Start the server
server.listen(PORT, function() {
	console.log('EFTPriv-> port:%s <- made by: polivilas / moded by: TheMaoci',PORT);
	console.log('default: maoci <-> will use this folder if not put any name in login');
	//We starting to adds images of new traders if not exists in Tarkov temp files
	//**Variable preparations
	const testExist = require('fs'), testCopy = require('fs');
	var testDir = require('fs');
	var img = [], dirTest = [];;
	//images for test and copy if needed - located in ./server/files folder
	img[0] = "jaeger.jpg";img[1] = "polivilas.jpg";img[2] = "themaoci.jpg";
	//dir for temp BSG folder
	dirTest[0] = process.env.TEMP + "\\Battlestate Games\\";
	dirTest[1] = dirTest[0] + "EscapeFromTarkov\\";
	dirTest[2] = dirTest[1] + "files\\";
	dirTest[3] = dirTest[2] + "trader\\";
	dirTest[4] = dirTest[3] + "avatar\\";
	//**Functions starts
	for(var key in dirTest){
		if (!testDir.existsSync(dirTest[key])){
		testDir.mkdirSync(dirTest[key]);
		}
	}
	for (let key2 in img){
		testExist.access(dirTest[4] + img[key2], testExist.F_OK, (err) => {
		  if (err) {
			console.error("File not found Copying File " + img[key2]);
				testCopy.copyFile('./files/' + img[key2], dirTest[4] + img[key2], (err) => {
					if (err) throw err;
				});
			return
		  }
		});
	}
});
