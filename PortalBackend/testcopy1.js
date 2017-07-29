var express = require('express')
var app = express()

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/test')

var fileUpload = require('express-fileupload')
app.use(fileUpload())

var extract = require('extract-zip')

var fs = require('fs');

var glob = require('glob')

var arrayUnique = require('npm-array-unique')

var itemSchema = mongoose.Schema({
	handle: String,
	informationCode: String,
	fields: [{
		fieldName: String,
		fieldValue: String
	}],
	level: String,
	warn_flag: Boolean
})

var sourceSchema = mongoose.Schema({
	handle: [String],
	informationCode: String,
	level: String,
	warn_flag: Boolean
})

var metadataSchema = mongoose.Schema({
	handle: String,
	informationCode: String,
	fieldValue: String,
	fieldName: String,
	level: String,
	warn_flag: Boolean
})

const lim = 10

// var offset = 0

var bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// data retrieval
app.post('/api/metadatalevels', function (req, res) {
	var collectionName = req.body.collectionName
	var pageToken = parseInt(req.body.pageToken)
	var choice = req.body.choice
	var fieldName = req.body.fieldName
	var infoCode = req.body.informationCode
	// console.log(collectionName)
	var metadataDemo = mongoose.model('metadataDemo', metadataSchema, collectionName)
	var qs = {"level":"metadataLevel"}
	// get the items
	if (fieldName=="NULL" && infoCode=="NULL"){
		var resObj = {fieldName:[],informationCode:[],count:[],item:[]}
		var cursor = metadataDemo.find(qs, function(err, item) {
		  if (err) throw err;
		  // object of the item
		  
		 //  for(a in item){
		 //  	// console.log(item[a])
		 //  	if(choice==="fieldName"){
			//   	resObj.fieldName.push(item[a].fieldName)
			// }
			// else if(choice==="informationCode"){
			//   	resObj.informationCode.push(item[a].informationCode)
			// }
		 //  }
		  // console.dir(resObj)
		  // arrayUnique.uniqueCount(resObj.fieldName)
		  // debugger
		  // console.dir(item)
		  // res.send(resObj)
		})
		// .select(choice)
		.distinct(choice,function(err, ids){
			// console.log(ids)
			if(choice==="fieldName"){
				resObj.fieldName = ids
			}
			else if(choice==="informationCode"){
			  	resObj.informationCode = ids
			}
			var qry = []
			for(a in ids){
			// for(var a=0; a<ids.length; a++){
				qry.push(metadataDemo.find(qs)
				.where(choice).equals(ids[a])
				.count())
				// console.log(v)
				// .then(function(data){
				// 	console.log(data)
				// 	resObj.count.push(data)
				// 	resObj.item.push({"name":ids[a],"count":data})
				// 	console.dir(resObj)
				// })
				// console.dir(resObj)
		    }
		    for (q in qry){
		    	qry[q].exec(function(err, cnt){
					console.log(cnt)
					resObj.count.push(cnt)
					resObj.item.push({"name":ids[a],"count":cnt})
					console.dir(resObj)
					// res.send(resObj)
					// c.push(cnt)
				})
			}
		    // console.dir(resObj)
		    res.send(resObj)
		}).cursor()
		cursor.on('data', function(doc) {
		  // Called once for every document
		  console.log("Item:------------"+doc.fieldName)
		  var curs = metadataDemo.find(qs)
				.where(choice).equals(doc.fieldName)
				.count()
				.cursor()
			curs.on('data', function(itm){
				console.log(itm)
			})
		});
		cursor.on('close', function() {
		  // Called when done
		  console.log("Full done")
		});
		// .distinct(choice, "{"+choice+": 1}")
	}
	else if (fieldName!=="NULL" || infoCode!=="NULL"){
		console.log("Entered")		
		if (fieldName!=="NULL"){
			fieldName = JSON.parse("["+fieldName+"]")
			values = fieldName
		}
		else if (infoCode!=="NULL"){
			infoCode = JSON.parse("["+infoCode+"]")
			values = infoCode
		}
		console.log(values)
		metadataDemo.find(qs, function(err, item) {
		  if (err) throw err;
		  // object of the item
		  var resObj = {
		  	"items":[],
		  	"pageToken": pageToken+1
		  }
		  for(a in item){
		  	console.log(item[a])
		  	resObj.items.push({
		  		"handleId": item[a].handle,
				"informationCode": item[a].informationCode,
				"fieldvalue": item[a].fieldValue,
				"fieldName": item[a].fieldName,
				"level": item[a].level
		  	})
		  }
		  res.send(resObj)
		}).where(choice).in(values)
		.limit(lim).skip((pageToken-1)*lim);
	}
})

