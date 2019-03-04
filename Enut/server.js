'use strict'
var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var server = http.createServer();
var FinalOutput = "";
var tmpTrader = "{}";
var PORT = 1337;
var hideoutSign = "5c71b934354682353958ea35";
var assort = new RegExp('/client/trading/api/getTraderAssort/([a-z0-9])+', 'i');
var prices = new RegExp('/client/trading/api/getUserAssortPrice/([a-z0-9])+', 'i');
var getTrader = new RegExp('/client/trading/api/getTrader/', 'i');
var traderImg = new RegExp('/files/([a-z0-9/\.jpng])+', 'i');
var content = new RegExp('/uploads/([a-z0-9/\.jpng_])+', 'i');
var pushNotifier = new RegExp('/push/notifier/get/', 'i');
var playerListJson = "client/profile/name/list.json";
var ItemOutput = "";
var stashX = 10; // fix for your stash size
var stashY = 64; // ^ if you edited it ofc
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}

var itemJSON = JSON.parse(ReadJson('client/items.json'));
itemJSON = itemJSON.data;
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
} // stolen off StackOverflow

function handleMoving(body) {
	var tmpList = JSON.parse(ReadJson(playerListJson));
	switch(body.Action) {
		case "QuestAccept":
			tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": 1337, "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
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
		case "Remove":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					ItemOutput.data.items.del.push({"_id": body.item});
					tmpList.data[1].Inventory.items.splice(key, 1);
					fs.writeFileSync(playerListJson, JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
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
							if(tmpList.data[1].Inventory.items[key2].parentId == hideoutSign) { // hideout
								for(var key3 in itemJSON) {
									if (itemJSON[key3]._id && itemJSON[key3]._id == tmpList.data[1].Inventory.items[key2]._tpl) {
										var iH = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? itemJSON[key3]._props.Width : itemJSON[key3]._props.Height);
										var iW = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? itemJSON[key3]._props.Height : itemJSON[key3]._props.Width);
										for (var x = 0; x < iH; x++) {
											Stash2D[tmpList.data[1].Inventory.items[key2].location.y + x].fill(1, tmpList.data[1].Inventory.items[key2].location.x, tmpList.data[1].Inventory.items[key2].location.x + iW);
										}
										break;
									}
								}
							}
						}
						var tmpSizeX = 0; var tmpSizeY = 0;
						for(var key4 in itemJSON) {
							if (itemJSON[key4]._id && itemJSON[key4]._id == tmpTrader.data.items[key]._tpl) {
								tmpSizeX = itemJSON[key4]._props.Width; tmpSizeY = itemJSON[key4]._props.Height;
								break;
							}
						}
						var badSlot = "no";
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
									//main item insertion to inventory
									ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": hideoutSign, "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
									tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": hideoutSign, "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
								//starting recursive attachments assignation 
								//[ key, newItem, tmpTrader, tmpList ]
								//[ {arrayIdNumber}, {ItemID}, {tmpTable}, {tmpTable} ]
									recursiveTraderAssignItem(key, newItem, tmpTrader.data.items, tmpList.data[1].Inventory.items);
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
				
				var tmpTrader = JSON.parse('{"err": 0,"errmsg": null,"data": ' + ReadJson('client/trading/api/getTraderAssort/' + body.tid.replace(/[^a-zA-Z0-9]/g, '') + '.json') + '}');
				for (var key in tmpTrader.data.items) {
					if (tmpTrader.data.items[key]._id && tmpTrader.data.items[key]._id == body.item_id) {
						//console.log("----==+==----");
						var vall = JSON.parse(tmpTrader.data.items[key].scheme_items);
						//console.log(vall[0].count);

				
					for (var key in body.items){
						for (var ListKey in tmpList.data[1].Inventory.items) {
							if(body.items[key].id == tmpList.data[1].Inventory.items[ListKey]._id){
							console.log("we delete item now");
							//console.log(body.items[key]);
							//console.log(tmpList.data[1].Inventory.items[ListKey]);
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
							
function recursiveTraderAssignItem(key, newItem, tmpTrader, tmpList){
	for(var key1 in tmpTrader) {
		if(tmpTrader[key1].parentId == tmpTrader[key]._id){
			var newItem2 = setID(); 
			ItemOutput.data.items.new.push({"_id": newItem2, "_tpl": tmpTrader[key1]._tpl, 
											"parentId": newItem, "slotId": tmpTrader[key1].slotId});
			tmpList.push({"_id": newItem2, "_tpl": tmpTrader[key1]._tpl, 
											"parentId": newItem, "slotId": tmpTrader[key1].slotId});
			recursiveTraderAssignItem(key1, newItem2, tmpTrader, tmpList);
		}
	}
}
function setID(){
	return getRandomInt(0, 999999999).toString();
}
function DisplayStatus(url,body){
		console.log("->" + url + " " + body);	
};
function getTradersInfo(url){
	//custom trader table assigns
	if (url.match("/client/trading/api/getTradersList")){
		//we dont need to do var here but fuck it
		//now we creating full traders body
		var output = '{"err": 0,"errmsg": null,"data": [' + 
				ReadJson("client/trading/api/getTrader/5a7c2eca46aef81a7ca2145d.json") + ', ' +
				ReadJson("client/trading/api/getTrader/5ac3b934156ae10c4430e83c.json") + ', ' +
				ReadJson("client/trading/api/getTrader/54cb50c76803fa8b248b4571.json") + ', ' +
				ReadJson("client/trading/api/getTrader/54cb57776803fa99248b456e.json") + ', ' +
				ReadJson("client/trading/api/getTrader/59c0ea2130c28d455c92e892.json") + ', ' +
				ReadJson("client/trading/api/getTrader/579dc571d53a0658a154fbec.json") + ', ' +
				ReadJson("client/trading/api/getTrader/5935c25fb3acc3127c3d8cd9.json") + ', ' +
				ReadJson("client/trading/api/getTrader/5c0647fdd443bc2504c2d371.json") + ', ' +
				ReadJson("client/trading/api/getTrader/58330581ace78e27b8b10cee.json") + ']}'
		return output;
	}
	// if not fullbody return exact trader table for all 3 states
	return '{"err": 0,"errmsg": null,"data": ' + ReadJson(url.replace('/client', 'client').replace('/trader/', '/') + ".json") + '}';
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
// special events handler
	// this deletes loading of levels in traders delete 2 lines below - then u will get dumped all level items
	if(url.indexOf("?retry=1") > -1 || url.indexOf("?retry=2") > -1 || url.indexOf("?retry=3") > -1) 
		return;
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
			FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
			break;
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
		case "/client/game/version/validate":
			FinalOutput = ReadJson('client/game/version/validate.json');
			break;
		case "/client/game/login":
			DisplayStatus(url,body)
			FinalOutput = ReadJson('client/game/name/login.json');
			break;
		case "/client/items":
			FinalOutput = ReadJson('client/items.json');
			break;
		case "/client/globals":
			FinalOutput = ReadJson('client/globals.json');
			break;
		case "/client/game/profile/list":
			FinalOutput = ReadJson('client/profile/name/list.json');
			break;
		case "/client/game/profile/select":
			FinalOutput = ReadJson('client/profile/name/select.json');
			break;
		case "/client/profile/status":
			FinalOutput = ReadJson('client/profile/name/status.json');
			break;
		case "/client/game/keepalive":
			console.log("> KeepConnectionAlive <")
			break;
		case "/client/weather":
			FinalOutput = ReadJson('client/weather.json');
			break;
		case "/client/locale/en":
			FinalOutput = ReadJson('client/locale/en.json');
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
			FinalOutput = ReadJson('client/game/bot/generate.json');
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
});
