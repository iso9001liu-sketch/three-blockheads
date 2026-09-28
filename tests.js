const assert=require('node:assert/strict');
const {Game}=require('./engine');
function step(g,n,input={}){for(let i=0;i<n;i++)g.tick(input);}
function place(g,id,x,bottom){Object.assign(g.people[id],{x,y:bottom-g.people[id].h,vx:0,vy:0,grounded:true});}
function until(g,predicate,input,limit=700){for(let i=0;i<limit;i++){if(predicate())return;g.tick(typeof input==='function'?input():input);}throw Error(`Timed out: level ${g.level.index+1} ${JSON.stringify(g.people)} flags ${g.pinkOn},${g.bridge}`);}
function move(g,id,x,extra=()=>({}),limit=700){g.select(id);const p=g.people[id];until(g,()=>Math.abs(p.x-x)<5&&Math.abs(p.vx)<.8,()=>{const error=x-p.x-p.vx*(id===1?8:2);return {right:error>1,left:error<-1,...extra(p)};},limit);}
function solve(index,seed=1){const g=new Game(index,seed),l=g.level;step(g,3);
 if(l.seesaw){for(const input of require('./demo')(g)){if(!input.hold)g.tick(input);}assert(g.won);assert.equal(g.flags.launches,2);console.log('PASS redesigned seesaw route');return g;}
 // Move blue to its pad; seventh level requires a jump onto the raised pad.
 if(l.n===6){g.tick({jump:true});step(g,10);move(g,0,120);step(g,30);}else move(g,0,270);
 step(g,20);assert(g.gateOpen,'blue must open gate');
 function crossStar(){move(g,2,l.gapL-75, p=>({jump:!!l.trap&&p.x>265&&p.x<330}));g.tick({});g.tick({jump:true,right:true});until(g,()=>g.people[2].x>775,{right:true,jump:true});move(g,2,784,()=>({jump:true}));}
 if(l.crate){crossStar();move(g,2,887);move(g,2,960);}
 // Pink uses the spring while blue stays on the switch. Avoid red pads in levels 2/7.
 g.select(1);g.tick({});let jumped=false;
 if(l.trap){move(g,1,l.trap.x-102);g.tick({});g.tick({jump:true,right:true});move(g,1,l.spring.x-10,()=>({}));}

 until(g,()=>g.people[1].x>l.gapR+40,()=>{const p=g.people[1];let jump=false;if(false&&!jumped&&p.x>l.trap.x-92&&p.grounded){jumped=true;jump=true;}return {right:true,jump};});
 move(g,1,822);step(g,30);assert(g.pinkOn,'pink must latch gate and power fan');
 if(!l.crate)crossStar();else move(g,2,784);
 g.select(2);until(g,()=>g.people[2].y<205,{});until(g,()=>g.people[2].x>906,{right:true,jump:true});move(g,2,913,()=>({jump:true}));until(g,()=>g.bridge,{});
 assert(g.bridge,'star must lift bridge');
 if(l.finale){move(g,1,985);move(g,0,540);step(g,5);assert(g.finalBridge,'last relay must lock final bridge');}
 for(const id of [0,1,2]){g.select(id);g.tick({});until(g,()=>g.people[id].arrived,()=>{const p=g.people[id];return {right:true,jump:p.grounded&&((!!l.trap&&p.x>l.trap.x-(id===0?55:90)&&p.x<l.trap.x+40)||(!!g.crate&&p.x>g.crate.x-65&&p.x<g.crate.x+45))};});}
 assert(g.won,'all three must reach exit');console.log(`PASS playable route: ${index+1} / seed ${seed} (${g.frames} frames, ${g.deaths} falls)`);return g;
}
// Mechanism regression checks with controlled setup.
{
 const g=new Game();step(g,2);place(g,1,270,520);step(g,2);assert(!g.gateOpen,'pink cannot hold weight pad');place(g,0,270,520);step(g,2);assert(g.gateOpen);place(g,0,50,520);step(g,2);assert(!g.gateOpen,'gate closes when blue leaves');place(g,1,822,520);step(g,2);assert(g.pinkOn&&g.gateOpen);place(g,2,913,290);step(g,2);assert(g.bridge);place(g,0,1140,520);step(g,2);assert(!g.won,'one person cannot win for everyone');
}
{const g=new Game(1);place(g,1,325,520);g.tick();assert.equal(g.deaths,1);assert.equal(g.people[1].x,150);}
{const g=new Game();place(g,2,550,800);g.tick();assert.equal(g.deaths,1);assert.equal(g.people[2].x,220);}
{const a=new Game(),b=new Game();place(a,2,550,330);place(b,2,550,330);a.selected=b.selected=2;step(a,30,{jump:true});step(b,30);assert(a.people[2].y<b.people[2].y,'gliding slows fall');}
for(let i=0;i<8;i++)solve(i);
for(const seed of [1,2,3,4,5,6,7,11,29,98])solve(8,seed);
console.log('All mechanics and complete input-driven routes passed.');

const createDemo=require('./demo');
for(let i=0;i<108;i++){const g=new Game(i<8?i:8,i<8?1:i-7),demo=createDemo(g);let ticks=0;for(const input of demo){if(++ticks>10000)throw Error('Demo did not finish');if(!input.hold)g.tick(input);}assert(g.won,'Demo must win: '+i);assert.equal(g.deaths,0,'Demo should not fall');}
console.log('PASS: 8 campaign demos + 100 seeded random demos, zero falls.');

// Third level: pressure alone is insufficient, impact and a waiting passenger are necessary.
{
 const g=new Game(2);place(g,0,315,520);place(g,1,415,520);step(g,180);
 assert(!g.flags.launches,'Standing on impact plate must not launch');assert(!g.pinkOn);assert(!g.bridge);
 g.select(0);g.tick({});g.tick({jump:true});until(g,()=>g.people[1].launching,{});
 assert.equal(g.flags.launches,1);until(g,()=>g.pinkOn,{});assert(!g.bridge,'First passenger alone must not open bridge');
 const empty=new Game(2);place(empty,0,315,520);empty.tick({jump:true});step(empty,60);assert(!empty.flags.launches,'Empty seesaw must not launch');
 const respawn=new Game(2);place(respawn,1,580,800);respawn.people[1].launching=true;respawn.tick();assert.equal(respawn.people[1].launching,false,'Falling must reset launch momentum');
}
console.log('PASS: seesaw needs impact + passenger; one receiver cannot open bridge; respawn clears launch.');
