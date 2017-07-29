var express = require('express')
var app = express()

var session = require('express-session')
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

var bcrypt = require('bcrypt');

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

// var config = require('./config')

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

var infoCodeSchema = mongoose.Schema({
    informationCode: String,
    description: String,
    level: String,
    warn_flag: Boolean
})

var userSchema = mongoose.Schema({
    userId: { type: String, unique: true, required: true, dropDups: true },
    password: String,
    firstName: String,
    lastName: String,
    role: String
})

var dataSourceSchema = mongoose.Schema({
    sourceCode: String,
    sourceName: String
})

var assignmentSchema = mongoose.Schema({
    userId: String,
    sourceCode: String,
    active: Boolean
})

var userSourceSchema = mongoose.Schema({
    userId: String,
    sourceCodes: [{
        code: String,
        isActive: Boolean
    }]
})

var sourceUserSchema = mongoose.Schema({
    sourceCode: String,
    userIds: [{
        uId: String,
        isActive: Boolean
    }]
})

var logDetailSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', field: '_id' },
    fileName: String,
    dataSource: { type: mongoose.Schema.Types.ObjectId, ref: 'dataSource', field: '_id' },
    batch: String,
    comments: String,
    uploadTime: { type: Date, default: Date.now }
})

var uploadLogSchema = mongoose.Schema({
    userID: String,
    fileName: String,
    sourceCode: String,
    batch: String,
    comments: String,
    collectionName: String,
    uploadTime: { type: Date, default: Date.now }
})

var IssueTrackerSchema = mongoose.Schema({
    userId: String,
    sourceCode: String,
    batch: String,
    fileName: String,
    commentLS: String,
    commentCS: String
})

const lim = 10

var bodyParser = require('body-parser')
app.use(fileUpload())
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }))
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, sid')
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)
    // Pass to next layer of middleware
    next()
}) // support encoded bodies

