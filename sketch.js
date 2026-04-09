let mic, fft;
let isRecording = false;
let currentTheme = 0; 
let frameCountLimit = 600; // ~10 seconds at 60fps
let timer = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255); // Clean gallery white
  colorMode(HSB, 360, 100, 100, 100);
  
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.9, 1024); // High smoothing for elegant curves
  fft.setInput(mic);

  select('#startBtn').mousePressed(toggleMic);
  select('#saveBtn').mousePressed(() => saveCanvas('vocal_masterpiece', 'png'));
}

async function toggleMic() {
  if (getAudioContext().state !== 'running') await getAudioContext().resume();

  if (!isRecording) {
    background(255);
    timer = 0;
    currentTheme = floor(random(4));
    mic.start();
    isRecording = true;
    select('#startBtn').html('Recording Masterpiece...');
  } else {
    stopRecording();
  }
}

function stopRecording() {
  mic.stop();
  isRecording = false;
  select('#startBtn').html('Create New Masterpiece');
  select('#themeDisplay').html("Masterpiece Finished");
}

function draw() {
  if (!isRecording) return;
  
  timer++;
  if (timer > frameCountLimit) {
    stopRecording();
    return;
  }

  let spectrum = fft.analyze();
  let vol = mic.getLevel();
  
  // THE SECRET: Draw many particles per frame for density
  translate(width / 2, height / 2);
  
  for (let i = 0; i < 200; i++) { // High density loop
    let angle = map(i, 0, 200, 0, TWO_PI);
    let freqIndex = floor(map(i, 0, 200, 0, spectrum.length / 2));
    let amp = spectrum[freqIndex];
    
    // Create the "Bent" geometry
    let r = map(amp, 0, 255, 50, height * 0.45);
    let x = r * cos(angle + (vol * 5)); 
    let y = r * sin(angle + (vol * 5));
    
    // Subtle coloring
    let hue = map(amp, 0, 255, 180, 340); // Unicorn/Auction Palette
    stroke(hue, 60, 90, 2); // VERY low alpha for professional layering
    strokeWeight(0.5); // Thin "hair" lines
    
    // Draw connecting lines to create depth
    line(x, y, x * noise(timer * 0.01), y * noise(timer * 0.01));
  }
}
