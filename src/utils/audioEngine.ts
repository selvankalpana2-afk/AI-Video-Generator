// Procedural audio synthesizer using Web Audio API to support actual sound design overlays
class AudioEngine {
  private ctx: AudioContext | null = null;
  private oscs: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private filter: BiquadFilterNode | null = null;
  private isPlaying = false;
  private currentStyle = "none";
  private lfo: OscillatorNode | null = null;
  private staticNode: AudioWorkletNode | ScriptProcessorNode | null = null;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio not supported in this frame", e);
    }
  }

  play(style: string) {
    this.init();
    if (!this.ctx) return;
    
    // Stop any active track
    this.stop();
    
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.currentStyle = style;

    if (style === "none") return;

    try {
      if (style === "cyberpunk") {
        this.playCyberpunk();
      } else if (style === "cinematic") {
        this.playCinematic();
      } else if (style === "ambient") {
        this.playSpaceAmbient();
      } else if (style === "lofi") {
        this.playLofi();
      }
    } catch (err) {
      console.warn("Could not initiate synthesizer oscillators", err);
    }
  }

  stop() {
    this.isPlaying = false;
    
    // Stop and disconnect all active oscillators
    this.oscs.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
      osc.disconnect();
    });
    this.gains.forEach((gain) => gain.disconnect());
    this.oscs = [];
    this.gains = [];

    if (this.filter) {
      this.filter.disconnect();
      this.filter = null;
    }

    if (this.lfo) {
      try { this.lfo.stop(); } catch (e) {}
      this.lfo.disconnect();
      this.lfo = null;
    }

    if (this.staticNode) {
      this.staticNode.disconnect();
      this.staticNode = null;
    }
  }

  // Deep, dark analog cyberpunk synthesizer drone
  private playCyberpunk() {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.gains.push(masterGain);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(6, this.ctx.currentTime);
    this.filter.connect(masterGain);

    // Warm thick sawtooth oscillators
    const freqs = [55, 110, 110.5, 165];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
      
      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.3, this.ctx!.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(this.filter!);
      
      osc.start();
      this.oscs.push(osc);
      this.gains.push(oscGain);
    });

    // LFO to sweep low-pass filter to sound "alive" and moving
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // very slow sweep
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime); // filter sweep amplitude
    
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start();
  }

  // Warm moving cinematic cello orchestration chords
  private playCinematic() {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.gains.push(masterGain);

    // Minor suspended chord sequence to feel "grand" and "mysterious"
    const chords = [
      [65.41, 130.81, 196.00, 246.94], // C major 7/9 elements
      [58.27, 116.54, 174.61, 220.00], // A# / D chords
    ];

    chords[0].forEach((f) => {
      const osc = this.ctx!.createOscillator();
      // Triangle wave delivers warm string-like acoustics
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);

      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.25, this.ctx!.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      this.oscs.push(osc);
      this.gains.push(oscGain);
    });

    // Slow chord transition sweep using an interval
    let chordIndex = 0;
    const intervalId = setInterval(() => {
      if (!this.isPlaying || this.currentStyle !== "cinematic" || !this.ctx) {
        clearInterval(intervalId);
        return;
      }
      chordIndex = (chordIndex + 1) % chords.length;
      const nextChord = chords[chordIndex];
      
      this.oscs.forEach((osc, idx) => {
        if (nextChord[idx]) {
          osc.frequency.exponentialRampToValueAtTime(nextChord[idx], this.ctx!.currentTime + 2.5);
        }
      });
    }, 6000);
  }

  // Ethereal weightless space hum
  private playSpaceAmbient() {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.gains.push(masterGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(1, this.ctx.currentTime);
    filter.connect(masterGain);

    const freqs = [196.00, 293.66, 392.00, 587.33]; // G major atmospheric fifths
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);

      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.12, this.ctx!.currentTime);

      // Add slight volume shimmer
      const lfo = this.ctx!.createOscillator();
      lfo.frequency.setValueAtTime(0.4 + Math.random() * 0.3, this.ctx!.currentTime);
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.setValueAtTime(0.04, this.ctx!.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();

      this.oscs.push(osc);
      this.oscs.push(lfo);
      this.gains.push(oscGain);
      this.gains.push(lfoGain);
    });
  }

  // Soft low-passed vinyl-crackling lofi backdrop
  private playLofi() {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.16, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.gains.push(masterGain);

    // Warm filtered sine waves
    const chords = [146.83, 220.00, 261.63, 329.63]; // D minor chords
    chords.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);

      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.18, this.ctx!.currentTime);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      this.oscs.push(osc);
      this.gains.push(oscGain);
    });

    // Make vinyl static hiss using script processor
    try {
      const bufferSize = 4096;
      this.staticNode = this.ctx.createScriptProcessor(bufferSize, 1, 1);
      this.staticNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Crackle sound trigger
          const isCrackle = Math.random() > 0.996;
          output[i] = white * 0.004 + (isCrackle ? (Math.random() > 0.5 ? 0.05 : -0.05) : 0);
        }
      };
      this.staticNode.connect(masterGain);
    } catch (e) {
      console.log("Vinyl crackler skipped due to secure frame limits");
    }
  }
}

export const audioEngine = new AudioEngine();
