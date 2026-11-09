export const WORLD = { width: 1800, height: 1300 };
export const STATION = { x: 250, y: 1020, radius: 108 };
export const MISSIONS = [
  {title:'First contact',subtitle:'Collect three samples',speed:138,capacity:3,kind:'sample',items:[[460,800],[920,520],[1350,880]],traps:[[730,870],[1130,760]],story:'Signal has reached an ancient Martian basin. Collect three soil samples and bring them to the Earth service station. Your rover drives forward automatically. Steer around rocks, and hold Down to brake.',lesson:'Drive over steady green canisters to collect them automatically. False signals flicker over rippling sand. Once all three samples are secured, press Enter at the cyan service station.'},
  {title:'A delivery gone wrong',subtitle:'Recover the storage upgrade',speed:170,capacity:3,kind:'upgrade',items:[[520,460],[1190,350],[1450,980]],traps:[[780,510],[1060,850],[1400,650]],story:'Earth needs more samples, but Signal only has three storage slots. A supply delivery has crash-landed across the basin. Recover two storage units and one toolkit, then bring all three to the Earth service station for installation.',lesson:'Your rover is faster now. Storage units and the toolkit are collected on contact. The upgrade is installed only after you deliver all three.'},
  {title:'The final collection',subtitle:'Bring five samples home',speed:198,capacity:5,kind:'sample',items:[[430,620],[820,300],[1380,350],[1490,930],[950,1030]],traps:[[630,410],[1100,480],[1260,950],[650,920]],story:'The extra storage is installed. Signal can now carry five samples. Collect all five across the basin, then deliver them safely to the Earth service station. Earth will receive the mission’s findings once the collection is secured.',lesson:'This is the fastest mission. Brake to plan a turn. Some promising sample signals are still hallucinations: watch the ground, not just the glow.'}
];
export function seeded(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class SignalGame {
 constructor(){this.totalDelivered=0;this.totalHits=0;this.load(0);this.mode='story';}
 load(level){this.level=level;this.mission=MISSIONS[level];this.lives=5;this.elapsed=0;this.cargo=[];this.cooldown=0;this.stun=0;this.message='';this.messageTime=0;this.pickupSerial=0;this.rover={x:250,y:1020,angle:-Math.PI/2,speed:0};this.safe={...this.rover};this.items=this.mission.items.map(([x,y],i)=>({x,y,id:i,collected:false,type:this.mission.kind==='upgrade'?(i===2?'toolkit':'storage'):'sample'}));this.traps=this.mission.traps.map(([x,y],i)=>({x,y,r:42+i%2*7}));const random=seeded(300+level*19);this.rocks=[];let attempts=0;while(this.rocks.length<26+level*4&&attempts++<1000){const rock={x:85+random()*1630,y:85+random()*1130,r:18+random()*21,rotation:random()*6.28,shape:random()};if([STATION,...this.items,...this.traps].every(p=>distance(p,rock)>(p===STATION?215:145))&&this.rocks.every(p=>distance(p,rock)>110))this.rocks.push(rock);}this.mode='story';this.event={type:'story',level};}
 start(){if(this.mode==='story'||this.mode==='paused'){this.mode='playing';this.event=null;}}
 pause(){if(this.mode==='playing'){this.mode='paused';this.rover.speed=0;this.event={type:'pause'};}}
 notify(text,duration=3){this.message=text;this.messageTime=duration;}
 get nearStation(){return distance(this.rover,STATION)<STATION.radius;}
 get required(){return this.items.length;}
 get complete(){return this.cargo.length===this.required;}
 update(dt,input={}){if(this.mode!=='playing')return;dt=Math.max(0,Math.min(dt,.05));this.elapsed+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.messageTime=Math.max(0,this.messageTime-dt);if(this.stun>0){this.stun=Math.max(0,this.stun-dt);this.rover.speed=0;return;}
 const turn=(input.right?1:0)-(input.left?1:0);this.rover.angle+=turn*2.3*dt;const target=input.brake?0:this.mission.speed;this.rover.speed+=Math.max(-600*dt,Math.min(240*dt,target-this.rover.speed));const before={...this.rover};this.rover.x+=Math.cos(this.rover.angle)*this.rover.speed*dt;this.rover.y+=Math.sin(this.rover.angle)*this.rover.speed*dt;
 const margin=45;if(this.rover.x<margin||this.rover.x>WORLD.width-margin||this.rover.y<margin||this.rover.y>WORLD.height-margin){this.rover.x=Math.max(margin,Math.min(WORLD.width-margin,this.rover.x));this.rover.y=Math.max(margin,Math.min(WORLD.height-margin,this.rover.y));this.rover.speed=0;this.notify('Basin boundary. Turn back toward the mission.',1.5);}
 const trap=this.traps.find(t=>distance(this.rover,t)<t.r+12);const rock=this.rocks.find(r=>distance(this.rover,r)<r.r+18);if(trap||rock){if(this.cooldown<=0){this.damage(trap?'False signal. Unstable sand!':'Rock impact.');return;}this.rover.x=before.x;this.rover.y=before.y;this.rover.speed=0;}
 else if(this.traps.every(t=>distance(this.rover,t)>t.r+95)&&this.rocks.every(r=>distance(this.rover,r)>r.r+75)){this.safe={...this.rover};}
 for(const item of this.items){if(!item.collected&&distance(this.rover,item)<37&&this.cargo.length<this.mission.capacity){item.collected=true;this.cargo.push(item);this.pickupSerial++;this.notify(item.type==='toolkit'?'Toolkit recovered.':item.type==='storage'?'Storage unit recovered.':`Sample ${this.cargo.length} secured.`,2);}}
 if(input.deliver)this.deliver();
 }
 damage(reason){this.lives--;this.totalHits++;this.cooldown=2;this.stun=.8;this.notify(`${reason} One life lost. Cargo retained.`,3.5);if(this.lives<=0){this.mode='gameover';this.rover.speed=0;this.event={type:'gameover'};return;}this.rover={...this.safe,angle:this.safe.angle+Math.PI,speed:0};}
 deliver(){if(this.mode!=='playing')return false;if(!this.nearStation){this.notify('Bring the cargo to the cyan service station, then press Enter.');return false;}if(!this.complete){this.notify(`Collect all ${this.required} mission items before delivery. ${this.cargo.length}/${this.required} secured.`);return false;}this.totalDelivered+=this.cargo.length;this.mode=this.level===2?'ending':'complete';this.rover.speed=0;this.event={type:this.mode};return true;}
 next(){if(this.mode==='complete'&&this.level<2)this.load(this.level+1);}
 retry(){if(this.mode==='gameover')this.load(this.level);}
 restart(){this.totalDelivered=0;this.totalHits=0;this.load(0);}
}
