const { chromium } = require('playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1366,height:900},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 const go=async id=>page.locator('#nav-'+id).click();
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('apmSave')));
 const namePark=async(name='Rogers Adventure Park')=>{if(await page.locator('#parkNameDialog').isVisible()){await page.locator('#parkNameInput').fill(name);await page.locator('#parkNameForm button').click()}};
 const seed=async data=>{await page.evaluate(d=>localStorage.setItem('apmSave',JSON.stringify(d)),data);await page.reload();await namePark()};
 fs.mkdirSync('test-results',{recursive:true});
 try{
 await page.goto('file://'+process.cwd()+'/index.html');
 assert(await page.locator('#parkNameDialog').isVisible());assert(await page.locator('#openBtn').isDisabled());
 await page.locator('#parkNameInput').fill('   ');await page.locator('#parkNameForm button').click();assert(await page.locator('#parkNameDialog').isVisible());
 await page.keyboard.press('Escape');assert(await page.locator('#parkNameDialog').isVisible());
 await namePark('Rogers & Kids <Adventure>');assert.equal(await page.locator('.park-gate').innerText(),'Rogers & Kids <Adventure>');assert.equal(await page.locator('.park-gate img').count(),0);
 await page.reload();assert(!(await page.locator('#parkNameDialog').isVisible()));assert.match(await page.locator('header h1').innerText(),/Rogers & Kids/);
 
 assert(await page.locator('#openBtn').isVisible());assert.equal(await page.locator('.park-map').count(),1);assert(await page.locator('.park-map path').count()>25);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.map-wheel').evaluate(el=>getComputedStyle(el).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
 for(const id of ['prices','build','reports','park']){await go(id);assert(await page.locator('#screen-'+id).isVisible())}
 await go('prices');if(await page.locator('#advancedPrices').count())await page.locator('#advancedPrices summary').click();
 for(const id of ['admission','coaster','pirate','water','hotdog','soda','fries']){
 const before=Number(await page.locator('#'+id).inputValue());
 await page.locator(`[data-adjust="${id}"]`).last().click();assert(Number(await page.locator('#'+id).inputValue())>before);
 await page.locator(`[data-adjust="${id}"]`).first().click();assert.equal(Number(await page.locator('#'+id).inputValue()),before);
 }
 await page.locator('#marketing').selectOption('25');assert.match(await page.locator('#marketingLabel').innerText(),/25/);
 await go('park');await page.locator('#openBtn').click();assert.equal(await page.locator('#dayNumber').innerText(),'2');
 await go('reports');assert(await page.locator('#ledgerContent tr').count()>1);
 const balance=(await saved()).bank;await page.reload();assert.equal((await saved()).bank,balance);
 const downloadPromise=page.waitForEvent('download');await page.locator('#exportBtn').click();const dl=await downloadPromise;assert(dl.suggestedFilename().endsWith('.csv'));
 const base={bank:10000,day:1,history:[],last:null,builtRides:{},purchases:[],upgrades:{},upgradePurchases:[]};
 await seed(base);await go('build');
 for(const category of ['Family','Thrill','Junior','All']){await page.locator(`[data-category="${category}"]`).click();assert.equal(await page.locator('.ride-tile').count(),category==='All'?12:4)}
 for(const id of ['paths1','paths2','green1','green2','market1','market2']){const btn=page.locator(`[data-upgrade="${id}"]`);assert(await btn.isEnabled());const before=await page.locator('#fixedCosts').innerText();await btn.click();assert(await btn.isDisabled());assert.notEqual(await page.locator('#fixedCosts').innerText(),before)}
 for(const id of ['carousel','ferris','train','bumper','drop','loop','swing','rapids','cups','mini','planes','frogs']){const btn=page.locator(`[data-build="${id}"]`);assert(await btn.isEnabled());const before=await page.locator('#fixedCosts').innerText();await btn.click();assert(await btn.isDisabled());assert.notEqual(await page.locator('#fixedCosts').innerText(),before)}
 await page.locator('[data-ride-price="cups"]').fill('4');await page.locator('[data-ride-price="cups"]').dispatchEvent('change');assert.equal((await saved()).builtRides.cups.price,4);
 await go('park');await page.locator('#openBtn').click();await go('reports');assert.match(await page.locator('#reportContent').innerText(),/Tea Cups/);
 await go('park');assert(await page.locator('#goalStatus').isVisible());assert.equal(await page.locator('[data-series=profit]').count(),1);assert.equal(await page.locator('[data-series=happiness]').count(),1);
 page.once('dialog',d=>d.accept());await page.locator('#newGameBtn').click();await namePark();assert.equal((await saved()).day,1);assert.equal(Object.keys((await saved()).builtRides).length,0);
 // Feature-specific checks are added with the corresponding branch.
 if(await page.locator('[data-strategy]').count()){
 await go('prices');await page.locator('[data-strategy="budget"]').click();const low=Number(await page.locator('#admission').inputValue());
 await page.locator('[data-strategy="premium"]').click();assert(Number(await page.locator('#admission').inputValue())>low);
 await page.reload();assert.equal(await page.locator('[data-strategy="premium"]').getAttribute('aria-pressed'),'true');
 }
 if(await page.locator('#fixedCosts').count()){
 await seed(base);await go('park');await page.locator('#openBtn').click();const r=(await saved()).last;assert(r.fixedCost>=160);assert.equal(Math.round((r.revenue-r.expenses-r.profit)*100),0);
 }
 if(await page.locator('#happinessValue').count()){
 assert(Number.isFinite((await saved()).satisfaction));assert.match(await page.locator('#happinessValue').innerText(),/\d+/);
 }
 if(await page.locator('#difficulty').count()){
 await go('park');await page.locator('#difficulty').selectOption('expert');page.once('dialog',d=>d.accept());await page.locator('#newGameBtn').click();await namePark();assert.equal((await saved()).difficulty,'expert');assert.equal((await saved()).bank,100);
 await seed({...base,bank:100,day:30,difficulty:'expert',satisfaction:70});await go('park');await page.locator('#openBtn').click();assert(await page.locator('#openBtn').isDisabled());assert.match(await page.locator('#seasonGoal').innerText(),/Season ended|Bankrupt|Goal reached/);
 await seed({...base,bank:-1,difficulty:'expert'});assert(await page.locator('#openBtn').isDisabled());await go('build');assert(await page.locator('[data-build="cups"]').isDisabled());
 }

 // Exercise every campaign, its exact daily charge, and persistence.
 for(const cost of [0,25,75,150,300,500]){
 await seed({...base,parkName:'Campaign Test',bank:10000});await go('prices');await page.locator('#marketing').selectOption(String(cost));assert.equal((await saved()).bank,10000);assert.match(await page.locator('#marketingLabel').innerText(),new RegExp('\\$'+cost));
 await page.reload();await go('prices');assert.equal(await page.locator('#marketing').inputValue(),String(cost));await go('park');await page.locator('#openBtn').click();const r=(await saved()).last;assert.equal(r.marketingCost,cost);assert(r.marketingName);assert(Math.abs(r.revenue-r.expenses-r.profit)<.011);
 }
 await seed({...base,bank:100,prices:{admission:20,coaster:6,pirate:4,water:3,hotdog:5,soda:3,fries:4,marketing:100}});await go('prices');assert.equal(await page.locator('#marketing').inputValue(),'75');

 // New-season end-to-end run: all 30 days, consistent accounting, terminal lock, reload.
 if(await page.locator('#difficulty').count()){
 await seed({...base,bank:100,difficulty:'easy',satisfaction:70});
 for(let day=1;day<=30;day++){await go('park');await page.locator('#openBtn').click();const current=await saved();assert.equal(current.history.length,day);assert(Math.abs(current.last.revenue-current.last.expenses-current.last.profit)<.011)}
 await go('park');assert(await page.locator('#openBtn').isDisabled());assert.match(await page.locator('#seasonGoal').innerText(),/Goal reached|Season ended/);await page.reload();assert(await page.locator('#openBtn').isDisabled());
 // Clamp invalid custom prices, migrate old saves, recover malformed saves.
 await seed({...base,bank:100});await go('prices');await page.locator('#advancedPrices summary').click();await page.locator('#admission').fill('-100');assert.equal(await page.locator('#admission').inputValue(),'1');
 await page.locator('#hotdog').fill('900');assert.equal(await page.locator('#hotdog').inputValue(),'25');await page.reload();await go('prices');await page.locator('#advancedPrices summary').click();assert.equal(await page.locator('#hotdog').inputValue(),'25');
 await seed({bank:100,day:1,history:{}});assert.equal(await page.locator('#dayNumber').innerText(),'1');assert(await page.locator('#openBtn').isEnabled());
 // Forecast status boundaries are driven by both goals, and every historical day is plotted.
 await seed({...base,bank:10000});await go('park');await page.locator('#openBtn').click();const record={...(await saved()).last,day:1,profit:0,bankBefore:100,bankAfter:7500,satisfactionBefore:65,satisfactionAfter:65};
 for(const [cash,happiness,status] of [[7500,65,'on-track'],[7501,66,'ahead'],[7499,90,'behind'],[9000,64,'behind']]){await seed({...base,bank:cash,difficulty:'normal',satisfaction:happiness,day:2,last:{...record,bankAfter:cash,satisfactionBefore:happiness,satisfactionAfter:happiness},history:[{...record,bankAfter:cash,satisfactionBefore:happiness,satisfactionAfter:happiness}]});assert.equal(await page.locator('#goalStatus').getAttribute('data-status'),status);assert.equal(await page.locator('circle[data-day]').count(),1)}
 // Name length and exact text on the sign, headings, save and reload.
 await seed({...base,parkName:''}); // seed helper names the park before continuing.
 page.once('dialog',d=>d.accept());await page.locator('#newGameBtn').click();assert(await page.locator('#parkNameDialog').isVisible());await page.locator('#parkNameInput').fill('A'.repeat(60));assert.equal((await page.locator('#parkNameInput').inputValue()).length,40);await page.locator('#parkNameForm button').click();assert.equal((await saved()).parkName.length,40);assert.equal((await page.locator('.park-gate').innerText()).length,40);
 // Restore a useful park for screenshots, then exercise keyboard navigation.
 await seed({...base,bank:600,difficulty:'normal',satisfaction:78});await page.locator('#nav-park').focus();await page.keyboard.press('Tab');await page.keyboard.press('Enter');assert(await page.locator('#screen-prices').isVisible());
 }
 for(const width of [390,768,1366]){await page.setViewportSize({width,height:900});for(const id of ['park','prices','build','reports']){await go(id);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`test-results/${id}-${width}.png`,fullPage:true})}}
 assert.deepEqual(errors,[]);console.log('PASS: all navigation, pricing, purchases, simulation, save, export, reset, feature checks and responsive layouts; no JS errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
