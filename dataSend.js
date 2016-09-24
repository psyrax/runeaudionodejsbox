var os = require('os');
var moment = require('moment');
var api_key = 'key-47408ab1316002c4dbefd62888b2cdf7';
var domain = 'updates.oglabs.info';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

var ifaces = os.networkInterfaces();
var addresses = [];
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }

    if (alias >= 1) {
      addresses.push({'url': 'http://'+iface.address+':6680', 'ip' : iface.address});
    } else {
      addresses.push({'url': 'http://'+iface.address+':6680', 'ip' : iface.address});
    }
    ++alias;
  });
});

var linkString = '';

addresses.forEach(function(address){
  linkString = linkString + '<li><a href="'+ address.url +'">'+ address.ip +'</a></li>'
})

var data = {
  from: 'Music box <mbox@updates.oglabs.info>',
  to: 'psyrax@opiumgarden.org',
  subject: 'Music box online ' + moment().format('MMMM Do YYYY, h:mm:ss a'),
  html: 'Connected @ <ul>' + linkString + '</ul>'
};
 
mailgun.messages().send(data, function (error, body) {
  //console.log(body);
});