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
		osm_nodevx: 0,
		osm_nodev1: 0,
		osm_wayv1: 0,
		osm_wayvx: 0,
		osm_relationv1: 0,
		osm_relationvx: 0,
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
	if (way.timestamp >= timestamp) {
		if (way.version === 1) {
			if (count.hasOwnProperty(way.user)) {
				++count[way.user].osm_wayv1;
				count[way.user].changeset.push(way.changeset);
			}
		} else {
			if (count.hasOwnProperty(way.user)) {
				++count[way.user].osm_wayvx;
				count[way.user].changeset.push(way.changeset);
			}
		}
	}
});

handler.on('node', function(node) {
	if (node.timestamp >= timestamp) {
		if (node.version === 1) {
			if (count.hasOwnProperty(node.user)) {
				++count[node.user].osm_nodev1;
				count[node.user].changeset.push(node.changeset);
			}
		} else {
			if (count.hasOwnProperty(node.user)) {
				++count[node.user].osm_nodevx;
				count[node.user].changeset.push(node.changeset);
			}
		}
	}
});

handler.on('relation', function(relation) {
	if (relation.timestamp >= timestamp) {
		if (relation.version === 1) {
			if (count.hasOwnProperty(relation.user)) {
				++count[relation.user].osm_relationv1;
				count[relation.user].changeset.push(relation.changeset);
			}
		} else {
			if (count.hasOwnProperty(relation.user)) {
				++count[relation.user].osm_relationvx;
				count[relation.user].changeset.push(relation.changeset);
			}
		}
	}
});
reader.apply(handler);
count = _.sortBy(count, function(v, k) {
	return -(v.osm_nodev1 + v.osm_nodevx + v.osm_wayv1 + v.osm_wayvx + v.osm_relationv1 + v.osm_relationvx);
});

var output = argv.file.split('.')[0] + '-count.md';
fs.writeFile(output, "User | Num OSM Objects | Num Changeset | Num nodes V1 | Num nodes Vx | Num ways V1| Num ways Vx | Num relation V1 | Num relation Vx \n ---|---|---|---|---|---|---|---|--- \n", function(err) {});
var total = new obj();
_.each(count, function(v, k) {
	total.osm_nodev1 += v.osm_nodev1;
	total.osm_nodevx += v.osm_nodevx;
	total.osm_wayv1 += v.osm_wayv1;
	total.osm_wayvx += v.osm_wayvx;
	total.osm_relationv1 += v.osm_relationv1;
	total.osm_relationvx += v.osm_relationvx;
	total.changeset = total.changeset.concat(v.changeset);
	var text = v.user + ' | ' + addCommas(v.osm_nodev1 + v.osm_nodevx + v.osm_wayv1 + v.osm_wayvx + v.osm_relationv1 + v.osm_relationvx) +
		' | ' + addCommas(_.size(_.uniq(v.changeset))) +
		' | ' + addCommas(v.osm_nodev1) + ' | ' + addCommas(v.osm_nodevx) + ' | ' + addCommas(v.osm_wayv1) + ' | ' + addCommas(v.osm_wayvx) +
		' | ' + addCommas(v.osm_relationv1) + ' | ' + addCommas(v.osm_relationvx) + '\n';

	fs.appendFile(output, text, function(err) {});
});
var text = '**Total** | ' + addCommas(total.osm_nodev1 + total.osm_nodevx + total.osm_wayv1 + total.osm_wayvx + total.osm_relationv1 + total.osm_relationvx) +
	' | ' + addCommas(_.size(_.uniq(total.changeset))) + ' | ' + addCommas(total.osm_nodev1) + ' | ' + addCommas(total.osm_nodevx) +
	' | ' + addCommas(total.osm_wayv1) + ' | ' + addCommas(total.osm_wayvx) + ' | ' + addCommas(total.osm_relationv1) + ' | ' + addCommas(total.osm_relationvx) + '\n';

fs.appendFile(output, text, function(err) {});

function addCommas(intNum) {
	return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}