var sess
// data retrieval
app.post('/api/metadatalevel', function(req, res) {
    var collectionName = req.body.collectionName
    var pageToken = parseInt(req.body.pageToken)
    var choice = req.body.choice
    var fieldName = req.body.fieldName
    var infoCode = req.body.informationCode
    console.log(collectionName)
    var metadataDemo = mongoose.model('metadataDemo', metadataSchema, collectionName)
    var qs = { "level": "metadataLevel" }
    // get the items
    if (fieldName == "NULL" && infoCode == "NULL") {
        var resObj = { item: [] }
        metadataDemo.find(qs)
            .distinct(choice, function(err, ids) {
                console.log(ids)
                if (err) throw err;
                async.eachSeries(ids, function(item, calback) {
                    console.log(item)
                    getCount = function(q, callback) {
                        metadataDemo.find(qs)
                            .where(choice).equals(item)
                            .count(function(err, cnt) {
                                resObj.item.push({ "name": item, "count": cnt })
                                // console.dir(resObj)
                                callback && callback(resObj)
                            })
                    }
                    getCount(qs, function(data) {
                        console.dir(data)
                        calback()
                    });
                }, function(err) {
                    if (err) throw err
                    console.log("Done")
                    res.send(resObj)
                })
            })
    } else if (fieldName !== "NULL" || infoCode !== "NULL") {
        console.log("Entered")
        if (fieldName !== "NULL") {
            fieldName = JSON.parse("[" + fieldName + "]")
            values = fieldName
        } else if (infoCode !== "NULL") {
            infoCode = JSON.parse("[" + infoCode + "]")
            values = infoCode
        }
        console.log(values)
        metadataDemo.find(qs, function(err, item) {
                if (err) throw err;
                // object of the item
                var resObj = {
                    "items": [],
                    "pageToken": pageToken + 1
                }
                for (a in item) {
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
            .limit(lim).skip((pageToken - 1) * lim);
    }
})

app.post('/api/sourcelevel', function(req, res) {
    var collectionName = req.body.collectionName
    var pageToken = parseInt(req.body.pageToken)
    var choice = req.body.choice
    var handle = req.body.handle
    var infoCode = req.body.informationCode
    console.log(collectionName)
    var sourceDemo = mongoose.model('sourceDemo', sourceSchema, collectionName)
    var qs = { "level": "sourceLevel" }
    // get the items
    if (handle == "NULL" && infoCode == "NULL") {
        sourceDemo.find(qs)
            .distinct(choice, function(err, items) {
                if (err) throw err;
                var resObj = { item: [] }
                async.eachSeries(items, function(item, calback) {
                    // console.log(item)
                    getCount = function(q, callback) {
                        sourceDemo.find(qs)
                            .where(choice).equals(item)
                            .count(function(err, cnt) {
                                resObj.item.push({ "name": item, "count": cnt })
                                console.dir(resObj)
                                callback && callback(resObj)
                            })
                    }
                    getCount(qs, function(data) {
                        // console.dir(data)
                        calback()
                    });
                }, function(err) {
                    if (err) throw err
                    console.log("Done")
                    res.send(resObj)
                })
            })
    } else if (handle !== "NULL" || infoCode !== "NULL") {
        console.log("Entered")
        if (infoCode !== "NULL") {
            infoCode = JSON.parse("[" + infoCode + "]")
            // values = infoCode
            sourceDemo.find(qs, function(err, item) {
                    if (err) throw err;
                    // object of the item
                    var resObj = {
                        "items": [],
                        "pageToken": pageToken + 1
                    }
                    for (a in item) {
                        console.log(item[a])
                        resObj.items.push({
                            "handleId": item[a].handle,
                            "informationCode": item[a].informationCode
                        })
                    }
                    res.send(resObj)
                }).where(choice).in(infoCode)
                .limit(lim).skip((pageToken - 1) * lim);
        }
        if (handle !== "NULL") {
            handle = JSON.parse("[" + handle + "]")
            sourceDemo.find(qs, function(err, items) {
                    if (err) throw err;
                    // object of the item
                    var resObj = {
                        "items": [],
                        "handles": [],
                        "pageToken": pageToken + 1
                    }
                    console.log(items)
                    async.eachSeries(items, function(item, calback) {
                        // console.log(item)
                        resObj.items.push(item.informationCode)
                        calback()
                    }, function(err) {
                        if (err) throw err
                        console.log("Done")
                        // console.dir(resObj.items)
                        console.dir(unique(resObj.items))
                        // res.send(resObj)
                    })
                    res.send(resObj)
                }).where(choice).in(handle)
                .limit(lim).skip((pageToken - 1) * lim)
        }
    }
})

app.post('/api/itemlevel', function(req, res) {
    var collectionName = req.body.collectionName
    var pageToken = parseInt(req.body.pageToken)
    var choice = req.body.choice
    var fieldName = req.body.fieldName
    var infoCode = req.body.informationCode
    console.log(collectionName)
    var itemDemo = mongoose.model('itemDemo', itemSchema, collectionName)
    var qs = { "level": "itemLevel" }
    // get the items
    if (choice === "informationCode") {
        if (infoCode === "NULL") {
            itemDemo.find(qs)
                .distinct(choice, function(err, items) {
                    if (err) throw err;
                    var resObj = { item: [] }
                    async.eachSeries(items, function(item, calback) {
                        getCount = function(q, callback) {
                            itemDemo.find(q)
                                .where(choice).equals(item)
                                .count(function(err, cnt) {
                                    resObj.item.push({ "name": item, "count": cnt })
                                    callback && callback(resObj)
                                })
                        }
                        getCount(qs, function(data) {
                            calback()
                        });
                    }, function(err) {
                        if (err) throw err
                        console.log("Done")
                        res.send(resObj)
                    })
                })
        } else {
            infoCode = JSON.parse("[" + infoCode + "]")
            itemDemo.find(qs, function(err, items) {
                    var resObj = { item: [] }
                    async.eachSeries(items, function(item, calback) {
                        // console.log(item)
                        // resObj.item.push(item.fields)
                        async.eachSeries(item.fields, function(fields, callback) {
                            console.log(fields)
                            resObj.item.push(fields.fieldName)
                            callback()
                        }, function(err) {
                            if (err) throw err
                            console.log("Done fields")
                            // res.send(resObj)
                        })
                        calback()
                    }, function(err) {
                        if (err) throw err
                        console.log("Done")
                        unique(resObj.item)
                        res.send(resObj)
                    })
                })
                .where(choice).in(infoCode)
        }
    } else if (choice === "fieldName") {
        if (fieldName === "NULL") {
            itemDemo.find(qs)
                .distinct("fields.fieldName", function(err, items) {
                    if (err) throw err;
                    console.log(items)
                    var resObj = { item: [] }
                    async.eachSeries(items, function(item, calback) {
                        getCount = function(q, callback) {
                            itemDemo.find(q)
                                .where("fields.fieldName").equals(item)
                                .count(function(err, cnt) {
                                    resObj.item.push({ "name": item, "count": cnt })
                                    callback && callback(resObj)
                                })
                        }
                        getCount(qs, function(data) {
                            calback()
                        });
                    }, function(err) {
                        if (err) throw err
                        console.log("Done")
                        res.send(resObj)
                    })
                })
        } else {
            fieldName = JSON.parse("[" + fieldName + "]")
            itemDemo.find(qs, function(err, items) {
                    if (err) throw err
                    var resObj = { infoCode: [], item: [] }
                    // console.dir(items)
                    async.eachSeries(items, function(item, calback) {
                        // console.log(item)
                        resObj.infoCode.push(item.informationCode)
                        calback()
                    }, function(err) {
                        if (err) throw err
                        console.log("Done")
                        unique(resObj.infoCode)
                        itemDemo.find(qs, function(err, items) {
                                // console.log(items)
                                async.eachSeries(items, function(info, callback) {
                                    console.dir(info.fields)
                                    var fv = []
                                    async.eachSeries(info.fields, function(fields, callbck) {
                                        // console.log(info)
                                        console.dir(fields)
                                        fv.push(fields.fieldValue)

                                        callbck()
                                    }, function(err) {
                                        if (err) throw err
                                        console.log("Done3")
                                        resObj.item.push({
                                            "handleId": info.handle,
                                            "fieldvalue": unique(fv),
                                        })
                                        // res.send(resObj)
                                    })
                                    callback()
                                }, function(err) {
                                    if (err) throw err
                                    console.log("Done2")
                                    res.send(resObj)
                                })
                            })
                            .where("informationCode").in(resObj.infoCode)
                    })
                })
                .where("fields.fieldName").in(fieldName)
        }
    }
})

app.post('/api/report', function(req, res) {
    var collectionName = req.body.collectionName
    var level = (req.body.level === "all") ? ["itemLevel", "metadataLevel", "sourceLevel"] : req.body.level
    var flagValue = (req.body.flag === "warn") ? true : (req.body.flag === "err") ? false : [true, false]
    var commonDemo = mongoose.model('commonDemo', commonSchema, collectionName)
    var infoCodeDemo = mongoose.model('infoCodeDemo', infoCodeSchema, "informationCodeMaster")
    var resObj = { item: [] }
    var qs = { "level": level, "warn_flag": flagValue }
    commonDemo.find()
        .distinct("informationCode", qs, function(err, items) {
            // console.log(items)
            if (err) throw err;
            async.eachSeries(items, function(item, calback) {
                console.log(item)
                infoCodeDemo.findOne(function(err, infoCodes) {
                    var lvl = infoCodes.level
                    console.log(infoCodes)
                    getCount = function(q, callback) {
                        commonDemo.find(q)
                            .where("informationCode").equals(item)
                            .count(function(err, cnt) {
                                resObj.item.push({ "name": item, "count": cnt, "level": lvl })
                                // console.dir(resObj)
                                callback && callback(resObj)
                            })
                    }
                    getCount(qs, function(data) {
                        // console.dir(data)
                        calback()
                    });
                }).where("informationCode").equals(item)
            }, function(err) {
                if (err) throw err
                console.log("Done")
                res.send(resObj)
            })
        })
})

//For Testing purpose
app.post('/testRef', upload.single('avatar'), function(request, response) {
        
    console.log(request)
    console.log(request.body)

    response.status(200).send("Done")



    // var User = mongoose.model('User', userSchema, "userMaster")
    // var dataSource = mongoose.model('dataSource', dataSourceSchema, "dataSources")
    // var LogDemo = mongoose.model("LogDemo", logDetailSchema, "logDetails")
    // var userid = ""
    // var sourceid = ""
    // userSchema.statics.search = function(str, callback) {
    //     return this.findOne({ 'userId': str }, '_id', callback);
    // };
    // var data1 = User.findOne({ 'userId': 'johnny' }, '_id', function(err, res) {
    //     console.log(res._id)
    //     userid = res._id
    //     return userid
    // })
    // var data2 = dataSource.findOne({ 'sourceCode': 'ASI' }, '_id', function(err, res) {
    //     console.log(res._id)
    //     sourceid = res._id
    // })

    // var newUser = new User({
    //     userId: "johnny",
    //     password: "pass",
    //     firstName: "Johnny",
    //     lastName: "Doe"
    // })
    // var source = new dataSource({
    //     sourceCode: "ASI",
    //     sourceName: "Archeological Survey of India"
    // })
    // var record = new LogDemo({
    //     user: newUser._id,
    //     fileName: "LOG_snltr.zip",
    //     dataSource: source._id,
    //     batch: "2",
    //     comments: "This is the first Comment"
    // })
    // record.save(function(err, record) {
    //     if (err) return console.error(err);
    //     console.log(record)
    // })
    //response.send("Success")
})

//For Testing purpose
app.get('/testRef1', function(request, response) {
    var User = mongoose.model('User', userSchema, "userMaster")
    var dataSource = mongoose.model('dataSource', dataSourceSchema, "dataSources")
    var LogDemo = mongoose.model("LogDemo", logDetailSchema, "logDetails");
    LogDemo.findOne({ 'fileName': 'LOG_snltr.zip' }).
    populate('dataSource').
    exec(function(err, item) {
        if (err) return handleError(err);
        console.log(item);
        response.send(item);
    })
})

// file upload
app.post('/api/file', function(req, res) {
    // console.dir(req.body)
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    var file = req.body.file
    var userId = req.body.userId
    var source = req.body.source
    var batch = req.body.batch
    var comments = req.body.comments
    if(req.files){
        req.files.forEach(function(file){
            console.log(file)
        })
        res.send("Uploaded")
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
    let sampleFile = req.files.sampleFile;
    console.log(file.lfFileName)
    var User = mongoose.model('User', userSchema, "userMaster")
    var LogDemo = mongoose.model("LogDemo", logDetailSchema, "logDetails")
    var uploadLog = mongoose.model("uploadLog", uploadLogSchema, "logDetails")
    uploadPath = '/home/subhasis/NDL_Error_Log_Analysis/LogAnalysisServer/upload/' + file.lfFileName
    extractPath = '/home/subhasis/NDL_Error_Log_Analysis/LogAnalysisServer/upload/unzipped/'
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).send(err);
        // res.send('File uploaded!');
    });
    extract(uploadPath, { dir: extractPath }, function(err) {
        // extraction is complete. make sure to handle the err 
        if (err) throw err;
    })
    var getLogs = function(src, callback) {
        glob(src + '**/*/*.txt', callback);
    };
    getLogs(extractPath, function(err, res) {
        if (err) {
            console.log('Error', err);
        } else {
            // console.log(res);
            // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
            console.log(file.lfFileName.split(".")[0])
            sourceName = userId + "_" + source + "_batch_" + batch
            var entry = new uploadLog({
                userID: userId,
                fileName: file.lfFileName,
                dataSource: source,
                batch: batch,
                comments: comments,
                collectionName: sourceName
            })
            console.log(entry)
            entry.save(function(err, record) {
                if (err) return console.error(err);
            })
            // sourceName = sampleFile.name.split(".")[0]
            var ItemDemo = mongoose.model('ItemDemo', itemSchema, sourceName)
            var MetadataDemo = mongoose.model('MetadataDemo', metadataSchema, sourceName)
            var SourceDemo = mongoose.model('SourceDemo', sourceSchema, sourceName)
            for (f in res) {
                // console.log(res[f])
                var level = ""
                if (/ItemError/.test(res[f])) {
                    level = "itemLevel"
                }
                if (/MetadataError/.test(res[f])) {
                    level = "metadataLevel"
                }
                if (/SourceError/.test(res[f])) {
                    level = "sourceLevel"
                }
                var content = fs.readFileSync(res[f]);
                if (/metaInfo.txt/.test(res[f])) {
                    sourceName = content
                    // console.log("\nIt is Handle Info: "+ content)
                } else {
                    // console.log("\nOutput Content : \n"+ content);
                    var jsonCont = JSON.parse(content);
                    // console.dir(jsonCont)
                    jsonCont.forEach(function(item) {
                        // console.log(item)
                        // console.log("--------------------------")
                        flag = /ERR/.test(item.informationCode) ? false : true
                        switch (level) {
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
                        record.save(function(err, record) {
                            if (err) return console.error(err);
                        })
                    })
                }
                // console.log("\n*********************************\n")
            }
        }
    });
})

app.post('/api/issuetracker', function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    var userId = req.body.userId
    var source = req.body.source
    var batch = req.body.batch
    var comments = req.body.commentLS
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
    let sampleFile = req.files.uploadedFile;
    console.log(sampleFile.name)
    var IssueTracker = mongoose.model("IssueTracker", IssueTrackerSchema, "IssueTrackerDetails")
    uploadPath = '/home/subhasis/NDL_Error_Log_Analysis/LogAnalysisServer/upload/' + sampleFile.name
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).send(err);
        var record = new IssueTracker({
            userId: userId,
            sourceCode: source,
            batch: batch,
            fileName: sampleFile.name,
            commentLS: comments,
            commentCS: ""
        })
        record.save(function(err, record) {
            if (err) return console.error(err);
            console.log(record)
        })
        res.send('File uploaded!');
    });

})

