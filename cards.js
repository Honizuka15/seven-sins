// Cartes de collection SEVEN SINS : calcul de rareté et rendu canvas (PNG/JPG haute résolution)
import { SINS } from '../data/sins.js';
const LEVELS=[[10,'Innocent'],[25,'Tentation'],[40,'Pécheur occasionnel'],[55,'Compromis'],[70,'Corrompu'],[85,'Démoniaque'],[99,'Abomination'],[100,'Incarnation']];
const RAR=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Shiny','Infinite'];
const RARC={Common:'#9a948c',Uncommon:'#6fcf7f',Rare:'#5fa8ff',Epic:'#b77bff',Legendary:'#e8c46a',Mythic:'#ff5f6d',Shiny:'#7fffe0',Infinite:'#ffffff'};
const level=v=>{for(const [m,l] of LEVELS) if(v<=m) return l; return 'Incarnation';};

function evalSin(s,i){
const d=SINS[i],lab=(s.label||'').trim();
const r={v:0,disp:'',rank:'',exc:false,shiny:false,neg:false,inf:false,glitch:false,num:false,kind:s.kind};
switch(s.kind){
case 'rank':r.v=110;r.disp=(lab||d.ladder[0]).toUpperCase();r.rank='Rang exceptionnel';r.exc=true;break;
case 'inf':r.v=Infinity;r.disp='∞';r.rank=lab||d.inf;r.exc=r.inf=true;break;
case 'shiny':r.v=200;r.disp='SHINY';r.rank=lab||d.shiny;r.exc=r.shiny=true;break;
case 'infshiny':r.v=Infinity;r.disp='∞ SHINY';r.rank=lab||(d.inf+' · Shiny');r.exc=r.inf=r.shiny=true;break;
case 'glitch':r.v=NaN;r.disp='NaN';r.rank=lab||'Inquantifiable';r.exc=r.shiny=r.glitch=true;break;
case 'neg':r.v=-Infinity;r.disp=(lab||'−∞').toUpperCase();r.rank='Shiny négatif';r.shiny=r.neg=true;break;
default:{const v=Math.max(0,Math.min(999,Math.round(+s.score||0)));r.v=v;r.num=true;r.disp=String(v);
if(v>100){r.exc=true;r.rank=lab||d.ladder[Math.min(Math.floor((v-101)/15),d.ladder.length-1)];}else r.rank=lab||level(v);}
}
return r;
}
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h;}
function compute(card){
const ev=card.sins.map(evalSin);
const cmpv=e=>Number.isNaN(e.v)?-1e9:e.v;
let dom=0;ev.forEach((e,i)=>{if(cmpv(e)>cmpv(ev[dom]))dom=i;});
const nums=ev.filter(e=>e.num).map(e=>e.v);
const exc=ev.filter(e=>e.exc).length,anyInf=ev.some(e=>e.inf),shinies=ev.filter(e=>e.shiny);
const c71=nums.filter(v=>v>=71).length,c56=nums.filter(v=>v>=56).length,c86=nums.filter(v=>v>=86).length,has100=nums.includes(100);
let rar='Common';
if(anyInf)rar='Infinite';else if(shinies.length)rar='Shiny';else if(exc>=2)rar='Mythic';
else if(exc===1||(has100&&c86>=2))rar='Legendary';else if(c71>=2||has100)rar='Epic';
else if(c71>=1||c56>=3)rar='Rare';else if(nums.some(v=>v>=41))rar='Uncommon';
const ri=RAR.indexOf(rar);
let tpl=card.tpl&&card.tpl!=='auto'?card.tpl:(ri>=6?'shiny':ri>=3?'legendary':'classic');
const negOnly=shinies.length>0&&shinies.every(e=>e.neg)&&!anyInf;
const variant=tpl==='shiny'&&negOnly?'neg':tpl;
let title=SINS[dom].title;
if(anyInf)title='THE FINAL SIN';else if(ev.some(e=>e.glitch))title='THE UNDEFINED';
else if(!exc&&!shinies.length&&nums.every(v=>v<=10))title='THE SUSPICIOUS SAINT';
const h=hash(card.name+'|'+card.date+'|'+JSON.stringify(card.sins)).toString(36).toUpperCase().padStart(8,'0').slice(-8);
return {ev,dom,rar,ri,tpl,variant,title,id:'SS-'+h.slice(0,4)+'-'+h.slice(4)};
}

