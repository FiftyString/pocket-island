import { type GameState, type Snapshot } from './game';
export interface Save { version: 1; best: number; muted: boolean; reduced: boolean; taught: boolean; game: GameState | null }
export const defaults=():Save=>({version:1,best:0,muted:false,reduced:false,taught:false,game:null});
const integer=(n:unknown,max=Number.MAX_SAFE_INTEGER):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=max;
function validSnapshot(s:unknown):s is Snapshot {
  if(!s || typeof s!=='object')return false; const v=s as Snapshot;
  return Array.isArray(v.board)&&v.board.length===36&&v.board.every(n=>integer(n,7))&&integer(v.score)&&integer(v.next,3)&&v.next>=1&&integer(v.rng,0xffffffff)&&typeof v.over==='boolean'&&v.over===v.board.every(Boolean);
}
export function decode(raw:string|null): Save {
  try {const s=JSON.parse(raw||'null'); if(!s || s.version!==1 || !integer(s.best)||typeof s.muted!=='boolean'||typeof s.reduced!=='boolean'||typeof s.taught!=='boolean')return defaults();
    if(s.game!==null){const g=s.game as GameState; if(!validSnapshot(g)||typeof g.undoUsed!=='boolean'||!(g.previous===null||validSnapshot(g.previous))||(g.undoUsed&&g.previous!==null))s.game=null;}
    return {version:1,best:s.best,muted:s.muted,reduced:s.reduced,taught:s.taught,game:s.game};
  }catch{return defaults();}
}
export class SaveManager {
  static key='pocket-island-v1';
  static read():Save {try{return decode(localStorage.getItem(this.key));}catch{return defaults();}}
  static write(s:Save):boolean {try{localStorage.setItem(this.key,JSON.stringify(s));return true;}catch{return false;}}
}
