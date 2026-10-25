import Phaser from 'phaser';
import {tile} from './art';
import type {GameState,Merge} from '../core/game';
export class IslandScene extends Phaser.Scene {
 private tiles:Phaser.GameObjects.Container[]=[];
 private state?:GameState;
 onPlace:(i:number)=>void=()=>{};
 reduced=false;
 constructor(){super('island');}
 create(){
  const g=this.add.graphics();g.fillStyle(0xb7ddcf);g.fillRoundedRect(2,12,416,416,30);g.fillStyle(0xf9eed3);g.fillRoundedRect(4,0,412,416,27);g.fillStyle(0xe2dfb9);g.fillRoundedRect(14,10,392,392,21);
  for(let i=0;i<36;i++){const x=35+i%6*70,y=35+Math.floor(i/6)*70;g.fillStyle(0xc6d7ac);g.fillRoundedRect(x-29,y-27,58,58,12);g.fillStyle(0xd6e3bf);g.fillRoundedRect(x-29,y-27,58,54,12);
   this.add.zone(x,y,66,66).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.onPlace(i));}
  if(this.state)this.draw(this.state);
 }
 draw(state:GameState,anchor=-1,merges:Merge[]=[]){this.state=state;if(!this.sys.isActive())return;
  this.tiles.forEach(t=>t.destroy());this.tiles=[];
  state.board.forEach((level,i)=>{if(!level)return;const x=35+i%6*70,y=35+Math.floor(i/6)*70;const t=tile(this,x,y,level);this.tiles.push(t);if(i===anchor&&!this.reduced){t.setScale(.6);this.tweens.add({targets:t,scale:1,duration:330,ease:'Back.Out'});}});
  if(merges.length && !this.reduced){const x=35+anchor%6*70,y=35+Math.floor(anchor/6)*70;
   for(let i=0;i<18;i++){const p=this.add.circle(x,y,3+i%3,[0xffd67f,0xffffff,0xe9a4ab][i%3]);const a=i*Math.PI/9;this.tweens.add({targets:p,x:x+Math.cos(a)*65,y:y+Math.sin(a)*65,alpha:0,scale:0,duration:700,onComplete:()=>p.destroy()});}
   const text=this.add.text(x,y-20,merges.length>1?`${merges.length} 连锁！`:'小岛长大啦！',{fontFamily:'sans-serif',fontSize:'18px',color:'#567953',backgroundColor:'#fff8dd',padding:{x:8,y:5}}).setOrigin(.5);this.tweens.add({targets:text,y:y-65,alpha:0,duration:1150,onComplete:()=>text.destroy()});
  }
 }
}
