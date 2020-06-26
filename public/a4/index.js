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
    SVGImport_size1('./imgs/plus.svg'),
    SVGImport_size1('./imgs/minus.svg'),
    SVGImport_size1('./imgs/faster.svg'),
    SVGImport_size1('./imgs/slower.svg'),
    //clap
    AudioImport_p5("./audio/clap@2/" + ("0" + getRandomInt(1, 2)).slice(-2) + ".mp3"),
    //beach_sounds page 1 ==> 7
    AudioImport("./audio/선근_으이.mp3"),
    AudioImport("./audio/선근_으이으.mp3"),
    AudioImport("./audio/선근_으이으이.mp3"),
    AudioImport("./audio/선근_이으.mp3"),
    AudioImport("./audio/선근_이으이.mp3"),
    AudioImport("./audio/선근_이으이으.mp3"),
    AudioImport("./audio/고요7.mp3"),
    //beach_sounds page 2 ==> 7
    AudioImport("./audio/승민_사이렌소리.mp3"),
    AudioImport("./audio/승민_사이렌소리1.mp3"),
    AudioImport("./audio/승민_사이렌소리2.mp3"),
    AudioImport("./audio/승민_사이렌피리.mp3"),
    AudioImport("./audio/승민_사이렌휘파람.mp3"),
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
    var faster = imports[7];
    var slower = imports[8];
    //clap
    var clap = imports[9];
    //beach list
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_sounds = {
      '선근_으이': imports[10],
      '선근_으이으': imports[11],
      '선근_으이으이': imports[12],
      '선근_이으': imports[13],
      '선근_이으이': imports[14],
      '선근_이으이으': imports[15],
      '_소리의_퍼짐______소리의_움직임_1': imports[16],
      '승민_사이렌소리': imports[17],
      '승민_사이렌소리1': imports[18],
      '승민_사이렌소리2': imports[19],
      '승민_사이렌피리': imports[20],
      '승민_사이렌휘파람': imports[21],
      '고요13': imports[22],
      '_소리의_퍼짐______소리의_움직임_2': imports[23],
    };
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_players = {
      '선근_으이': [],
      '선근_으이으': [],
      '선근_으이으이': [],
      '선근_이으': [],
      '선근_이으이': [],
      '선근_이으이으': [],
      '_소리의_퍼짐______소리의_움직임_1': [],
      '승민_사이렌소리': [],
      '승민_사이렌소리1': [],
      '승민_사이렌소리2': [],
      '승민_사이렌피리': [],
      '승민_사이렌휘파람': [],
      '고요13': [],
      '_소리의_퍼짐______소리의_움직임_2': [],
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
      fillColor: '#51D0FD',
      strokeWidth: vssw * 0.03,
      strokeColor: '#FFE40A',
      dashArray: [vssw * 0.05, vssw * 0.05],
      onFrame: function(event) {
        // this.rotate(0.2);
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
    aprev.fillColor = '#FFE40A';
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
    anext.fillColor = '#FFE40A';
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
    var titlebox = new Path.Rectangle({
      point: [vssw * 2, vssw * 1],
      size: [vssw * 6, vssw * 1.5],
      fillColor: 'white',
      radius: vssw * 0.8,
      opacity: 0.3,
    });

    //screen #1 - 'home'
    changeScreen(1);
    new Path.Rectangle([0, 0], vs).fillColor = '#999';

    //title - text
    new PointText({
      point: titlebox.bounds.center,
      content: '  사운드-랩 § soundLab  ',
      fillColor: 'white',
      fontFamily: 'AppleGothic, Sans-serif',
      fontWeight: 'bold',
      fontSize: '3em',
    }).fitBounds(titlebox.bounds);

    //hello, screen.
    phonehand.addTo(project);
    phonehand.scale(vsw / 1.5);
    phonehand.position = view.center;
    //phonehand.position.y -= vssh;

    //screen #2 - check
    changeScreen(2);
    new Path.Rectangle([0, 0], vs).fillColor = '#05C183';

    //title - text
    new PointText({
      point: [vssw * 2, vssw * 1],
      content: '          연결 확인          ',
      fillColor: 'white',
      fontFamily: 'AppleGothic, Sans-serif',
      fontWeight: 'bold',
      fontSize: '3em'
    }).fitBounds(titlebox.bounds);

    //TODO: info text.
    new PointText({
      content: "네트워크 테스트!",
      point: view.center + [-vssw * 3, -vssw * 2],
      fontWeight: 'bold',
      fontSize: vssw * 1.0,
      fillColor: 'gold'
    });
    new PointText({
      content: "사운드 테스트!",
      point: view.center + [-vssw * 3, vssw * 0],
      fontWeight: 'bold',
      fontSize: vssw * 1.0,
      fillColor: 'pink'
    });
    new PointText({
      content: "동그라미 터치!",
      point: view.center + [-vssw * 3, vssw * 2],
      fontWeight: 'bold',
      fontSize: vssw * 1.0,
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

    //global panning variable
    //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
    var pan_width_pool = [1000, 2000, 3000, 4000, 8000, 80000];
    var pan_speed_pool = [0, 10, 30, 50, 80, 200, 400, 1200];
    var cur_pan_width_idx = pan_width_pool.length - 1;
    var cur_pan_speed_idx = 0;
    var cur_pan_width = 0;
    var cur_pan_speed = 0;

    //screen #3 - beach page #1
    changeScreen(3);
    new Path.Rectangle([0, 0], vs).fillColor = '#555';

    //title - text
    new PointText({
      point: [vssw * 2, vssw * 1],
      content: '           믹스 #1           ',
      fillColor: 'white',
      fontFamily: 'AppleGothic, Sans-serif',
      fontWeight: 'bold',
      fontSize: '3em'
    }).fitBounds(titlebox.bounds);

    //
    for (var row = 0; row < 7; row++) {
      for (var col = 0; col < 1; col++) {
        var idx = row * 1 + col;

        //play/stop/playcount/faster/slower button (networked between groups)
        var c = new Group({
          children: [
            //play button
            new Group({
              name: 'play_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 0.8, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.5, vssw * 0.7],
                  fillColor: new Color({
                    hue: getRandom(20, 60),
                    saturation: 1,
                    brightness: 1
                  }),
                }),
                plus.clone()
              ],
              onMouseDown: function(event) {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_width: (+)
                  if (cur_pan_width_idx < (pan_width_pool.length - 1)) {
                    cur_pan_width_idx++;
                  }
                  cur_pan_width = pan_width_pool[cur_pan_width_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.playcounter.content = '' + (cur_pan_width_idx + 1);
                } else {
                  par._players.push(par._player.start()._source); // start playbacks and collect their '_source's..
                  par._playcount++;
                  par.children.playcounter.content = '' + par._playcount;
                  par.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'start',
                    group: 'beach'
                  });
                }
              }
            }),
            //playcounterbox
            new Path.Rectangle({
              name: 'playcounterbox',
              point: [vssw * 2.3, row * vssw * 1.4 + vssw * 3.5],
              size: [vssw * 0.6, vssw * 0.8],
            }),
            //playcounter
            new PointText({
              name: 'playcounter',
              content: '' + 0,
              fillColor: 'white',
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //stop button
            new Group({
              name: 'stop_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 2.9, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  fillColor: new Color({
                    hue: getRandom(120, 180),
                    saturation: 1,
                    brightness: 1
                  }),
                }),
                minus.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_width : (-)
                  if (cur_pan_width_idx > 0) {
                    cur_pan_width_idx--;
                  }
                  cur_pan_width = pan_width_pool[cur_pan_width_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.playcounter.content = '' + (cur_pan_width_idx + 1);
                } else {
                  if (par._players.length > 0) {
                    (par._players.shift()).stop();
                    par._playcount--;
                    par.children.playcounter.content = '' + par._playcount;
                  }
                  if (par._players.length == 0) {
                    par.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                  }
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'stop',
                    group: 'beach'
                  });
                }
              }
            }),
            //faster button
            new Group({
              name: 'faster_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 5.0, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  strokeColor: new Color({
                    hue: getRandom(20, 60),
                    saturation: 1,
                    brightness: 1
                  }),
                  strokeWidth: vssw * 0.03,
                  fillColor: "#555"
                }),
                faster.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_speed: (+)
                  if (cur_pan_speed_idx < (pan_speed_pool.length - 1)) {
                    cur_pan_speed_idx++;
                  }
                  cur_pan_speed = pan_speed_pool[cur_pan_speed_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.speedcounter.content = '' + cur_pan_speed_idx;
                } else {
                  if (par._players.length > 0) {
                    par._players[par._players.length - 1].playbackRate.value += 0.2;
                    par.children.speedcounter.content = Number.parseFloat(par._players[par._players.length - 1].playbackRate.value).toFixed(1);
                  }
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'faster',
                    group: 'beach'
                  });
                }
              }
            }),
            //speedcounterbox
            new Path.Rectangle({
              name: 'speedcounterbox',
              point: [vssw * 6.6, row * vssw * 1.4 + vssw * 3.5],
              size: [vssw * 0.6, vssw * 0.8],
            }),
            //speedcounter
            new PointText({
              name: 'speedcounter',
              content: '' + 0,
              fillColor: 'white',
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //slower button
            new Group({
              name: 'slower_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 7.8, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  strokeColor: new Color({
                    hue: getRandom(120, 180),
                    saturation: 1,
                    brightness: 1
                  }),
                  strokeWidth: vssw * 0.03,
                  fillColor: "#555"
                }),
                slower.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_speed: (-)
                  if (cur_pan_speed_idx > 0) {
                    cur_pan_speed_idx--;
                  }
                  cur_pan_speed = pan_speed_pool[cur_pan_speed_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.speedcounter.content = '' + cur_pan_speed_idx;
                } else {
                  if (par._players.length > 0) {
                    var val = par._players[par._players.length - 1].playbackRate.value;
                    if (val > 0.2) {
                      par._players[par._players.length - 1].playbackRate.value = val - 0.2;
                    }
                    par.children.speedcounter.content = Number.parseFloat(par._players[par._players.length - 1].playbackRate.value).toFixed(1);
                  }
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'slower',
                    group: 'beach'
                  });
                }
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
            // set icons
            this.children.play_btn.children[1].fitBounds(this.children.play_btn.children[0].bounds);
            this.children.play_btn.children[1].fillColor = "#555";
            this.children.stop_btn.children[1].fitBounds(this.children.stop_btn.children[0].bounds);
            this.children.stop_btn.children[1].fillColor = "#555";
            this.children.faster_btn.children[1].fitBounds(this.children.faster_btn.children[0].bounds);
            this.children.faster_btn.children[1].fillColor = "orange";
            this.children.slower_btn.children[1].fitBounds(this.children.slower_btn.children[0].bounds);
            this.children.slower_btn.children[1].fillColor = "lime";
            // positioning numberboxes...
            this.children.playcounter.fitBounds(this.children.playcounterbox.bounds);
            this.children.speedcounter.fitBounds(this.children.speedcounterbox.bounds);
            this.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
            //socket io event handling..
            var that = this;
            this._socket.on('sound', function(msg) {
              if (msg.group == 'beach' && msg.name == that._key) {
                if (msg.action == 'start') {
                  that._players.push(that._player.start()._source); // start playbacks and collect their '_source's..
                  that._playcount++;
                  that.children.playcounter.content = '' + that._playcount;
                  that.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                } else if (msg.action == 'stop') {
                  if (that._players.length > 0) {
                    (that._players.shift()).stop();
                    that._playcount--;
                    that.children.playcounter.content = '' + that._playcount;
                  }
                  if (that._players.length == 0) {
                    that.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                  }
                } else if (msg.action == 'faster') {
                  if (that._players.length > 0) {
                    that._players[that._players.length - 1].playbackRate.value += 0.2;
                    that.children.speedcounter.content = Number.parseFloat(that._players[that._players.length - 1].playbackRate.value).toFixed(1);
                  }
                } else if (msg.action == 'slower') {
                  if (that._players.length > 0) {
                    var val = that._players[that._players.length - 1].playbackRate.value;
                    if (val > 0.2) {
                      that._players[that._players.length - 1].playbackRate.value -= 0.2;
                    }
                    that.children.speedcounter.content = Number.parseFloat(that._players[that._players.length - 1].playbackRate.value).toFixed(1);
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
          fontSize: vssw * 0.55,
          fontWeight: 'bold',
          fillColor: 'white'
        });
      }
    }

    //screen #4 - beach page #2
    changeScreen(4);
    new Path.Rectangle([0, 0], vs).fillColor = '#555';

    //title - text
    new PointText({
      point: [vssw * 2, vssw * 1],
      content: '           믹스 #2           ',
      fillColor: 'white',
      fontFamily: 'AppleGothic, Sans-serif',
      fontWeight: 'bold',
      fontSize: '3em'
    }).fitBounds(titlebox.bounds);

    //
    for (var row = 0; row < 7; row++) {
      for (var col = 0; col < 1; col++) {
        var idx = row * 1 + col + 7;

        //play/stop/playcount/faster/slower button (networked between groups)
        var c = new Group({
          children: [
            //play button
            new Group({
              name: 'play_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 0.8, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.5, vssw * 0.7],
                  fillColor: new Color({
                    hue: getRandom(20, 60),
                    saturation: 1,
                    brightness: 1
                  }),
                }),
                plus.clone()
              ],
              onMouseDown: function(event) {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_width: (+)
                  if (cur_pan_width_idx < (pan_width_pool.length - 1)) {
                    cur_pan_width_idx++;
                  }
                  cur_pan_width = pan_width_pool[cur_pan_width_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.playcounter.content = '' + (cur_pan_width_idx + 1);
                } else {
                  par._players.push(par._player.start()._source); // start playbacks and collect their '_source's..
                  par._playcount++;
                  par.children.playcounter.content = '' + par._playcount;
                  par.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'start',
                    group: 'beach'
                  });
                }
              }
            }),
            //playcounterbox
            new Path.Rectangle({
              name: 'playcounterbox',
              point: [vssw * 2.3, row * vssw * 1.4 + vssw * 3.5],
              size: [vssw * 0.6, vssw * 0.8],
            }),
            //playcounter
            new PointText({
              name: 'playcounter',
              content: '' + 0,
              fillColor: 'white',
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //stop button
            new Group({
              name: 'stop_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 2.9, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  fillColor: new Color({
                    hue: getRandom(120, 180),
                    saturation: 1,
                    brightness: 1
                  }),
                }),
                minus.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_width : (-)
                  if (cur_pan_width_idx > 0) {
                    cur_pan_width_idx--;
                  }
                  cur_pan_width = pan_width_pool[cur_pan_width_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.playcounter.content = '' + (cur_pan_width_idx + 1);
                } else {
                  if (par._players.length > 0) {
                    (par._players.shift()).stop();
                    par._playcount--;
                    par.children.playcounter.content = '' + par._playcount;
                  }
                  if (par._players.length == 0) {
                    par.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                  }
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'stop',
                    group: 'beach'
                  });
                }
              }
            }),
            //faster button
            new Group({
              name: 'faster_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 5.0, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  strokeColor: new Color({
                    hue: getRandom(20, 60),
                    saturation: 1,
                    brightness: 1
                  }),
                  strokeWidth: vssw * 0.03,
                  fillColor: "#555"
                }),
                faster.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_speed: (+)
                  if (cur_pan_speed_idx < (pan_speed_pool.length - 1)) {
                    cur_pan_speed_idx++;
                  }
                  cur_pan_speed = pan_speed_pool[cur_pan_speed_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.speedcounter.content = '' + cur_pan_speed_idx;
                } else {
                  if (par._players.length > 0) {
                    par._players[par._players.length - 1].playbackRate.value += 0.2;
                    par.children.speedcounter.content = Number.parseFloat(par._players[par._players.length - 1].playbackRate.value).toFixed(1);
                  }
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'faster',
                    group: 'beach'
                  });
                }
              }
            }),
            //speedcounterbox
            new Path.Rectangle({
              name: 'speedcounterbox',
              point: [vssw * 6.6, row * vssw * 1.4 + vssw * 3.5],
              size: [vssw * 0.6, vssw * 0.8],
            }),
            //speedcounter
            new PointText({
              name: 'speedcounter',
              content: '' + 0,
              fillColor: 'white',
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //slower button
            new Group({
              name: 'slower_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 7.8, row * vssw * 1.4 + vssw * 3.5],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  strokeColor: new Color({
                    hue: getRandom(120, 180),
                    saturation: 1,
                    brightness: 1
                  }),
                  strokeWidth: vssw * 0.03,
                  fillColor: "#555"
                }),
                slower.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                //NOTE: this DOES NOT sync between web-clients! <-- TBD, yet NOT-IMPLEMENTED !
                if (par._key == '_소리의_퍼짐______소리의_움직임_1' || par._key == '_소리의_퍼짐______소리의_움직임_2') {
                  //pan_speed: (-)
                  if (cur_pan_speed_idx > 0) {
                    cur_pan_speed_idx--;
                  }
                  cur_pan_speed = pan_speed_pool[cur_pan_speed_idx];
                  par._socket.emit('pan', {
                    width: cur_pan_width,
                    speed: cur_pan_speed
                  });
                  par.children.speedcounter.content = '' + cur_pan_speed_idx;
                } else {
                  if (par._players.length > 0) {
                    var val = par._players[par._players.length - 1].playbackRate.value;
                    if (val > 0.2) {
                      par._players[par._players.length - 1].playbackRate.value = val - 0.2;
                    }
                    par.children.speedcounter.content = Number.parseFloat(par._players[par._players.length - 1].playbackRate.value).toFixed(1);
                  }
                  //
                  par._socket.emit('sound', {
                    name: par._key,
                    action: 'slower',
                    group: 'beach'
                  });
                }
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
            // set icons
            this.children.play_btn.children[1].fitBounds(this.children.play_btn.children[0].bounds);
            this.children.play_btn.children[1].fillColor = "#555";
            this.children.stop_btn.children[1].fitBounds(this.children.stop_btn.children[0].bounds);
            this.children.stop_btn.children[1].fillColor = "#555";
            this.children.faster_btn.children[1].fitBounds(this.children.faster_btn.children[0].bounds);
            this.children.faster_btn.children[1].fillColor = "orange";
            this.children.slower_btn.children[1].fitBounds(this.children.slower_btn.children[0].bounds);
            this.children.slower_btn.children[1].fillColor = "lime";
            // positioning numberboxes...
            this.children.playcounter.fitBounds(this.children.playcounterbox.bounds);
            this.children.speedcounter.fitBounds(this.children.speedcounterbox.bounds);
            this.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
            //socket io event handling..
            var that = this;
            this._socket.on('sound', function(msg) {
              if (msg.group == 'beach' && msg.name == that._key) {
                if (msg.action == 'start') {
                  that._players.push(that._player.start()._source); // start playbacks and collect their '_source's..
                  that._playcount++;
                  that.children.playcounter.content = '' + that._playcount;
                  that.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                } else if (msg.action == 'stop') {
                  if (that._players.length > 0) {
                    (that._players.shift()).stop();
                    that._playcount--;
                    that.children.playcounter.content = '' + that._playcount;
                  }
                  if (that._players.length == 0) {
                    that.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                  }
                } else if (msg.action == 'faster') {
                  if (that._players.length > 0) {
                    that._players[that._players.length - 1].playbackRate.value += 0.2;
                    that.children.speedcounter.content = Number.parseFloat(that._players[that._players.length - 1].playbackRate.value).toFixed(1);
                  }
                } else if (msg.action == 'slower') {
                  if (that._players.length > 0) {
                    var val = that._players[that._players.length - 1].playbackRate.value;
                    if (val > 0.2) {
                      that._players[that._players.length - 1].playbackRate.value -= 0.2;
                    }
                    that.children.speedcounter.content = Number.parseFloat(that._players[that._players.length - 1].playbackRate.value).toFixed(1);
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
          fontSize: vssw * 0.55,
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
