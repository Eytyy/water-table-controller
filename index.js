'use strict';

const Tessel = require('tessel-io');
const five = require('johnny-five');

const board = new five.Board({
  io: new Tessel(),
  repl: false,
  debug: false,
});

const ip = '192.168.1.27';
const port = '3000';

const io = require('socket.io-client');
const socket = io.connect(`http://${ip}:${port}`);

socket.on('connect', function() {
  socket.emit('join', 'Tessel');
});

let lastSeekValue = 0;
let lastLayerValue = 0;

const emmiKnobEvent = ({event, payload}) => {
  if (event === 'seek-video') {
    if (payload === lastSeekValue) {
      return;
    }
    lastSeekValue = payload;
  } else if (event === 'change-data-layer') {
    if (payload === lastLayerValue) {
      return;
    }
    lastLayerValue = payload;
  }

  socket.emit('fromTessel', {
    event,
    payload,
  });
};

const emmetButtonEvent = (value) => {
  socket.emit('fromTessel', {
    event: value,
    payload: 0,
  });
};


board.on('ready', () => {

  /* video controls */
    // start button
    const b6 = new five.Button({
      pin: 'b6'
    });
    b6.on('press', () => emmetButtonEvent('start'))

    // timeline knob
    const sensor = new five.Sensor({
      pin: "b7",
      freq: 250
    });
    sensor.on('change', () => emmiKnobEvent({
      event: 'seek-video',
      payload: sensor.scaleTo(0, 72),
    }));
  /* - video controls */

  /* data controls */
    // data viz toggle
    const a6 = new five.Button({
      pin: 'a6'
    });
    a6.on('press', () => emmetButtonEvent('toggle-screen'))

    // data viz layer selection knob
    const sensor2 = new five.Sensor({
      pin: "a7",
      freq: 250
    });
    sensor2.on('change', () => emmiKnobEvent({
      event: 'change-data-layer',
      payload: sensor2.scaleTo(0, 24),
    }));
  /* - data controls */
});
