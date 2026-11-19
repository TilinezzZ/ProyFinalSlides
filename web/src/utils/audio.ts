class SoundEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {

  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled
    return this.enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public playSnap() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc1 = this.ctx.createOscillator()
    const osc2 = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc1.type = 'triangle'
    osc2.type = 'sine'

    osc1.frequency.setValueAtTime(523.25, now)
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12)

    osc2.frequency.setValueAtTime(1046.5, now)
    osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.25)
    osc2.stop(now + 0.25)
  }

  public playError() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(160, now)
    osc.frequency.linearRampToValueAtTime(90, now + 0.18)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  public playClick() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  }

  public playPulse() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  }

  public playVictory() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5]
    const startTime = this.ctx.currentTime

    notes.forEach((freq, index) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const noteTime = startTime + index * 0.1

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, noteTime)

      gain.gain.setValueAtTime(0.2, noteTime)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(noteTime)
      osc.stop(noteTime + 0.35)
    })
  }
}

export const sounds = new SoundEngine()
