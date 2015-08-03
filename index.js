#!/usr/bin/env node

var fs = require('fs');
var osmium = require('osmium');
var fs = require('fs');
var _ = require('underscore');
var argv = require('optimist').argv;
var users = require('./users.js').users;
var timestamp = argv.timestamp;

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
	count[users[i]] = new obj();
	count[users[i]].user = users[i];
}

var file = new osmium.File(argv.file);
var reader = new osmium.Reader(file);
var handler = new osmium.Handler();

handler.on('way', function(way) {
	if (way.timestamp >= timestamp && way.version === 1 && way.tags().highway != 'undefined') {
		if (count.hasOwnProperty(way.user)) {
			++count[way.user].osm_way;
			count[way.user].changeset.push(way.changeset);
		}
	}
});

handler.on('node', function(node) {
	if (node.timestamp >= timestamp && node.version === 1 && way.tags().highway != 'undefined') {
		if (count.hasOwnProperty(node.user)) {
			++count[node.user].osm_node;
			count[node.user].changeset.push(node.changeset);
		}
	}
});

handler.on('relation', function(relation) {
	if (relation.timestamp >= timestamp && relation.version === 1 && way.tags().highway != 'undefined') {
		if (count.hasOwnProperty(relation.user)) {
			++count[relation.user].osm_relation;
			count[relation.user].changeset.push(relation.changeset);
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