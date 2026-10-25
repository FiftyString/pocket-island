export class AudioManager {
  private ctx:AudioContext|null=null;
  constructor(public muted=false){}
  play(chain=0){if(this.muted)return;try{this.ctx??=new AudioContext();void this.ctx.resume();const time=this.ctx.currentTime;[0, ...(chain?[4,7,12]:[])].forEach((note,i)=>{const o=this.ctx!.createOscillator(),g=this.ctx!.createGain();o.type='sine';o.frequency.value=330*2**((note+chain*2)/12);g.gain.setValueAtTime(0,time+i*.065);g.gain.linearRampToValueAtTime(.075,time+i*.065+.015);g.gain.exponentialRampToValueAtTime(.001,time+i*.065+.3);o.connect(g);g.connect(this.ctx!.destination);o.start(time+i*.065);o.stop(time+i*.065+.32);});}catch{/* Silent fallback on unsupported browsers. */}}
}
