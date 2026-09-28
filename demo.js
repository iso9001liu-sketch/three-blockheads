/* A deterministic player: only issues movement/jump inputs and character switches. */
(function(root){
function* demonstration(g){
 const l=g.level;
 function* step(n,input={}){for(let i=0;i<n;i++)yield input;}
 function* note(message){for(let i=0;i<90;i++)yield {hold:true,note:message};}
 function* until(done,input,limit=900){for(let i=0;i<limit;i++){if(done())return;yield typeof input==='function'?input():input;}throw Error('演示路线暂时卡住了，请接管或重试。');}
 function* move(id,x,extra=()=>({})){g.select(id);const p=g.people[id];yield* until(()=>Math.abs(p.x-x)<5&&Math.abs(p.vx)<.8,()=>{const error=x-p.x-p.vx*(id===1?8:2);return {right:error>1,left:error<-1,...extra(p)};});}
 function* crossStar(){yield* move(2,l.gapL-75,p=>({jump:!!l.trap&&p.x>265&&p.x<330}));yield {};yield {jump:true,right:true};yield* until(()=>g.people[2].x>775,{right:true,jump:true});yield* move(2,784,()=>({jump:true}));}
 if(l.seesaw){
  yield* step(3);yield* note('① 先让秦练习停稳在粉色发射座。站着压按钮，这次没用。');yield* move(1,415);yield* step(30);
  yield* note('② 换艾改错到蓝色冲击板，跳起再砸下。重量 × 落地冲击，才能发射队友！');yield* move(0,315);yield {};yield {jump:true};yield* until(()=>g.pinkOn,{});
  yield* note('③ 秦练习已在高台接应。董高分走到同一个发射座，等第二次重砸。');yield* move(2,415);yield* step(20);g.select(0);yield {};yield {jump:true};yield* until(()=>g.people[2].launching,{});yield* until(()=>g.people[2].grounded,{});
  yield* move(2,957);yield* until(()=>g.bridge,{});yield* note('④ 两座高台都有人接应，桥才升起。现在把三个人都带到出口。');
  for(const id of [0,1,2]){g.select(id);yield {};yield* until(()=>g.people[id].arrived,{right:true});}return;
 }
 yield* note('① 艾改错压住蓝按钮，先给队友开门。');yield* step(3);
 if(l.n===6){yield {jump:true};yield* step(10);yield* move(0,120);yield* step(30);}else yield* move(0,270);
 yield* step(20);
 if(l.crate){yield* note('先让董高分滑翔过坑，把挡住粉按钮的箱子推开。');yield* crossStar();yield* move(2,887);yield* move(2,960);}
 yield* note(l.seesaw?'② 艾改错提供重量，秦练习借力弹射。':l.portal?'② 秦练习穿过门，借弹力或传送门到右侧。':'② 换秦练习，利用弹簧飞过坑，踩粉按钮接应。');
 g.select(1);yield {};
 if(l.trap){yield* note('红按钮不碰！跳过去，反向刹车，落到弹簧旁。');yield* move(1,l.trap.x-102);yield {};yield {jump:true,right:true};yield* move(1,l.spring.x-10);}
 yield* until(()=>g.people[1].x>l.gapR+40,{right:true});yield* move(1,822);yield* step(30);
 yield* note('③ 门已锁住，风扇启动。董高分长按跳跃滑翔。');
 if(!l.crate)yield* crossStar();else yield* move(2,784);
 g.select(2);yield* until(()=>g.people[2].y<205,{});yield* note('乘风升高，再向右滑翔，落在高台黄按钮上。');yield* until(()=>g.people[2].x>906,{right:true,jump:true});yield* move(2,913,()=>({jump:true}));yield* until(()=>g.bridge,{});
 if(l.finale){yield* note('④ 最后一轮：秦练习留在 04，艾改错走到 05，锁住最后一段桥。');yield* move(1,985);yield* move(0,540);yield* step(5);}
 yield* note('桥升起来了！接回艾改错，三个人一起进出口。');
 for(const id of [0,1,2]){g.select(id);yield {};yield* until(()=>g.people[id].arrived,()=>{const p=g.people[id];return {right:true,jump:p.grounded&&((!!l.trap&&p.x>l.trap.x-(id===0?55:90)&&p.x<l.trap.x+40)||(!!g.crate&&p.x>g.crate.x-65&&p.x<g.crate.x+45))};});}
}
root.createDemonstration=demonstration;if(typeof module!=='undefined')module.exports=demonstration;
})(typeof globalThis!=='undefined'?globalThis:this);
