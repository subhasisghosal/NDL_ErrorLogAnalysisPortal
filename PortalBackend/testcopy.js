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
var unique = require('array-unique');

var async = require('async')

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

var commonSchema = mongoose.Schema({
	informationCode: String,
	level: String,
	warn_flag: Boolean
})

const lim = 10

// var offset = 0

var bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) 

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)

    // Pass to next layer of middleware
    next()
}) // support encoded bodies
// support encoded bodies

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
		metadataDemo.find(qs)
		.distinct(choice,function(err, ids){
			console.log(ids)
			if (err) throw err;
			if(choice==="fieldName"){
				resObj.fieldName = ids
			}
			else if(choice==="informationCode"){
			  	resObj.informationCode = ids
			}
			async.eachSeries(ids,function(item,calback){
				console.log(item)
				getCount = function(q,callback){
					metadataDemo.find(qs)
					.where(choice).equals(item)
					.count(function(err,cnt){
						resObj.item.push({"name":item,"count":cnt})
						// console.dir(resObj)
						callback && callback(resObj)
					})
				}
				getCount(qs,function(data){
					console.dir(data)
					calback()
				});
				// calback()
			},function(err){
				if (err) throw err
				// getCount(qs,function(data){
				// 	console.dir(data)
				// });
				console.log("Done")
				res.send(resObj)
			})
		    // res.send(resObj)
		})
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
		sourceDemo.find(qs)
		.distinct(choice, function(err, items) {
		  if (err) throw err;
		  // object of the item
		  // console.log(items)
		  var resObj = {item:[]}
		  async.eachSeries(items,function(item,calback){
				// console.log(item)
				getCount = function(q,callback){
					sourceDemo.find(qs)
					.where(choice).equals(item)
					.count(function(err,cnt){
						resObj.item.push({"name":item,"count":cnt})
						console.dir(resObj)
						callback && callback(resObj)
					})
				}
				getCount(qs,function(data){
					// console.dir(data)
					calback()
				});
			},function(err){
				if (err) throw err
				console.log("Done")
				res.send(resObj)
			})
		})
		// .select(choice+" -_id")
	}
	else if (handle!=="NULL" || infoCode!=="NULL"){
		console.log("Entered")		
		if (infoCode!=="NULL"){
			infoCode = JSON.parse("["+infoCode+"]")
			// values = infoCode
			sourceDemo.find(qs, function(err, items) {
			  if (err) throw err;
			  // object of the item
			  var resObj = {
			  	"items":[],
			  	"handles":[],
			  	"pageToken": pageToken+1
			  }	
			  // console.log(items)
			  	async.eachSeries(items,function(item,calback){
					console.log(item)
					resObj.handles.push(item.handle)
					// getCount = function(q,callback){
					// 	metadataDemo.find(qs)
					// 	.where(choice).equals(item)
					// 	.count(function(err,cnt){
					// 		resObj.item.push({"name":item,"count":cnt})
					// 		// console.dir(resObj)
					// 		callback && callback(resObj)
					// 	})
					// }
					// getCount(qs,function(data){
					// 	console.dir(data)
						calback()
					// });
				},function(err){
					if (err) throw err
					console.log("Done")
					// res.send(resObj)
				})	  
			  // for(a in item){
			  // 	// console.log(item[a])
			  // 	resObj.items.push({
			  // 		"handleId": item[a].handle,
					// "informationCode": item[a].informationCode
			  // 	})
			  // }
			  res.send(resObj)
			}).where(choice).in(infoCode)
			.limit(lim).skip((pageToken-1)*lim);
		}
		if (handle!=="NULL") {
			handle = JSON.parse("["+handle+"]")
			sourceDemo.find(qs, function(err, items) {
			  if (err) throw err;
			  // object of the item
			  var resObj = {
			  	"items":[],
			  	"handles":[],
			  	"pageToken": pageToken+1
			  }	
			  console.log(items)
			  	async.eachSeries(items,function(item,calback){
					// console.log(item)
					resObj.items.push(item.informationCode)
					calback()
				},function(err){
					if (err) throw err
					console.log("Done")
					console.dir(unique(resObj.items))
					// res.send(resObj)
				})	  
			  res.send(resObj)
			}).where(choice).in(handle)
			.limit(lim).skip((pageToken-1)*lim)
		}
	}
})

app.post('/api/report', function (req, res) {
	var collectionName = req.body.collectionName
	var level = (req.body.level==="all")?["itemLevel","metadataLevel","sourceLevel"]:req.body.level
	// var flag = req.body.flag
	var flagValue = (req.body.flag==="warn")?true:(req.body.flag==="err")?false:[true,false]
	var commonDemo = mongoose.model('commonDemo', commonSchema, collectionName)
	var resObj = {item:[]}
	var qs = {"level":level,"warn_flag":flagValue}
	commonDemo.find()
	.distinct("informationCode",qs,function(err, items){
		// console.log(items)
		if (err) throw err;
		async.eachSeries(items,function(item,calback){
			console.log(item)
			getCount = function(q,callback){
				commonDemo.find(q)
				.where("informationCode").equals(item)
				.count(function(err,cnt){
					resObj.item.push({"name":item,"count":cnt,"level":level})
					// console.dir(resObj)
					callback && callback(resObj)
				})
			}
			getCount(qs,function(data){
				// console.dir(data)
				calback()
			});
		},function(err){
			if (err) throw err
			console.log("Done")
			res.send(resObj)
		})
	})
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
