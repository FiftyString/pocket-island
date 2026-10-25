export const SIZE = 6;
export const NAMES = ['空地', '草地', '花田', '树林', '木屋', '村庄', '城堡', '奇迹之塔'];
export type Board = number[];
export interface Snapshot { board: Board; score: number; next: number; rng: number; over: boolean }
export interface GameState extends Snapshot { undoUsed: boolean; previous: Snapshot | null }
export interface Merge { cells: number[]; level: number; chain: number; points: number }
export class TileGenerator {
  constructor(public state: number, public weights = [75, 20, 5]) {
    if (weights.length !== 3 || weights.some(w => !Number.isFinite(w) || w < 0) || weights.reduce((a,b)=>a+b,0) <= 0) throw Error('Invalid weights');
  }
  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    const r = this.state / 4294967296 * this.weights.reduce((a,b)=>a+b,0);
    let sum = 0;
    for (let i=0;i<3;i++) { sum += this.weights[i]; if (r < sum) return i+1; }
    return 3;
  }
}
export class BoardManager {
  static neighbors(i: number): number[] { const x=i%SIZE,y=Math.floor(i/SIZE); return [x>0?i-1:-1,x<SIZE-1?i+1:-1,y>0?i-SIZE:-1,y<SIZE-1?i+SIZE:-1].filter(n=>n>=0); }
  static connected(board: Board, start: number): number[] {
    const level=board[start]; if (!level) return [];
    const found=new Set([start]), queue=[start];
    for(let n=0;n<queue.length;n++) for(const i of this.neighbors(queue[n])) if(board[i]===level && !found.has(i)){found.add(i);queue.push(i);}
    return queue;
  }
}
export class MergeEngine {
  static resolve(board: Board, anchor: number): Merge[] {
    const merges: Merge[]=[];
    while(board[anchor]>0 && board[anchor]<7){
      const cells=BoardManager.connected(board,anchor); if(cells.length<3) break;
      const level=board[anchor]+1,chain=merges.length+1,points=(cells.length-1)*10*2**(level-2)*chain;
      for(const i of cells) board[i]=0; board[anchor]=level;
      merges.push({cells,level,chain,points});
    }
    return merges;
  }
}
export function newGame(seed = Date.now() >>> 0): GameState {
  const generator=new TileGenerator(seed); const next=generator.next();
  return {board:Array(36).fill(0),score:0,next,rng:generator.state,over:false,undoUsed:false,previous:null};
}
export function snapshot(s: Snapshot): Snapshot {return {board:[...s.board],score:s.score,next:s.next,rng:s.rng,over:s.over};}
export function place(s: GameState,index: number): Merge[] | null {
  if(s.over || !Number.isInteger(index) || index<0 || index>=36 || s.board[index]) return null;
  s.previous=s.undoUsed?null:snapshot(s); s.board[index]=s.next;
  const merges=MergeEngine.resolve(s.board,index); s.score+=merges.reduce((sum,m)=>sum+m.points,0);
  const generator=new TileGenerator(s.rng); s.next=generator.next();s.rng=generator.state;
  s.over=s.board.every(Boolean); return merges;
}
export function undo(s: GameState): boolean {
  if(s.undoUsed || !s.previous)return false;
  Object.assign(s,snapshot(s.previous),{undoUsed:true,previous:null});return true;
}
