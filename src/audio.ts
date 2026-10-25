export class AudioManager {
  private ctx: AudioContext | null = null;
  constructor(public muted = false) {}

  async play(chain = 0): Promise<void> {
    if (this.muted) return;
    try {
      // Called from a user gesture; resume again after Safari interrupts audio.
      this.ctx ??= new AudioContext();
      await this.ctx.resume();
      if (this.muted || document.hidden || this.ctx.state !== 'running') return;
      const time = this.ctx.currentTime;
      [0, ...(chain ? [4, 7, 12] : [])].forEach((note, i) => {
        const oscillator = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 330 * 2 ** ((note + chain * 2) / 12);
        gain.gain.setValueAtTime(0, time + i * .065);
        gain.gain.linearRampToValueAtTime(.075, time + i * .065 + .015);
        gain.gain.exponentialRampToValueAtTime(.001, time + i * .065 + .3);
        oscillator.connect(gain);
        gain.connect(this.ctx!.destination);
        oscillator.start(time + i * .065);
        oscillator.stop(time + i * .065 + .32);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Audio unavailable: keep the game playable. */ }
  }

  suspend(): void {
    void this.ctx?.suspend().catch(() => {});
  }
}
