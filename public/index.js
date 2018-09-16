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
    //btn_sounds ==> 9
    AudioImport_p5("./audio/bridgeA/고향돌리도.mp3"),
    AudioImport_p5("./audio/bridgeA/동물소리흉내.mp3"),
    // AudioImport_p5("./audio/bridgeA/동물소리흉내02.mp3"),
    AudioImport_p5("./audio/bridgeA/동물소리흉내03.mp3"),
    AudioImport_p5("./audio/bridgeA/모래야돌아와.mp3"),
    AudioImport_p5("./audio/bridgeA/물소리가있었다.mp3"),
    AudioImport_p5("./audio/bridgeA/우와.mp3"),
    AudioImport_p5("./audio/bridgeA/이거물에넣고해도되요.mp3"),
    AudioImport_p5("./audio/bridgeA/흰수마자돌아와.mp3"),
    AudioImport_p5("./audio/bridgeA/흰수마자어디갔니.mp3"),
    //set_sounds ==> 8
    AudioImport_p5("./audio/path/가을아침.mp3"),
    AudioImport_p5("./audio/path/내나이.mp3"),
    AudioImport_p5("./audio/path/노래.mp3"),
    AudioImport_p5("./audio/path/사랑을했따.mp3"),
    AudioImport_p5("./audio/path/아아아아.mp3"),
    AudioImport_p5("./audio/path/하모니카.mp3"),
    AudioImport_p5("./audio/path/합주.mp3"),
    AudioImport_p5("./audio/path/휘파람.mp3"),
    //beach_sounds ==> 8
    AudioImport("./audio/beach/두드리는01.mp3"),
    AudioImport("./audio/beach/두드리는02.mp3"),
    // AudioImport("./audio/beach/두드리는03.mp3"),
    // AudioImport("./audio/beach/두드리는04.mp3"),
    AudioImport("./audio/beach/두드리는06.mp3"),
    // AudioImport("./audio/beach/모래걸음.mp3"),
    AudioImport("./audio/beach/물소리.mp3"),
    AudioImport("./audio/beach/물장구.mp3"),
    AudioImport("./audio/beach/손장구.mp3"),
    AudioImport("./audio/beach/운더강강술래.mp3"),
    // AudioImport("./audio/beach/웃음.mp3"),
    AudioImport("./audio/beach/젖은모래쓸어내기.mp3"),
    // AudioImport("./audio/beach/천막긁는.mp3"),
    // AudioImport("./audio/beach/풍덩.mp3"),
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
    //groups
    var group_names = [
      '블루',
      '소담이담',
      '상남이네',
      '양냥',
    ];
    var group_keys = [
      'grp1',
      'grp2',
      'grp3',
      'grp4',
    ];
    //buttons
    var btn_names = [
      '고향',
      '동물1',
      '동물2',
      '모래',
      '물소리',
      '우와',
      '이거',
      '돌아와',
      '어디'
    ];
    var btn_sounds = [
      imports[8],
      imports[9],
      imports[10],
      imports[11],
      imports[12],
      imports[13],
      imports[14],
      imports[15],
      imports[16],
    ];
    //set list
    var set_sounds = {
      '가을아침': imports[17],
      '내나이': imports[18],
      '노래': imports[19],
      '사랑': imports[20],
      '아아': imports[21],
      '하모니카': imports[22],
      '합주': imports[23],
      '휘파람': imports[24]
    };
    //beach list
    var beach_sounds = {
      '두드림1': imports[25],
      '두드림2': imports[26],
      '두드림6': imports[27],
      '물소리': imports[28],
      '물장구': imports[29],
      '손장구': imports[30],
      '강강': imports[31],
      '모래': imports[32]
    };
    var beach_players = {
      '두드림1': [],
      '두드림2': [],
      '두드림6': [],
      '물소리': [],
      '물장구': [],
      '손장구': [],
      '강강': [],
      '모래': [],
    };

    //screen changer
    var nscreen = 6;
    var screens = [];
    var screen_names = {};
    screen_names['start'] = 1;
    screen_names['select'] = 2;
    screen_names['check'] = 3;
    screen_names['bridgeA'] = 4;
    screen_names['path'] = 5;
    screen_names['beach'] = 6;
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
      if (curscreen == 2) {
        anext._deactivate();
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
    //var socket = io('http://192.168.1.105:8080');
    var socket = io('http://choir.run:8080');

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

    //screen #2 - 'select'

    changeScreen(2);
    new Path.Rectangle([0, 0], vs).fillColor = '#3333ff'; //;

    //group select buttons
    var group_selected = undefined; //key
    for (var row = 0; row < 2; row++) {
      for (var col = 0; col < 2; col++) {
        var idx = row * 2 + col;
        var c = new Path.Circle({
          center: [col * vssw * 3.5 + vssw * 2.5, row * vssw * 3.5 + vssw * 4 + vssw * 2.5],
          radius: vssw * 1,
          fillColor: new Color({
            hue: getRandom(30, 180),
            saturation: 1,
            brightness: 1
          }),
          _idx: idx,
          onClick: function() {
            group_selected = group_keys[this._idx];
            console.log(group_selected);
            //next screen.
            changeScreen(3);
          }
        });
        new PointText({
          point: c.bounds.topLeft + [0, -5],
          content: group_names[idx],
          fontSize: '2em',
          fontWeight: 'bold',
          fillColor: c.fillColor
        });
      }
    }

    //screen #3 - check
    changeScreen(3);
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

    //screen #4 - bridgeA
    changeScreen(4);
    new Path.Rectangle([0, 0], vs).fillColor = '#333';

    //sound list
    var buttons = [];

    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        var idx = row * 3 + col;

        //play/stop button (networked between groups)
        var c = new Group([
          new Path.Circle({
            center: [col * vssw * 2.5 + vssw * 2, row * vssw * 2.3 + vssw * 5.5],
            radius: vssw * 0.8,
            fillColor: new Color({
              hue: getRandom(20, 60),
              saturation: 1,
              brightness: 1
            }),
            _socket: socket,
            _key: btn_names[idx],
            _player: btn_sounds[idx],
            _playcount: 0,
            _init: function() {
              var that = this;
              this._socket.on('sound', function(msg) {
                if (msg.group == group_selected && msg.name == that._key) {
                  if (msg.action == 'start') {
                    that._playstart();
                    that._playcount++;
                  }
                }
              });
              this.nextSibling.opacity = 0; //marker off!
              this._player.playMode('restart');
            },
            _playstart: function() {
              // play (re-)start now!
              this._player.play();
              this.nextSibling.opacity = 1; //marker on!
              var that = this;
              this._player.onended(function() {
                if (that._playcount > 0) {
                  that._playcount--;
                  if (that._playcount == 0) { // only do this, when it is finally stopped.
                    that.nextSibling.opacity = 0; //marker off!
                  }
                }
              });
            },
            _playstop: function() {
              this._player.stop();
              this.nextSibling.opacity = 0; //marker off!
            },
            onMouseDown: function() {
              //
              this._playstart();
              this._playcount++;
              //
              this._socket.emit('sound', {
                name: this._key,
                action: 'start',
                group: group_selected
              });
            }
          }),
          //the marking ring around the button
          new Path.Circle({
            center: [col * vssw * 2.5 + vssw * 2, row * vssw * 2.3 + vssw * 5.5],
            radius: vssw * 1,
            strokeWidth: 5,
            strokeColor: 'white'
          })
        ]);
        c.firstChild._init();
        buttons.push(c);
        //labels
        new PointText({
          point: c.firstChild.bounds.topLeft + [0, -5],
          content: btn_names[idx],
          fontSize: '1.5em',
          fontWeight: 'bold',
          fillColor: c.firstChild.fillColor
        });
      }
    }
    //speed controller - frame
    new Group({
      children: [
        new Path.Rectangle({
          point: [vsw - vssw * 1.5, vssh * 2.5],
          size: [vssw, vssh * 6],
          radius: 20,
        }),
        new Path.Rectangle({
          point: [vsw - vssw * 1.5, vssh * 2.5],
          size: [vssw, vssh * 3],
          fillColor: 'blue'
        }),
        new Path.Rectangle({
          point: [vsw - vssw * 1.5, vssh * 2.5 + vssh * 3],
          size: [vssw, vssh * 3],
          fillColor: 'gold'
        }),
      ],
      clipped: true
    });
    //speed controller - knob
    var knob = new Path.Circle({
      center: [vsw - vssw, vssh * 2.5 + vssw * 0.5],
      radius: 20,
      fillColor: 'white',
      _start_y: vssh * 2.5 + vssw * 0.5,
      _end_y: vssh * 2.5 + vssh * 6 - vssw * 0.5,
      onMouseDrag: function(event) {
        if (event.point.y > this._end_y) {
          this.position.y = this._end_y;
        } else if (event.point.y < this._start_y) {
          this.position.y = this._start_y;
        } else {
          this.position.y = event.point.y;
        }
        var control = map(this.position.y, [this._start_y, this._end_y], [-1, 1]);
        //playback speed change.. (perform the effect)
        buttons.forEach(function(item) {
          item.firstChild._player.rate(Math.pow(5, control));
        });
      }
    });
    //initial position of the knob. 0 means 1 (Math.pow(XXX, 0) == 1)
    knob.position.y = map(0, [-1, 1], [knob._start_y, knob._end_y]);
    //stop button
    var stopbtn = new Group({
      _socket: socket,
      children: [
        new Path.Circle({
          center: [vssw * 2.7 + vssw * 2, 2.5 * vssw * 2.7 + vssw * 6],
          radius: vssw * 0.8
        })
      ],
      onMouseDown: function() {
        buttons.forEach(function(item) {
          item.firstChild._playstop();
          item.firstChild._playcount = 0;
        });
        //
        this._socket.emit('sound', {
          name: 'stop',
          action: 'stop',
          group: group_selected
        });
      }
    });
    //label
    stopbtn.addChild(new PointText({
      point: stopbtn.bounds.topLeft + [0, -5],
      content: 'stop',
      fontSize: '2em',
      fontWeight: 'bold'
    }));
    stopbtn.fillColor = 'red';
    //'stop' handler
    socket.on('sound', function(msg) {
      if (msg.action == 'stop') {
        buttons.forEach(function(item) {
          item.firstChild._playstop();
          item.firstChild._playcount = 0;
        });
      }
    });

    //screen #5 - path
    changeScreen(5);
    new Path.Rectangle([0, 0], vs).fillColor = '#333';

    iconsound.addTo(project);
    //iconsound.scale(vsw / 1.5);
    iconsound.scale(vsw / 2.5);
    iconsound.position = view.center;
    iconsound.fillColor = '#00acfe';

    new Group({
      children: [
        new Path.Circle({
          center: view.center,
          radius: vssw * 3,
          fillColor: '#fef1b5', // buttermilk
          opacity: 0.6
        })
      ],
      onClick: function() {
        clap.play();
      }
    }).addChild(iconsound);

    //play mode
    Object.keys(set_sounds).forEach(function (key) {
      set_sounds[key].playMode('restart');
    });

    //socket io event waiting..
    socket.on('sound', function(msg) {
      if (msg.group == 'path') {
        if (msg.action == 'start') {
          set_sounds[msg.name].play();
        } else if (msg.action == 'stop') {
          set_sounds[msg.name].stop();
        }
      }
    });

    //screen #6 - beach
    changeScreen(6);
    new Path.Rectangle([0, 0], vs).fillColor = '#333';

    //
    for (var row = 0; row < 8; row++) {
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
