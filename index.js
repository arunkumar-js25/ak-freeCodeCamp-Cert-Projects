// index.js
// where your node app starts
require('dotenv').config();

// init project
var express = require('express');
var app = express();

// Accessing dns module
const dns = require('dns');
//Accessing MongoDB
let mongoose = require('mongoose');
//Body Parser
let bodyParser = require('body-parser');

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
let methodRun = false;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use('/api/shorturl',bodyParser.urlencoded({extended: false})); 
app.use('/api/users',bodyParser.urlencoded({extended: false})); 
app.use('/api/users/:_id/exercises',bodyParser.urlencoded({extended: false}));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {https://ak-freeCodehttps://ak-freeCodeCamp-Cert-Projects.arunkumar-js25.repl.coCamp-Cert-Projects.arunkumar-js25.repl.co
  res.json({greeting: 'hello API'});
});

//Request Header Parser Microservice
app.get('/api/whoami', (req, res) => {
  console.log("GET > /api/whoami");
  res.json({"ipaddress":req.headers['x-forwarded-for'],
            "language":req.headers['accept-language'],
            "software":req.headers['user-agent']});
});

//Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username : {
      type: String,
      required: true
    },
    count : {
      type: Number
    },
    log : [
      {
        description : String,
        duration : Number,
        date: String
      }
    ]
});

let user = mongoose.model("User", userSchema);

//Exercise Tracker
app.post('/api/users', (req, res) => {
  console.log("POST > /api/users");
  console.log(req.body);
  let userName = req.body.username;
  user.find({username:userName},function(err, data) {
    console.log(data);
     if (data.length == 0)
      {
       let userDetail = new user({username:userName, count:0 });
        userDetail.save(function(err, savedData) {
          if (err && err.code == "ENOTFOUND")
          {
            console.error(err);
            return;
          }
          console.log(savedData.username + "  " + savedData._id);
          res.json({username:savedData.username,_id:savedData._id});
        });
      }
      else
      {
        console.log(data[0].username + "  " + data[0]._id);
        res.json({username:data[0].username,_id:data[0]._id});
      }
    
  });
});

app.get('/api/users', (req, res) => {
  console.log("GET > /api/users");
  user.find()
    .select({count: 0,log:0,__v:0})
    .exec(function(err, data) {
      if (err) return console.error(err);
      res.json(data);
    });
});


app.post('/api/users/:_id/exercises', (req, res) => {
  let userId = req.params._id;
  console.log("POST > /api/users/"+userId+"/exercises");
  
  let exerciseDetail = {
    description: req.body.description,
    duration: req.body.duration == '' ? 0 : Number(req.body.duration),
    date: req.body.date == '' ? new Date().toDateString() : new Date(req.body.date).toDateString()
  };
  console.log(exerciseDetail);
  user.findById(userId,
                function(err, data) {
                  data.count++;
                  data.log.push(exerciseDetail);

                  data.save((err, updatedUser) => {
                    console.log(updatedUser);
                    console.log(updatedUser.username);
                    if (err) return console.error(err);
                    res.json({
                      username: updatedUser.username,
                      description: exerciseDetail.description,
                      duration: exerciseDetail.duration,
                      date: exerciseDetail.date,
                      _id: userId
                    });
                  });
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  let userId = req.params._id;
  console.log(req.method + " > "+ req.path);
  console.log(req.params);
  console.log(req.query);

  let filterCondition = {};
  let limitCondition = {}
  if(req.query.from != undefined)
  {
    filterCondition.$gte = new Date(req.query.from).toDateString();
  }
  if(req.query.to != undefined)
  {
    filterCondition.$lte = new Date(req.query.to).toDateString();
  }

  if(req.query.limit != undefined)
  {
    limitCondition.limit = Number(req.query.limit);
  }

  console.log(filterCondition);
  console.log(limitCondition);
user.find({_id: userId, date: filterCondition},limitCondition).select().exec(
  function(err, data) {
    if (err) return console.error(err);
    console.log(data);
    res.json(data[0]);
  });
});



//URL Shortener Microservice
let redirectUrl = ['https://forum.freecodecamp.org/'];
app.post('/api/shorturl', (req, res) => {
  console.log("POST > /api/shorturl");
  let urlLink = req.body.url;
  let urlLinkData = new URL(urlLink);
  let indexPos=0;
  let errFlag = false;
  //Check whether the url is valid or not
  dns.lookup( urlLinkData.hostname, function(err, address, family){
    console.log(err);
    if(err && err.code == "ENOTFOUND"){
      errFlag = true;
      console.log(errFlag);
    }

    console.log(/^(http:..|https:..)/.test(urlLink));
    if (errFlag || ! (/^(http:..|https:..)/.test(urlLink))) {
      res.json({ error: 'invalid url' });
    }
    else
    {
      indexPos = redirectUrl.indexOf(urlLink);
      console.log(indexPos);
      if( indexPos == -1){
        redirectUrl.push(urlLink);
        indexPos = redirectUrl.length-1;
      }
    res.json({ original_url : urlLink, short_url : indexPos});
    }
  });

});

app.get('/api/shorturl/:id', (req, res) => {
  
  let inputID = req.params.id;
  console.log("GET > /api/shorturl/"+inputID);
  console.log(inputID);
  console.log(redirectUrl);
  if(inputID != undefined && /^\d+$/.test(inputID) && inputID < redirectUrl.length)
  {
    console.log(redirectUrl[inputID]);
    res.redirect(redirectUrl[inputID]);
  }
  else
  {
    res.json({ error: 'invalid ID' });
  }
});

//Timestamp Microservice 
app.get('/api/:date?', (req, res) => {
  console.log("GET > /api/:dateInput?" + req.params.date);
  var dateInput = req.params.date;
  var dateOutput;

  //Added due to conflict with other projects
  if(dateInput == "shorturl" || dateInput == "users")
  {
    return;
  }
  
  if(dateInput == undefined)
  {
    dateOutput = new Date();
  }
  else if(/^\d+$/.test(dateInput))
  {
    dateOutput = new Date(Number(dateInput));

  }
  else
  {
     dateOutput = new Date(dateInput);
  }
  
  console.log(dateOutput);
  var utcDate = "";
  var unixTimestamp = 0;
  
  if(dateOutput == "Invalid Date")
  {
     res.json({ error : "Invalid Date" });
  }
  else
  {
    var utcDate = dateOutput.toUTCString();
    var unixTimestamp = dateOutput.getTime();
    res.json({ unix: unixTimestamp, utc: utcDate });
  }
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
