var express = require("express");
var mongo = require('mongodb').MongoClient;
require("dotenv").config();
var url =`mongodb://${process.env.USERNAME}:${process.env.PASSWOURD}@ds125914.mlab.com:25914/urls`;
var app = express();
app.get("/", function(request, response){
	var obj = { "user" : process.env.USERNAME, "pass" : process.env.PASSWOURD };
	response.send(obj);
});
app.listen(process.env.PORT || 5000);