app.post('/admin/addsource', function(req, res) {
    var sources = JSON.parse(req.body.source)
    console.log(sources)
    var dataSource = mongoose.model('dataSource', dataSourceSchema, 'dataSources')
    var sourceUser = mongoose.model('sourceUser', sourceUserSchema)
    async.eachSeries(sources, function(source, callback) {
        console.log(source)
        var record = new dataSource({
            sourceCode: source.sourceCode,
            sourceName: source.sourceName
        })
        var refRecord = new sourceUser({
            sourceCode: source.sourceCode,
            userIds: []
        })
        console.log("Saving record for " + record)
        record.save(function(err, record) {
            if (err) return console.error(err);
        })
        refRecord.save(function(err, record) {
            if (err) return console.error(err);
        })
        callback()
    }, function(err) {
        if (err) throw err
        res.send("Sources Added")
    })
})

app.get('/admin/getsources', function(req, res) {
    var dataSource = mongoose.model('dataSource', dataSourceSchema, 'dataSources')
    dataSource.find(function(err, items) {
        console.log(items)
        res.send(items)
    })
})

app.post('/admin/adduser', function(req, res) {
    var users = JSON.parse(req.body.data)
    var userDemo = mongoose.model('user', userSchema, 'userMaster')
    var userSource = mongoose.model('userSource', userSourceSchema)
    var isError = false
    async.eachSeries(users, function(user, callback) {
        //console.log(user)
        bcrypt.hash(user.password, 10, function(err, hash) {
            var record = new userDemo({
                userId: user.userId,
                password: hash,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            })
            var refRecord = new userSource({
                userId: user.userId,
                sourceCodes: []
            })
            //console.log("Saving record for " + record.firstName)
            record.save(function(err, record) {
                if (err) {
                    console.log(err)
                    res.send("bad request");
                } else {
                    refRecord.save(function(err, record) {
                        if (err) {
                            console.log(err)
                            res.send("bad request");
                        }
                    })
                }

            })
        });
        callback()
    }, function(err) {
        /*console.log(users[0].password)
        if (isError) {
            res.send("bad request");
        }
        else {
            res.send("Users Added")
        }*/
    })
})

