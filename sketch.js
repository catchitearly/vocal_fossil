let mic, fft;
let particles = [];
let isRecording = false;
let currentTheme = 0; 
const THEME_NAMES = ["Organic Flow", "Cymatic Resonance", "Geometric Crystal", "Neural Fractal"];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id('defaultCanvas0');
  background(10);
  colorMode(HSB, 360, 100, 100, 100);

  mic = new p5.AudioIn();
  fft = new p5.FFT();
  fft.setInput(mic);

  select('#startBtn').mousePressed(toggleMic);
  select('#saveBtn').mousePressed(() => saveCanvas('vocal_fossil_art', 'png'));
  select('#shareBtn').mousePressed(shareArt);
}

async function toggleMic() {
  if (getAudioContext().state !== 'running') {
    await getAudioContext().resume();
  }

  if (!isRecording) {
    background(10);
    particles = [];
    currentTheme = floor(random(4));
    select('#themeDisplay').html(`Style: ${THEME_NAMES[currentTheme]}`);
    mic.start();
    isRecording = true;
    select('#startBtn').html('Stop & Finalize');
    select('#shareBtn').hide();
  } else {
    mic.stop();
    isRecording = false;
    select('#startBtn').html('Start New Recording');
    select('#shareBtn').show();
  }
}

function draw() {
  if (!isRecording && particles.length === 0) return;

  let spectrum = fft.analyze();
  let vol = mic.getLevel();
  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");
  let mid = fft.getEnergy("mid");

  if (isRecording && vol > 0.005) {
    push(); // Protect coordinate system
    if (currentTheme === 0) { 
      for (let i = 0; i < 5; i++) particles.push(new FlowParticle(bass, treble));
    } else if (currentTheme === 1) { 
      drawCymatic(bass, mid, treble);
    } else if (currentTheme === 2) { 
      drawGeometric(vol, bass, treble);
    } else if (currentTheme === 3) { 
      translate(width / 2, height);
      drawFractal(height / 4, vol, treble);
    }
    pop();
  }

  if (currentTheme === 0) {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();
      if (particles[i].finished()) particles.splice(i, 1);
    }
  }
}

class FlowParticle {
  constructor(bass, treble) {
    this.pos = createVector(random(width), random(height));
    this.prevPos = this.pos.copy();
    this.vel = p5.Vector.fromAngle(random(TWO_PI));
    this.hue = map(treble, 0, 255, 180, 320);
    this.speed = map(bass, 0, 255, 2, 6);
    this.alpha = 255;
  }
  update() {
    this.pos.add(this.vel);
    this.alpha -= 1.5;
  }
  show() {
    stroke(this.hue, 80, 100, this.alpha / 5);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.prevPos = this.pos.copy();
  }
  finished() { return this.alpha < 0; }
}

function drawCymatic(b, m, t) {
  noFill();
  stroke(map(m, 0, 255, 0, 100), 70, 100, 10);
  let r = map(b, 0, 255, 50, height/2);
  ellipse(width / 2, height / 2, r, r * (t / 128));
}

function drawGeometric(v, b, t) {
  stroke(map(t, 0, 255, 40, 80), 80, 100, 20);
  let x = random(width);
  let y = random(height);
  let sz = v * 500;
  rect(x, y, sz, sz);
}

function drawFractal(len, v, t) {
  stroke(map(t, 0, 255, 150, 250), 80, 100, 30);
  line(0, 0, 0, -len);
  translate(0, -len);
  if (len > 10) {
    push();
    rotate(PI / 4 * v);
    drawFractal(len * 0.7, v, t);
    pop();
    push();
    rotate(-PI / 4 * v);
    drawFractal(len * 0.7, v, t);
    pop();
  }
}

async function shareArt() {
  const canvas = document.getElementById('defaultCanvas0');
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], 'vocal_art.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'My Vocal Fossil',
      text: 'Captured my voice into this unique artwork.'
    });
  } else {
    alert("Share not supported. Use Download!");
  }
}
