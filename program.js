var express = require("express");
var mongo = require('mongodb').MongoClient;
var cors = require("cors");
require("dotenv").config(); //ovo je neophodno da bih mogao sakriti varijable unutar stringa
var url =`mongodb://${process.env.USERNAME}:${process.env.PASSWOURD}@ds125914.mlab.com:25914/urls`;
var app = express();
app.use(cors());
app.use(express.static('./public'));
app.get("/n/*", function(request, response){
	//Unos novog url-a u bazu
	var newUrl = request.params[0];
	if(urlTester(newUrl)){
		//Ako je url provjereno dobar, onda ide insert
		mongo.connect(url, function(err, server) {
			if(err){throw err;}
			var db = server.db('urls');
			var collection = db.collection('urls');
			var query = {};
			var countUrls = 0;
			//prebrojavanje url-a je potrebno kako bi se napravio skraceni url
			collection.count(function(err, count) {
				countUrls = count;
				var letterDeterminator = parseInt(countUrls / 26);
				var shortUrl = String.fromCharCode(97+letterDeterminator) + countUrls;
				var obj = { 'originalUrl' : newUrl, 'shortUrl' : shortUrl};
				collection.insert(obj, function(error,data){
					if(error){throw error;}
					var jsonURL = {'originalUrl' : data.ops[0].originalUrl, 'shortUrl' : data.ops[0].shortUrl };
					response.send(jsonURL);
					server.close();
				});
			 });
			
		});
	}
	else{
		//Url nije dobar
		var errorMsg = {"error":"URL you provided is not in a correct format"};
		response.send(errorMsg);
	}
});
app.get( "/:surl", function(request, response){
	var inputUrl = request.params.surl;
	var stranica = {};
		mongo.connect(url, function(err, server) {
			var db = server.db('urls');
			var query = {shortUrl: {$eq: inputUrl}};
			let project = { _id: 0};
			var collection = db.collection("urls");
			collection.find(query).project(project).toArray(function(err, res) {
				if (err) throw err;
				if(res.length == 0){
					//nije nadjen takav skraceni url
					var errorMsg = {"error":"No such shortened url."};
					response.send(errorMsg);
				}
				else{
					response.redirect(res[0].originalUrl.toString());
				}
			  });
			  server.close();
		});
		
});
app.listen(process.env.PORT || 5000);

function urlTester(inputUrl){
	var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = new RegExp(expression);
	if (inputUrl.match(regex)) {
	  return true;
	} else {
	  return false;
	}
}