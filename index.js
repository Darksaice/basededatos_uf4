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
	
/*function sendChats (response)
{	
	let cursorP = chats_db.collection("chats").find({});
	
	let data = [];

	cursorP.each( (err, doc) => {
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
};*/


console.log("Inicializando servidor chat");


let public_files = new node_static.Server("pub");

http.createServer( (request, response) => {

	console.log("Archivo: "+request.url);
	
	if (request.url == "/chats"){
		console.log("Nos piden el chat de mongo");
		let cursor = chats_db.collection("chats").find({});
		let chat = cursor.toArray();
		chat.then( (data) => {
		//	console.log(data);
			response.writeHead(200, {'Content-Type':'text/plain'});
			response.write( JSON.stringify(data) );
			response.end();
		});
		
		return;

	} 
	if (request.url == "/submit") {
		console.log("Envío de datos: ", request.body);
		let body = [];
		request.on('data', chunk => {
			body.push(chunk);
		}).on('end', () => {
			let chat_data = JSON.parse(Buffer.concat(body).toString());
			
			chats_db.collection("chats").insertOne({
				user: chat_data.chat_user,
				msg: chat_data.chat_msg,
				date: Date.now()
			});
		
		});

		response.end();	
		return;
	}
	public_files.serve(request, response);
}).listen(8080);

