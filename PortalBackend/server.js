var http = require('http');
var mongodb = require('mongodb');
var mongoClient= mongodb.MongoClient;

var format = require('util').format;

var url = 'mongodb://localhost:27017/test';

var results1=[];
var results2=[];
var text=[];
text.push("itemLevel");
text.push("metadataLevel");

	mongoClient.connect(url, function (err, db){
 		if(err){
       		 	console.log('failed');
        		}else{  
				console.log('connection established');

				var collection = db.collection('log_error');

				collection.count(function(err, count){
					console.log("There are "+ count + " records");
				});

				/* basic query statement */
				var queryStatement_metadata= {"level":text[1]};
				var queryStatement_item = {"level":text[0]};
				var sortField = { "handle" : -1};

				/* Printing data from cursor each */
				collection.find(queryStatement_metadata).sort(sortField).each(function (err, doc){
					if(doc!= null)	console.log("Doc from each metadataLevel docs ");
				console.dir(doc);
					results1.push(doc);							
				});
				collection.find(queryStatement_item).sort(sortField).each(function (err, doc){
					if(doc!= null)	console.log("Doc from each metadataLevel docs ");
				console.dir(doc);
					results2.push(doc);							
				});

				/* closing the db connection*/
				db.close();
        		}
		});

function onRequest(request, response){
	response.writeHead(200,{'Content-Type':'application/json'});
	console.log(request.url);
	if(request.url=='/metadatalevel'){
		response.write(JSON.stringify(results1));
	}
	else{ 
		if(request.url == '/itemlevel')
			response.write(JSON.stringify(results2));	
	}
	response.end();
}

http.createServer(onRequest).listen(8000);
