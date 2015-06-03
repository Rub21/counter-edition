#!/usr/bin/env node

var fs = require('fs');
var osmium = require('osmium');
var fs = require('fs');
var _ = require('underscore');
var argv = require('optimist').argv;
var timestamp = 1429920000; //04/25/2015
var users = [
	[510836, 'Rub21'],
	[1240849, 'ediyes'],
	[1829683, 'Luis36995'],
	[2219338, 'RichRico'],
	[2226712, 'dannykath'],
	[94578, 'andygol'],
	[1051550, 'shravan91'],
	[2554698, 'ruthmaben'],
	[2377377, 'abel801'],
	[2511706, 'calfarome'],
	[2512300, 'samely'],
	[2115749, 'srividya_c'],
	[1306, 'PlaneMad'],
	[2748195, 'karitotp'],
	[2644101, 'Chetan_Gowda'],
	[2823295, 'ramyaragupathy'],
	[589596, 'lxbarth'],
	[2306749, 'shvrm'],
	[53073, 'Aaron Lidman'],
	[146675, 'geohacker']
];

var obj = function() {
	return {
		user: null,
		osm_node: 0,
		osm_way: 0,
		osm_relation: 0,
		changeset: []
	};
};

var count = {};

for (var i = 0; i < users.length; i++) {
	count[users[i][0]] = new obj();
	count[users[i][0]].user = users[i][1];
}

var file = new osmium.File(argv.file);
var reader = new osmium.Reader(file);
var handler = new osmium.Handler();

handler.on('way', function(way) {
	if (way.timestamp >= timestamp) {
		if (count.hasOwnProperty(way.uid)) {
			++count[way.uid].osm_way;
			count[way.uid].changeset.push(way.changeset);
		}
	}
});

handler.on('node', function(node) {
	if (node.timestamp >= timestamp) {
		if (count.hasOwnProperty(node.uid)) {
			++count[node.uid].osm_node;
			count[node.uid].changeset.push(node.changeset);
		}
	}
});

handler.on('relation', function(relation) {
	if (relation.timestamp >= timestamp) {
		if (count.hasOwnProperty(relation.uid)) {
			++count[relation.uid].osm_relation;
			count[relation.uid].changeset.push(relation.changeset);
		}
	}
});
reader.apply(handler);
count = _.sortBy(count, function(v, k) {
	return -(v.osm_node + v.osm_way + v.osm_relation);
});
var output = argv.file.split('.')[0] + '-count.md';
fs.writeFile(output, "User | Num OSM Objects | Num Changeset | Num nodes | Num ways | Num relation \n ---|---|---|---|---|--- \n", function(err) {});
var total = new obj();
_.each(count, function(v, k) {
	total.osm_node += v.osm_node;
	total.osm_way += v.osm_way
	total.osm_relation += v.osm_relation
	total.changeset = total.changeset.concat(v.changeset);
	var text = v.user + ' | ' + addCommas(v.osm_node + v.osm_way + v.osm_relation) + ' | ' + addCommas(_.size(_.uniq(v.changeset))) + ' | ' + addCommas(v.osm_node) + ' | ' + addCommas(v.osm_way) + ' | ' + addCommas(v.osm_relation) + '\n';
	fs.appendFile(output, text, function(err) {});
});
var text = '**Total** | ' + addCommas(total.osm_node + total.osm_way + total.osm_relation) + ' | ' + addCommas(_.size(_.uniq(total.changeset))) + ' | ' + addCommas(total.osm_node) + ' | ' + addCommas(total.osm_way) + ' | ' + addCommas(total.osm_relation) + '\n';
fs.appendFile(output, text, function(err) {});

function addCommas(intNum) {
	return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}