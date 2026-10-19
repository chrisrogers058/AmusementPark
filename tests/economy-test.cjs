const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0];
const fields=new Map();const document={getElementById:id=>{if(!fields.has(id))fields.set(id,{addEventListener(){},value:0});return fields.get(id)},addEventListener(){},querySelectorAll(){return []}};
const marker='setupDashboard();\nstate=load();';assert(source.includes(marker));
const instrumented=source.slice(0,source.indexOf(marker))+'globalThis.engine={calculate,weatherFor,defaults,catalog,modes,gameOver,goalForecast,overheadFor,assetUpkeep,upgrades,campaigns,marketingPlan,setState:s=>state=s};})();';
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
  const choices=[];for(const factor of [.75,1,1.15])for(const marketing of [0,25,75,150]){const prices={...e.defaults,marketing};for(const k of Object.keys(prices))if(k!=='marketing')prices[k]*=factor;choices.push(e.calculate(prices,day,e.weatherFor(day)))}
  const r=choices.sort((a,b)=>b.profit-a.profit)[0];s.bank=r.bankAfter;s.satisfaction=r.satisfactionAfter;s.day++;
 }
 console.log({strategy:'adjust price/campaign to weather; invest with reserve',difficulty,cash:s.bank,happiness:s.satisfaction});assert(s.bank>=e.modes[difficulty].goal&&s.satisfaction>=e.modes[difficulty].happiness,'A disciplined investment strategy must be able to win '+difficulty);
}

s=fresh('normal');s.builtRides={cups:{price:3}};e.setState(s);const fairRide=e.calculate(e.defaults,1,e.weatherFor(1));s.builtRides.cups.price=50;const gouged=e.calculate(e.defaults,1,e.weatherFor(1));assert(gouged.extraRides.cups.revenue<fairRide.extraRides.cups.revenue,'Custom ride prices must not offer unlimited revenue');

const g={goal:1000,happiness:70};
const predicted=(cash,happiness,profit=0)=>e.goalForecast({bank:cash,day:2,satisfaction:happiness,history:[{day:1,profit,satisfactionBefore:happiness,satisfactionAfter:happiness}]},g);
assert.equal(predicted(1000,70).status,'on-track');assert.equal(predicted(1001,71).status,'ahead');assert.equal(predicted(999,90).status,'behind');assert.equal(predicted(2000,69).status,'behind');assert.equal(predicted(100,70,100).cash,3000);
assert.equal(e.goalForecast({bank:100,day:1,history:[]},g).status,'waiting');assert.equal(e.goalForecast({bank:1001,day:31,satisfaction:71,history:[{day:30,profit:999}]},g).cash,1001);
console.log('PASS: forecast categories, separate cash/happiness requirements, no-history and day-30 boundaries');

let park=fresh('normal'),previous=e.overheadFor(park,1).total;
for(const ride of e.catalog){park.builtRides[ride.id]={price:ride.price};const next=e.overheadFor(park,1);assert(next.total>previous);previous=next.total}
for(const upgrade of e.upgrades){park.upgrades[upgrade.id]=true;const next=e.overheadFor(park,1);assert(next.total>previous);previous=next.total}
const total=e.overheadFor(park,1);assert.equal(total.total,Object.values(total.breakdown).reduce((a,b)=>a+b,0));assert(e.overheadFor(park,1.12).total>total.total);
console.log('PASS: every ride and upgrade raises overhead and reconciles to expense categories');

s=fresh('normal');s.bank=10000;e.setState(s);let attendance=0;
for(const campaign of e.campaigns){const result=e.calculate({...e.defaults,marketing:campaign.cost},1,e.weatherFor(1));assert.equal(result.marketingCost,campaign.cost);assert.equal(result.marketingName,campaign.name);assert(result.guests>=attendance);attendance=result.guests}
assert.equal(e.marketingPlan(100).cost,75);assert.equal(e.marketingPlan(-1).cost,0);assert.equal(e.campaigns.filter(c=>c.cost>0).length,5);
console.log('PASS: campaign costs and demand, legacy-budget migration and no-advertising option');
