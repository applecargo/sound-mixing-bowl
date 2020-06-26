//paperscript (paperjs)

//'index' page

$(document).ready(function() {

  //common metrics
  var vs = view.size;
  var vsw = vs.width;
  var vsh = vs.height;
  var vss = view.size / 10;
  var vssw = vss.width;
  var vssh = vss.height;

  //pre-load resources
  Promise.all([
    //imgs
    RasterImport_size1('./imgs/phonehand.png'),
    SVGImport_size1('./imgs/arrow-circle-right.svg'),
    SVGImport_size1('./imgs/arrow-circle-left.svg'),
    SVGImport_size1('./imgs/hand-point-right-regular.svg'),
    SVGImport_size1('./imgs/listen-icon.svg'),
    SVGImport_size1('./imgs/iconmonstr-plus-4.svg'),
    SVGImport_size1('./imgs/iconmonstr-minus-4.svg'),
    //clap
    AudioImport_p5("./audio/clap@2/" + ("0" + getRandomInt(1, 2)).slice(-2) + ".mp3"),
    //beach_sounds page 1 ==> 7
    AudioImport("./audio/나도_모르게_딸랑.mp3"),
    AudioImport("./audio/나도_모르게_우르르.mp3"),
    AudioImport("./audio/나도_모르게_한숨.mp3"),
    AudioImport("./audio/나도_모르게_메트로놈.mp3"),
    AudioImport("./audio/나도_모르게_사이렌소리.mp3"),
    AudioImport("./audio/나도_모르게_커피머신.mp3"),
    AudioImport("./audio/고요7.mp3"),
    //beach_sounds page 2 ==> 7
    AudioImport("./audio/과즙팡팡_바나나꺾고까는소리.mp3"),
    AudioImport("./audio/과즙팡팡_바나나먹는소리.mp3"),
    AudioImport("./audio/과즙팡팡_오렌지까는소리.mp3"),
    AudioImport("./audio/과즙팡팡_오렌지먹는소리.mp3"),
    AudioImport("./audio/고요12.mp3"),
    AudioImport("./audio/고요13.mp3"),
    AudioImport("./audio/고요14.mp3"),
    //
  ]).then(function(imports) {
    //imgs
    var phonehand = imports[0];
    var anext = imports[1];
    var aprev = imports[2];
    var hand = imports[3];
    var iconsound = imports[4];
    var plus = imports[5];
    var minus = imports[6];
    //clap
    var clap = imports[7];
    //beach list
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_sounds = {
      '나도_모르게_딸랑' : imports[8],
      '나도_모르게_우르르' : imports[9],
      '나도_모르게_한숨' : imports[10],
      '나도_모르게_메트로놈' : imports[11],
      '나도_모르게_사이렌소리' : imports[12],
      '나도_모르게_커피머신' : imports[13],
      '고요7' : imports[14],
      '과즙팡팡_바나나꺾고까는소리' : imports[15],
      '과즙팡팡_바나나먹는소리' : imports[16],
      '과즙팡팡_오렌지까는소리' : imports[17],
      '과즙팡팡_오렌지먹는소리' : imports[18],
      '고요12' : imports[19],
      '고요13' : imports[20],
      '고요14' : imports[21],
    };
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_players = {
      '나도_모르게_딸랑': [],
      '나도_모르게_우르르': [],
      '나도_모르게_한숨': [],
      '나도_모르게_메트로놈': [],
      '나도_모르게_사이렌소리': [],
      '나도_모르게_커피머신': [],
      '고요7': [],
      '과즙팡팡_바나나꺾고까는소리': [],
      '과즙팡팡_바나나먹는소리': [],
      '과즙팡팡_오렌지까는소리': [],
      '과즙팡팡_오렌지먹는소리': [],
      '고요12': [],
      '고요13': [],
      '고요14': [],
    };

    //screen changer
    var nscreen = 4;
    var screens = [];
    var screen_names = {};
    screen_names['start'] = 1;
    screen_names['check'] = 2;
    screen_names['beach1'] = 3;
    screen_names['beach2'] = 4;
    var curscreen;
    for (var idx = 0; idx < nscreen; idx++) {
      screens.push(new Layer());
    }

    function changeScreen(page) {
      //pagination buttons
      aprev._activate();
      anext._activate();
      //
      if (page < 1) page = 1;
      if (page > nscreen) page = nscreen;
      curscreen = page;
      for (var idx = 0; idx < nscreen; idx++) {
        //
        if (idx == page - 1) {
          screens[idx].bringToFront();
          top.bringToFront();
          $('.objstring').eq(idx).css('z-index', 1);
          //
          screens[idx].activate();
        } else {
          screens[idx].sendToBack();
          $('.objstring').eq(idx).css('z-index', -1);
        }
      }
      //pagination buttons
      if (curscreen == 1) {
        aprev._deactivate();
      }
      if (curscreen == nscreen) {
        anext._deactivate();
      }
    }

    function nextScreen() {
      if (curscreen + 1 <= nscreen) {
        curscreen++;
        changeScreen(curscreen);
      }
    }

    function prevScreen() {
      if (curscreen - 1 > 0) {
        curscreen--;
        changeScreen(curscreen);
      }
    }

    function changeScreenByName(pagename) {
      changeScreen(screen_names[pagename]);
    }

    function getScreenNameNext() {
      if (curscreen + 1 <= nscreen) {
        return Object.keys(screen_names)[curscreen + 1 - 1];
      } else {
        return Object.keys(screen_names)[curscreen - 1];
      }
    }

    function getScreenNamePrev() {
      if (curscreen - 1 > 0) {
        return Object.keys(screen_names)[curscreen - 1 - 1];
      } else {
        return Object.keys(screen_names)[curscreen - 1];
      }
    }

    //top layer
    var top = new Layer(); // new Layer() will be automatically activated at the moment.

    //networking - socket.io
    //var socket = io('http://192.168.42.20:8080');
    //var socket = io('http://sound-mix.herokuapp.com:8080');
    var socket = io('https://sound-mix.herokuapp.com');

    //net. connection marker
    var netstat = new Path.Circle({
      center: view.bounds.topRight + [-vssw / 2, +vssw / 2],
      radius: vssw / 4,
      fillColor: 'hotpink',
      strokeWidth: 2,
      strokeColor: 'gray',
      dashArray: [4, 4],
      onFrame: function(event) {
        this.rotate(1);
      }
    });
    netstat.fillColor.alpha = 0;

    //
    socket.on('connect', function() {
      console.log("i' m connected!");
      top.activate();
      netstat.fillColor.alpha = 1;
      socket.on('disconnect', function() {
        console.log("i' m disconnected!");
        top.activate();
        netstat.fillColor.alpha = 0;
      });
    });

    //page change - prev. page
    aprev.addTo(project);
    aprev.scale(vssw * 1.5);
    aprev.position = [0, 0]; //reset position, before relative positioning !!
    aprev.translate([vssw, vssw * 1.8]);
    aprev.fillColor = 'pink';
    aprev._socket = socket;
    aprev._isactive = false;
    aprev._activate = function() {
      this._isactive = true;
      this.opacity = 1;
    }
    aprev._deactivate = function() {
      this._isactive = false;
      this.opacity = 0.3;
    }
    aprev.onClick = function() {
      if (this._isactive == true) {
        prevScreen();
      }
    };

    //page change - next. page
    anext.addTo(project);
    anext.scale(vssw * 1.5);
    anext.position = [0, 0]; //reset position, before relative positioning !!
    anext.translate([vssw * 9, vssw * 1.8]);
    anext.fillColor = 'pink';
    anext._socket = socket;
    anext._isactive = false;
    anext._activate = function() {
      this._isactive = true;
      this.opacity = 1;
    }
    anext._deactivate = function() {
      this._isactive = false;
      this.opacity = 0.3;
    }
    anext.onClick = function() {
      if (this._isactive == true) {
        nextScreen();
      }
    };

    //title background
    new Path.Rectangle({
      point: [vssw * 2, vssw * 1],
      size: [vssw * 6, vssw * 1.5],
      fillColor: 'white',
      radius: 30,
    }).opacity = 0.3;

    //screen #1 - 'home'
    changeScreen(1);
    new Path.Rectangle([0, 0], vs).fillColor = '#999';

    //hello, screen.
    phonehand.addTo(project);
    phonehand.scale(vsw / 1.5);
    phonehand.position = view.center;
    //phonehand.position.y -= vssh;

    //screen #2 - check
    changeScreen(2);
    new Path.Rectangle([0, 0], vs).fillColor = '#393';

    //TODO: info text.
    new PointText({
      content: "네트워크 테스트!",
      point: view.center + [-vssw * 3, -vssw * 2],
      fontWeight: 'bold',
      fontSize: '2em',
      fillColor: 'gold'
    });
    new PointText({
      content: "사운드 테스트!",
      point: view.center + [-vssw * 3, vssw * 0],
      fontWeight: 'bold',
      fontSize: '2em',
      fillColor: 'pink'
    });
    new PointText({
      content: "동그라미 터치!",
      point: view.center + [-vssw * 3, vssw * 2],
      fontWeight: 'bold',
      fontSize: '2em',
      fillColor: 'red'
    });
    new Path.Circle({
      center: view.center,
      radius: vsw / 4,
      fillColor: 'white',
      opacity: 0.5,
      onClick: function() {
        clap.play();
      }
    });

    //screen #3 - beach page #1
    changeScreen(3);
    new Path.Rectangle([0, 0], vs).fillColor = '#333';

    //
    for (var row = 0; row < 7; row++) {
      for (var col = 0; col < 1; col++) {
        var idx = row * 1 + col;

        //play/stop/playcount/faster/slower button (networked between groups)
        var c = new Group({
          children: [
            //play button
            new Path.Rectangle({
              point: [vssw * 0.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(20, 60),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function(event) {
                var par = this.parent;
                par._players.push(par._player.start()._source); // start playbacks and collect their '_source's..
                par._playcount++;
                par.children.playcounter.content = '' + par._playcount;
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'start',
                  group: 'beach'
                });
              }
            }),
            //stop button
            new Path.Rectangle({
              point: [vssw * 2.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(120, 250),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  (par._players.shift()).stop();
                  par._playcount--;
                  par.children.playcounter.content = '' + par._playcount;
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'stop',
                  group: 'beach'
                });
              }
            }),
            //playcounter
            new PointText({
              name: 'playcounter',
              content: '' + 0,
              point: [vssw * 4.8, row * vssw * 1.4 + vssw * 3.5 + vssw * 0.6],
              fillColor: 'white',
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //faster button
            new Path.Rectangle({
              point: [vssw * 5.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(20, 60),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  par._players[par._players.length - 1].playbackRate.value += 0.2;
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'faster',
                  group: 'beach'
                });
              }
            }),
            //slower button
            new Path.Rectangle({
              point: [vssw * 7.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(120, 250),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  par._players[par._players.length - 1].playbackRate.value -= 0.2;
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'slower',
                  group: 'beach'
                });
              }
            })
          ],
          _socket: socket,
          _key: Object.keys(beach_sounds)[idx],
          _player: beach_sounds[Object.keys(beach_sounds)[idx]],
          _players: beach_players[Object.keys(beach_players)[idx]],
          _playcount: 0,
          _init: function() {
            this._player.loop = true;
            this._player.retrigger = true;
            //socket io event handling..
            var that = this;
            this._socket.on('sound', function(msg) {
              if (msg.group == 'beach' && msg.name == that._key) {
                if (msg.action == 'start') {
                  that._players.push(that._player.start()._source); // start playbacks and collect their '_source's..
                  that._playcount++;
                  that.children.playcounter.content = '' + that._playcount;
                } else if (msg.action == 'stop') {
                  if (that._players.length > 0) {
                    (that._players.shift()).stop();
                    that._playcount--;
                    that.children.playcounter.content = '' + that._playcount;
                  }
                } else if (msg.action == 'faster') {
                  if (that._players.length > 0) {
                    that._players[that._players.length - 1].playbackRate.value += 0.2;
                  }
                } else if (msg.action == 'slower') {
                  if (that._players.length > 0) {
                    that._players[that._players.length - 1].playbackRate.value -= 0.2;
                  }
                }
              }
            });
          }
        });
        c._init();
        //label
        new PointText({
          point: c.firstChild.bounds.topLeft + [0, -5],
          content: Object.keys(beach_sounds)[idx],
          fontSize: '1em',
          fontWeight: 'bold',
          fillColor: 'white'
        });
      }
    }

    //screen #4 - beach page #2
    changeScreen(4);
    new Path.Rectangle([0, 0], vs).fillColor = '#333';

    //
    for (var row = 0; row < 7; row++) {
      for (var col = 0; col < 1; col++) {
        var idx = row * 1 + col + 7;

        //play/stop/playcount/faster/slower button (networked between groups)
        var c = new Group({
          children: [
            //play button
            new Path.Rectangle({
              point: [vssw * 0.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(20, 60),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function(event) {
                var par = this.parent;
                par._players.push(par._player.start()._source); // start playbacks and collect their '_source's..
                par._playcount++;
                par.children.playcounter.content = '' + par._playcount;
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'start',
                  group: 'beach'
                });
              }
            }),
            //stop button
            new Path.Rectangle({
              point: [vssw * 2.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(120, 250),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  (par._players.shift()).stop();
                  par._playcount--;
                  par.children.playcounter.content = '' + par._playcount;
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'stop',
                  group: 'beach'
                });
              }
            }),
            //playcounter
            new PointText({
              name: 'playcounter',
              content: '' + 0,
              point: [vssw * 4.8, row * vssw * 1.4 + vssw * 3.5 + vssw * 0.6],
              fillColor: 'white',
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //faster button
            new Path.Rectangle({
              point: [vssw * 5.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(20, 60),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  par._players[par._players.length - 1].playbackRate.value += 0.2;
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'faster',
                  group: 'beach'
                });
              }
            }),
            //slower button
            new Path.Rectangle({
              point: [vssw * 7.8, row * vssw * 1.4 + vssw * 3.5],
              radius: vssw * 0.4,
              size: [vssw * 1.6, vssw * 0.7],
              fillColor: new Color({
                hue: getRandom(120, 250),
                saturation: 1,
                brightness: 1
              }),
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  par._players[par._players.length - 1].playbackRate.value -= 0.2;
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'slower',
                  group: 'beach'
                });
              }
            })
          ],
          _socket: socket,
          _key: Object.keys(beach_sounds)[idx],
          _player: beach_sounds[Object.keys(beach_sounds)[idx]],
          _players: beach_players[Object.keys(beach_players)[idx]],
          _playcount: 0,
          _init: function() {
            this._player.loop = true;
            this._player.retrigger = true;
            //socket io event handling..
            var that = this;
            this._socket.on('sound', function(msg) {
              if (msg.group == 'beach' && msg.name == that._key) {
                if (msg.action == 'start') {
                  that._players.push(that._player.start()._source); // start playbacks and collect their '_source's..
                  that._playcount++;
                  that.children.playcounter.content = '' + that._playcount;
                } else if (msg.action == 'stop') {
                  if (that._players.length > 0) {
                    (that._players.shift()).stop();
                    that._playcount--;
                    that.children.playcounter.content = '' + that._playcount;
                  }
                } else if (msg.action == 'faster') {
                  if (that._players.length > 0) {
                    that._players[that._players.length - 1].playbackRate.value += 0.2;
                  }
                } else if (msg.action == 'slower') {
                  if (that._players.length > 0) {
                    that._players[that._players.length - 1].playbackRate.value -= 0.2;
                  }
                }
              }
            });
          }
        });
        c._init();
        //label
        new PointText({
          point: c.firstChild.bounds.topLeft + [0, -5],
          content: Object.keys(beach_sounds)[idx],
          fontSize: '1em',
          fontWeight: 'bold',
          fillColor: 'white'
        });
      }
    }

    //home
    changeScreen(1);

    //reveal the curtain.
    $('#page-loading').css('z-index', -1);

    //network event handlers

    //event: 'sound'
    socket.on('sound', function(sound) {
      if (sound.name == 'clap') {
        if (sound.action == 'start') {
          clap.start();
        }
      }
    });

  });

});
