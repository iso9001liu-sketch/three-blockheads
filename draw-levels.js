/* Distinct visual language for each later chapter, sharing the paper-and-ink palette. */
function drawAdvanced(g){
 const l=g.level,f=g.flags;
 for(const s of l.platforms)terrain(s);
 function bridge(){terrain({x:l.gapL,y:520,w:l.gapR-l.gapL,h:18});}
 function cable(x1,y1,x2,y2,color='#bdc9aa'){line(x1,y1,x2,y2,color,2,[6,7]);}
 function ring(x,y,color,label){ctx.beginPath();ctx.ellipse(x,y-35,20,36,0,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.ellipse(x,y-35,12,28,0,0,Math.PI*2);ctx.strokeStyle=color+'70';ctx.lineWidth=3;ctx.stroke();text(label,x,y-88,13,color,'center',700);}
 function gear(x,y,r,stopped){ctx.save();ctx.translate(x,y);ctx.rotate(stopped?0:g.frames/35);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);rounded(r-5,-8,18,16,3,'#a8b3a0','#74836d');}ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle=stopped?'#d4dfbd':'#bdc7b2';ctx.fill();ctx.strokeStyle='#74836d';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.38,0,7);ctx.stroke();ctx.restore();}
 const headline=['借一个脑袋，当一块弹簧。','先接通电，再接回队友。','同一扇门，两个目的地。','快，不一定比停下来聪明。','机器停了，队友还在里面！'][l.custom-1];
 text(headline,620,123,21,'#78816b','center',800);
 if(l.custom===1){
  if(g.bridge)bridge();else{cable(460,524,730,524);text('货箱压住，桥才固定',592,565,14,'#9ca38c','center');}
  ctx.beginPath();ctx.ellipse(242,514,40,9,0,0,7);ctx.setLineDash([4,5]);ctx.strokeStyle='#d491af';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);text('秦练习 · 人形弹簧',240,565,15,'#b18098','center',700);
  ctx.beginPath();ctx.moveTo(245,432);ctx.quadraticCurveTo(225,198,369,267);ctx.setLineDash([6,8]);ctx.strokeStyle='#caad61';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
  pad(l.yellow,palette[2],f.cargoUnlocked?'货箱已解锁':'高台 · 解开锁链',f.cargoUnlocked);pad(l.cargo,palette[0],'货箱停这里',f.cargoDocked);
  const b=g.crate;rounded(b.x,b.y,b.w,b.h,4,'#c9ae85','#82765f');line(b.x+5,b.y+5,b.x+b.w-5,b.y+b.h-5,'#a58c64',2);line(b.x+b.w-5,b.y+5,b.x+5,b.y+b.h-5,'#a58c64',2);
  if(!f.cargoUnlocked){cable(370,300,b.x+23,b.y,'#97a1aa');rounded(b.x+14,b.y+10,18,16,4,'#778594');text('锁',b.x+23,b.y+22,10,'#fff','center');}
  text(f.cargoUnlocked?'艾改错来推 →':'箱子锁住了',b.x+23,b.y-18,13,'#8a795c','center',700);
  text('普通跳跃够不到，借队友弹高！',325,235,14,'#ad9b69','center');
 }
 if(l.custom===2){
  ctx.fillStyle='#dcebe8';ctx.fillRect(350,544,550,106);for(let j=0;j<4;j++)for(let i=0;i<8;i++){const x=365+i*72+(g.frames/8%24);line(x,560+j*23,x+29,560+j*23,'#b8d4cd',2);}
  const v=g.ferry;rounded(v.x,v.y,v.w,18,5,'#d4bf93','#7e8064');ctx.beginPath();ctx.moveTo(v.x+4,539);ctx.lineTo(v.x+25,562);ctx.lineTo(v.x+115,562);ctx.lineTo(v.x+136,539);ctx.closePath();ctx.fillStyle='#819d8a';ctx.fill();ctx.strokeStyle='#647e6b';ctx.stroke();
  line(v.x+70,520,v.x+70,469,'#85997d',3);rounded(v.x+73,470,35,21,3,'#e8e7b8');text('三人渡',v.x+90,485,10,'#73805e','center');
  text({left:'等人上船',out:'开往右岸 →',right:'靠岸 · 请下船',back:'← 返回接人'}[v.phase],v.x+70,586,15,'#608675','center',700);
  pad(l.pink,palette[1],'秦练习留守供电',g.onPad(g.people[1],l.pink)||f.dockPower);pad(l.blue,palette[0],'艾改错接通备用电',f.dockPower);
  cable(206,535,335,580,'#c99aac');cable(335,580,335,535,'#c99aac');text('没有永久桥，每个人都要坐船',640,358,17,'#83a19a','center');
 }
 if(l.custom===3){
  ring(303,520,'#a18bb3','入口');ring(692,360,'#a18bb3','返回左岸');ring(929,520,'#9eb894','出口接收端');
  cable(320,425,578,280,g.route?'#d3d4c9':'#b9a0cc');cable(330,443,923,430,g.route?'#9daf81':'#d3d4c9');
  pad(l.blue,palette[0],'艾改错 · 供电',g.onPad(g.people[0],l.blue)||f.portalRelay);pad(l.yellow,palette[2],'董高分跳一下切换',!!g.route);pad(l.battery,palette[1],'秦练习 · 路由电池',f.battery);pad(l.receiver,palette[2],'远端接力盘',f.portalRelay);
  rounded(449,171,300,54,10,'#f0edf5','#b6a8c5');text('当前目的地：'+(g.route?'右岸出口':'中转岛'),599,205,21,'#8d769e','center',800);
  text('先取电 → 原路返回 → 切换目的地',630,582,15,'#a38caa','center');
 }
 if(l.custom===4){
  for(let i=0;i<3;i++){const x=l.lasers[i],light=AdvancedLevels.laser(g,i);const color=light.safe?'#8eae67':'#d88278';
   rounded(x-12,247,46,47,10,'#e9e7d8','#8b8f7c');ctx.beginPath();ctx.arc(x+11,270,11,0,7);ctx.fillStyle=color;ctx.fill();
   if(!light.safe){ctx.fillStyle='#dc8b7e32';ctx.fillRect(x,299,20,220);line(x+10,300,x+10,519,'#d88278',5);}else line(x+10,300,x+10,519,'#a9c18d',2,[5,8]);
   text(light.safe?'通行 '+(light.remaining/60).toFixed(1)+'s':'等待 '+(light.remaining/60).toFixed(1)+'s',x+10,228,15,color,'center',800);text(String(i+1).padStart(2,'0'),x+10,557,19,'#9c9f8c','center',800);
  }
  for(const x of [465,705,945]){line(x+10,520,x+10,472,'#929c7b',2);ctx.beginPath();ctx.moveTo(x+10,473);ctx.lineTo(x+37,484);ctx.lineTo(x+10,495);ctx.closePath();ctx.fillStyle='#c0d7a0';ctx.fill();text('复活旗',x+20,577,12,'#899574','center');}
  text('秦练习：提前松手，反向刹车。',636,167,15,'#a98999','center');
 }
 if(l.custom===5){
  if(f.gearStopped)bridge();else{cable(450,522,850,522,'#b4b7a3');text('运转中 · 先停齿轮',658,489,15,'#ab9173','center');}
  gear(594,575,45,f.gearStopped);gear(703,577,59,f.gearStopped);
  pad(l.blue,palette[0],'① 开启齿轮入口',g.onPad(g.people[0],l.blue));pad(l.gear,palette[1],f.gearStopped?'她卡住了！':'② 秦练习进入',f.gearStopped);
  pad(l.power,palette[0],'③ 升降供电',g.onPad(g.people[0],l.power));pad(l.yellow,palette[2],'④ 锁定主桥',f.bridgeLocked);pad(l.rescue,palette[0],'⑤ 艾改错救人',f.rescued);
  line(884,263,884,518,'#b8c6aa',4);line(970,263,970,518,'#b8c6aa',4);terrain(g.lift);text('升降台',927,g.lift.y-20,13,'#809070','center');
  if(g.people[1].frozen){rounded(459,421,107,36,8,'#f8e0ea','#c992aa');text('救我啊！',512,445,16,'#b17b91','center',800);for(let k=0;k<3;k++)line(472+k*23,480,472+k*23,520,'#a6998180',3);}
  const phases=[f.gearStopped,f.bridgeLocked,f.rescued];['停机','锁桥','救人'].forEach((v,i)=>{rounded(468+i*96,178,83,30,7,phases[i]?'#d3e5b5':'#ebe8d9');text(v,510+i*96,199,14,phases[i]?'#668249':'#a3a38f','center',700);});
 }
}
