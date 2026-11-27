"use client"

/**
 * Shared singleton Web Audio API engine for Relic UI acoustic components.
 * Solves the browser 6-context hardware limit and ensures proper user-gesture audio resumption.
 */

let sharedCtx: AudioContext | null = null

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    if (!sharedCtx || sharedCtx.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        sharedCtx = new AudioCtx()
      }
    }
    if (sharedCtx && sharedCtx.state === "suspended") {
      sharedCtx.resume().catch(() => {})
    }
    return sharedCtx
  } catch {
    return null
  }
}

/**
 * Resonant metallic tuning fork chime (440Hz A4 concert pitch + high clang harmonic).
 */
export function playTuningForkChime(frequency: number = 440) {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime

    // Fundamental pure sine wave
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(frequency, t)

    // Subtle second harmonic overtone (clang mode ~2.76x)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(frequency * 2.76, t)

    // Audible gain envelope
    gain1.gain.setValueAtTime(0.5, t)
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + 2.4)

    gain2.gain.setValueAtTime(0.18, t)
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)

    osc1.connect(gain1)
    osc2.connect(gain2)
    gain1.connect(ctx.destination)
    gain2.connect(ctx.destination)

    osc1.start(t)
    osc2.start(t)
    osc1.stop(t + 2.4)
    osc2.stop(t + 0.22)
  } catch {}
}

/**
 * Vinyl stylus landing thud + warm rotating surface micro-crackle.
 */
export function playVinylCrackle() {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime

    // Stylus needle drop thud
    const thudOsc = ctx.createOscillator()
    const thudGain = ctx.createGain()
    thudOsc.type = "sine"
    thudOsc.frequency.setValueAtTime(140, t)
    thudOsc.frequency.exponentialRampToValueAtTime(35, t + 0.09)

    thudGain.gain.setValueAtTime(0.5, t)
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)

    thudOsc.connect(thudGain)
    thudGain.connect(ctx.destination)
    thudOsc.start(t)
    thudOsc.stop(t + 0.09)

    // Surface crackle noise buffer
    const bufferSize = Math.floor(ctx.sampleRate * 1.2)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      // Periodic clicks mixed with vinyl surface friction
      data[i] = Math.random() < 0.012 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.04
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = "bandpass"
    bandpass.frequency.setValueAtTime(2200, t)
    bandpass.Q.setValueAtTime(1.4, t)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.35, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2)

    noise.connect(bandpass)
    bandpass.connect(gain)
    gain.connect(ctx.destination)
    noise.start(t + 0.02)
  } catch {}
}

/**
 * High-voltage ionizing radiation particle click.
 */
export function playGeigerClick() {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const bufferSize = Math.floor(ctx.sampleRate * 0.012)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.002))
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = "highpass"
    filter.frequency.setValueAtTime(2600, t)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.6, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start(t)
  } catch {}
}

/**
 * Studio fader felt rail friction noise.
 */
export function playFaderFriction() {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const bufferSize = Math.floor(ctx.sampleRate * 0.02)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = "bandpass"
    bandpass.frequency.setValueAtTime(3400, t)
    bandpass.Q.setValueAtTime(2.2, t)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.35, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02)

    noise.connect(bandpass)
    bandpass.connect(gain)
    gain.connect(ctx.destination)
    noise.start(t)
  } catch {}
}

let activeMorseOsc: OscillatorNode | null = null
let activeMorseGain: GainNode | null = null

/**
 * Starts a continuous CW telegraph sidetone with a click-free 6ms attack.
 */
export function startMorseTone(frequency: number = 680) {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    stopMorseTone()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(frequency, t)

    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(0.28, t + 0.006)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)

    activeMorseOsc = osc
    activeMorseGain = gain
  } catch {}
}

/**
 * Smoothly releases the active CW telegraph sidetone.
 */
export function stopMorseTone() {
  const ctx = sharedCtx
  if (!ctx || !activeMorseOsc || !activeMorseGain) return

  try {
    const t = ctx.currentTime
    const gain = activeMorseGain
    const osc = activeMorseOsc
    activeMorseOsc = null
    activeMorseGain = null

    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015)
    osc.stop(t + 0.02)
  } catch {}
}