app.post('/api/sourcelevel', function (req, res) {
	var collectionName = req.body.collectionName
	var pageToken = parseInt(req.body.pageToken)
	var choice = req.body.choice
	var handle = req.body.handle
	var infoCode = req.body.informationCode
	console.log(collectionName)
	var sourceDemo = mongoose.model('sourceDemo', sourceSchema, collectionName)
	var qs = {"level":"sourceLevel"}
	// get the items
	if (handle=="NULL" && infoCode=="NULL"){
		sourceDemo.find(qs, function(err, item) {
		  if (err) throw err;
		  // object of the item
		  var resObj = {handle:[],informationCode:[]}
		  for(a in item){
		  	console.log(item[a])
		  	if(choice==="handle"){
		  		console.log(item[a].handle)
		  		var informationCode_unit = item[a].informationCode
		  		console.log("InfoCode: "+informationCode_unit)
		  		item[a].handle.forEach(function(handleId) {
		  			resObj.handle.push({
		  				"handle":handleId,
		  				"informationCode": informationCode_unit
		  			})
		  		})
			}
			else if(choice==="informationCode"){
			  	resObj.informationCode.push(item[a].informationCode)
			}
		  }
		  res.send(resObj)
		})
		.select("handle informationCode")
	}
	else if (handle!=="NULL" || infoCode!=="NULL"){
		console.log("Entered")		
		if (infoCode!=="NULL"){
			infoCode = JSON.parse("["+infoCode+"]")
			// values = infoCode
			sourceDemo.find(qs, function(err, item) {
			  if (err) throw err;
			  // object of the item
			  var resObj = {
			  	"items":[],
			  	"pageToken": pageToken+1
			  }		  
			  for(a in item){
			  	console.log(item[a])
			  	resObj.items.push({
			  		"handleId": item[a].handle,
					"informationCode": item[a].informationCode
			  	})
			  }
			  res.send(resObj)
			}).where(choice).in(infoCode)
			.limit(lim).skip((pageToken-1)*lim);
		}
		// console.log(values)
		
	}
})



// file upload
app.post('/api/file', function (req, res) {
	if (!req.files)
    		return res.status(400).send('No files were uploaded.'); 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  	let sampleFile = req.files.uploadedFile;
 	uploadPath = '/home/subhayan/log_analysis/upload/'+sampleFile.name
 	extractPath = '/home/subhayan/log_analysis/upload/unzipped/'
  // Use the mv() method to place the file somewhere on your server
  	sampleFile.mv(uploadPath, function(err) {
    	if (err)
      		return res.status(500).send(err);
    	res.send('File uploaded!');
  	});
  	extract(uploadPath, {dir: extractPath}, function (err) {
 	// extraction is complete. make sure to handle the err 
 		if (err) throw err;
	})
	var getLogs = function (src, callback) {
	  glob(src + '**/*/*.txt', callback);
	};
	getLogs(extractPath, function (err, res) {
	  if (err) {
	    console.log('Error', err);
	  } else {
	    console.log(res);
	    sourceName = "test_source"
	    var ItemDemo = mongoose.model('ItemDemo', itemSchema, sourceName)
	    var MetadataDemo = mongoose.model('MetadataDemo', metadataSchema, sourceName)
	    var SourceDemo = mongoose.model('SourceDemo', sourceSchema, sourceName)
	    for(f in res){
	    	console.log(res[f])
	    	var level = ""
	    	if(/ItemError/.test(res[f])){
	    		level = "itemLevel"
	    	}
	    	if(/MetadataError/.test(res[f])){
	    		level = "metadataLevel"
	    	}
	    	if(/SourceError/.test(res[f])){
	    		level = "sourceLevel"
	    	}
	    	var content = fs.readFileSync(res[f]);
	    	if(/metaInfo.txt/.test(res[f])){
	    		sourceName = content
	    		// console.log("\nIt is Handle Info: "+ content)
	    	}
	    	else{
 				// console.log("\nOutput Content : \n"+ content);
 				var jsonCont =  JSON.parse(content);
	 			// console.dir(jsonCont)
 				jsonCont.forEach(function(item) {
 					console.log(item)
 					console.log("--------------------------")
 					flag = /ERR/.test(item.informationCode) ? false : true
 					switch(level){
 						case "itemLevel":
 							var record = new ItemDemo({
 								handle: item.handle,
								informationCode: item.informationCode,
								fields: item.fields,
								level: level,
								warn_flag: flag
 							})
 							break;
 						case "metadataLevel":
 							var record = new MetadataDemo({
 								handle: item.handle,
								informationCode: item.informationCode,
								fieldName: item.fieldName,
								fieldValue: item.fieldValue,
								level: level,
								warn_flag: flag
 							})
 							break;
 						case "sourceLevel":
 							var record = new SourceDemo({
 								handle: item.handles,
 								informationCode: item.informationCode,
								level: level,
								warn_flag: flag
 							})
 							break;
 					}
 					record.save(function(err,record){
 						if (err) return console.error(err);
 					})
 				})
	    	}
	    	console.log("\n*********************************\n")
	    }
	  }
	});
})

app.listen(3010, function () {
  console.log('Example app listening on port 3010!')
})