app.get('/admin/getusers', function(req, res) {
    var userDemo = mongoose.model('user', userSchema, 'userMaster')
    userDemo.find(function(err, items) {
        console.log(items)
        res.send(items)
    })
})

app.post('/admin/assigntask', function(req, res) {
    var tasks = JSON.parse(req.body.data)
    var sourceUser = mongoose.model('sourceUser', sourceUserSchema)
    var userSource = mongoose.model('userSource', userSourceSchema)
    var assignment = mongoose.model('assignment', assignmentSchema)

    async.eachSeries(tasks, function(item, callback) {
        console.log(item)
        sourceUser.update({ 'sourceCode': item.source }, { $push: { 'userIds': { 'uId': item.user, 'isActive': true } } }, function(err, result) {
            if (err) return console.error(err)
        })
        userSource.update({ 'userId': item.user }, { $push: { 'sourceCodes': { 'code': item.source, 'isActive': true } } }, function(err, result) {
            if (err) return console.error(err)
        })
        callback()
    }, function(err) {
        if (err) throw err
        res.send("Task Assigned")
    })
})

app.post('/admin/getAssignment', function(req, res) {
    var choice = req.body.data
    var searchParam = req.body.id
    var userDemo = mongoose.model('user', userSchema, 'userMaster')
    var userSource = mongoose.model('userSource', userSourceSchema)
    var sourceUser = mongoose.model('sourceUser', sourceUserSchema)
    if (choice === 'user') {
        userSource.findOne({ "userId": searchParam }, function(err, items) {
            console.log(items)
            res.send(items)
        })
    } else {
        sourceUser.findOne({ "sourceCode": searchParam }, function(err, items) {
            console.log(items)
            res.send(items)
        })
    }
})

