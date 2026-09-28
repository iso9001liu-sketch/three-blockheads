/* Fixed-step, dependency-free cooperative platformer. Coordinates are in world pixels. */
(function(root){
'use strict';
const names=['三个大聪明出门了','别碰那个按钮','你先飞，我来砸','这锅谁来背','风大，别装了','借你一条近路','看起来很靠谱','一个都不能少'];
const hints=[
 '① 艾改错站上左侧蓝按钮。② 秦练习穿过门，踩弹簧飞过坑，落在右侧粉按钮。③ 董高分长按跳跃滑翔过坑，乘风到上层黄按钮。④ 桥升起，三人到出口。',
 '红按钮会让全队回到起点。跳过红按钮，按蓝 → 粉 → 黄的顺序接力。红色真的不是什么喜庆的颜色。',
 '① 秦练习先停在左岸粉色发射座上。② 艾改错站上蓝色冲击板，原地跳起再落下，才能把她弹上右侧高台。③ 董高分回到同一发射座，艾改错再跳砸一次，把他送到更高的黄按钮。④ 两个高台接应完成，桥才会升起。站着不动不会发射，普通跳跃也够不到高台。',
 '粉按钮被箱子挡住了。董高分先滑翔到右侧，将箱子向右推离粉按钮；再让秦练习踩按钮开启风扇。',
 '坑上有逆风。秦练习踩弹簧时持续向右，董高分从靠近坑边的位置起跳并长按空格；粉按钮能关闭逆风。',
 '粉色传送门只认秦练习。先压蓝按钮，再让秦练习走进门；董高分仍要自己飞过去。',
 '中间的红色大按钮写着“捷径”，但它会重置全队。真正的蓝按钮在左边小平台上，跳上去压住它。',
 '先完成蓝 → 粉 → 黄接力。董高分开启第一座桥后，秦练习踩住右侧第二个粉按钮；艾改错走到第二个蓝按钮，最后一段桥才会永久锁定。'
];
function makeLevel(index,seed){
 const endless=index>=8; let n=endless?(seed%7):index;
 let gapL=460,gapR=730+(endless?(seed%3)*12:0);
 const level={index,n,seed,name:endless?'随机遭罪 · '+seed:names[n],hint:hints[n],gapL,gapR,
  platforms:[{x:0,y:520,w:gapL,h:130},{x:gapR,y:520,w:1200-gapR,h:130},{x:840,y:290,w:170,h:20},...(n===6?[{x:85,y:458,w:110,h:10}]:[])],
  blue:{x:n===6?115:260,y:n===6?458:520,w:54},pink:{x:810,y:520,w:54},yellow:{x:912,y:290,w:48},gate:{x:355,y:350,w:22,h:170},
  spring:{x:gapL-45,y:520,w:38},fan:{x:770,y:520,w:58},exit:{x:1110,y:520},trap:n===1?{x:320,y:520,w:30}:n===6?{x:320,y:520,w:30}:null,
  crate:n===3?{x:812,y:486,w:42,h:34}:null,seesaw:n===2,wind:n===4,portal:n===5,finale:n===7};
 if(n===2){level.blue={x:305,y:520,w:62};level.pink={x:798,y:340,w:54};level.yellow={x:956,y:280,w:48};level.platforms=[{x:0,y:520,w:460,h:130},{x:gapR,y:520,w:1200-gapR,h:130},{x:720,y:340,w:165,h:18},{x:900,y:280,w:175,h:18}];level.seat={x:407,y:520,w:48};}
 return level;
}
function person(i){return {id:i,x:80+i*70,y:520-[66,40,48][i],w:[44,44,49][i],h:[66,40,48][i],vx:0,vy:0,grounded:false,launching:false,arrived:false,rotation:0,emotion:0,hitCooldown:0};}
class Game{
 constructor(index=0,seed=1){this.level=makeLevel(index,seed);this.people=[0,1,2].map(person);this.selected=0;this.frames=0;this.deaths=0;this.bumps=0;this.gateOpen=false;this.pinkOn=false;this.bridge=false;this.finalBridge=false;this.won=false;this.events=[];this.jumpHeld=false;this.trapCooldown=0;this.crate=this.level.crate?{...this.level.crate}:null;this.flags={};}
 event(type,text){this.events.push({type,text});}
 select(i){if(i<0||i>2)return;this.selected=i;this.jumpHeld=true;}
 onPad(p,pad){return !p.arrived&&p.x+p.w>pad.x&&p.x<pad.x+pad.w&&Math.abs(p.y+p.h-pad.y)<10;}
 solids(){const l=this.level;let a=l.platforms.slice();if(!l.seesaw&&!this.gateOpen)a.push(l.gate);if(this.bridge)a.push({x:l.gapL,y:520,w:l.finale?140:l.gapR-l.gapL,h:18});if(l.finale&&this.finalBridge)a.push({x:l.gapL+140,y:520,w:l.gapR-l.gapL-140,h:18});return a;}
 respawn(p){const q=person(p.id);Object.assign(p,q);this.deaths++;this.event('fall',['花还在，人也在。','我刚才只是下去看看！','这地心引力有问题。'][p.id]);}
 tick(input={}){
  if(this.won)return;this.frames++;this.trapCooldown=Math.max(0,this.trapCooldown-1);
  const l=this.level,blue=this.people[0],pink=this.people[1],star=this.people[2];
  const weighted=this.onPad(blue,l.blue);this.gateOpen=l.seesaw||weighted||this.pinkOn||this.bridge;
  if(!l.seesaw&&weighted&&!this.flags.blue){this.flags.blue=true;this.event('button','咚。门开了，艾改错先别走。');}
  if(this.onPad(pink,l.pink)&&(!this.crate||Math.abs(this.crate.x-l.pink.x)>45)&&!this.pinkOn){this.pinkOn=true;this.event('button',l.seesaw?'第一座高台接应成功！用跷跷板再发射董高分。':'秦练习接应成功！风扇开了，门也锁住了。');}
  if(this.onPad(star,l.yellow)&&this.pinkOn&&!this.bridge){this.bridge=true;this.event('bridge',l.finale?'第一段桥起来了！还有最后一轮接力。':'桥升起来了！把艾改错接过来吧。');}
  if(l.finale&&this.bridge&&!this.finalBridge&&this.onPad(pink,{x:980,y:520,w:48})&&this.onPad(blue,{x:535,y:520,w:48})){this.finalBridge=true;this.event('bridge','最后一段桥锁定！一个都不能少。');}
  let jump=!!input.jump&&!this.jumpHeld;this.jumpHeld=!!input.jump;
  for(const p of this.people){
   if(p.arrived)continue;p.emotion=Math.max(0,p.emotion-1);p.hitCooldown=Math.max(0,p.hitCooldown-1);
   const active=p.id===this.selected,dir=active?((input.right?1:0)-(input.left?1:0)):0;
   const accel=p.id===1?.38:.68,max=[3.2,6.8,4.5][p.id];
   if(p.launching&&!p.grounded){p.vx=p.id===1?6.6:6.8;}else if(dir)p.vx=Math.max(-max,Math.min(max,p.vx+dir*accel));else p.vx*=p.id===1?.955:.72;
   if(active&&jump&&p.grounded){p.vy=-[8.8,11.4,10.4][p.id];p.grounded=false;this.event('jump','');}
   let gravity=.48;
   if(p.id===2&&active&&input.jump&&p.vy>0){gravity=.05;p.vy=Math.min(p.vy,1.55);}
   if(l.wind&&!this.pinkOn&&p.x>l.gapL-15&&p.x<l.gapR)p.vx-=p.id===0?.015:.07;
   if(!l.seesaw&&this.pinkOn&&p.id===2&&p.x+p.w>l.fan.x-15&&p.x<l.fan.x+l.fan.w+20&&p.y+p.h>240){p.vy=Math.max(-7,p.vy-.9);}
   p.vy=Math.min(15,p.vy+gravity);let solids=this.solids();
   let oldX=p.x;p.x+=p.vx;p.x=Math.max(5,Math.min(1195-p.w,p.x));
   for(const s of solids){if(p.x<s.x+s.w&&p.x+p.w>s.x&&p.y<s.y+s.h&&p.y+p.h>s.y+.5){if(oldX+p.w<=s.x+1)p.x=s.x-p.w;else if(oldX>=s.x+s.w-1)p.x=s.x+s.w;p.vx=0;}}
   if(this.crate&&p.x+p.w>this.crate.x&&p.x<this.crate.x+this.crate.w&&p.y+p.h>this.crate.y&&p.y<this.crate.y+this.crate.h){if(p.id===2||p.id===0){this.crate.x=Math.max(l.gapR,Math.min(1060,this.crate.x+p.vx));}if(p.vx>0)p.x=this.crate.x-p.w;else if(p.vx<0)p.x=this.crate.x+this.crate.w;}
   const impactSpeed=p.vy;const oldBottom=p.y+p.h;p.y+=p.vy;p.grounded=false;
   for(const s of solids){if(p.x+p.w>s.x+.1&&p.x<s.x+s.w-.1&&p.y+p.h>=s.y&&oldBottom<=s.y+Math.max(2,-p.vy)&&p.vy>=0){p.y=s.y-p.h;p.vy=0;p.grounded=true;}}
   if(this.crate&&p.x+p.w>this.crate.x&&p.x<this.crate.x+this.crate.w&&oldBottom<=this.crate.y+2&&p.y+p.h>=this.crate.y&&p.vy>=0){p.y=this.crate.y-p.h;p.vy=0;p.grounded=true;}
   if(p.grounded)p.launching=false;
   if(l.seesaw&&p.id===0&&p.grounded&&impactSpeed>5&&this.onPad(p,l.blue)){
    const passenger=[pink,star].find(q=>q.grounded&&this.onPad(q,l.seat));
    this.flags.slam=this.frames;
    if(passenger){passenger.vy=passenger.id===1?-17:-20.5;passenger.vx=passenger.id===1?6.6:6.8;passenger.grounded=false;passenger.launching=true;passenger.emotion=100;this.flags.launches=(this.flags.launches||0)+1;this.event('bounce',passenger.id===1?'BOOM！第一位乘客起飞！':'BOOM！第二位乘客，去更高的地方！');}
    else this.event('button','砸空了！先让队友停在粉色发射座。');
   }
   // Each teammate can be stood on; the pink character is a living trampoline.
   for(const other of this.people){if(other===p||other.arrived)continue;if(p.x+p.w>other.x+5&&p.x<other.x+other.w-5&&p.vy>0&&oldBottom<=other.y+5&&p.y+p.h>=other.y&&p.y<other.y){p.y=other.y-p.h;if(other.id===1&&p.id!==0){p.vy=-15;p.emotion=60;this.event('bounce','Duang！队友也是弹簧。');}else{p.vy=0;p.grounded=true;if(p.id===0&&other.id===1)other.vx=0;}}
    if(p.id!==0&&other.id===0&&!p.hitCooldown&&Math.abs(p.vx)>3&&Math.abs(p.x-other.x)<42&&Math.abs(p.y-other.y)<50){this.bumps++;p.hitCooldown=70;blue.emotion=30;if(this.bumps===20)this.event('achievement','🏆 他真的生气了 · 连续撞艾改错 20 次');}}
   if(!l.seesaw&&p.id===1&&p.grounded&&p.x+p.w>l.spring.x&&p.x<l.spring.x+l.spring.w&&(!l.seesaw||weighted)){p.vy=-15.2;p.vx=6.6;p.grounded=false;p.emotion=70;this.event('bounce',l.seesaw?'BOOM！重量就是力量！':'Duang！刹车是什么？');}
   if(l.portal&&p.id===1&&this.gateOpen&&p.x>385&&p.x<435&&p.grounded){p.x=760;p.vx=2;this.event('portal','借过一下。物理老师别看。');}
   if(l.trap&&this.onPad(p,l.trap)&&!this.trapCooldown){this.trapCooldown=90;this.deaths++;this.people=[0,1,2].map(person);this.pinkOn=false;this.bridge=false;this.finalBridge=false;this.gateOpen=false;this.event('trap','不是所有按钮，都值得按。全队重来！');break;}
   if(p.y>730){this.respawn(p);continue;}
   if(p.id===1)p.rotation+=p.vx*.014;else p.rotation*=.8;
   if(this.bridge&&(!l.finale||this.finalBridge)&&p.x+p.w>l.exit.x&&p.y+p.h>440&&p.y+p.h<=525){p.arrived=true;p.vx=0;this.event('arrive',['艾改错到了。花也到了。','秦练习到了。终于刹住了。','董高分到了。一脸嫌弃地到了。'][p.id]);const next=this.people.find(q=>!q.arrived);if(next)this.selected=next.id;}
  }
  if(this.people.every(p=>p.arrived)){this.won=true;this.event('win','一个都不能少。');}
 }
}
root.IdiotGame={Game,makeLevel,names,hints};if(typeof module!=='undefined')module.exports=root.IdiotGame;
})(typeof globalThis!=='undefined'?globalThis:this);
