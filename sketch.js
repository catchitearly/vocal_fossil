let mic, fft;
let isRecording = false;
let startTime = 0;
let currentTheme = 0;
const MIN_RECORD_TIME = 5000; // 5 Seconds
const THEME_NAMES = ["Ethereal Silk", "Geometric Prism", "Cymatic Soul", "Abyss Flow"];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    colorMode(HSB, 360, 100, 100, 100);

    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    fft.setInput(mic);

    // Press and Hold Logic
    const btn = select('#startBtn');
    btn.mousePressed(startRecording);
    btn.mouseReleased(stopRecording);
    
    // Mobile Touch Support
    btn.elt.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
    btn.elt.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); });

    select('#saveBtn').mousePressed(() => saveCanvas('vocal_masterpiece', 'png'));
    select('#shareBtn').mousePressed(shareArt);
}

function startRecording() {
    if (getAudioContext().state !== 'running') getAudioContext().resume();
    background(255);
    startTime = millis();
    isRecording = true;
    currentTheme = floor(random(4));
    select('#themeDisplay').html(THEME_NAMES[currentTheme]);
    select('#progressContainer').show();
    mic.start();
}

function stopRecording() {
    let duration = millis() - startTime;
    if (duration < MIN_RECORD_TIME) {
        alert("Hold for at least 5 seconds to generate the details!");
        background(255);
        resetUI();
    } else {
        isRecording = false;
        mic.stop();
        select('#startBtn').html('CREATE AGAIN');
        select('#shareBtn').show();
        select('#progressBar').style('width', '100%');
    }
}

function resetUI() {
    isRecording = false;
    mic.stop();
    select('#startBtn').html('HOLD TO RECORD');
    select('#progressContainer').hide();
    select('#progressBar').style('width', '0%');
}

function draw() {
    if (!isRecording) return;

    let elapsed = millis() - startTime;
    let progress = map(elapsed, 0, 10000, 0, 100); // 10s max progress
    select('#progressBar').style('width', constrain(progress, 0, 100) + '%');

    let spectrum = fft.analyze();
    let vol = mic.getLevel();
    let bass = fft.getEnergy("bass");
    let treble = fft.getEnergy("treble");

    translate(width / 2, height / 2);

    // --- PRO THEME ENGINES ---
    if (currentTheme === 0) { // ETHEREAL SILK (Flow Field)
        for (let i = 0; i < 150; i++) {
            let angle = map(i, 0, 150, 0, TWO_PI);
            let d = noise(i * 0.05, frameCount * 0.01) * map(bass, 0, 255, 100, height);
            stroke(map(treble, 0, 255, 280, 360), 50, 90, 2);
            strokeWeight(0.5);
            line(cos(angle) * d, sin(angle) * d, cos(angle) * d * 1.1, sin(angle) * d * 1.1);
        }
    } 
    else if (currentTheme === 1) { // GEOMETRIC PRISM
        rotate(frameCount * 0.01);
        for (let i = 0; i < 8; i++) {
            rotate(TWO_PI / 8);
            stroke(map(bass, 0, 255, 180, 240), 40, 90, 5);
            noFill();
            rect(vol * 500, vol * 500, bass, treble);
        }
    }
    else if (currentTheme === 2) { // CYMATIC SOUL
        noFill();
        let hue = map(vol, 0, 0.5, 180, 360);
        stroke(hue, 60, 90, 3);
        beginShape();
        for (let i = 0; i < 360; i += 2) {
            let r = map(spectrum[i % 128], 0, 255, 50, height/2);
            let x = r * cos(radians(i));
            let y = r * sin(radians(i));
            vertex(x, y);
        }
        endShape(CLOSE);
    }
    else if (currentTheme === 3) { // ABYSS FLOW
        for(let i=0; i<10; i++) {
            let x = map(noise(frameCount * 0.01, i), 0, 1, -width/2, width/2);
            let y = map(noise(i, frameCount * 0.01), 0, 1, -height/2, height/2);
            stroke(map(bass, 0, 255, 200, 300), 60, 90, 5);
            strokeWeight(vol * 20);
            point(x, y);
        }
    }
}

async function shareArt() {
    const canvas = document.querySelector('canvas');
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'vocal_masterpiece.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Vocal Magic Art', text: 'Created from my voice! ✨' });
    }
}