app.post('/admin/updateStatus', function(req, res) {
    var user = req.body.user
    var source = req.body.source
    var status = req.body.status
    var userSource = mongoose.model('userSource', userSourceSchema)
    var sourceUser = mongoose.model('sourceUser', sourceUserSchema)
    sourceUser.findOne({ 'sourceCode': source }, function(err, item) {
        var users = item.userIds
        for (var index in users) {
            if (users[index].uId === user) {
                users[index].isActive = status
                break;
            }
        }
        sourceUser.update({ 'sourceCode': source }, { $set: { 'userIds': users } }, function(err, result) {
            if (err) {
                console.error(err)
                res.send("Error took place")
            } else {
                userSource.findOne({ 'userId': user }, function(err, item) {
                    var sources = item.sourceCodes
                    for (var index in sources) {
                        if (sources[index].code === source) {
                            sources[index].isActive = status
                            break;
                        }
                    }
                    userSource.update({ 'userId': user }, { $set: { 'sourceCodes': sources } }, function(err, result) {
                        if (err) return console.error(err)
                        res.send(result)
                    })
                })
            }
        })
    })
})

app.post('/admin/deleteAssignment', function(req, res) {

    var user = req.body.userId
    var source = req.body.source

    var userSource = mongoose.model('userSource', userSourceSchema)
    var sourceUser = mongoose.model('sourceUser', sourceUserSchema)

    sourceUser.findOne({ 'sourceCode': source }, function(err, item) {
        var users = item.userIds
        for (var index in users) {
            if (users[index].uId === user) {
                users.splice(index, 1)
                break;
            }
        }

        sourceUser.update({ 'sourceCode': source }, { $set: { 'userIds': users } }, function(err, result) {

            if (err) {
                console.error(err)
                res.send("Error took place")
            } else {
                userSource.findOne({ 'userId': user }, function(err, item) {
                    var sources = item.sourceCodes
                    for (var index in sources) {
                        if (sources[index].code === source) {
                            sources.splice(index, 1)
                            break;
                        }
                    }
                    userSource.update({ 'userId': user }, { $set: { 'sourceCodes': sources } }, function(err, result) {
                        if (err) return console.error(err)
                        res.send(result)
                    })
                })
            }
        })
    })
})

