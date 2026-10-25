import {describe,it,expect} from 'vitest';
import {BoardManager,MergeEngine,newGame,place,undo,TileGenerator} from './game';
import {decode,defaults} from './save';
const board=()=>Array(36).fill(0);
describe('合成引擎',()=>{
 it('四向连通且没有跨行连接',()=>{const b=board();[7,1,6,8,13].forEach(i=>b[i]=1);expect(BoardManager.connected(b,7)).toHaveLength(5);b[5]=1;expect(BoardManager.connected(b,6)).not.toContain(5);});
 it('对角不连接',()=>{const b=board();[0,7,14].forEach(i=>b[i]=1);expect(MergeEngine.resolve(b,7)).toEqual([]);});
 it('两块不合成',()=>{const b=board();b[0]=b[1]=1;expect(MergeEngine.resolve(b,0)).toEqual([]);});
 it('三块合成在落点，清除其余',()=>{const b=board();b[0]=b[1]=b[2]=1;expect(MergeEngine.resolve(b,1)[0]).toMatchObject({level:2,points:20,chain:1});expect(b.slice(0,3)).toEqual([0,2,0]);});
 it('四块以上全连通区域一起合成',()=>{const b=board();[0,1,2,6,7].forEach(i=>b[i]=2);expect(MergeEngine.resolve(b,0)[0]).toMatchObject({level:3,points:80});expect(b.filter(Boolean)).toEqual([3]);});
 it('不同等级不合成',()=>{const b=board();b[0]=1;b[1]=2;b[2]=1;expect(MergeEngine.resolve(b,1)).toEqual([]);});
 it('连锁与计分公式',()=>{const b=board();b[6]=b[7]=b[8]=1;b[1]=b[13]=2;expect(MergeEngine.resolve(b,7).map(m=>m.points)).toEqual([20,80]);expect(b[7]).toBe(3);});
 it('Lv7封顶，Lv6可合成到7',()=>{const b=board();b[0]=b[1]=b[2]=6;expect(MergeEngine.resolve(b,1)[0].points).toBe(640);b[0]=b[2]=7;expect(MergeEngine.resolve(b,1)).toEqual([]);});
 it('满盘结算后结束',()=>{const s=newGame(1);s.board.fill(7);s.board[0]=0;place(s,0);expect(s.over).toBe(true);expect(place(s,0)).toBeNull();});
 it('最后一个空格触发合成后不结束',()=>{const s=newGame(1);s.board.fill(7);s.board[0]=0;s.board[1]=s.board[6]=1;s.next=1;place(s,0);expect(s.over).toBe(false);});
 it('无效落点不改变任何状态',()=>{const s=newGame(1);place(s,0);const before=structuredClone(s);expect(place(s,0)).toBeNull();expect(place(s,-1)).toBeNull();expect(s).toEqual(before);});
});
describe('随机和撤销',()=>{
 it('可序列化可配置随机生成器',()=>{const g=new TileGenerator(123,[0,100,0]);expect(g.next()).toBe(2);const restored=new TileGenerator(g.state,[0,100,0]);expect(g.next()).toBe(restored.next());expect(()=>new TileGenerator(1,[0,0,0])).toThrow();});
 it('完整撤销并保持后续随机、分数一致，次数不恢复',()=>{const s=newGame(100);s.board[0]=s.board[1]=1;s.next=1;const before=structuredClone(s);place(s,2);const after=structuredClone(s);expect(undo(s)).toBe(true);expect(s.board).toEqual(before.board);expect(s.score).toBe(before.score);expect(s.next).toBe(before.next);expect(s.rng).toBe(before.rng);place(s,2);expect(s.board).toEqual(after.board);expect(s.score).toBe(after.score);expect(s.next).toBe(after.next);expect(s.rng).toBe(after.rng);expect(undo(s)).toBe(false);});
 it('游戏结束仍可撤销',()=>{const s=newGame(2);s.board.fill(7);s.board[0]=0;place(s,0);undo(s);expect(s.over).toBe(false);expect(s.board[0]).toBe(0);});
});
describe('存档',()=>{
 it('恢复含撤销快照的存档',()=>{const s=defaults();s.game=newGame(9);place(s.game,5);expect(decode(JSON.stringify(s))).toEqual(s);});
 it('撤销已使用状态持久化',()=>{const s=defaults();s.game=newGame(2);place(s.game,1);undo(s.game);const restored=decode(JSON.stringify(s));expect(undo(restored.game!)).toBe(false);});
 it('损坏JSON、版本、无效根对象恢复默认',()=>{for(const raw of ['{','null','{}','{"version":2}'])expect(decode(raw)).toEqual(defaults());});
 it('非法棋盘、随机、下一块、结束标志、快照被丢弃且保留设置纪录',()=>{for(const change of [{board:[1]},{rng:-1},{next:4},{over:true},{score:-2},{previous:{}},{undoUsed:'yes'},{board:Array(36).fill(8)}]){const s={...defaults(),best:42,game:{...newGame(1),...change}};const restored=decode(JSON.stringify(s));expect(restored.game).toBeNull();expect(restored.best).toBe(42);}});
});
