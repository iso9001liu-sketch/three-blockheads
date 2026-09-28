/* Later chapters have separate maps, state machines and cooperative objectives. */
(function(root){
const titles=['队友是弹簧','渡船不等人','传送门接错了','红灯别乱跑','谁来救救她'];
const hints=[
'秦练习停在左侧粉色虚线圈（约 x=220）。董高分在她头上原地跳起，落下来时会被弹高；弹起后向右落到高台黄开关，解开货箱锁。艾改错把货箱推到岸边蓝色货位，箱子会永久压住桥。最后三人过桥。',
'秦练习留在左边粉色供电按钮。艾改错走上渡船，站稳后等船开到右岸，走到蓝色码头按钮接通备用电源。渡船从此自动往返，秦练习可以离开按钮。其余两人各自等船回到左岸，站上去后松开方向，到岸再下船。',
'艾改错先在蓝按钮供电。秦练习走进紫色入口，先到中转岛取电，再从岛右侧紫门返回左岸。董高分到黄色路由盘上跳一下，落地切换到“出口”。再让秦练习和董高分依次从入口到右岸；董高分踩右侧接力盘，门户永久供电，最后接走艾改错。',
'前方三道光栅周期错开。绿色表示通行，红色表示危险；在光栅前停稳，等新一轮绿灯再走。中间旗帜是每个角色独立的复活点。秦练习需要提前松手并反向刹车。三人都要自己走到出口。',
'艾改错先站蓝按钮，打开齿轮入口。秦练习走入粉色齿轮座，被固定后机器停转，临时桥出现。艾改错过桥站在“升降供电”按钮，董高分乘升降台登上高处，踩黄按钮把桥永久锁住。最后艾改错踩右岸救援按钮，释放秦练习，三人一起出门。'
];
function configure(l){if(l.n<3)return l;l.custom=l.n-2;l.name=l.index>=8?'随机挑战 · '+titles[l.n-3]+' / '+l.seed:titles[l.n-3];l.hint=hints[l.n-3];l.seesaw=l.wind=l.portal=l.finale=false;l.trap=null;l.crate=null;
 l.platforms=[{x:0,y:520,w:460,h:130},{x:730,y:520,w:470,h:130}];l.gapL=460;l.gapR=730;
 if(l.custom===1){l.platforms.push({x:285,y:300,w:150,h:18});l.yellow={x:346,y:300,w:48};l.crate={x:340,y:482,w:46,h:38};l.cargo={x:399,y:520,w:60};l.bounceSpot={x:212,y:520,w:60};}
 if(l.custom===2){l.gapL=350;l.gapR=900;l.platforms=[{x:0,y:520,w:350,h:130},{x:900,y:520,w:300,h:130}];l.pink={x:180,y:520,w:54};l.blue={x:960,y:520,w:55};}
 if(l.custom===3){l.gapL=365;l.gapR=880;l.platforms=[{x:0,y:520,w:365,h:130},{x:535,y:360,w:190,h:18},{x:880,y:520,w:320,h:130}];l.blue={x:135,y:520,w:52};l.yellow={x:216,y:520,w:48};l.battery={x:597,y:360,w:44};l.receiver={x:994,y:520,w:50};l.portals=[{x:303,y:520},{x:692,y:360}];}
 if(l.custom===4){l.platforms=[{x:0,y:520,w:1200,h:130}];l.gapL=l.gapR=0;l.lasers=[390,630,870];}
 if(l.custom===5){l.gapL=450;l.gapR=850;l.platforms=[{x:0,y:520,w:450,h:130},{x:850,y:520,w:350,h:130},{x:970,y:270,w:175,h:18}];l.blue={x:260,y:520,w:52};l.gear={x:405,y:520,w:44};l.power={x:805,y:520,w:45};l.yellow={x:1020,y:270,w:50};l.rescue={x:998,y:520,w:50};}
 return l;
}
function init(g){g.ferry={x:350,y:520,w:140,h:18,phase:'left',wait:0};g.lift={x:890,y:520,w:76,h:16};g.route=0;g.checkpoints=[80,150,220];}
function trigger(g,key,message,type='button'){if(g.flags[key])return;g.flags[key]=true;g.event(type,message);}
function laser(g,i){const phase=(g.frames+i*80)%240;return {safe:phase<100,remaining:phase<100?100-phase:240-phase};}
function before(g){const l=g.level,b=g.people[0],p=g.people[1],s=g.people[2];g.gateOpen=true;
 if(l.custom===1){if(g.onPad(s,l.yellow))trigger(g,'cargoUnlocked','货箱解锁！轮到艾改错搬砖。');if(g.flags.cargoUnlocked&&g.crate.x>=399){trigger(g,'cargoDocked','货箱就位，桥已固定！','bridge');g.bridge=true;}}
 if(l.custom===2){if(g.onPad(b,l.blue))trigger(g,'dockPower','对岸备用电源接通！留守的秦练习可以上船了。');const f=g.ferry;const powered=g.onPad(p,l.pink)||g.flags.dockPower;const passengers=g.people.filter(q=>!q.arrived&&q.grounded&&Math.abs(q.y+q.h-f.y)<2&&q.x+q.w/2>f.x+5&&q.x+q.w/2<f.x+f.w-5);const old=f.x;
  if(f.phase==='left'){if(powered&&passengers.length){if(++f.wait>=35){f.phase='out';f.wait=0;}}else f.wait=0;}
  else if(f.phase==='out'&&powered){f.x=Math.min(760,f.x+2.8);if(f.x===760){f.phase='right';f.wait=0;}}
  else if(f.phase==='right'){if(++f.wait>=120){f.phase='back';f.wait=0;}}
  else if(f.phase==='back'&&powered){f.x=Math.max(350,f.x-2.8);if(f.x===350){f.phase='left';f.wait=0;}}
  for(const q of passengers)q.x+=f.x-old;
 }
 if(l.custom===3){if(g.onPad(p,l.battery))trigger(g,'battery','中转电池到手！从岛右侧返回，再切换目的地。');if(g.flags.battery&&g.onPad(s,l.receiver))trigger(g,'portalRelay','远端接力完成，传送门永久通电！艾改错也能走了。');}
 if(l.custom===5){if(g.flags.gearStopped){g.bridge=true;if(g.onPad(s,l.yellow))trigger(g,'bridgeLocked','主桥锁定！去右岸救援按钮，把秦练习放出来。','bridge');}
  const lift=g.lift;const riders=g.people.filter(q=>!q.arrived&&q.grounded&&Math.abs(q.y+q.h-lift.y)<2&&q.x+q.w>lift.x+4&&q.x<lift.x+lift.w-4);const old=lift.y;const power=g.onPad(b,l.power);if(power&&g.flags.gearStopped&&(riders.length||lift.y<520))lift.y=Math.max(270,lift.y-2);else lift.y=Math.min(520,lift.y+2);for(const q of riders)q.y+=lift.y-old;
  if(g.flags.bridgeLocked&&g.onPad(b,l.rescue)&&!g.flags.rescued){trigger(g,'rescued','救援成功！秦练习终于不用当螺丝钉了。','bridge');p.frozen=false;p.x=520;p.y=480;p.vx=p.vy=0;}
 }
}
function solids(g){const l=g.level,a=l.platforms.slice();if(l.custom===1&&g.bridge)a.push({x:460,y:520,w:270,h:18});if(l.custom===2)a.push({...g.ferry});if(l.custom===5){a.push({...g.lift});if(g.flags.gearStopped)a.push({x:450,y:520,w:400,h:18});}return a;}
function after(g,p,impact){const l=g.level;
 if(l.custom===3){p.portalCooldown=Math.max(0,(p.portalCooldown||0)-1);
  if(p.id===2&&g.onPad(p,l.yellow)&&p.grounded&&impact>4){if(g.flags.battery){g.route=1-g.route;g.event('portal',g.route?'目的地：出口。现在进左边紫门。':'目的地：中转岛。');}else g.event('button','先让秦练习去中转岛取电。');}
  if(!p.portalCooldown&&p.grounded){const portal=l.portals.find(v=>Math.abs(p.x+p.w/2-v.x)<25&&Math.abs(p.y+p.h-v.y)<5);if(portal){if(portal===l.portals[1])teleport(g,p,240,520);else if(g.onPad(g.people[0],l.blue)||g.flags.portalRelay){if(g.route&&g.flags.battery)teleport(g,p,916,520);else teleport(g,p,555,360);}}}
 }
 if(l.custom===4){for(let i=0;i<3;i++){if(p.x+p.w>l.lasers[i]&&p.x<l.lasers[i]+20&&p.y+p.h>285&&!laser(g,i).safe){g.respawn(p);g.event('trap','红灯碰不得！回到最近的旗帜，再看准节奏。');return;}}for(const x of [465,705,945])if(p.grounded&&p.x>=x)g.checkpoints[p.id]=Math.max(g.checkpoints[p.id],x);}
 if(l.custom===5&&p.id===1&&!g.flags.gearStopped&&g.onPad(p,l.gear)&&g.onPad(g.people[0],l.blue)){trigger(g,'gearStopped','秦练习卡住齿轮了！临时桥已出现，快去救她。','bridge');p.frozen=true;p.x=480;p.y=480;p.vx=p.vy=0;}
}
function teleport(g,p,x,bottom){p.x=x;p.y=bottom-p.h;p.vx=p.vy=0;p.portalCooldown=20;p.grounded=false;g.event('portal','咻！目的地可不是随便选的。');}
function ready(g){switch(g.level.custom){case 1:return !!g.flags.cargoDocked;case 2:return !!g.flags.dockPower;case 3:return !!g.flags.portalRelay;case 4:return true;case 5:return !!g.flags.rescued;}return false;}
function objective(g){const f=g.flags;switch(g.level.custom){case 1:return !f.cargoUnlocked?'让董高分借秦练习弹上左侧高台，解开货箱锁。':!f.cargoDocked?'货箱解锁了！艾改错把它推到岸边蓝色货位。':'货箱压住桥了，三个人一起过桥！';case 2:return !f.dockPower?'秦练习留在供电板，艾改错乘船到右岸接通备用电源。':'渡船已自动供电，等它回左岸，把队友接过来。';case 3:return !f.battery?'艾改错供电，秦练习先传送到中转岛取电。':!g.route?'董高分在路由盘上跳一下，把目的地切到出口。':!f.portalRelay?'秦练习和董高分先传送，董高分踩右侧接力盘。':'门户永久通电！让艾改错也传送过来。';case 4:return '绿灯通行，红灯停。秦练习提前刹车，旗帜可以存复活点。';case 5:return !f.gearStopped?'艾改错压住左侧蓝板，秦练习进入粉色齿轮座。':!f.bridgeLocked?'艾改错过桥给升降台供电，董高分登顶锁住主桥。':!f.rescued?'主桥已锁定，艾改错踩右侧救援按钮，放出秦练习。':'救援完成，三个人一起离开工厂！';}}
root.AdvancedLevels={configure,init,before,solids,after,ready,objective,laser,titles,hints};if(typeof module!=='undefined')module.exports=root.AdvancedLevels;
})(typeof globalThis!=='undefined'?globalThis:this);
