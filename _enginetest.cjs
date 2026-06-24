const fs=require('fs'), path=require('path');
const h=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const start=h.indexOf('function mulberry32(');
const end=h.indexOf('/* ============================ UI / WIRING');
const block=h.slice(start,end);
const {runSim}=new Function(block+'\nreturn {runSim};')();

function P(over){return Object.assign({
  optimized:false, f_phase:true,f_night:true,f_cbm:true,f_pred:true,
  horizonYears:5, fleetTarget:43, ramp:1, hotReserve:4,
  depotBays:14, nightBays:14, latheCount:1, latheHoursPerDay:20,
  dailyRidership:50000, seasonAmp:0.20, weekendFactor:0.92,
  seats:450, loadFactor:0.70, maxTrips:5, oneWayKm:670,
  unsAddon:0.30, failRate:0.0015, failHours:18,
  reproKm:200000, reproBogies:16, reproHrPerBogie:1.2, seed:777 },over);}

const pc=v=>(v*100).toFixed(1)+'%';
function show(label,k){
  console.log(label.padEnd(26)+
    'avail '+pc(k.meanAvail)+'  min '+pc(k.minAvail)+'  >=89% '+pc(k.pctMeet)+
    '  peak '+k.maxMaint.toFixed(0)+'  avg '+k.meanMaint.toFixed(1)+
    '  dt '+k.meanDowntime.toFixed(2)+'d  km '+Math.round(k.realAnnualKm/1000)+'k');
}
const base=runSim(P({optimized:false})).kpis;
const opt =runSim(P({optimized:true})).kpis;
show('BASELINE',base);
show('OPTIMIZED (all on)',opt);
console.log('');
// isolate each technique (start from baseline, turn on one at a time within optimized)
const only=(flags)=>runSim(P(Object.assign({optimized:true,f_phase:false,f_night:false,f_cbm:false,f_pred:false},flags))).kpis;
show('opt + phase only',only({f_phase:true}));
show('opt + night only',only({f_night:true}));
show('opt + cbm only',only({f_cbm:true}));
show('opt + pred only',only({f_pred:true}));
console.log('');
// stress: high demand
show('BASE  high demand 90k',runSim(P({optimized:false,dailyRidership:90000})).kpis);
show('OPT   high demand 90k',runSim(P({optimized:true,dailyRidership:90000})).kpis);
console.log('');
// fewer bays stress
show('BASE  4 day bays',runSim(P({optimized:false,depotBays:4})).kpis);
show('OPT   4 day bays',runSim(P({optimized:true,depotBays:4})).kpis);

console.log('\n--- assertions ---');
const fails=[];
if(!(opt.meanAvail>base.meanAvail)) fails.push('optimized should beat baseline availability');
if(!(base.meanAvail>0.78 && base.meanAvail<0.95)) fails.push('baseline availability not in a credible 78-95% band: '+pc(base.meanAvail));
if(!(opt.meanAvail>0.92)) fails.push('optimized should clear ~92%+: '+pc(opt.meanAvail));
if(!(opt.maxMaint<=base.maxMaint)) fails.push('optimized peak should be <= baseline');
[base,opt].forEach((k,i)=>{ if(isNaN(k.meanAvail)) fails.push('NaN in '+(i?'opt':'base')); });
console.log(fails.length? 'FAIL: '+fails.join(' | ') : 'ALL PASSED');
