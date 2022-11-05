// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
let methodRun = false;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

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

// Accessing dns module
const dns = require('dns');
let bodyParser = require('body-parser');
app.use('/api/shorturl',bodyParser.urlencoded({extended: false})); 

let redirectUrl = ['https://forum.freecodecamp.org/'];

//URL Shortener Microservice
app.post('/api/shorturl', (req, res) => {
  console.log("POST > /api/shorturl");
  let urlLink = req.body.url;
  let indexPos=0;
  let errFlag = false;
  //Check whether the url is valid or not
  dns.lookup( urlLink, function(err, address, family){
    console.log(err);
    if(err){
      errFlag = true;
    }
  });

  if (errFlag) {
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
