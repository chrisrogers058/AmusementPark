const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0];
const fields=new Map();const document={getElementById:id=>{if(!fields.has(id))fields.set(id,{addEventListener(){},value:0});return fields.get(id)},addEventListener(){},querySelectorAll(){return []}};
const marker='setupDashboard();\nstate=load();';assert(source.includes(marker));
const instrumented=source.slice(0,source.indexOf(marker))+'globalThis.engine={calculate,weatherFor,defaults,catalog,modes,gameOver,setState:s=>state=s};})();';
const context={document,console,setTimeout(){}};vm.runInNewContext(instrumented,context);const e=context.engine;
const fresh=difficulty=>({difficulty,bank:100,day:1,satisfaction:70,history:[],builtRides:{},upgrades:{}});
let s=fresh('normal');e.setState(s);const normal=e.calculate(e.defaults,1,e.weatherFor(1));
const high=e.calculate({...e.defaults,admission:100},1,e.weatherFor(1));assert(high.guests<normal.guests);assert(high.revenue<normal.revenue,'Maximum admission must not exploit the revenue model');
s.bank=1000;e.setState(s);const zero=e.calculate({...e.defaults,admission:100,coaster:50,pirate:50,water:50,hotdog:25,soda:25,fries:25,marketing:0},1,e.weatherFor(1));assert(zero.guests===0);assert(zero.expenses>=580);
for(const difficulty of Object.keys(e.modes)){
 for(const factor of [.75,1,1.35]){
 s=fresh(difficulty);e.setState(s);const p={...e.defaults};for(const k of Object.keys(p))if(k!=='marketing')p[k]*=factor;
 let losses=0;
 for(let day=1;day<=30&&s.bank>=0;day++){
 const r=e.calculate(p,day,e.weatherFor(day));assert(Number.isFinite(r.bankAfter));assert(Math.abs(r.revenue-r.expenses-r.profit)<.011);assert(r.satisfactionAfter>=0&&r.satisfactionAfter<=100);if(r.profit<0)losses++;s.bank=r.bankAfter;s.satisfaction=r.satisfactionAfter;s.history.push(r);s.day++;
 }
 console.log(JSON.stringify({difficulty,strategy:factor,cash:s.bank,happiness:s.satisfaction,days:s.history.length,losses,won:s.bank>=e.modes[difficulty].goal&&s.satisfaction>=e.modes[difficulty].happiness}));
 }
}
s=fresh('normal');s.bank=10000;s.builtRides={cups:{price:3}};e.setState(s);const repair=e.calculate(e.defaults,9,e.weatherFor(9));assert.equal(repair.extraRides.cups.sold,0);assert.equal(repair.repairCost,70);assert(repair.fixedCost>normal.fixedCost);
s.bank=-1;assert(e.gameOver());console.log('PASS: financial reconciliation, no-guest overhead, price elasticity, maintenance, bankruptcy and nine full-season strategies');
for(const difficulty of ['normal','expert']){
 s=fresh(difficulty);e.setState(s);
 for(let day=1;day<=30&&s.bank>=0;day++){
  // Reserve cash before investing; diversify inexpensive rides before costly thrills.
  for(const ride of [...e.catalog].sort((a,b)=>a.build-b.build))if(!s.builtRides[ride.id]&&s.bank-ride.build>=500){s.bank-=ride.build;s.builtRides[ride.id]={price:ride.price}}
  for(const [id,cost] of [['paths1',60],['green1',75],['green2',180]])if(!s.upgrades[id]&&s.bank-cost>=500){s.bank-=cost;s.upgrades[id]=true}
  const r=e.calculate(e.defaults,day,e.weatherFor(day));s.bank=r.bankAfter;s.satisfaction=r.satisfactionAfter;s.day++;
 }
 console.log({strategy:'invest with reserve',difficulty,cash:s.bank,happiness:s.satisfaction});assert(s.bank>=e.modes[difficulty].goal&&s.satisfaction>=e.modes[difficulty].happiness,'A disciplined investment strategy must be able to win '+difficulty);
}

s=fresh('normal');s.builtRides={cups:{price:3}};e.setState(s);const fairRide=e.calculate(e.defaults,1,e.weatherFor(1));s.builtRides.cups.price=50;const gouged=e.calculate(e.defaults,1,e.weatherFor(1));assert(gouged.extraRides.cups.revenue<fairRide.extraRides.cups.revenue,'Custom ride prices must not offer unlimited revenue');
