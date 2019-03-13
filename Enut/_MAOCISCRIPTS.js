var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var allowDeleting = true;
//var allowDeleting = false;
var traderToDeleteItems = "polivilasTrader";
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}
var FILE = JSON.parse(ReadJson('client/trading/api/getTraderAssort/' + traderToDeleteItems + '.json'));
var TODELETE = JSON.parse(ReadJson('ToDelete/list.json'));

for (let key in TODELETE.data[1].Inventory.items) {
	for (let keyName in FILE.items){
		if (TODELETE.data[1].Inventory.items[key]._tpl == FILE.items[keyName]._tpl){
			console.log("DELETED: [" + keyName + "] " + FILE.items[keyName]._id + " - " + FILE.items[keyName]._tpl);
			//FILE.items.del.push({"_id": FILE.items[keyName]._id});
			if(allowDeleting)
				FILE.items.splice(keyName, 1);
			break;
		}
	}
}

fs.writeFileSync('client/trading/api/getTraderAssort/' + traderToDeleteItems + '.json', JSON.stringify(FILE, null, "\t"), 'utf8');
console.log("Script Ended!");