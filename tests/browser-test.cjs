const { chromium } = require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1366,height:900},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('JS ERROR STACK',e.stack)});
 await page.goto('file://'+process.cwd()+'/index.html');
 const html=require('fs').readFileSync('index.html','utf8');const js=html.split('<script>')[1].split('</script>')[0];try{new(require('vm').Script)(js)}catch(e){console.log('SCRIPT SYNTAX',e.stack);throw e;}
 const check=async(c,msg)=>{if(!c)throw Error(msg)};
 await check(await page.locator('#openBtn').isEnabled(),'Open park button disabled');
 await page.locator('[data-adjust="admission"][data-delta="1"]').click();
 console.log('admission after +',await page.locator('#admission').inputValue(),'errors',errors);await check(await page.locator('#admission').inputValue()==='21','Admission + button failed');
 await page.locator('[data-adjust="admission"][data-delta="-1"]').click();
 await check(await page.locator('#admission').inputValue()==='20','Admission - button failed');
 await page.locator('#marketing').fill('25');
 await check((await page.locator('#marketingLabel').innerText()).includes('25'),'Marketing slider failed');
 await page.locator('#rideTabs [data-category="Junior"]').click();
 await check(await page.locator('#rideCatalog .ride-tile').count()===4,'Ride category tab failed');
 await page.locator('#rideTabs [data-category="All"]').click();
 await check(await page.locator('#rideCatalog .ride-tile').count()===12,'All rides tab failed');
 await page.locator('#openBtn').click();
 await check((await page.locator('#dayNumber').innerText())==='2','Day advance failed');
 await check(await page.locator('#ledgerContent tr').count()>=2,'Ledger failed');
 const money=await page.locator('#bankValue').innerText();await check(money!=='$100.00','Bank not updated');
 await check(await page.locator('#upgradeCatalog [data-upgrade="paths1"]').isEnabled(),'Paths upgrade should be affordable');
 await page.locator('#upgradeCatalog [data-upgrade="paths1"]').click();
 await check((await page.locator('#upgradeCount').innerText()).startsWith('1'),'Upgrade purchase failed');
 await page.locator('#rideCatalog [data-build="cups"]').click();
 await check((await page.locator('#rideCount').innerText()).startsWith('1'),'Ride construction failed');
 await page.locator('#rideCatalog [data-ride-price="cups"]').fill('4');
 await page.locator('#rideCatalog [data-ride-price="cups"]').dispatchEvent('change');
 await check((await page.locator('#rideCatalog [data-ride-price="cups"]').inputValue())==='4','Ride price change failed');
 await page.locator('#openBtn').click();
 await check((await page.locator('#reportContent').innerText()).includes('Tea Cups'),'New ride missing from report');
 const downloadPromise=page.waitForEvent('download');await page.locator('#exportBtn').click();const dl=await downloadPromise;await check(dl.suggestedFilename().endsWith('.csv'),'Export failed');
 page.once('dialog',d=>d.accept());await page.locator('#newGameBtn').click();
 await check((await page.locator('#dayNumber').innerText())==='1','Reset failed');
 await check((await page.locator('#rideCount').innerText()).startsWith('0'),'Ride reset failed');
 await check((await page.locator('#upgradeCount').innerText()).startsWith('0'),'Upgrade reset failed');

 // Exhaustively exercise each price +/- control and each ride/upgrade purchase button.
 await page.evaluate(()=>{localStorage.setItem('apmSave',JSON.stringify({bank:10000,day:1,history:[],last:null,builtRides:{},purchases:[],upgrades:{},upgradePurchases:[]}));});
 await page.reload();
 for(const id of ['admission','coaster','pirate','water','hotdog','soda','fries']){
   const before=Number(await page.locator('#'+id).inputValue());
   await page.locator('[data-adjust="'+id+'"][data-delta]:last-of-type').click();
   const increased=Number(await page.locator('#'+id).inputValue());
   await check(increased>before,id+' increase failed');
   await page.locator('[data-adjust="'+id+'"][data-delta]:first-of-type').click();
   await check(Number(await page.locator('#'+id).inputValue())===before,id+' decrease failed');
 }
 for(const category of ['Family','Thrill','Junior','All']){
   await page.locator('#rideTabs [data-category="'+category+'"]').click();
   await check(await page.locator('#rideCatalog .ride-tile').count()===(category==='All'?12:4),category+' tab failed');
 }
 for(const id of ['paths1','paths2','green1','green2','market1','market2']){
   const btn=page.locator('[data-upgrade="'+id+'"]');
   await check(await btn.isEnabled(),id+' purchase disabled unexpectedly');
   await btn.click();
   await check(await btn.isDisabled(),id+' not marked purchased');
 }
 for(const id of ['carousel','ferris','train','bumper','drop','loop','swing','rapids','cups','mini','planes','frogs']){
   const btn=page.locator('[data-build="'+id+'"]');
   await check(await btn.isEnabled(),id+' build disabled unexpectedly');
   await btn.click();
   await check(await btn.isDisabled(),id+' not marked built');
 }
 await check((await page.locator('#rideCount').innerText()).startsWith('12'),'Not all rides constructed');
 await check((await page.locator('#upgradeCount').innerText()).startsWith('6'),'Not all upgrades purchased');
 await page.locator('#openBtn').click();
 await check((await page.locator('#reportContent').innerText()).includes('Carousel'),'All-built ride report failed');
 await page.setViewportSize({width:390,height:844});
 await check(await page.locator('#openBtn').isVisible(),'Mobile open button invisible');
 await check(errors.length===0,'Browser errors: '+errors.join(' | '));
 console.log('PASS: pricing buttons, marketing, category tabs, day simulation, ledger, upgrades, construction, ride pricing, ride sales, CSV, reset, mobile viewport; zero JS errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});