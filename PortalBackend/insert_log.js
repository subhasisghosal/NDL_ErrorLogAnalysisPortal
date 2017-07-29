var mongodb = require('mongodb');
var mongoClient= mongodb.MongoClient;

var url = 'mongodb://localhost:27017/test';

var fs = require('fs');

fs.readFile('log_format.json', 'utf8', function(error, data){
   if(error){
		return console.log(error);
	} else{
		// console.log(data);	

		var newdata = JSON.parse(data);
		var metadataLevelObjects = newdata.metadataLevel;
		var itemLevelObjects = newdata.itemLevel;
		var sourceLevelObjects = newdata.sourceLevel;

		mongoClient.connect(url, function (err, db){
 		if(err){
       		 	console.log('failed');
        		}else{  
				console.log('connection established');

				for(var i=0;i<metadataLevelObjects.length;i++){
					var obj = {
						"fieldName": metadataLevelObjects[i].fieldName,
						"fieldValue": metadataLevelObjects[i].fieldValue,
						"informationCode": metadataLevelObjects[i].informationCode,
						"handle" : metadataLevelObjects[i].handle,
						"level" : "metadataLevel"
					};
        				db.collection('log_error').insert(obj);
				}

				for(var i=0;i<itemLevelObjects.length;i++){
					var obj = {
						"fields": itemLevelObjects[i].fields,
						"informationCode": itemLevelObjects[i].informationCode,
						"handle" : itemLevelObjects[i].handle,
						"level" : "itemLevel"
					};
        				db.collection('log_error').insert(obj);
				}
				for(var i=0;i<sourceLevelObjects.length;i++){
					var obj = {
						"informationCode": sourceLevelObjects[i].informationCode,
						"handle" : sourceLevelObjects[i].handles,
						"level" : "sourceLevel"
					};
        				db.collection('log_error').insert(obj);
				}

				db.close();
        		}
		});
	}
});