app.get('/api/file', function(req, res) {
    sess = req.session
    var source = req.get("source")
    var batch = req.get("batch")
    console.log(sess)
    res.send("Welcome" + " " + source + " " + batch)
})

app.post('/api/getCollections', function(req, res) {
    var searchString = req.body.item
    console.log(searchString)
    var dataSource = mongoose.model('dataSource', dataSourceSchema, 'dataSources')
    dataSource.find({ sourceName: new RegExp('^' + searchString, "i") }, function(err, doc) {
        console.log(doc)
        res.send(doc)
    })
    // res.send("Collections")
})

app.delete('/api/file', function(req, res) {

})

app.post('/users/register', function(req, res) {
    userid = req.body.userId
    password = req.body.password
    firstName = req.body.firstName
    lastName = req.body.lastName
    type = req.body.userType
    var User = mongoose.model('User', userSchema, "userMaster")
    bcrypt.hash(password, 10, function(err, hash) {
        // Store hash in your password DB. 
        var record = new User({
            userId: userid,
            password: hash,
            firstName: firstName,
            lastName: lastName,
            role: type
        })
        record.save(function(err, record) {
            if (err) return console.error(err);
            res.send(record)
        })
    });
})

app.post('/users/authenticate', function(req, response) {
    sess = req.session
    sess.userid = req.body.userId
    sess.password = req.body.password
    sess.loginStatus = false
    var User = mongoose.model('User', userSchema, "userMaster")
    User.findOne(function(err, user) {
        if (!user) {
            console.log("If block")
            // throw err
            // response.end(err.message)
            response.send("User Not Found")
        } else {
            console.log("Else Block" + user)
            bcrypt.compare(sess.password, user.password, function(err, res) {
                if (err) throw err
                if (res) {
                    sess.loginStatus = true
                    console.log(sess)
                    response.send(sess)
                    // response.send("Login Success")
                } else {
                    // sess.destroy();
                    response.end("Login Failed")
                }
            })
        }
    }).where('userId').equals(sess.userid)
})

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
})

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
})