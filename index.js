#!/usr/bin/node

const http = require("http");
const node_static = require("node-static");

const mongo = require("mongodb").MongoClient;

let server_url = "mongodb://localhost:27017";

let chats_db;

mongo.connect(server_url, (err, server) => {
	if (err){
		console.log("Error en la conexión a MongoDB");
		throw err;
	}

	console.log("Dentro de MongoDB");

	chats_db = server.db("amongmeme");
});
	
function sendChats (response)
{	
	let cursor = chats_db.collection("chats").find({});
	
	let data = [];

	cursor.each( (err, doc) => {
			if (err) {
				console.log("Error al leer el documento");
				throw err;
			}
			data.push(doc);
		//	console.log(data);
		
		// if (ultimo caso){
		//  response.write("<p>Ahora viene el chat</p>");
		//  response.end();
		//	}

	});
	console.log(data);
};


console.log("Inicializando servidor chat");


let public_files = new node_static.Server("pub");

http.createServer( (request, response) => {

	console.log("Archivo: "+request.url);
	
	if (request.url == "/chats"){
		console.log("Nos piden el chat de mongo");
		response.writeHead(200, {'Content-Type':'text/plain'});
	//	response.write("<p>Ahora viene el chat</p>");
	//	response.end();

		sendChats(response);
	} else {
		public_files.serve(request, response);
	}
}).listen(8080);

