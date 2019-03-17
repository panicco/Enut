var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var allowDeleting = true;//true - allow, false - disallow

var traderToDeleteItems = "polivilasTrader";
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}
var FILE = JSON.parse(ReadJson('../client/trading/api/getTraderAssort/' + traderToDeleteItems + '.json'));
var TODELETE = JSON.parse(ReadJson('ToDelete/list.json'));
var TraderBuild = JSON.parse('{"items":[],"barter_scheme":{},"loyal_level_items":{}}');

for (let key in TODELETE.data[1].Inventory.items) {
if(TODELETE.data[1].Inventory.items[key].slotId == "hideout" && TODELETE.data[1].Inventory.items[key]._tpl != "5449016a4bdc2d6f028b456f"){
	TraderBuild.items.push({"_id": "TRADER_ITEM_" + key, "_tpl": TODELETE.data[1].Inventory.items[key]._tpl, "parentId": "hideout", "slotId": "hideout", "upd": {"UnlimitedCount": true, "StackObjectsCount": 1000000}});
	TraderBuild.barter_scheme["TRADER_ITEM_" + key] = [[{"count": 1, "_tpl": "5449016a4bdc2d6f028b456f"}]];
	TraderBuild.loyal_level_items["TRADER_ITEM_" + key] = 1;
	console.log("ADDED: [" + "TRADER_ITEM_" + key + "]");

	for (let keyName in FILE.items){
		if (TODELETE.data[1].Inventory.items[key]._tpl == FILE.items[keyName]._tpl){
			console.log("DELETED: [" + keyName + "] " + FILE.items[keyName]._id + " - " + FILE.items[keyName]._tpl);
			//FILE.items.del.push({"_id": FILE.items[keyName]._id});
			if(allowDeleting)
				FILE.items.splice(keyName, 1);
			break;
		}
	}
}else{
	console.log("NotCount: " + TODELETE.data[1].Inventory.items[key].parentId);
}
}
fs.writeFileSync('preset.json', JSON.stringify(TraderBuild, null, "\t"), 'utf8');
fs.writeFileSync('../client/trading/api/getTraderAssort/' + traderToDeleteItems + '.json', JSON.stringify(FILE, null, "\t"), 'utf8');
console.log("Script Ended!");