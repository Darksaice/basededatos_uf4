#!/usr/bin/node

const http = require("http");
const node_static = require("node-static");

const mongo = require("mongodb").MongoClient;

let server_url = "mongodb://localhost:27017";

mongo.connect(server_url, (err, server) => {
	if (err){
		console.log("Error en la conexión a MongoDB");
		throw err;
	}

	console.log("Dentro de MongoDB");

	let chats_db = server.db("amongmeme");

	chats_db.collection("chats").find({});

});



console.log("Inicializando servidor chat");


/*
let public_files = new node_static.Server("pub");

http.createServer( (request, response) => {

	console.log("Archivo"+request.url);

	public_files.serve(request, response);
}).listen(8080);
*/
