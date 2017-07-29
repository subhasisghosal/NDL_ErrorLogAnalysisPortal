var express = require('express')
var app = express()

/*var allowCrossDomain = function(req,res){
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
	res.header('Access-Control-Allow-Headers', 'Content-Type')
}
*/
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/ndl')

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

var bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
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
// data retrieval

app.get('/', function(req,res){
	console.log("yahooooo")
	res.send("Hello world")
})

app.post('/test', function(request, response){
	var collectionName = request.body.collectionName
	var commonDemo = mongoose.model('commonDemo', commonSchema, collectionName)
	var record = new commonDemo({
		informationCode: "Something",
		level: "itemlevel",
		warn_flag: true
	})
	console.log(collectionName)
	record.save(function(err,record){
		if (err) return console.error(err);
		response.send("Successfull")
	})
})

app.post('/testRef', function(request, response){
	var collectionName = request.body.collectionName
	var commonDemo = mongoose.model('commonDemo', commonSchema, collectionName)
	var data = commonDemo.findOne({'handle' : '123456789/14881'},'_id',function(err,res){
		console.log(res)
	})
	console.dir(data)
	data.exec(function(err,item){
		console.log(item)
	})
	response.send("Success")
})

app.post('/api/report', function (req, res) {
	var collectionName = req.body.collectionName
	var level = (req.body.level==="all")?["itemLevel","metadataLevel","sourceLevel"]:req.body.level
	// var flag = req.body.flag
	var flagValue = (req.body.flag==="warn")?true:(req.body.flag==="err")?false:[true,false]
	var commonDemo = mongoose.model('commonDemo', commonSchema, collectionName)
	var resObj = {item:[]}
	var qs = {"level":level,"warn_flag":flagValue}
	var pipeline = [
	{ "$lookup": { 
		"from": "informationCodeMaster", 
		"localField": "informationCode", 
		"foreignField": "informationCode", 
		"as": "detailedInfoCodes"
	}}, 
	{ "$unwind": "$detailedInfoCodes" },
	{ "$project": { 
		"informationCode": 1, 
		"level": "$detailedInfoCodes.level", 
		"warn_flag": "$detailedInfoCodes.warn_flag", 
		"description": 1
	}}
	]
	// commonDemo.aggregate(pipeline).exec(function(err, infoCodes) {
	// 		    // console.dir(infoCodes);
	// });
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
					resObj.item.push({"name":item,"count":cnt})
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
 	uploadPath = '/home/subhasis/NDL_Error_Log_Analysis/LogAnalysisServer/upload/'+sampleFile.name
 	extractPath = '/home/subhasis/NDL_Error_Log_Analysis/LogAnalysisServer/upload/unzipped/'
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

app.listen(3010,  function () {
  console.log('Example app listening on port 3010!')
})