function rr(x,ctx,a,b,w,h,r){ctx.beginPath();ctx.moveTo(a+r,b);ctx.arcTo(a+w,b,a+w,b+h,r);ctx.arcTo(a+w,b+h,a,b+h,r);ctx.arcTo(a,b+h,a,b,r);ctx.arcTo(a,b,a+w,b,r);ctx.closePath();}
const R=(ctx,a,b,w,h,r)=>rr(0,ctx,a,b,w,h,r);
function rainbow(ctx,x0,y0,x1,y1){const g=ctx.createLinearGradient(x0,y0,x1,y1);['#ff5f6d','#ffc371','#fff27a','#6dffb0','#5fc8ff','#a06dff','#ff6dd8','#ff5f6d'].forEach((c,i,a)=>g.addColorStop(i/(a.length-1),c));return g;}
function gold(ctx,x0,y0,x1,y1){const g=ctx.createLinearGradient(x0,y0,x1,y1);[['#5a3d0e',0],['#e8c46a',.22],['#7a5512',.45],['#f6dd94',.68],['#6b4a12',1]].forEach(([c,o])=>g.addColorStop(o,c));return g;}
function fitFont(ctx,text,maxW,size,weight,fam){do{ctx.font=weight+' '+size+'px '+fam;if(ctx.measureText(text).width<=maxW)break;size-=2;}while(size>14);return size;}

function sigil(ctx,sym,c){
ctx.save();ctx.lineWidth=8;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=c;ctx.fillStyle=c+'33';ctx.shadowColor=c;ctx.shadowBlur=30;
const P=()=>{ctx.fill();ctx.stroke();};
if(sym==='crown'){ctx.beginPath();ctx.moveTo(-90,40);ctx.lineTo(-90,-40);ctx.lineTo(-45,10);ctx.lineTo(0,-62);ctx.lineTo(45,10);ctx.lineTo(90,-40);ctx.lineTo(90,40);ctx.closePath();P();R(ctx,-95,46,190,26,6);P();[[-90,-40],[0,-62],[90,-40]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y-14,11,0,7);P();});}
else if(sym==='coins'){[60,36,12].forEach(y=>{ctx.beginPath();ctx.ellipse(-20,y,70,20,0,0,7);P();});ctx.beginPath();ctx.arc(45,-45,48,0,7);P();ctx.beginPath();ctx.arc(45,-45,30,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(45,-65);ctx.lineTo(45,-25);ctx.stroke();}
else if(sym==='rose'){for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.arc(Math.cos(a)*30,-30+Math.sin(a)*30,34,0,7);P();}ctx.beginPath();ctx.arc(0,-30,14,0,4.5);ctx.stroke();ctx.beginPath();ctx.moveTo(0,10);ctx.bezierCurveTo(-20,50,20,70,0,100);ctx.stroke();ctx.beginPath();ctx.moveTo(4,62);ctx.quadraticCurveTo(50,40,60,70);ctx.quadraticCurveTo(30,80,4,62);P();}
else if(sym==='eye'){ctx.beginPath();ctx.moveTo(-105,0);ctx.quadraticCurveTo(0,-85,105,0);ctx.quadraticCurveTo(0,85,-105,0);P();ctx.beginPath();ctx.arc(0,0,38,0,7);P();ctx.fillStyle='#050505';ctx.beginPath();ctx.ellipse(0,0,9,30,0,0,7);ctx.fill();for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*30,-44+Math.abs(i)*6);ctx.lineTo(i*38,-68+Math.abs(i)*8);ctx.stroke();}}
else if(sym==='maw'){ctx.beginPath();ctx.moveTo(-100,-8);ctx.quadraticCurveTo(0,-120,100,-8);ctx.closePath();P();ctx.beginPath();ctx.moveTo(-100,8);ctx.quadraticCurveTo(0,120,100,8);ctx.closePath();P();ctx.fillStyle=c;for(let x=-72;x<=72;x+=29){ctx.beginPath();ctx.moveTo(x-11,-8);ctx.lineTo(x+11,-8);ctx.lineTo(x,26);ctx.closePath();ctx.fill();}for(let x=-58;x<=58;x+=29){ctx.beginPath();ctx.moveTo(x-11,8);ctx.lineTo(x+11,8);ctx.lineTo(x,-24);ctx.closePath();ctx.fill();}}
else if(sym==='flame'){const f=(s,oy)=>{ctx.beginPath();ctx.moveTo(0,-100*s+oy);ctx.bezierCurveTo(60*s,-30*s+oy,85*s,20*s+oy,52*s,72*s+oy);ctx.quadraticCurveTo(0,112*s+oy,-52*s,72*s+oy);ctx.bezierCurveTo(-85*s,20*s+oy,-35*s,-20*s+oy,0,-100*s+oy);P();};f(1,0);f(.5,38);}
else{ctx.beginPath();ctx.arc(0,-25,70,Math.PI*.28,Math.PI*1.72,false);ctx.arc(32,-38,58,Math.PI*1.6,Math.PI*.4,true);ctx.closePath();P();[-62,0,62].forEach((x,i)=>{ctx.beginPath();ctx.ellipse(x,80,32,i%2?10:16,0,0,7);ctx.stroke();});ctx.font='700 30px Cinzel, serif';ctx.fillStyle=c;ctx.fillText('z',70,-60);ctx.font='700 22px Cinzel, serif';ctx.fillText('z',96,-86);}
ctx.restore();
}

