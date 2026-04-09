let mic, fft;
let particles = [];
let isRecording = false;
let currentTheme = 0; 
const THEME_NAMES = ["Cotton Candy Flow", "Crystal Echo", "Prism Mesh", "Magic Willow"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(248, 249, 250); // Light Theme Background
  colorMode(HSB, 360, 100, 100, 100);

  mic = new p5.AudioIn();
  fft = new p5.FFT();
  fft.setInput(mic);

  select('#startBtn').mousePressed(toggleMic);
  select('#saveBtn').mousePressed(() => saveCanvas('vocal_magic_art', 'png'));
  select('#shareBtn').mousePressed(shareArt);
}

// Ensure canvas resizes with the device
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(248, 249, 250);
}

async function toggleMic() {
  if (getAudioContext().state !== 'running') {
    await getAudioContext().resume();
  }

  if (!isRecording) {
    background(248, 249, 250);
    particles = [];
    currentTheme = floor(random(4));
    select('#themeDisplay').html(THEME_NAMES[currentTheme]);
    mic.start();
    isRecording = true;
    select('#startBtn').html('Stop & Finish');
    select('#shareBtn').hide();
  } else {
    mic.stop();
    isRecording = false;
    select('#startBtn').html('Create More Magic');
    select('#shareBtn').show();
  }
}

function draw() {
  if (!isRecording && particles.length === 0) return;

  let vol = mic.getLevel();
  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");
  let mid = fft.getEnergy("mid");
  fft.analyze();

  if (isRecording && vol > 0.005) {
    push();
    if (currentTheme === 0) { 
        for (let i = 0; i < 3; i++) particles.push(new FlowParticle(bass, treble));
    } else if (currentTheme === 1) { 
        drawCymatic(bass, mid, treble);
    } else if (currentTheme === 2) { 
        drawGeometric(vol, bass, treble);
    } else if (currentTheme === 3) { 
        translate(width / 2, height * 0.8);
        drawFractal(height / 5, vol, treble);
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
    // Unicorn Palette: Pinks, Purples, Teals
    this.hue = random([330, 280, 190]); 
    this.speed = map(bass, 0, 255, 1, 4);
    this.alpha = 200;
  }
  update() {
    this.pos.add(this.vel);
    this.alpha -= 0.8;
  }
  show() {
    stroke(this.hue, 60, 90, this.alpha / 10);
    strokeWeight(2);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.prevPos = this.pos.copy();
  }
  finished() { return this.alpha < 0; }
}

function drawCymatic(b, m, t) {
  noFill();
  stroke(map(t, 0, 255, 280, 350), 50, 90, 15);
  let r = map(b, 0, 255, 10, height/1.5);
  ellipse(width / 2, height / 2, r, r);
}

function drawGeometric(v, b, t) {
  noFill();
  stroke(map(b, 0, 255, 180, 240), 40, 90, 20);
  let x = random(width);
  let y = random(height);
  let sz = v * 400;
  rect(x, y, sz, sz, 10);
}

function drawFractal(len, v, t) {
  stroke(map(t, 0, 255, 300, 360), 50, 90, 40);
  strokeWeight(2);
  line(0, 0, 0, -len);
  translate(0, -len);
  if (len > 20) {
    push();
    rotate(PI / 6 * v * 10);
    drawFractal(len * 0.7, v, t);
    pop();
  }
}

async function shareArt() {
  const canvas = document.querySelector('canvas');
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], 'vocal_magic.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Vocal Magic Art',
      text: 'Look at the art my voice created! ✨'
    });
  } else {
    alert("Share unsupported. Try the Save button!");
  }
}
