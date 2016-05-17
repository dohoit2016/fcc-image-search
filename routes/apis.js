var express = require('express');
var router = express.Router();
var url = require('url');
var request = require('request');
var fs = require('fs');

var recentRequest = [];

/* GET users listing. */
router.get('/image/*', function(req, res, next) {
	var parseURL = url.parse(req.url, true);
	var query = parseURL.pathname.substring('/image/'.length);
	// console.log(parseURL.query);
	// console.log(parseURL);
	// console.log(query);
	var option = {
		url: 'https://bingapis.azure-api.net/api/v5/images/search?q=' + query + '&count=10&safeSearch=Off' + (parseURL.query.hasOwnProperty('offset') ? ('&offset=' + parseInt(parseURL.query.offset)) : ""),
		headers: {
			'Ocp-Apim-Subscription-Key': '20ca912672b440289a926f7c668dfd35'
		}
	}
	request(option, function (err, response, body) {
		if (err){
			console.log(err);
			return;
		}
		// console.log(response);
		// console.log(body);
		body = JSON.parse(body).value;
		// res.json(body);
		// console.log(url.parse(decodeURIComponent(body[0].hostPageUrl), true));
		// res.end();
		// return;
		var result = [];
		for (var i = 0; i < body.length; i++) {
			var r = {};
			var b = body[i];
			r.url = b.contentUrl;
			r.snippet = b.name;
			r.thumbnail = b.thumbnailUrl;
			r.context = url.parse(decodeURIComponent(b.hostPageUrl), true).query.r;
			result.push(r);
		}
		res.json(result);
		fs.readFile(__dirname + "/../search.json", "utf8", function (err, data) {
			if (err){
				console.log(err);
				return;
			}
			console.log(data.toString());
			recentRequest = JSON.parse(data);
			if (recentRequest.length >= 10){
				recentRequest.pop();
			}
			recentRequest.unshift({
				search: decodeURIComponent(query),
				when: (new Date()).toString()
			});
			console.log(recentRequest);
			fs.writeFile(__dirname + "/../search.json", JSON.stringify(recentRequest, null, 4), function (err) {
				if (err){
					console.log("err write file");
					console.log(err);
					return;
				}
			})
		})
		
	})

});

router.get('/latestImageSearch', function (req, res, next) {
	fs.readFile(__dirname + "/../search.json", function (err, data) {
		recentRequest = JSON.parse(data);
		res.json(recentRequest);
	})
});

module.exports = router;