/**
 * Mechanical pyramid metronome woodblock tick (with optional beat-1 brass bell).
 */
export function playWoodblockTick(accent: boolean = false) {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(accent ? 1320 : 880, t)
    osc.frequency.exponentialRampToValueAtTime(accent ? 640 : 420, t + 0.035)

    gain.gain.setValueAtTime(accent ? 0.45 : 0.28, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.05)

    if (accent) {
      const bell = ctx.createOscillator()
      const bellGain = ctx.createGain()
      bell.type = "sine"
      bell.frequency.setValueAtTime(2640, t)
      bellGain.gain.setValueAtTime(0.16, t)
      bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
      bell.connect(bellGain)
      bellGain.connect(ctx.destination)
      bell.start(t)
      bell.stop(t + 0.3)
    }
  } catch {}
}

/**
 * Heavy brushed-metal transport latch click for tape decks.
 */
export function playMechanicalLatch() {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "square"
    osc.frequency.setValueAtTime(190, t)
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.035)

    gain.gain.setValueAtTime(0.22, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.045)
  } catch {}
}

/**
 * Magnetic tape head scrub flutter noise scaled by scrub velocity.
 */
export function playTapeScrub(velocity: number = 1) {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const len = Math.floor(ctx.sampleRate * 0.03)
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.18
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    const freq = Math.min(4800, Math.max(500, 900 + Math.abs(velocity) * 280))
    filter.frequency.setValueAtTime(freq, t)
    filter.Q.setValueAtTime(3.0, t)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.24, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start(t)
  } catch {}
}

/**
 * Warm polyphonic electric-piano / synth pad voice for ChordMatrix pads.
 */
export function playSynthNote(frequency: number, waveform: OscillatorType = "triangle") {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc1.type = waveform
    osc1.frequency.setValueAtTime(frequency, t)

    // Subtle detuned chorus voice
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(frequency * 1.0035, t)

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(frequency * 5, t)
    filter.frequency.exponentialRampToValueAtTime(Math.max(400, frequency * 1.5), t + 0.7)

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.22, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.95)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(t)
    osc2.start(t)
    osc1.stop(t + 1.0)
    osc2.stop(t + 1.0)
  } catch {}
}

/**
 * Short FM inter-station static puff scaled inversely by signal clarity (0..1).
 */
export function playRadioStaticBurst(clarity: number = 0) {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const len = Math.floor(ctx.sampleRate * 0.035)
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(1800 + (1 - clarity) * 1800, t)
    filter.Q.setValueAtTime(1.1, t)

    const level = Math.max(0.02, (1 - clarity) * 0.22)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(level, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start(t)
  } catch {}
}

/**
 * Clean warm stereo lock chime when RotaryTuner locks onto a station.
 */
export function playStationLockTone(frequency: number = 523.25) {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(frequency, t)
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, t + 0.08)

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.45)
  } catch {}
}

/**
 * Woody + spring-steel kalimba tine pluck.
 */
export function playKalimbaPluck(frequency: number) {
  const ctx = getSharedAudioContext()
  if (!ctx) return

  try {
    const t = ctx.currentTime

    // Resonant wooden chamber fundamental
    const bodyOsc = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    bodyOsc.type = "sine"
    bodyOsc.frequency.setValueAtTime(frequency, t)

    bodyGain.gain.setValueAtTime(0.001, t)
    bodyGain.gain.linearRampToValueAtTime(0.36, t + 0.005)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.35)

    // Metallic tine transient overtone (approx 2.8x)
    const tineOsc = ctx.createOscillator()
    const tineGain = ctx.createGain()
    tineOsc.type = "triangle"
    tineOsc.frequency.setValueAtTime(frequency * 2.8, t)

    tineGain.gain.setValueAtTime(0.14, t)
    tineGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)

    bodyOsc.connect(bodyGain)
    tineOsc.connect(tineGain)
    bodyGain.connect(ctx.destination)
    tineGain.connect(ctx.destination)

    bodyOsc.start(t)
    tineOsc.start(t)
    bodyOsc.stop(t + 1.4)
    tineOsc.stop(t + 0.16)
  } catch {}
}