function draw(cv,card,scale){
const ctx=cv.getContext('2d');cv.width=1000*scale;cv.height=1400*scale;
const C=compute(card),d=SINS[C.dom],V=C.variant;
const T={classic:{ink:'#efe9e1',sub:'rgba(239,233,225,.62)',bg0:'#141216',bg1:'#070608',acc:d.c},
legendary:{ink:'#f7eed6',sub:'rgba(247,238,214,.66)',bg0:'#1b130a',bg1:'#070504',acc:'#f0cf7a'},
shiny:{ink:'#ffffff',sub:'rgba(255,255,255,.7)',bg0:'#120f1e',bg1:'#05040a',acc:d.c},
neg:{ink:'#0d0d10',sub:'rgba(13,13,16,.66)',bg0:'#f1f2f5',bg1:'#a7adb7',acc:'#111'}}[V];
ctx.save();ctx.scale(scale,scale);ctx.clearRect(0,0,1000,1400);
// frame
R(ctx,0,0,1000,1400,44);
ctx.fillStyle=V==='legendary'?gold(ctx,0,0,1000,1400):V==='shiny'?rainbow(ctx,0,0,1000,1400):V==='neg'?(()=>{const g=ctx.createLinearGradient(0,0,1000,1400);['#000','#666','#111','#9aa','#000'].forEach((c,i)=>g.addColorStop(i/4,c));return g;})():(()=>{const g=ctx.createLinearGradient(0,0,0,1400);g.addColorStop(0,'#2b2a30');g.addColorStop(1,'#121114');return g;})();
ctx.fill();
const bg=ctx.createRadialGradient(500,470,40,500,600,900);bg.addColorStop(0,V==='neg'?'#ffffff':d.c+'55');bg.addColorStop(.35,T.bg0);bg.addColorStop(1,T.bg1);
R(ctx,24,24,952,1352,30);ctx.fillStyle=bg;ctx.fill();
ctx.save();R(ctx,24,24,952,1352,30);ctx.clip();
ctx.lineWidth=3;ctx.strokeStyle=V==='classic'?'#8b1e24':V==='legendary'?'#c9a45c':V==='neg'?'#222':'rgba(255,255,255,.5)';R(ctx,40,40,920,1320,22);ctx.stroke();
// corner ornaments
[[40,40],[960,40],[40,1360],[960,1360]].forEach(([x,y])=>{ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillStyle=V==='classic'?'#b3262e':V==='legendary'?'#f0cf7a':V==='neg'?'#111':'#fff';ctx.fillRect(-10,-10,20,20);ctx.restore();});
if(V==='legendary'){ctx.strokeStyle='rgba(240,207,122,.55)';ctx.lineWidth=2;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(120,62+i*10);ctx.lineTo(880,62+i*10);ctx.stroke();}}
// header
ctx.fillStyle=T.sub;ctx.font='700 24px Cinzel, serif';ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillText('SEVEN SINS · PLAYER CARD',70,108);
const rc=V==='neg'?'#111':RARC[C.rar];ctx.font='800 22px Inter, sans-serif';const rw=ctx.measureText(C.rar.toUpperCase()).width+36;
R(ctx,930-rw,78,rw,42,21);
if(C.rar==='Infinite'||C.rar==='Shiny'){ctx.fillStyle=V==='neg'?'#111':rainbow(ctx,930-rw,0,930,0);ctx.fill();ctx.fillStyle=V==='neg'?'#fff':'#111';}else{ctx.strokeStyle=rc;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=rc;}
ctx.textAlign='center';ctx.fillText(C.rar.toUpperCase(),930-rw/2,107);
// name + title
ctx.textAlign='center';ctx.fillStyle=T.ink;const ns=fitFont(ctx,card.name.toUpperCase(),860,104,900,'Cinzel, serif');
if(V==='shiny'){ctx.shadowColor=d.c;ctx.shadowBlur=24;}ctx.fillText(card.name.toUpperCase(),500,220);ctx.shadowBlur=0;
fitFont(ctx,C.title,860,38,700,'Cinzel, serif');ctx.fillStyle=V==='shiny'?rainbow(ctx,200,0,800,0):T.acc;ctx.fillText(C.title,500,276);
// illustration
const cx=500,cy=482,rad=168;
ctx.save();ctx.translate(cx,cy);
ctx.strokeStyle=V==='neg'?'rgba(0,0,0,.25)':d.c+'40';ctx.lineWidth=2;
for(let i=0;i<36;i++){const a=i*Math.PI/18;ctx.beginPath();ctx.moveTo(Math.cos(a)*(rad+14),Math.sin(a)*(rad+14));ctx.lineTo(Math.cos(a)*(rad+(i%2?44:70)),Math.sin(a)*(rad+(i%2?44:70)));ctx.stroke();}
const ig=ctx.createRadialGradient(0,0,10,0,0,rad);ig.addColorStop(0,V==='neg'?'#ffffff':d.c+'66');ig.addColorStop(1,V==='neg'?'#c9ced6':'#0a090c');
ctx.beginPath();ctx.arc(0,0,rad,0,7);ctx.fillStyle=ig;ctx.fill();
ctx.lineWidth=6;ctx.strokeStyle=V==='legendary'?gold(ctx,-rad,-rad,rad,rad):V==='shiny'?rainbow(ctx,-rad,-rad,rad,rad):V==='neg'?'#111':d.c;ctx.stroke();
if(C.rar==='Infinite'){ctx.font='900 300px Cinzel, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillText('∞',0,10);}
ctx.scale(1.05,1.05);sigil(ctx,d.sym,V==='neg'?'#111111':d.c);
ctx.restore();
ctx.textBaseline='alphabetic';ctx.textAlign='center';
ctx.fillStyle=T.sub;ctx.font='600 20px Inter, sans-serif';ctx.fillText('PÉCHÉ DOMINANT',500,712);
ctx.fillStyle=V==='neg'?'#111':d.c;ctx.font='900 44px Cinzel, serif';ctx.fillText(d.n.toUpperCase(),500,760);
// scores
const y0=800,rh=68;
C.ev.forEach((e,i)=>{const s=SINS[i],y=y0+i*rh;
ctx.strokeStyle=V==='neg'?'rgba(0,0,0,.15)':'rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(70,y);ctx.lineTo(930,y);ctx.stroke();
ctx.fillStyle=V==='neg'?'#111':s.c;ctx.beginPath();ctx.arc(86,y+28,9,0,7);ctx.fill();
ctx.textAlign='left';ctx.fillStyle=T.ink;ctx.font=(i===C.dom?'800':'600')+' 28px Inter, sans-serif';ctx.fillText(s.n,110,y+38);
ctx.fillStyle=T.sub;fitFont(ctx,e.rank,330,19,'500','Inter, sans-serif');ctx.fillText(e.rank,110,y+60);
// bar
const bx=470,bw=250,by=y+26;R(ctx,bx,by,bw,10,5);ctx.fillStyle=V==='neg'?'rgba(0,0,0,.15)':'rgba(255,255,255,.1)';ctx.fill();
if(e.num){const w=Math.min(e.v,100)/100*bw;if(w>0){R(ctx,bx,by,Math.max(w,10),10,5);ctx.fillStyle=V==='neg'?'#111':s.c;ctx.fill();}
if(e.v>100){const ext=Math.min((e.v-100)/100,1)*60;ctx.save();ctx.shadowColor=s.c;ctx.shadowBlur=16;R(ctx,bx+bw-6,by-3,ext+12,16,8);ctx.fillStyle=s.c;ctx.fill();ctx.restore();}}
else if(e.glitch){for(let k=0;k<7;k++){ctx.fillStyle=k%2?'#00f0ff':'#ff2bd6';ctx.fillRect(bx+k*36,by+(k%3-1)*4,22,10);}}
else if(!e.neg){R(ctx,bx,by,bw,10,5);ctx.fillStyle=e.shiny||e.inf?rainbow(ctx,bx,0,bx+bw,0):gold(ctx,bx,0,bx+bw,0);ctx.fill();}
else{ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx,by+5);ctx.lineTo(bx+bw,by+5);ctx.setLineDash([6,8]);ctx.stroke();ctx.setLineDash([]);}
// value
ctx.textAlign='right';
if(e.num){ctx.font='600 18px Inter, sans-serif';const sw=ctx.measureText('/100').width;ctx.fillStyle=T.sub;ctx.fillText('/100',930,y+44);
ctx.font='700 40px Cinzel, serif';ctx.fillStyle=e.v>100?(V==='neg'?'#111':s.c):T.ink;if(e.v>100){ctx.shadowColor=s.c;ctx.shadowBlur=14;}ctx.fillText(e.disp,926-sw,y+46);ctx.shadowBlur=0;}
else{ctx.font='800 22px Inter, sans-serif';const tw=Math.min(ctx.measureText(e.disp).width,170);const cw=tw+28,cx2=930-cw;R(ctx,cx2,y+14,cw,40,20);
let fg='#111';if(e.glitch){ctx.fillStyle='#0a0f12';ctx.fill();ctx.strokeStyle='#00f0ff';ctx.lineWidth=2;ctx.stroke();fg='#fff';}
else if(e.neg){ctx.fillStyle='#111';ctx.fill();fg='#fff';}
else if(e.shiny||e.inf){ctx.fillStyle=rainbow(ctx,cx2,0,930,0);ctx.fill();}
else{ctx.fillStyle=gold(ctx,cx2,0,930,0);ctx.fill();}
ctx.textAlign='center';if(e.glitch){ctx.fillStyle='#ff2bd6';ctx.fillText(e.disp,cx2+cw/2-2,y+42,170);ctx.fillStyle='#00f0ff';ctx.fillText(e.disp,cx2+cw/2+2,y+42,170);}
ctx.fillStyle=fg;ctx.fillText(e.disp,cx2+cw/2,y+42,170);}
});
// footer
ctx.strokeStyle=V==='neg'?'rgba(0,0,0,.3)':'rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(70,1290);ctx.lineTo(930,1290);ctx.stroke();
const dt=card.date?card.date.split('-').reverse().join('/'):'';
ctx.fillStyle=T.sub;ctx.font='600 20px Inter, sans-serif';ctx.textAlign='left';ctx.fillText('TEST DU '+dt,70,1328);
ctx.textAlign='right';ctx.fillText(C.id,930,1328);
ctx.textAlign='center';ctx.font='italic 500 17px Inter, sans-serif';ctx.fillText('Tout le monde a un péché.',500,1328);
// foil
if(V!=='classic'){ctx.globalCompositeOperation=V==='neg'?'multiply':'screen';
for(let k=-2;k<6;k++){const g=ctx.createLinearGradient(k*260,0,k*260+500,700);const col=V==='legendary'?'rgba(255,240,190,':V==='neg'?'rgba(40,90,120,':'rgba(160,220,255,';g.addColorStop(0,col+'0)');g.addColorStop(.5,col+(V==='shiny'?'.14)':'.10)'));g.addColorStop(1,col+'0)');ctx.fillStyle=g;ctx.fillRect(0,0,1000,1400);}
ctx.globalCompositeOperation='source-over';
if(V==='shiny'){for(let k=0;k<16;k++){const a=(hash(C.id+k)%628)/100,dd=200+hash(k+C.id)%110,x=500+Math.cos(a)*dd*1.25,y=482+Math.sin(a)*dd*.8,r=2+(k%4)*1.6;ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.moveTo(x,y-r*3);ctx.lineTo(x+r*.6,y-r*.6);ctx.lineTo(x+r*3,y);ctx.lineTo(x+r*.6,y+r*.6);ctx.lineTo(x,y+r*3);ctx.lineTo(x-r*.6,y+r*.6);ctx.lineTo(x-r*3,y);ctx.lineTo(x-r*.6,y-r*.6);ctx.closePath();ctx.fill();}}}
ctx.restore();ctx.restore();
return C;
}


export { compute, draw, sigil, RAR, RARC, rainbow };
