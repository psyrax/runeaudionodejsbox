/* Config options */
var config = require("./config.json");

/* Dependecy load */
var WhatCD = require("whatcd");
var _ = require("underscore");
var client = new WhatCD("https://apollo.rip", config.whatUsername, config.whatPassword);
var express = require('express');
var exphbs  = require('express-handlebars');
var superagent = require('superagent');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

/* Express setup */
var app = express();
var hbs = exphbs.create({defaultLayout:'main'});

/*Serial port init*/
//require('./serialPort.js');
//require('./dataSend.js');

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Homepage */
app.get('/', function (req, res) {
  res.render('home');
});

app.get('/top', function(req, res){
  var searchParams = {
    type: "name",
    query: req.query.artist
  }
  getArtist(searchParams, function(results){+
    res.render('topTable', {data:{torrents:results}});
  });
});

app.get('/seedbox', function(req, res){
  superagent.get(config.remoteUrl)
  .end(function(err, response){
    res.render('seedbox', {data: { downloads: JSON.stringify(response.body) }});
  });
});

app.get('/currentUser', function(req, res){
  getCurrentUserInfo(function(userData){
    res.json(userData);
  });
})

app.get('/ls', function(req,res ){
  var ls = fs.readdirSync(config.localDownloadDir).filter(function(file){
    return fs.statSync(path.join(config.localDownloadDir, file)).isDirectory();
  });
  ls.sort(function(a, b) {
    if(a.toLowerCase() < b.toLowerCase()) return -1;
    if(a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  });

  res.json(ls);
});

app.post('/scp', function(req, res){
  console.log(req.body);
  res.json('ok');
  var localDir = config.localDownloadDir + req.body.target + "/";
  var remoteDir = req.body.dir.path + '/';
  if (!fs.existsSync(localDir)){
    fs.mkdirSync(localDir);
  };
  const spawn = require('child_process').spawn;
  const scp = spawn('scp', ['-r', config.remoteSSHPath+':' + bashEscape(remoteDir) , localDir]);

  scp.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  scp.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  scp.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
})

function getArtist(params, callback){
  var searchParams  = {};
  var flacTorrents = [];
  if ( params.type == "id" ){

  } else {
    searchParams.artistname = params.query;
  };
  
  client.artist(searchParams,function(err, data) {
    if (err) {
      return console.log(err);
    }
   
    var torrentGroups = data.torrentgroup;  
    torrentGroups.forEach(function(torrentGroup){
      if ( parseInt(torrentGroup.releaseType) == 1 ){
        var albumTitle = torrentGroup.groupName;
        torrentGroup.torrent.forEach(function(torrent){
          if ( torrent.format == "FLAC"  && (torrent.media =="CD" || torrent.media == "Vinyl")){
            torrent.title = albumTitle;
            flacTorrents.push(torrent);
          }
          
        })    
      };
    });
    flacTorrents = _.sortBy(flacTorrents, "snatched");
    var uniqueFlacs = _.uniq(flacTorrents, JSON.stringify);
    uniqueFlacs.reverse();
    callback(uniqueFlacs);
  });
}

function getCurrentUserInfo(callback){
  client.index(function(error, data){
    if (error) {
      console.log(error);
    }
    console.log("currentUser",data);
    callback(data);
  })
}

// Implement bash string escaping.
var safePattern =    /^[a-z0-9_\/\-.,?:@#%^+=\[\]]*$/i;
var safeishPattern = /^[a-z0-9_\/\-.,?:@#%^+=\[\]{}|&()<>; *']*$/i;
function bashEscape(arg) {
  // These don't need quoting
  if (safePattern.test(arg)) return arg;

  // These are fine wrapped in double quotes using weak escaping.
  if (safeishPattern.test(arg)) return '"' + arg + '"';

  // Otherwise use strong escaping with single quotes
  return "'" + arg.replace(/'+/g, function (val) {
    // But we need to interpolate single quotes efficiently

    // One or two can simply be '\'' -> ' or '\'\'' -> ''
    if (val.length < 3) return "'" + val.replace(/'/g, "\\'") + "'";

    // But more in a row, it's better to wrap in double quotes '"'''''"' -> '''''
    return "'\"" + val + "\"'";

  }) + "'";
}

/* Express JS boot */
app.listen(config.expressPort, function () {
  console.log('what.cd artist top listening on port: ' + config.expressPort);
});