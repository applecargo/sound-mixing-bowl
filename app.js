//NOTE: SERVER CONFIGURATION has 2 options. ENABLE 1 of 2 options

// //NOTE: option (1) - https server (443) + redirection 80 to 443

// //prepare credentials & etc
// var fs = require('fs');
// var https = require('https');
// var privateKey = fs.readFileSync('/etc/letsencrypt/live/choir.run/privkey.pem', 'utf8');
// var certificate = fs.readFileSync('/etc/letsencrypt/live/choir.run/fullchain.pem', 'utf8');
// var credentials = {
//   key: privateKey,
//   cert: certificate
// };

// //https WWW server @ port 443
// var express = require('express');
// var app = express();
// var httpsWebServer = https.createServer(credentials, app).listen(443, function() {
//   console.log('[express] listening on *:443');
// });

// //http Redirection server @ port 80
// //  ==> Don't get why this works.. all others not. ==> https://stackoverflow.com/a/23283173
// var http = require('http');
// var httpApp = express();
// var httpRouter = express.Router();
// httpApp.use('*', httpRouter);
// httpRouter.get('*', function(req, res) {
//   var host = req.get('Host');
//   // replace the port in the host
//   host = host.replace(/:\d+$/, ":" + app.get('port'));
//   // determine the redirect destination
//   var destination = ['https://', host, req.url].join('');
//   return res.redirect(destination);
// });
// var httpServer = http.createServer(httpApp);
// httpServer.listen(80);

// //https socket.io server @ port 443 (same port as WWW service)
// var io = require('socket.io')(httpsWebServer, {
//   'pingInterval': 1000,
//   'pingTimeout': 3000
// });

//NOTE: option (2) - simple http dev server (8080)

var http = require('http');
var express = require('express');
var app = express();
var httpServer = http.createServer(app);
httpServer.listen(8080);

//http socket.io server @ port 8080 (same port as WWW service)
var io = require('socket.io')(httpServer, {
  'pingInterval': 1000,
  'pingTimeout': 3000
});

//express configuration
app.use(express.static('public'));

// //'scroll' status array
// var scroll = {};
// scroll['a'] = {
//   value: 0,
//   islocked: false
// };
// scroll['b'] = {
//   value: 0,
//   islocked: false
// };
// scroll['c'] = {
//   value: 0,
//   islocked: false
// };
// scroll['d'] = {
//   value: 0,
//   islocked: false
// };
// scroll['e'] = {
//   value: 0,
//   islocked: false
// };
// scroll['f'] = {
//   value: 0,
//   islocked: false
// };
// scroll['g'] = {
//   value: 0,
//   islocked: false
// };
// scroll['h'] = {
//   value: 0,
//   islocked: false
// };

// //'sound' status array
// var sound_stat = {};
// sound_stat['a'] = {
//   id: 0,
//   isplaying: false,
//   playcount: 0
// };
// sound_stat['b'] = {
//   id: 1,
//   isplaying: false,
//   playcount: 0
// };
// sound_stat['c'] = {
//   id: 2,
//   isplaying: false,
//   playcount: 0
// };
// sound_stat['d'] = {
//   id: 3,
//   isplaying: false,
//   playcount: 0
// };
// sound_stat['e'] = {
//   id: 4,
//   isplaying: false,
//   playcount: 0
// };
// sound_stat['f'] = {
//   id: 5,
//   isplaying: false,
//   playcount: 0
// };
// sound_stat['g'] = {
//   id: 6,
//   isplaying: false,
//   playcount: 0
// };
// sound_stat['h'] = {
//   id: 7,
//   isplaying: false,
//   playcount: 0
// };

