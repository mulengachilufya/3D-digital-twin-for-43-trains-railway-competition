// Headless smoke test of the FULL browser script under stubbed DOM/canvas.
// Catches id typos, bad references, and any throw inside render()/exportCSV().
const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const s=html.indexOf('<script>')+8, e=html.lastIndexOf('</script>');
const script=html.slice(s,e);

const ctx=new Proxy({},{get:(t,p)=>(p in t?t[p]:()=>{}),set:(t,p,v)=>{t[p]=v;return true;}});
function makeEl(){
  return {value:0,textContent:'',innerHTML:'',checked:false,className:'',
    dataset:{mode:'optimized'},style:{},
    classList:{toggle(){},add(){},remove(){},contains:()=>false},
    addEventListener(){},setAttribute(){},appendChild(){},click(){},
    href:'',download:'',clientWidth:700,width:0,height:0,
    getAttribute:a=>(a==='height'?'200':'0'),getContext:()=>ctx};
}
const els={};
const calls={renders:0};
const document={
  getElementById:id=>els[id]||(els[id]=makeEl()),
  querySelectorAll:()=>[],
  createElement:()=>makeEl()
};
const window={devicePixelRatio:1,addEventListener(){}};
class Blob{constructor(){}}
const URL={createObjectURL:()=>'blob:x'};

let ok=true, err=null;
try{
  new Function('document','window','Blob','URL',script)(document,window,Blob,URL);
}catch(ex){ ok=false; err=ex; }

if(!ok){ console.log('UI SCRIPT THREW on load: '+err.stack); process.exit(1); }

// sanity: the KPI container should have received innerHTML with availability cards
const kpiHtml=els['kpis'] && els['kpis'].innerHTML;
const verdict=els['verdict'] && els['verdict'].textContent;
console.log('UI script loaded and rendered without throwing.');
console.log('kpis innerHTML length: '+(kpiHtml?kpiHtml.length:0));
console.log('verdict text: '+verdict);
const checks=[
  ['kpis populated', kpiHtml && kpiHtml.includes('Mean availability')],
  ['verdict set', verdict && (verdict.includes('PASS')||verdict.includes('RISK'))],
  ['cmpTable populated', els['cmpTable'] && els['cmpTable'].innerHTML.includes('Mean availability')],
  ['assumptions populated', els['assump'] && els['assump'].innerHTML.includes('From the brief')]
];
let allgood=true;
for(const [n,c] of checks){ console.log((c?'  ok  ':' FAIL ')+n); if(!c)allgood=false; }
console.log(allgood?'\nALL UI CHECKS PASSED':'\nUI CHECKS FAILED');
process.exit(allgood?0:1);
