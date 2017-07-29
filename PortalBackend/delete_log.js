var mongodb = require('mongodb');
var mongoClient= mongodb.MongoClient;

var url = 'mongodb://localhost:27017/test';

	mongoClient.connect(url, function (err, db){
 		if(err){
       		 	console.log('failed');
        		}else{  
				console.log('connection established');
				db.collection('test_source').drop();
				console.log('collection data has been removed');
				db.close();
        		}
		});
	
