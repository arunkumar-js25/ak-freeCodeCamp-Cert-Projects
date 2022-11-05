// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
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
