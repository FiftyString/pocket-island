import Phaser from 'phaser';
export function tile(scene:Phaser.Scene,x:number,y:number,level:number):Phaser.GameObjects.Container {
 const c=scene.add.container(x,y),g=scene.add.graphics();c.add(g);
 const rect=(color:number,x:number,y:number,w:number,h:number,r=3)=>{g.fillStyle(color);g.fillRoundedRect(x,y,w,h,r);};
 const circle=(color:number,x:number,y:number,r:number)=>{g.fillStyle(color);g.fillCircle(x,y,r);};
 const tri=(color:number,x:number,y:number,w:number,h:number)=>{g.fillStyle(color);g.fillTriangle(x-w/2,y,x+w/2,y,x,y-h);};
 rect(0x438f79,-28,-18,56,46,12);rect(0x9ccf87,-28,-24,56,46,12);rect(0xc4e7a1,-25,-23,50,37,10);
 const tree=(x:number,y:number,s=1)=>{rect(0x99724a,x-2,y,4,13);circle(0x418c68,x,y-6,10*s);circle(0x63a976,x-4,y-10,7*s);};
 const house=(x:number,y:number,s=1)=>{rect(0xffe5b4,x-12*s,y-8*s,24*s,23*s);tri(0xc87961,x,y-7*s,32*s,17*s);rect(0x8d6953,x-3*s,y+4*s,6*s,11*s,1);rect(0xfff9dd,x+5*s,y-2*s,4*s,5*s,1);};
 if(level===1){for(const [x,y] of [[-13,1],[8,-7],[14,10]]){g.lineStyle(2,0x71a865);g.beginPath();g.moveTo(x-4,y);g.lineTo(x,y+4);g.lineTo(x+2,y-3);g.strokePath();}circle(0xfff3ba,-15,-11,3);}
 if(level===2){for(const [x,y] of [[-14,-8],[1,3],[14,-10],[-13,11],[15,12]]){rect(0x6a9b60,x-1,y,2,7,0);for(let k=0;k<5;k++)circle(k%2?0xfff3d2:0xeea49b,x+Math.cos(k*1.26)*3,y+Math.sin(k*1.26)*3,3);circle(0xe6b752,x,y,2);}}
 if(level===3){tree(-13,0,.85);tree(12,3,.85);tree(0,-7,1.15);}
 if(level===4){house(-2,-1);circle(0xf6d58a,17,12,4);}
 if(level===5){house(-12,-7,.7);house(12,-4,.7);house(0,9,.75);}
 if(level===6){rect(0xf5e6c9,-20,-12,40,30);rect(0xd1bdad,-7,-9,14,27);for(const x of [-19,13]){rect(0xfff0d7,x,-23,8,39,1);tri(0x799cba,x+4,-22,16,13);}rect(0x8e8794,-4,6,8,12);circle(0xffdc83,0,-4,4);}
 if(level===7){rect(0xf8e4c2,-9,-29,18,47);rect(0xfff6db,-14,-7,28,5);rect(0xfff6db,-12,-24,24,5);tri(0xb19ac8,0,-28,27,18);circle(0xffdc85,0,-47,4);rect(0x9ba8bc,-3,5,6,13);for(const x of [-21,21]){circle(0xfff7c5,x,-17,3);}}
 const label=scene.add.text(21,19,String(level),{fontFamily:'sans-serif',fontSize:'10px',color:'#396e58',fontStyle:'bold'}).setOrigin(.5);c.add(label);return c;
}
