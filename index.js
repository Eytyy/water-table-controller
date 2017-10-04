'use strict';

const Tessel = require('tessel-io');
const five = require('johnny-five');

const board = new five.Board({
  io: new Tessel(),
  repl: false,
  debug: false,
});

const ip = '192.168.1.3';
// const ip = '192.168.1.4';

const port = '3000';

const io = require('socket.io-client');
const socket = io.connect(`http://${ip}:${port}`);

socket.on('connect', function() {
  socket.emit('join', 'Tessel');
});

let lastSeekValue = 0;
// seek video
const onSeekVideo = ({event, payload}) => {
  if (payload === lastSeekValue) {
    return;
  }
  lastSeekValue = payload;
  socket.emit('fromTessel', {
    event,
    payload,
  });
};

let lastLayerValue = 0;
// toggle-layer
const onChangeLayer = ({event, payload}) => {
  if (payload === lastLayerValue) {
    return;
  }
  lastLayerValue = payload;

  socket.emit('fromTessel', {
    event,
    payload,
  });
};



board.on('ready', () => {
  // sensors
  // timeline knob
  const sensor = new five.Sensor({
    pin: "b7",
    freq: 250
  });
  sensor.on('change', () => onSeekVideo({
    event: 'seek-video',
    payload: sensor.scaleTo(0, 72),
  }));

  const sensor2 = new five.Sensor({
    pin: "a7",
    freq: 250
  });
  sensor2.on('change', () => onChangeLayer({
    event: 'change-data-layer',
    payload: sensor2.scaleTo(0, 24),
  })); 

  // buttons

  // start button
  const b6 = new five.Button({
    pin: 'b6'
  });
  b6.on('press', () => {
    socket.emit('fromTessel', {
      event: 'start',
      payload: 0,
    });
  });

  const b5 = new five.Button({
    pin: 'b5'
  });
  b5.on('press', () => {
    socket.emit('fromTessel', {
      event: 'toggle-screen',
      payload: 0,
    });
  });
    
  /* - svg controls */
  const a5 = new five.Button({
    pin: 'a5'
  });
  a5.on('press', () => {
    socket.emit('fromTessel', {
      event: 'svg-1',
      payload: 0,
    });
  });

  const a6 = new five.Button({
    pin: 'a6'
  });
  a6.on('press', () => {
    socket.emit('fromTessel', {
      event: 'svg-2',
      payload: 0,
    });
  });
});