//socket.io events
io.on('connection', function(socket) {

  //entry log.
  console.log('someone connected.');

  //let this new member be up-to-date immediately
  // Object.keys(scroll).forEach(function(key) { // ES6 --> https://stackoverflow.com/a/5737192
  //   socket.emit('scroll', {
  //     key: key,
  //     data: scroll[key]
  //   });
  // });

  // //on 'scroll' --> relay the msg. to everyone except sender
  // socket.on('scroll-get', function(key, fn) {
  //   console.log('investigating...');
  //   console.log(key);
  //   if (scroll[key].islocked == false) {
  //     fn(true);
  //     scroll[key].islocked = true;
  //   } else if (scroll[key].islocked == true) {
  //     fn(false);
  //   }
  // });

  // socket.on('lock-all', function(msg) {
  //   if (msg.action == 'close') {
  //     console.log('lock-all');
  //     Object.keys(scroll).forEach(function(key) {
  //       console.log(scroll[key].islocked);
  //       scroll[key].islocked = true;
  //       console.log(scroll[key].islocked);
  //       socket.broadcast.emit('scroll', {
  //         key: key,
  //         data: scroll[key]
  //       });
  //     });
  //   } else if (msg.action == 'open') {
  //     console.log('release-all');
  //     Object.keys(scroll).forEach(function(key) {
  //       console.log(scroll[key].islocked);
  //       scroll[key].islocked = false;
  //       console.log(scroll[key].islocked);
  //       socket.broadcast.emit('scroll', {
  //         key: key,
  //         data: scroll[key]
  //       });
  //     });
  //   }
  // })

  // //on 'scroll' --> relay the msg. to everyone except sender
  // socket.on('scroll', function(msg) {

  //   //update server's scroll database
  //   scroll[msg.key].value = msg.data.value;
  //   scroll[msg.key].islocked = msg.data.islocked;

  //   //relay the message to everybody except sender
  //   socket.broadcast.emit('scroll', msg);
  //   // //relay the message to everybody INCLUDING sender
  //   // io.emit('scroll', msg);

  //   //DEBUG
  //   //console.log('scroll :');
  //   console.log(msg);
  // });

  //on 'sound' --> relay the message to everybody INCLUDING sender
  // var soundactive = false;
  socket.on('sound', function(sound) {

    //relay the message to everybody EXCEPT the sender
    socket.broadcast.emit('sound', sound);

    //DEBUG
    console.log('sound.name :' + sound.name);
    console.log('sound.action :' + sound.action);
    console.log('sound.group :' + sound.group);
  });

  // //on 'voice'
  // socket.on('voice', function(voice) {

  //   //relay the message to everybody INCLUDING sender // TODO: actually only sound server is listening...
  //   io.emit('voice', voice);

  //   //DEBUG
  //   console.log('voice.id :' + voice.id);
  //   console.log('voice.key :' + voice.key);
  //   //{name: voice_selected, key: this._idx}
  // })

  // //on 'page' --> relay the message to everybody INCLUDING sender
  // socket.on('page', function(page) {

  //   //relay the message to everybody INCLUDING sender
  //   io.emit('page', page);

  //   //DEBUG
  //   console.log('page.name :' + page.name);
  // });

  //on 'clap' --> relay the message to everybody INCLUDING sender
  socket.on('clap', function(clap) {

    //relay the message to everybody INCLUDING sender
    io.emit('clap', clap);

    //DEBUG
    console.log('clap.name :' + clap.name);
  });

  //on 'disconnect'
  socket.on('disconnect', function() {
    //
    // if (soundactive == true) {
    //   soundactive = false;
    //   if (sound_stat[sound.name].playcount > 0) {
    //     sound_stat[sound.name].playcount--;
    //   }
    //   if (sound_stat[sound.name].isplaying == true) {
    //     sound_stat[sound.name].isplaying = false;
    //     //emit stop
    //     //relay the message to everybody INCLUDING sender -- but actually only 'receiver.js' is listening 'sound_ctrl' msg.
    //     io.emit('sound_ctrl', {
    //       id: sound_stat[sound.name].id,
    //       action: 0
    //     });
    //   }
    // }

    console.log('someone disconnected.');

    //NOTE, TODO, BUG:
    //    --> disconnection one's 'locked' keys must be released!
    //        otherwise, nobody can use it! (even the one who locked it, when returned.)
    //
    //        (but, then server firstly should also remember 'who' locked 'which' key...)
  });
});