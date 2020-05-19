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
    AudioImport("./audio/2011_2011.mp3"),
    AudioImport("./audio/2011_벨.mp3"),
    AudioImport("./audio/2011_숲.mp3"),
    AudioImport("./audio/2011_바람.mp3"),
    AudioImport("./audio/2011_헤비레인.mp3"),
    AudioImport("./audio/고요6.mp3"),
    AudioImport("./audio/고요7.mp3"),
    //beach_sounds page 2 ==> 7
    AudioImport("./audio/검은산_뚜루.mp3"),
    AudioImport("./audio/검은산_다급.mp3"),
    AudioImport("./audio/검은산_부엉.mp3"),
    AudioImport("./audio/검은산_불안.mp3"),
    AudioImport("./audio/검은산_쏟아짐.mp3"),
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
      '2011_2011' : imports[8],
      '2011_벨' : imports[9],
      '2011_숲' : imports[10],
      '2011_바람' : imports[11],
      '2011_헤비레인' : imports[12],
      '고요6' : imports[13],
      '고요7' : imports[14],
      '검은산_뚜루' : imports[15],
      '검은산_다급' : imports[16],
      '검은산_부엉' : imports[17],
      '검은산_불안' : imports[18],
      '검은산_쏟아짐' : imports[19],
      '고요13' : imports[20],
      '고요14' : imports[21],
    };
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_players = {
      '2011_2011': [],
      '2011_벨': [],
      '2011_숲': [],
      '2011_바람': [],
      '2011_헤비레인': [],
      '고요6': [],
      '고요7': [],
      '검은산_뚜루': [],
      '검은산_다급': [],
      '검은산_부엉': [],
      '검은산_불안': [],
      '검은산_쏟아짐': [],
      '고요13': [],
      '고요14': [],
    };
    //NOTE: beware! same key is not allowed!! every keys should have different name!!
    var beach_playcounts = {
      '2011_2011': 0,
      '2011_벨': 0,
      '2011_숲': 0,
      '2011_바람': 0,
      '2011_헤비레인': 0,
      '고요6': 0,
      '고요7': 0,
      '검은산_뚜루': 0,
      '검은산_다급': 0,
      '검은산_부엉': 0,
      '검은산_불안': 0,
      '검은산_쏟아짐': 0,
      '고요13': 0,
      '고요14': 0,
    };

    //screen changer
    var nscreen = 3;
    var screens = [];
    var screen_names = {};
    screen_names['start'] = 1;
    screen_names['check'] = 2;
    screen_names['beach'] = 3;
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
    //var socket = io('http://choir.run:8080');
    var socket = io('https://choir.run');

    //net. connection marker
    var netstat = new Path.Circle({
      center: view.bounds.topRight + [-vssw / 2, +vssw / 2],
      radius: vssw / 4,
      fillColor: '#51D0FD',
      strokeWidth: vssw * 0.03,
      strokeColor: '#FFE40A',
      dashArray: [vssw * 0.05, vssw * 0.05],
      onFrame: function(event) {
        this.rotate(0.2);
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

    //screen #3 - beach page #1
    changeScreen(3);
    new Path.Rectangle([0, 0], vs).fillColor = '#333';

    //title - text
    new PointText({
      point: [vssw * 2, vssw * 1],
      content: '           믹스 #1           ',
      fillColor: 'white',
      fontFamily: 'AppleGothic, Sans-serif',
      fontWeight: 'bold',
      fontSize: '3em'
    }).fitBounds(titlebox.bounds);

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
    Object.keys(beach_sounds).forEach(function (key) {
      //
      beach_sounds[key].loop = true;
      beach_sounds[key].retrigger = true;

      //socket io event handling..
      // var that = this;
      socket.on('sound', function(msg) {
        if (msg.group == 'beach' && msg.name == key) {
          if (msg.action == 'start') {
            beach_players[key].push(beach_sounds[key].start()._source); // start playbacks and collect their '_source's..
            beach_playcounts[key]++;
          } else if (msg.action == 'stop') {
            if (beach_players[key].length > 0) {
              (beach_players[key].shift()).stop();
              beach_playcounts[key]--;
            }
          } else if (msg.action == 'faster') {
            if (beach_players[key].length > 0) {
              beach_players[key][beach_players[key].length - 1].playbackRate.value += 0.2;
            }
          } else if (msg.action == 'slower') {
            if (beach_players[key].length > 0) {
              beach_players[key][beach_players[key].length - 1].playbackRate.value -= 0.2;
            }
          }
        }
      });
    });

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
