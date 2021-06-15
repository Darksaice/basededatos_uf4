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
	
console.log("Inicializando servidor chat");


let public_files = new node_static.Server("pub");

http.createServer( (request, response) => {

	console.log("Archivo: "+request.url);
	
	if (request.url.startsWith("/chats")){
		console.log("Nos piden el chat de mongo");
		let info = request.url.split("=");
		console.log(info[1]);
		let query = {
			date : { $gt : parseInt(info[1]) }
		};

		let cursor = chats_db.collection("chats").find(query);
		let chat = cursor.toArray();
		chat.then( (data) => {
		//	console.log(data);
			response.writeHead(200, {'Content-Type':'text/plain'});
			response.write( JSON.stringify(data) );
			response.end();
		});
		
		return;

	}

	if (request.url == "/recent"){
		//yo tengo un total de 7 chats insertados en mongo
		const NUM = 7;
		const MAX = 5;	
		let cursor = chats_db.collection("chats").find({},{
				skip:NUM - MAX,
				limit:MAX,
				sort:{$natural:1},
			});
		
		let chat = cursor.toArray();
		chat.then( (data) => {
			response.writeHead(200, {'Content-Type':'text/plain'});
			response.write( JSON.stringify(data) );
			response.end();
		});
		return;
	}

	if (request.url == "/history"){
		const NUM = 7;
		const MAX = 7;
		let cursor = chats_db.collection("chats").find({},{
				limit:MAX,
				sort:{$natural:1},
		});
		let alldate = "";
		let chat = cursor.toArray();
		chat.then( (data) => {

			for (let i = 0; i < data.length; i++){
						let date = data[i].date;
						let currentDate = new Date (parseInt(date));
						let month = currentDate.getMonth () +1;
						let day = currentDate.getDate();
						let year = currentDate.getFullYear();

						let fecha = day + " / " + month + " / " + year;
						alldate = " ( " + fecha + " ) " + data[i].user + " : " + data[i].msg;
						
						response.writeHead(200, {'Content-Type':'text/plain'});
						response.write( JSON.stringify(alldate) + "\n" );
			}
			response.end();
		
		});
		return;
	}

	if (request.url == "/submit") {
		console.log("Envío de datos");
		let body = [];
		request.on('data', (chunk) => {
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
