/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — page logic, data and English content
*/
(function(){
"use strict";
const KEY="biz-starter-guide-v2";
const LANG_KEY="strike-right-lang";
/* Data freshness: one place to update the "Last verified" dates (YYYY-MM) */
const VERIFIED={llc:"2026-10",nexus:"2026-10",oklahoma:"2026-10",tulsa:"2026-10",texas:"2026-10",dallas:"2026-10"};
const REPORT_EMAIL="frandyslueue@gmail.com";
const ES=window.SR_ES||null;
let S={zip:"",state:"",city:"",type:"services",where:"home",hire:false,done:{},open:{},reach:"home",pick:[],letter:{},llcState:""};
let SAVED=null;
try{SAVED=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("biz-starter-guide-v1")||"null")}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}writeURL()}
const $=s=>document.querySelector(s);
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const L=(t,u)=>`<a href="${u}" target="_blank" rel="noopener">${t} ↗</a>`;
const SBA="https://www.sba.gov/business-guide/";
const LIC="https://www.careeronestop.org/Toolkit/Training/find-licenses.aspx";

/* ---------- Data ---------- */
const STATES=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
const CODES=["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const CODE_OF=Object.fromEntries(STATES.map((s,i)=>[s,CODES[i]])),STATE_OF=Object.fromEntries(CODES.map((c,i)=>[c,STATES[i]]));
const TYPES={software:"Software, app or SaaS",ecommerce:"Online store / e-commerce",services:"Professional services / consulting",retail:"Retail store or physical products",food:"Food or beverage",trades:"Construction / skilled trades",home:"Cleaning, lawn & home services",care:"Personal care, health or fitness",child:"Childcare or education",transport:"Delivery, moving or transportation",creative:"Creative, media or events",other:"Something else / not sure yet"};
const SHORT={software:"software and apps",ecommerce:"online stores",services:"professional services",retail:"retail",food:"food and beverage",trades:"construction and trades",home:"home services",care:"personal care and health",child:"childcare and education",transport:"transportation",creative:"creative work and events",other:"new businesses"};
const WHERE=["home","online","site","mobile"],REACH=["home","some","all"];
/* Allowlists: own-property / Set membership only, so keys like __proto__ or constructor never match */
const own=(o,k)=>typeof k==="string"&&Object.prototype.hasOwnProperty.call(o,k);
const STATE_SET=new Set(STATES),WHERE_SET=new Set(WHERE),REACH_SET=new Set(REACH);
const LETTER_TYPES=new Set(["advice","pilot","intro","partner","loi","program","followup"]);
const LETTER_FIELDS=new Set(["lName","lTitle","lBiz","lContact","lWhat","lToName","lToTitle","lToOrg","exHelp","exLen","exPrice","exGoal","exAfter","exProblem","exProof","exAsk","exGive","exUse","exQty","exWhen","exPrice2","exProgram","exStage","exUseFunds","exMet","exNext"]);
const isType=k=>own(TYPES,k),isState=k=>typeof k==="string"&&STATE_SET.has(k);
const stateOfCode=c=>{c=String(c||"").trim().toUpperCase();return own(STATE_OF,c)?STATE_OF[c]:null};
const isPlain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const boolMap=x=>{const o={};if(isPlain(x))for(const k of Object.keys(x))if(/^[A-Za-z0-9 -]{1,40}$/.test(k)&&typeof x[k]==="boolean")o[k]=x[k];return o};
const statesOf=x=>Array.isArray(x)?[...new Set(x.filter(isState))]:[];
/* Field-by-field cleanup of anything read from localStorage; bad or missing values fall back to defaults */
function normalize(d){
  const n={zip:"",state:"",city:"",type:"services",where:"home",hire:false,done:{},open:{},reach:"home",pick:[],letter:{},llcState:""};
  if(!isPlain(d))return n;
  if(typeof d.zip==="string")n.zip=d.zip.replace(/\D/g,"").slice(0,5);
  if(isState(d.state))n.state=d.state;
  if(typeof d.city==="string")n.city=d.city.trim().slice(0,80);
  const ty=d.type==="online"?"software":d.type;if(isType(ty))n.type=ty;
  if(WHERE_SET.has(d.where))n.where=d.where;
  n.hire=d.hire===true;
  n.done=boolMap(d.done);n.open=boolMap(d.open);
  if(REACH_SET.has(d.reach))n.reach=d.reach;
  n.pick=statesOf(d.pick);
  if(isPlain(d.letter)){for(const k of Object.keys(d.letter))if(LETTER_FIELDS.has(k)&&typeof d.letter[k]==="string")n.letter[k]=d.letter[k].slice(0,2000);
    if(LETTER_TYPES.has(d.letter.type))n.letter.type=d.letter.type}
  if(isState(d.llcState))n.llcState=d.llcState;
  return n;
}
S=normalize(SAVED);

/* ---------- Language ---------- */
const QP=new URLSearchParams(location.search);
let LANG="en";
try{LANG=localStorage.getItem(LANG_KEY)||"en"}catch(e){}
const LANGS=new Set(["en","es"]);
if(LANGS.has(QP.get("lang")))LANG=QP.get("lang");
if(LANG!=="es"||!ES)LANG="en";
const es=()=>LANG==="es"&&ES;
/* Interface strings built in JS. Spanish versions live in i18n-es.js (SR_ES.ui) under the same keys. */
const UI={
  chooseState:"Choose a state…",zipEmpty:"Fills in your state",zipMore:"Keep typing…",zipBad:"Not a U.S. state ZIP. Pick your state instead.",zipOk:st=>"✓ "+st+" (change below if wrong)",
  planTitle:loc=>loc?`Starting checklist for ${loc}`:"Starting checklist",
  planLead:(sh,hire,st)=>`Tailored for ${sh}${hire?", with hiring":""}${st?"":". Choose your state above for state-specific notes"}. Work top to bottom; free help comes first.`,
  done:(n,m)=>`${n} of ${m} done`,phaseDone:"✓ Done",phaseCount:(k,m)=>k+" of "+m,expandAll:"Expand all",collapseAll:"Collapse all",
  tapClear:"Tap again to clear",clearChecks:"Clear checks",clearFields:"Clear fields",copied:"Copied",selectCopy:"Select text to copy",copy:"Copy",
  phone:"Phone",email:"Email",address:"Address",bestFit:"Best fit",
  verified:"Last verified:",report:"Report outdated info",
  helpLead:(sh,st)=>`Filtered for ${sh}${st?" in "+st:""}. Resources built specifically for your type are marked “Best fit”; general resources that serve every business appear too.`,
  hiddenCount:n=>`${n} resource${n===1?" aimed at other business types is":"s aimed at other business types are"} hidden.`,
  showingAll:"Showing every resource, including ones aimed at other business types.",showAll:"Show all",showMatches:"Show only matches",
  gTulsa:"Tulsa area",gTulsaSub:"Local programs and offices",gOk:"Across Oklahoma",gOkSub:"State programs and offices",
  gDallas:"Dallas area",gDallasSub:"Local programs and offices",gTx:"Across Texas",gTxSub:"State programs and offices",gUs:"Across the U.S.",gUsSub:"Available in every state",
  tulsaTech:`<strong>Best first move for a Tulsa tech founder:</strong> contact OCN and i2E, then Gradient and Build in Tulsa. Say you're a Tulsa-based founder with little startup capital and ask which open program accepts founders at your stage.`,
  tulsaHint:"In the Tulsa area? Enter a Tulsa-area city or ZIP above to see Tulsa programs too.",
  dallasHint:"In the Dallas area? Enter a Dallas-area city or ZIP above to see Dallas programs too.",
  appReality:`<strong>Reality check for app founders:</strong> an app idea alone rarely qualifies for innovation grants. Programs help more when you can show a real customer problem, demand, technical innovation or a path to jobs. Don't pay for an accelerator before confirming its terms and fit.`,
  arch:d=>d>0?`ARCH deadline Nov 20, 2026 · ${d} day${d===1?"":"s"} left`:d===0?"ARCH deadline is today":"ARCH deadline (Nov 20, 2026) has passed; ask about the next cohort",
  llcDocSub:"The document you file to form the LLC.",llcFee:"Filing fee",llcFeeSub:"One time, state fee",llcOngoing:"Ongoing cost",llcFiling:"Ongoing filing",llcNexus:"Out-of-state sellers collect sales tax after",
  llcSpecial:"Special rules:",llcNone:st=>`No publication requirement or unusual state tax noted for ${st}.`,llcOffice:st=>`Find the ${st} filing office ↗`,llcCopy:"Copy summary",
  llcSummary:(st,doc,fee,filing,ong,timing,special)=>`${st} LLC: ${doc}, filing fee ${fee}; ongoing: ${filing} (${ong}), ${timing}.${special?" "+special:""}`,
  llcAsOf:m=>`State fees as listed in ${m}.`,noMatch:"No state matches.",
  none:"None",perYear:"/yr",noSalesTax:"No statewide sales tax",nexus:(base,n,conj)=>n?`${base} in sales ${conj==="and"?"and":"or"} ${n} transactions`:`${base} in sales`,
  pickCount:n=>n?`${n} state${n===1?"":"s"} selected`:"Select the states where you'll sell",
  letterCopied:"Letter copied.",letterSelect:"Select the letter text and copy it.",emailCopied:"Email version copied.",emailFail:"Couldn't copy automatically.",fieldsCleared:"Fields cleared.",
  eg:ph=>"e.g. "+ph,
  sTulsa:"Free help – Tulsa area",sOk:"Free help – Across Oklahoma",sDallas:"Free help – Dallas area",sTx:"Free help – Across Texas",sLlc:"LLC by state",sNexus:"Selling across states – sales tax table"
};
const u=(k,...a)=>{const src=es()&&ES.ui[k]!==undefined?ES.ui[k]:UI[k];return typeof src==="function"?src(...a):src};
const TY=k=>es()?ES.TYPES[k]:TYPES[k],SH=k=>es()?ES.SHORT[k]:SHORT[k];
const locale=()=>LANG==="es"?"es-US":"en-US";
function monthText(ym){const [y,m]=ym.split("-").map(Number);return new Date(y,m-1,1).toLocaleDateString(locale(),{month:"long",year:"numeric"})}
/* "Last verified" line with a mailto link. Subjects stay in English so reports are easy to sort. */
function freshHTML(section,key,state){
  const subj=`Outdated info: ${section}${state?" ("+state+")":""}${LANG==="es"?" [ES]":""}`;
  return `<span>${u("verified")} <span class="when">${monthText(VERIFIED[key])}</span></span><a href="mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subj)}">${u("report")}</a><span class="addr">${REPORT_EMAIL}</span>`;
}

/* ---------- Shareable plan links ---------- */
const PLAN_PARAMS=["zip","state","city","type","where","hire","reach","picks"];
if(PLAN_PARAMS.some(p=>QP.has(p))){
  /* A shared plan replaces the saved plan choices; checkmarks and letter drafts stay */
  Object.assign(S,{zip:"",state:"",city:"",type:"services",where:"home",hire:false,reach:"home",pick:[]});
  const z=(QP.get("zip")||"").replace(/\D/g,"").slice(0,5);if(z)S.zip=z;
  const st=stateOfCode(QP.get("state"));if(st){S.state=st;S.llcState=st}
  S.city=(QP.get("city")||"").trim().slice(0,80);
  if(isType(QP.get("type")))S.type=QP.get("type");
  if(WHERE_SET.has(QP.get("where")))S.where=QP.get("where");
  S.hire=["1","true","yes"].includes((QP.get("hire")||"").toLowerCase());
  if(REACH_SET.has(QP.get("reach")))S.reach=QP.get("reach");
  S.pick=statesOf((QP.get("picks")||"").split(",").map(stateOfCode));
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
}
/* Only plan choices go in the URL: never letter fields, names, emails or phone numbers */
function planQuery(){
  const p=new URLSearchParams();
  if(S.zip)p.set("zip",S.zip);if(S.state)p.set("state",CODE_OF[S.state]);if(S.city)p.set("city",S.city);
  if(S.type!=="services")p.set("type",S.type);if(S.where!=="home")p.set("where",S.where);if(S.hire)p.set("hire","1");
  if(S.reach!=="home")p.set("reach",S.reach);if(S.reach==="some"&&S.pick.length)p.set("picks",S.pick.map(s=>CODE_OF[s]).join(","));
  if(LANG==="es")p.set("lang","es");
  return p.toString().replace(/%2C/gi,",");
}
function writeURL(){
  const q=planQuery(),next=location.pathname+(q?"?"+q:"")+location.hash;
  if(next!==location.pathname+location.search+location.hash){try{history.replaceState(null,"",next)}catch(e){}}
}
const planLink=()=>{const q=planQuery();return location.origin+location.pathname+(q?"?"+q:"")};

/* LLC: [filing fee, ongoing $/yr (null = none), ongoing filing, timing, special rules] — as listed Oct 2026 */
const CERT_FORM=["Delaware","Maine","Mississippi","New Hampshire","New Jersey","Texas","Washington"];
const CERT_ORG=["Connecticut","Massachusetts","Pennsylvania"];
const LLC={
"Alabama":[200,0,"Business privilege tax return","Yearly","No report fee; the privilege tax is based on net worth and may be small or zero."],
"Alaska":[250,50,"Biennial report ($100)","Every 2 years, due Jan 2",""],
"Arizona":[50,null,"No annual report","—","Must publish notice of formation unless the LLC's statutory agent or place of business is in Maricopa or Pima County."],
"Arkansas":[45,150,"Annual franchise tax report","Yearly, due May 1",""],
"California":[70,810,"$800 annual LLC tax + Statement of Information ($20 every 2 years)","Tax yearly; first SOI within 90 days of forming","$800 minimum franchise tax every year, even with no income."],
"Colorado":[50,25,"Periodic report","Yearly, around your formation month",""],
"Connecticut":[120,80,"Annual report","Yearly, Jan 1–Mar 31",""],
"Delaware":[110,400,"Annual LLC tax","Yearly, due June 1","Annual tax rose from $300 to $400 in 2026. Forming here doesn't avoid registering in the state where you actually operate."],
"District of Columbia":[99,150,"Biennial report ($300)","Every 2 years, due Apr 1",""],
"Florida":[125,138.75,"Annual report","Yearly, Jan 1–May 1","$400 late fee after May 1."],
"Georgia":[110,50,"Annual registration","Yearly, Jan 1–Apr 1",""],
"Hawaii":[50,15,"Annual report","Yearly, by the end of your formation quarter",""],
"Idaho":[100,0,"Annual report (no fee)","Yearly, by end of anniversary month",""],
"Illinois":[150,75,"Annual report","Yearly, before anniversary month",""],
"Indiana":[75,15.5,"Business entity report ($31)","Every 2 years, anniversary month",""],
"Iowa":[50,15,"Biennial report ($30)","Every 2 years, odd years, by Apr 1",""],
"Kansas":[85,45,"Information report ($90)","Every 2 years, by Apr 15",""],
"Kentucky":[40,15,"Annual report","Yearly, Jan 1–Jun 30",""],
"Louisiana":[125,35,"Annual report","Yearly, on formation anniversary",""],
"Maine":[175,85,"Annual report","Yearly, due June 1",""],
"Maryland":[100,300,"Annual report / personal property return","Yearly, due Apr 15",""],
"Massachusetts":[500,500,"Annual report","Yearly, by formation anniversary","Among the most expensive states to form and keep an LLC."],
"Michigan":[50,25,"Annual statement","Yearly, due Feb 15",""],
"Minnesota":[135,0,"Annual renewal (no fee)","Yearly, by Dec 31","Filing fee may be higher online."],
"Mississippi":[50,0,"Annual report (no fee)","Yearly, Jan 1–Apr 15",""],
"Missouri":[50,null,"No annual report","—",""],
"Montana":[35,20,"Annual report","Yearly, due Apr 15",""],
"Nebraska":[100,12.5,"Biennial report ($25)","Every 2 years, odd years, by Apr 1","Must publish notice of formation in a local newspaper for 3 weeks and file proof of publication."],
"Nevada":[425,350,"Annual list + state business license","Yearly, by end of anniversary month","Filing total includes the initial list and the $200 state business license."],
"New Hampshire":[100,100,"Annual report","Yearly, due Apr 1",""],
"New Jersey":[125,75,"Annual report","Yearly, by end of anniversary month",""],
"New Mexico":[50,null,"No annual report","—",""],
"New York":[200,4.5,"Biennial statement ($9)","Every 2 years","Must publish notice in two newspapers for six weeks within 120 days, then file a $50 Certificate of Publication. Publication can cost hundreds to over $1,000 depending on county. A written operating agreement is required."],
"North Carolina":[125,203,"Annual report","Yearly, due Apr 15",""],
"North Dakota":[135,50,"Annual report","Yearly, due Nov 15",""],
"Ohio":[99,null,"No annual report","—",""],
"Oklahoma":[100,25,"Annual certificate","Yearly, on formation anniversary",""],
"Oregon":[100,100,"Annual report","Yearly, on formation anniversary",""],
"Pennsylvania":[125,7,"Annual report","Yearly, Jan 1–Sep 30",""],
"Rhode Island":[150,450,"Annual report ($50) + minimum business tax ($400)","Yearly, Feb 1–May 1","$400 minimum business tax every year on top of the report."],
"South Carolina":[110,null,"No annual report","—",""],
"South Dakota":[150,70,"Annual report","Yearly, first day of anniversary month",""],
"Tennessee":[300,400,"Annual report + franchise & excise tax","Yearly, due Apr 1 (Dec fiscal year)","Filing and annual report are $50 per member, $300 minimum. Franchise tax minimum $100 yearly."],
"Texas":[300,0,"Public Information Report (or Ownership Information Report) at or below the no-tax-due threshold; franchise tax report above it","Yearly, due May 15","Every Texas LLC files every year by May 15. At or below the no-tax-due threshold ($2.65 million for 2026 and 2027 reports), file only the Public Information Report or Ownership Information Report; the No Tax Due Report is no longer filed. Above the threshold, file the franchise tax report."],
"Utah":[59,18,"Annual renewal","Yearly, on formation anniversary",""],
"Vermont":[155,45,"Annual report","Yearly, within 3 months of fiscal year end",""],
"Virginia":[100,50,"Annual registration fee","Yearly, by end of formation month",""],
"Washington":[180,70,"Annual report","Yearly, by end of anniversary month",""],
"West Virginia":[100,25,"Annual report","Yearly, Jan 1–Jul 1",""],
"Wisconsin":[130,25,"Annual report","Yearly, by end of formation quarter",""],
"Wyoming":[100,60,"Annual report (license tax)","Yearly, first day of anniversary month","$60 minimum; more if Wyoming assets exceed $300,000."]
};
const docNameEn=st=>CERT_FORM.includes(st)?"Certificate of Formation":CERT_ORG.includes(st)?"Certificate of Organization":"Articles of Organization";
const docName=st=>es()?ES.docName(docNameEn(st)):docNameEn(st);
/* LLC text fields in the current language: [ongoing filing, timing, special rules] */
const llcText=st=>{const d=LLC[st],x=es()&&ES.llc[st];return x?x:[d[2],d[3],d[4]]};

/* Sales tax economic nexus, Oct 2026: [threshold, transactions, "or"/"and", note]; null = no statewide sales tax */
const NEXUS={"Alabama":[250000,0],"Alaska":[100000,0,"","Local sales taxes only, through the Alaska Remote Seller Sales Tax Commission"],"Arizona":[100000,0],"Arkansas":[100000,200,"or"],"California":[500000,0],"Colorado":[100000,0],"Connecticut":[100000,200,"and"],"Delaware":null,"District of Columbia":[100000,200,"or"],"Florida":[100000,0],"Georgia":[100000,200,"or"],"Hawaii":[100000,200,"or"],"Idaho":[100000,0],"Illinois":[100000,0,"","Transaction test removed Jan 1, 2026"],"Indiana":[100000,0],"Iowa":[100000,0],"Kansas":[100000,0],"Kentucky":[100000,0,"","Transaction test removed Aug 1, 2026"],"Louisiana":[100000,0],"Maine":[100000,0],"Maryland":[100000,200,"or"],"Massachusetts":[100000,0],"Michigan":[100000,200,"or"],"Minnesota":[100000,200,"or"],"Mississippi":[250000,0],"Missouri":[100000,0],"Montana":null,"Nebraska":[100000,200,"or"],"Nevada":[100000,200,"or"],"New Hampshire":null,"New Jersey":[100000,200,"or"],"New Mexico":[100000,0],"New York":[500000,100,"and"],"North Carolina":[100000,0],"North Dakota":[100000,0],"Ohio":[100000,200,"or"],"Oklahoma":[100000,0],"Oregon":null,"Pennsylvania":[100000,0],"Rhode Island":[100000,200,"or"],"South Carolina":[100000,0],"South Dakota":[100000,0],"Tennessee":[100000,0],"Texas":[500000,0],"Utah":[100000,0],"Vermont":[100000,200,"or"],"Virginia":[100000,200,"or"],"Washington":[100000,0],"West Virginia":[100000,200,"or"],"Wisconsin":[100000,0],"Wyoming":[100000,0]};
const money=n=>"$"+(n%1?n.toFixed(2):n.toLocaleString("en-US"));
const nexusText=st=>{const n=NEXUS[st];if(n===null)return u("noSalesTax");return u("nexus",money(n[0]),n[1],n[2])};
const nexusNote=st=>{const n=NEXUS[st];return (es()&&ES.nexusNote[st])||(n&&n[3])||""};
const ongoing=d=>d[1]===null?u("none"):d[1]===0?"$0":money(d[1])+u("perYear");

/* ---------- Tailoring form ---------- */
const ZIP3=[[5,5,"New York"],[10,27,"Massachusetts"],[28,29,"Rhode Island"],[30,38,"New Hampshire"],[39,49,"Maine"],[50,54,"Vermont"],[55,55,"Massachusetts"],[56,59,"Vermont"],[60,69,"Connecticut"],[70,89,"New Jersey"],[100,149,"New York"],[150,196,"Pennsylvania"],[197,199,"Delaware"],[200,200,"District of Columbia"],[201,201,"Virginia"],[202,205,"District of Columbia"],[206,219,"Maryland"],[220,246,"Virginia"],[247,268,"West Virginia"],[270,289,"North Carolina"],[290,299,"South Carolina"],[300,319,"Georgia"],[320,339,"Florida"],[341,349,"Florida"],[350,369,"Alabama"],[370,385,"Tennessee"],[386,397,"Mississippi"],[398,399,"Georgia"],[400,427,"Kentucky"],[430,459,"Ohio"],[460,479,"Indiana"],[480,499,"Michigan"],[500,528,"Iowa"],[530,549,"Wisconsin"],[550,567,"Minnesota"],[569,569,"District of Columbia"],[570,577,"South Dakota"],[580,588,"North Dakota"],[590,599,"Montana"],[600,629,"Illinois"],[630,658,"Missouri"],[660,679,"Kansas"],[680,693,"Nebraska"],[700,714,"Louisiana"],[716,729,"Arkansas"],[730,732,"Oklahoma"],[733,733,"Texas"],[734,749,"Oklahoma"],[750,799,"Texas"],[800,816,"Colorado"],[820,831,"Wyoming"],[832,838,"Idaho"],[840,847,"Utah"],[850,865,"Arizona"],[870,884,"New Mexico"],[885,885,"Texas"],[889,898,"Nevada"],[900,961,"California"],[967,968,"Hawaii"],[970,979,"Oregon"],[980,994,"Washington"],[995,999,"Alaska"]];
/* ZIPs that sit wholly in a different state from their three-digit range (U.S. Census Bureau 2020 ZCTA-to-county
   relationship file). null = not one of the 50 states + DC. Checked before the ranges. */
const ZIP_EXCEPTIONS={"06390":"New York","73960":"Texas","83414":"Wyoming","96799":null};
const zipState=z=>{if(own(ZIP_EXCEPTIONS,z))return ZIP_EXCEPTIONS[z];const n=parseInt(z.slice(0,3),10);const m=ZIP3.find(([a,b])=>n>=a&&n<=b);return m?m[2]:null};
function fillSelects(){
  $("#state").innerHTML=`<option value="">${u("chooseState")}</option>`+STATES.map(s=>`<option${s===S.state?" selected":""}>${s}</option>`).join("");
  $("#btype").innerHTML=Object.keys(TYPES).map(k=>`<option value="${k}"${k===S.type?" selected":""}>${TY(k)}</option>`).join("");
}
fillSelects();
$("#where").value=S.where;$("#hire").checked=!!S.hire;$("#city").value=S.city||"";$("#zip").value=S.zip||"";
function zipHint(){
  const z=S.zip||"",h=$("#zipHint");
  if(z.length<5){h.className="zip-hint";h.textContent=z.length?u("zipMore"):u("zipEmpty");return null}
  const st=zipState(z);
  if(!st){h.className="zip-hint";h.textContent=u("zipBad");return null}
  h.className="zip-hint ok";h.textContent=u("zipOk",st);return st;
}
function zipCheck(){
  const z=$("#zip").value.replace(/\D/g,"").slice(0,5);if($("#zip").value!==z)$("#zip").value=z;
  S.zip=z;const st=zipHint();
  if(st&&S.state!==st){S.state=st;$("#state").value=st;S.llcState=st}
}
$("#zip").addEventListener("input",()=>{zipCheck();save();renderAll()});
let cityT;$("#city").addEventListener("input",()=>{clearTimeout(cityT);cityT=setTimeout(()=>{S.city=$("#city").value.trim();save();renderAll()},300)});
["state","btype","where","hire"].forEach(id=>$("#"+id).addEventListener("change",()=>{
  const prev=S.state,v=$("#state").value;S.state=isState(v)?v:"";if(isType($("#btype").value))S.type=$("#btype").value;if(WHERE_SET.has($("#where").value))S.where=$("#where").value;S.hire=$("#hire").checked;
  if(S.state!==prev&&S.state)S.llcState=S.state;save();renderAll()}));
if(S.zip)zipCheck();else zipHint();
function isTulsa(){
  const c=(S.city||"").toLowerCase();const z=(S.zip||"").slice(0,3);
  return S.state==="Oklahoma"&&(/tulsa|broken arrow|owasso|jenks|bixby|sand springs|sapulpa|glenpool|catoosa|skiatook|collinsville/.test(c)||z==="740"||z==="741");
}
function isDallas(){
  const c=(S.city||"").toLowerCase();const z=parseInt((S.zip||"").slice(0,3),10);
  return S.state==="Texas"&&(/\b(dallas|irving|garland|mesquite|richardson|plano|carrollton|grand prairie|arlington|duncanville|desoto|de soto|lancaster|rowlett|addison|farmers branch)\b/.test(c)||(S.zip.length>=3&&z>=750&&z<=753));
}

/* ---------- Checklist ---------- */
function typeItems(t,st){
  const tg=x=>`<span class="tag">${x}</span>`;
  const T={
   software:[
    ["sw-pay","Decide how you'll charge, and who handles sales tax "+tg("Software"),"App store in-app purchases: Apple and Google collect and remit U.S. sales tax for you, but take a commission. Direct web billing: you handle sales tax, or use a merchant-of-record service (such as Paddle) that does. SaaS is taxable in some states and not others."],
    ["sw-legal","Publish a privacy policy and terms of service "+tg("Software"),`Required by the app stores and payment processors, and by state privacy laws as you grow. If your app is aimed at children under 13, COPPA applies. ${L("FTC: children's privacy","https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy")}`],
    ["sw-ip","Get written IP assignment from anyone who writes code or designs for you "+tg("Software"),"Without it, contractors can keep the copyright to what they build. Also track the licenses of open-source packages you ship."],
    ["sw-reg","Check whether your app is in a regulated category "+tg("Software"),"Apps that move money, lend, insure, give medical care, broker real estate, offer gambling or paid sweepstakes, or deliver alcohol often need licenses in each state where users are. See “Selling across states.”"],
    ["sw-access","Build for accessibility (WCAG) from the start "+tg("Software"),"Accessible apps reach more users and lower the risk of ADA complaints. Retrofitting later costs far more."],
    ["sw-sec","Protect user data: encryption, access controls and a breach plan "+tg("Software"),`Every state has a data-breach notification law. ${L("FTC: data security","https://www.ftc.gov/business-guidance/privacy-security/data-security")}`]],
   ecommerce:[
    ["ec-permit","Get a seller's permit in your state before your first taxable sale "+tg("E-commerce"),"Marketplaces like Amazon, Etsy and eBay collect sales tax for you on their sales. Your own website doesn't."],
    ["ec-ship","Publish shipping, returns and refund policies "+tg("E-commerce"),`The FTC Mail Order Rule requires you to ship within the time you state, or within 30 days if you state none. ${L("FTC: Mail Order Rule","https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule")}`],
    ["ec-safety","Check product safety rules for what you sell "+tg("E-commerce"),`Children's products need third-party testing and a Children's Product Certificate. Selling into California may require Prop 65 warnings. ${L("CPSC business guidance","https://www.cpsc.gov/Business--Manufacturing")}`],
    ["ec-privacy","Publish a privacy policy and use a secure checkout "+tg("E-commerce"),"Use a PCI-compliant payment processor; never store card numbers yourself."]],
   services:[
    ["sv-lic","Check whether your profession is licensed in "+st+" "+tg("Services"),`Accounting, law, real estate, engineering, insurance, financial advice and many others need a state license. ${L("Licensed occupations finder",LIC)}`],
    ["sv-contract","Use a written contract or statement of work for every client "+tg("Services"),"Scope, price, payment terms, who owns the work product, and how either side can end it."],
    ["sv-eo","Ask about professional liability (E&O) insurance "+tg("Services"),"Covers claims that your advice or work caused a client a loss. Some clients require it."]],
   retail:[
    ["rt-permit","Get a seller's permit and a resale certificate "+tg("Retail"),"The permit lets you collect sales tax; the resale certificate lets you buy inventory for resale without paying sales tax on it."],
    ["rt-coo","Confirm zoning, certificate of occupancy, fire inspection and sign permits "+tg("Retail"),"Check before signing a lease. Fixing a zoning problem after you sign is expensive."],
    ["rt-ins","Get general and product liability insurance "+tg("Retail"),"Landlords usually require general liability. Product liability matters if you make, import or private-label goods."],
    ["rt-safety","Check product safety rules for what you sell "+tg("Retail"),L("CPSC business guidance","https://www.cpsc.gov/Business--Manufacturing")]],
   food:[
    ["fd-health","Contact your local health department about permits "+tg("Food"),"Restaurants, food trucks, caterers and stands need a food establishment or mobile vending permit and inspections."],
    ["fd-cottage","Check "+st+"'s cottage food law if you'll cook at home "+tg("Food"),"Most states let you sell some low-risk foods made at home, with limits on products, sales and where you sell. Cottage food usually can't be shipped across state lines."],
    ["fd-cert","Get food safety certification "+tg("Food"),"Most jurisdictions require a certified food protection manager and food handler cards for staff."],
    ["fd-kitchen","Line up a licensed commercial or commissary kitchen if needed "+tg("Food"),"Required for most food trucks and for foods outside cottage-food rules."],
    ["fd-label","Label packaged foods correctly "+tg("Food"),`Ingredients, allergens, net quantity and your business name and address. Small businesses may be exempt from nutrition facts. ${L("FDA labeling","https://www.fda.gov/food/food-labeling-nutrition")}`],
    ["fd-alc","Selling alcohol? Start with state liquor licensing "+tg("Food"),"Alcohol requires a state license, often a local one, and federal TTB permits if you produce it."]],
   trades:[
    ["tr-lic","Get your contractor or trade license "+tg("Trades"),`Many states and cities license general contractors and trades like electrical, plumbing and HVAC. ${L("Licensed occupations finder",LIC)}`],
    ["tr-bond","Get bonded and insured "+tg("Trades"),"General liability, and often a surety bond for licensing. Workers' comp once you have employees."],
    ["tr-permit","Pull building permits per job "+tg("Trades"),"Usually from the city or county building department."],
    ["tr-lead","Working on homes built before 1978? Get EPA lead-safe (RRP) certified "+tg("Trades"),`Required for renovation, repair and painting that disturbs paint in pre-1978 homes and child-occupied facilities. ${L("EPA RRP program","https://www.epa.gov/lead/renovation-repair-and-painting-program")}`],
    ["tr-osha","Follow OSHA safety rules "+tg("Trades"),L("OSHA small business","https://www.osha.gov/smallbusiness")]],
   home:[
    ["hm-lic","Get a local business license "+tg("Home services"),"Most cities and counties require one for cleaning, lawn and handyman services."],
    ["hm-ins","Get general liability insurance and consider a janitorial bond "+tg("Home services"),"Clients often ask for proof. A bond covers theft claims against workers."],
    ["hm-pest","Applying pesticides or herbicides for clients? Get licensed "+tg("Home services"),"Most states require a commercial applicator license from the state agriculture department, including for lawn weed control."],
    ["hm-auto","Insure your vehicle for business use "+tg("Home services"),"Personal auto policies often exclude business use."]],
   care:[
    ["ca-lic","Get your state professional license "+tg("Personal care"),`Cosmetology, barbering, massage, nursing and many health roles need a state board license. ${L("Licensed occupations finder",LIC)}`],
    ["ca-shop","License your location if required "+tg("Personal care"),"Salons, spas and clinics often need an establishment license separate from your personal license."],
    ["ca-hipaa","Handling patient health information? Follow HIPAA "+tg("Personal care"),L("HHS: HIPAA for professionals","https://www.hhs.gov/hipaa/for-professionals/index.html")],
    ["ca-ins","Get professional liability insurance and client waivers "+tg("Personal care"),"Fitness and wellness businesses commonly use signed waivers and intake forms."]],
   child:[
    ["ch-lic","Contact "+st+"'s childcare licensing agency "+tg("Childcare"),`Childcare needs a state license or a specific exemption, even in your home. ${L("Childcare.gov state resources","https://childcare.gov/state-resources")}`],
    ["ch-bg","Complete background checks for you and anyone around the children "+tg("Childcare"),"States typically require fingerprint-based checks and registry searches."],
    ["ch-train","Get CPR, first aid and required training "+tg("Childcare"),"Plus the health and safety training your state sets."],
    ["ch-ins","Get childcare liability insurance "+tg("Childcare"),"Homeowner's policies almost never cover a home daycare."],
    ["ch-food","Ask about the USDA food program (CACFP) "+tg("Childcare"),"Can reimburse eligible providers for healthy meals and snacks."]],
   transport:[
    ["tp-ins","Get commercial auto insurance "+tg("Transport"),"Personal policies typically exclude paid delivery and hauling."],
    ["tp-dot","Check federal USDOT and operating authority rules "+tg("Transport"),`Commercial vehicles crossing state lines often need a USDOT number; for-hire interstate carriers also need operating authority. ${L("FMCSA registration","https://www.fmcsa.dot.gov/registration")}`],
    ["tp-cdl","Confirm whether drivers need a CDL "+tg("Transport"),"Generally required for vehicles over 26,000 lbs, hazmat, or larger passenger vehicles."],
    ["tp-move","Moving household goods? Check state mover licensing "+tg("Transport"),"Many states license in-state movers separately from federal rules."]],
   creative:[
    ["cr-copy","Register copyrights for your key work "+tg("Creative"),`Registration is required before you can sue for infringement. ${L("U.S. Copyright Office","https://www.copyright.gov/registration/")}`],
    ["cr-music","License music you play at events or in your business "+tg("Creative"),"Public performance licenses come from ASCAP, BMI, SESAC and GMR."],
    ["cr-release","Use model and property releases "+tg("Creative"),"Needed before you use someone's likeness or private property in commercial work."],
    ["cr-event","Check event and temporary sales permits "+tg("Creative"),"Festivals and craft fairs can need a temporary event permit and a temporary sales tax license."]],
   other:[
    ["ot-lic","Check whether your activity needs a state license "+tg("General"),L("Licensed occupations finder",LIC)]]
  };
  return T[t]||T.other;
}
/* Texas-only checklist items (verified Oct 2026 on sos.state.tx.us, comptroller.texas.gov, twc.texas.gov, texasattorneygeneral.gov) */
const TX_ITEMS={
  "tx-franchise":["File your Texas franchise tax filing every year by May 15",`Every LLC (and other taxable entity, not sole proprietors) files annually. At or below the no-tax-due threshold ($2.65 million for 2026 and 2027 reports), file only the Public Information Report or Ownership Information Report; the No Tax Due Report is no longer filed. Above the threshold, file the franchise tax report. ${L("Comptroller: franchise tax","https://comptroller.texas.gov/taxes/franchise/")} · ${L("No tax due reporting","https://comptroller.texas.gov/taxes/franchise/ntd-rpt-updates-2024.php")}`],
  "tx-sales":["Get a Texas sales and use tax permit if you sell taxable goods or services",`Required if you sell or lease tangible personal property in Texas or sell taxable services there. Apply online through the Comptroller's eSystems before your first taxable sale. ${L("Comptroller: sales tax permit","https://comptroller.texas.gov/taxes/permit/")}`],
  "tx-dba":"Texas: sole proprietors and general partnerships file an assumed name certificate with the county clerk; LLCs and corporations file with the Secretary of State ($25). "+L("Texas SOS: name filings","https://www.sos.state.tx.us/corp/namefilingsfaqs.shtml"),
  "tx-twc":["Register with the Texas Workforce Commission within 10 days of becoming liable for unemployment tax",`Most employers register online through TWC's Unemployment Tax Registration (UTR) system. ${L("TWC: register a tax account","https://www.twc.texas.gov/services/register-tax")}`],
  "tx-newhire":["Report each new hire to the Texas Attorney General within 20 days",`Texas new-hire reports go to the Attorney General's Child Support Division. ${L("Texas new hire reporting","https://www.texasattorneygeneral.gov/child-support/employers/new-hire-reporting")}`]
};
function buildPhases(){
  /* City and state are escaped once here; every label below is markup */
  const st=S.state?esc(S.state):"your state",stName=esc(S.state),t=S.type,w=S.where,city=esc(S.city||""),tg=x=>`<span class="tag">${x}</span>`,tx=S.state==="Texas";
  const P=[];
  const s1=[
    ["help-sbdc","Book a free session with your Small Business Development Center",`Advisers in ${st} help with planning, budgets, registration and finding funding. ${L("Find your SBDC","https://americassbdc.org")}`],
    ["help-score","Request a free SCORE mentor",`Ask for a mentor with experience in ${SHORT[t]}. ${L("Find a mentor","https://www.score.org/find-mentor")}`],
    ["help-local",`Ask ${city?city+"'s":"your city's"} economic development office and chamber of commerce about local programs`,"Local grants, microloans, free workshops and shared workspace are usually listed there first."],
    ["help-lib",`Use the ${city?city+" ":""}public library's business resources`,"Free market research databases, business plan guides and often free meeting rooms."]];
  if(S.state==="Oklahoma"&&t==="software")s1.unshift(["ok-ocn","Call OCN and i2E: ask which open program fits a pre-revenue tech founder "+tg("Oklahoma"),"Then talk to Gradient and Build in Tulsa. See “Help matched to your business.”"]);
  if(isTulsa())s1.splice(2,0,["tul-aj","Ask Avanzando Juntos about microgrants and formation-cost help "+tg("Tulsa"),"Phone 918-212-0750. Availability and eligibility must be confirmed."]);
  if(isDallas())s1.splice(1,0,["dal-sbdc","Request no-cost counseling from the Dallas Metropolitan SBDC "+tg("Dallas"),"Serves Dallas, Collin and Rockwall counties; phone 214-860-5848. In Tarrant County (Arlington), use the Tarrant SBDC. See “Help matched to your business.”"]);
  P.push({n:"Step 1",t:"Get free help",items:s1});
  const s2=[
    ["idea-desc","Write a one-paragraph description of what you sell and to whom","You'll reuse it in every letter, application and bank form."],
    ["idea-cust","Talk to at least ten potential customers before spending money","Ask about their problem and what they pay today, not whether they like your idea."],
    ["idea-price","Set a starting price from real costs and what customers pay today","Include your time, materials, fees and taxes. It's easier to discount than to raise prices."],
    ["idea-budget","List what you need to start, and what can wait","Separate must-haves from nice-to-haves. Your adviser can review it."],
    ["idea-plan","Sketch a one-page business plan",L("SBA business plan guide",SBA+"plan-your-business/write-your-business-plan")]];
  if(t==="software")s2.splice(2,0,["idea-mvp","Define the smallest version that solves the core problem "+tg("Software"),"Build only what a pilot customer needs to see value. Line up 3 to 5 pilot users before building more. See “Get known.”"]);
  P.push({n:"Step 2",t:"Shape the idea",items:s2});
  const d=S.state&&LLC[S.state];
  const llcWhy=d?`${stName}: ${docNameEn(S.state)}, filing fee ${money(d[0])}; ongoing: ${d[2]} (${money0(d)}).${d[4]?" "+d[4]:""} Details under “LLC by state.”`:"Pick your state above to see its fees and rules here. Details under “LLC by state.”";
  const s3=[
    ["reg-structure","Choose a structure: sole proprietorship, partnership, LLC or corporation","See “Structures.” You can start simple and change later."],
    ["reg-name","Check your business name",`Search ${st}'s business name database and the federal trademark database. ${L("USPTO search","https://www.uspto.gov/trademarks/search")}`],
    ["reg-file",`Register with ${st} if you form an LLC or corporation`,llcWhy],
    ["reg-dba","File a DBA if you'll operate under a different name",tx?TX_ITEMS["tx-dba"]:"Filed with the state or county depending on where you live."],
    ["reg-ein","Get a free EIN from the IRS",`Apply only at irs.gov; never pay a third party for it. ${L("Apply for an EIN","https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number")}`],
    ["reg-oa","Sign an operating or partnership agreement","Spells out ownership, decisions, money and what happens if someone leaves. Essential with more than one owner."]];
  if(tx)s3.splice(3,0,["tx-franchise",TX_ITEMS["tx-franchise"][0]+" "+tg("Texas"),TX_ITEMS["tx-franchise"][1]]);
  P.push({n:"Step 3",t:"Make it official",items:s3});
  const lic=[
    ["lic-local",`Ask ${city||"your city"} and your county which business license or permits apply`,`Requirements depend on your activity and address. ${L("SBA: licenses and permits",SBA+"launch-your-business/apply-licenses-permits")}`],
    ["lic-statetax",`Register for ${st} taxes that apply to you`,`${S.state&&NEXUS[S.state]===null?stName+" has no statewide sales tax, but other state taxes may apply. ":""}Your state revenue department handles income, sales and other business taxes. ${L("SBA: tax ID numbers",SBA+"launch-your-business/get-federal-state-tax-id-numbers")}`],
    ...(tx?[["tx-sales",TX_ITEMS["tx-sales"][0]+" "+tg("Texas"),TX_ITEMS["tx-sales"][1]]]:[]),
    ...typeItems(t,st)];
  if(w==="home")lic.push(["lic-home","Check zoning and lease or HOA rules for a home business "+tg("Home-based"),"Many cities require a home occupation permit, especially if clients visit or you store inventory."]);
  if(w==="site")lic.push(["lic-site","Confirm zoning and a certificate of occupancy before signing a lease "+tg("Location"),"Ask the city whether the space is zoned for your use."]);
  if(w==="mobile")lic.push(["lic-mobile","Check licenses in every city where you'll work "+tg("Mobile"),"Some cities require their own business license even if you're based elsewhere."]);
  if(S.reach&&S.reach!=="home")lic.push(["lic-multi","Review the multi-state rules for where you'll sell "+tg("Multi-state"),"Sales tax thresholds, foreign registration and regulated activity. See “Selling across states.”"]);
  if(S.hire){
    lic.push(["hire-1","Set up payroll withholding and your state's new-hire reporting "+tg("Hiring"),L("SBA: hire and manage employees",SBA+"manage-your-business/hire-manage-employees")]);
    lic.push(["hire-2",`Register for ${st} unemployment insurance and get workers' comp `+tg("Hiring"),S.state==="Texas"?"Texas makes workers' comp optional for most private employers, but opting out carries real risk. Ask an adviser.":"Most states require workers' compensation once you have employees. Rules vary by state and headcount."]);
    if(tx){lic.push(["tx-twc",TX_ITEMS["tx-twc"][0]+" "+tg("Texas"),TX_ITEMS["tx-twc"][1]]);lic.push(["tx-newhire",TX_ITEMS["tx-newhire"][0]+" "+tg("Texas"),TX_ITEMS["tx-newhire"][1]])}
    lic.push(["hire-3","Complete Form I-9 for every new hire "+tg("Hiring"),"Verifies identity and work eligibility. Keep the forms on file."]);
    lic.push(["hire-4","Classify workers correctly "+tg("Hiring"),`Treating an employee as a contractor can bring back taxes and penalties. ${L("IRS: contractor or employee?","https://www.irs.gov/businesses/small-businesses-self-employed/independent-contractor-self-employed-or-employee")}`]);
  }
  P.push({n:"Step 4",t:"Licenses, permits & taxes",items:lic});
  P.push({n:"Step 5",t:"Protect your money",items:[
    ["money-bank","Open a separate business bank account",L("SBA: business bank accounts",SBA+"launch-your-business/open-business-bank-account")],
    ["money-books","Pick a simple way to track income and expenses","A free spreadsheet or app is enough to start. Keep every receipt."],
    ["money-tax","Set aside money for taxes and know your estimated-tax dates","Self-employed owners usually pay federal estimated taxes quarterly. Many set aside 25–30% of profit until they know their rate."],
    ["money-ins","Ask about the insurance your work needs",`General liability is common. ${["trades","transport","home"].includes(t)?"Commercial auto and bonding may apply to you. ":""}${w==="home"?"Homeowner's policies usually don't cover business activity. ":""}${L("SBA: business insurance",SBA+"launch-your-business/get-business-insurance")}`],
    ["money-contract","Use written agreements with customers and partners","A free legal clinic or SCORE mentor can review a simple template."]]});
  P.push({n:"Step 6",t:"Launch and get known",items:[
    ["launch-pilot",t==="software"||t==="services"?"Run a pilot with 3 to 5 target customers":"Land your first paying customers","Use the playbook under “Get known.” The letter builder has a pilot proposal and a letter of intent."],
    ["launch-profile",w==="online"?"Get listed where your customers look":"Claim your free Google Business Profile",w==="online"?"Online-only businesses aren't eligible for a Google Business Profile; use directories, marketplaces and app stores in your field instead.":"Shows you in Google Search and Maps, free. Service-area businesses can hide their address."],
    ["launch-reviews","Ask happy customers for honest reviews","Never buy, fake or filter reviews; the FTC fines businesses that do."],
    ["launch-cal","Put recurring deadlines on your calendar","Tax filings, license renewals and your state's annual report if you formed an LLC or corporation."],
    ["launch-apply","Apply to programs that fit and are open now","Use the questions under “Funding” to check fit before you apply."]]});
  P.forEach(p=>p.label=p.n);
  /* Spanish: same steps and item ids, text from i18n-es.js */
  return es()?ES.phases(P,phaseCtx()):P;
}
/* The English ongoing-cost text for checklist notes, independent of the interface language */
function money0(d){return d[1]===null?"None":d[1]===0?"$0":money(d[1])+"/yr"}
function phaseCtx(){return {S,L,LIC,SBA,LLC,NEXUS,money,isTulsa:isTulsa(),isDallas:isDallas(),docName,llcText,ongoing,TX_ITEMS}}
let PH=[];
function renderChecklist(){
  PH=buildPhases();
  const loc=[S.city,S.state].filter(Boolean).join(", ");
  $("#planTitle").textContent=u("planTitle",loc);
  $("#planLead").textContent=u("planLead",SH(S.type),S.hire,S.state);
  const first=PH.findIndex(p=>p.items.some(i=>!S.done[i[0]]));
  $("#phases").innerHTML=PH.map((p,idx)=>{
    const open=(p.n in S.open)?S.open[p.n]:idx===first;
    return `<details class="phase" data-step="${p.n}"${open?" open":""}><summary><span class="badge">${idx+1}</span><div class="minw-0"><div class="sn">${p.label}</div><h3>${p.t}</h3></div><div class="meta"><span class="c"></span><span class="mb"><span></span></span></div><span class="chev" aria-hidden="true"></span></summary>
    <div class="body"><ul class="items">${p.items.map(([id,label,why])=>`<li class="item${S.done[id]?" done":""}"><input type="checkbox" id="c-${id}" data-id="${id}"${S.done[id]?" checked":""}><div class="minw-0"><label for="c-${id}">${label}</label><div class="why">${why}</div></div></li>`).join("")}</ul></div></details>`}).join("");
  updateProgress();syncToggleAll();
}
function updateProgress(){
  const all=PH.flatMap(p=>p.items.map(i=>i[0]));const n=all.filter(id=>S.done[id]).length;
  $("#plabel").textContent=u("done",n,all.length);$("#pbar").style.width=(all.length?n/all.length*100:0)+"%";
  document.querySelectorAll(".phase").forEach((el,i)=>{const p=PH[i];const k=p.items.filter(x=>S.done[x[0]]).length,m=p.items.length;
    el.querySelector(".c").textContent=k===m?u("phaseDone"):u("phaseCount",k,m);el.querySelector(".mb span").style.width=(k/m*100)+"%";el.classList.toggle("complete",k===m)});
}
function syncToggleAll(){const d=[...document.querySelectorAll(".phase")];$("#toggleAll").textContent=d.length&&d.every(x=>x.open)?u("collapseAll"):u("expandAll")}
$("#phases").addEventListener("change",e=>{const id=e.target.dataset.id;if(!id)return;S.done[id]=e.target.checked;e.target.closest(".item").classList.toggle("done",e.target.checked);save();updateProgress()});
$("#phases").addEventListener("toggle",e=>{const d=e.target;if(!d.classList||!d.classList.contains("phase")||printing())return;S.open[d.dataset.step]=d.open;save();syncToggleAll()},true);
$("#toggleAll").addEventListener("click",()=>{const d=[...document.querySelectorAll(".phase")];const openAll=!d.every(x=>x.open);d.forEach(x=>{x.open=openAll;S.open[x.dataset.step]=openAll});save();syncToggleAll()});
function armed(btn,doneLabel,run){
  if(btn.dataset.armed){delete btn.dataset.armed;btn.textContent=u(doneLabel);run();return}
  btn.dataset.armed="1";btn.textContent=u("tapClear");setTimeout(()=>{if(btn.dataset.armed){delete btn.dataset.armed;btn.textContent=u(doneLabel)}},3000);
}
$("#clearPlan").addEventListener("click",function(){armed(this,"clearChecks",()=>{S.done={};S.open={};save();renderChecklist()})});
$("#copyPlan").addEventListener("click",function(){
  /* <template> content is inert: nothing in it loads or runs while we read its text */
  const tmp=document.createElement("template");const lines=[$("#planTitle").textContent.toUpperCase(),""];
  PH.forEach(p=>{lines.push(`${p.label}: ${p.t}`);p.items.forEach(([id,label])=>{tmp.innerHTML=label;lines.push(`  [${S.done[id]?"x":" "}] ${tmp.content.textContent.trim()}`)});lines.push("")});
  copyText(lines.join("\n"),this);
});
$("#copyLink").addEventListener("click",function(){writeURL();copyText(planLink(),this)});

/* ---------- Help, mapped to business type ---------- */
const ALL="*";
const NATIONAL=[
 {n:"Small Business Development Centers",who:"SBA resource partner · nearly 1,000 locations",pills:["Free"],fit:ALL,
  d:"Free one-on-one advising on planning, budgets, registration and financing. Many have specialists in technology, exporting or government contracting.",links:[["Find your SBDC","https://americassbdc.org"]]},
 {n:"SCORE",who:"Volunteer mentors nationwide",pills:["Free"],fit:ALL,
  d:"Free mentoring from experienced owners. You can request a mentor with experience in your industry.",links:[["Find a mentor","https://www.score.org/find-mentor"],["SBA locator","https://www.sba.gov/local-assistance/find?type=score"]]},
 {n:"Women's Business Centers",who:"SBA resource partner",pills:["Free or low cost"],fit:ALL,
  d:"Training and counseling, often with evening and online options. Many serve all entrepreneurs, not only women.",links:[["Find a center","https://www.sba.gov/local-assistance/find"]]},
 {n:"Veterans Business Outreach Centers",who:"Veterans, service members and military spouses",pills:["Free"],fit:ALL,
  d:"Business training, counseling and the Boots to Business program.",links:[["Find a VBOC","https://www.sba.gov/local-assistance/find"]]},
 {n:"Minority Business Development Agency",who:"U.S. Department of Commerce",pills:["Varies"],fit:ALL,
  d:"Business centers that help minority-owned firms with growth, contracts and capital.",links:[["MBDA","https://www.mbda.gov"]]},
 {n:"Free legal help",who:"Legal aid and law school clinics",pills:["Free if eligible"],fit:ALL,
  d:"Legal aid groups and many law school clinics help with formation questions, contracts and referrals for those who qualify.",links:[["LawHelp.org","https://www.lawhelp.org"]]},
 {n:"USDA Rural Development",who:"For rural areas",pills:["Eligibility rules"],fit:ALL,
  d:"Loans, grants and guarantees for businesses and cooperatives in eligible rural communities.",links:[["Rural Development","https://www.rd.usda.gov"]]},
 {n:"Licensed occupations finder",who:"U.S. Department of Labor · CareerOneStop",pills:["Free","Official"],fit:["services","trades","home","care","child","transport","food"],
  d:"Search the licenses your occupation needs in your state, with the agency that issues each one.",links:[["Find licenses",LIC]]},
 {n:"SBIR / STTR programs",who:"Federal R&D awards for small businesses",pills:["Selective","Non-dilutive"],fit:["software"],
  d:"Federal agencies fund research-based technology through competitive awards. A fit only if your product involves real technical risk or R&D, not a standard app.",links:[["SBIR.gov","https://www.sbir.gov"]]},
 {n:"CodeLaunch",who:"Software startup competition",pills:["Selective"],fit:["software"],
  d:"Competition and accelerator-style event that has paired selected founders with dev teams, mentors and investors. Useful if you also need help building an MVP.",
  tip:"Confirm current events, eligibility, costs and any geographic limits.",links:[["CodeLaunch","https://codelaunch.com/"]]},
 {n:"Techstars",who:"Selective accelerator network",pills:["Selective"],fit:["software","ecommerce"],
  d:"Mentorship and investor access for startups that can show demand and a path to scale. Terms can include investment for equity.",links:[["Browse accelerators","https://www.techstars.com/accelerators"]]},
 {n:"Consumer Product Safety Commission",who:"Federal product safety rules",pills:["Free","Official"],fit:["ecommerce","retail","creative"],
  d:"Testing and certificate rules for consumer products, especially anything made for children, plus a small-business ombudsman you can contact.",links:[["CPSC for business","https://www.cpsc.gov/Business--Manufacturing"]]},
 {n:"FDA food guidance",who:"Federal food rules",pills:["Free","Official"],fit:["food"],
  d:"Labeling, food facility registration for manufacturers and processors, and safety rules. Restaurants and retail food are mostly regulated locally.",links:[["FDA food guidance","https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements"]]},
 {n:"OSHA small business help",who:"Workplace safety",pills:["Free","Official"],fit:["trades","home","transport","food"],
  d:"Free, confidential on-site safety consultations that don't result in citations, plus training resources.",links:[["OSHA small business","https://www.osha.gov/smallbusiness"]]},
 {n:"FMCSA registration",who:"Federal motor carrier rules",pills:["Official"],fit:["transport"],
  d:"Find out whether you need a USDOT number or operating authority for your vehicles and routes.",links:[["Registration","https://www.fmcsa.dot.gov/registration"]]},
 {n:"Childcare.gov state resources",who:"U.S. Department of Health and Human Services",pills:["Free","Official"],fit:["child"],
  d:"Links to your state's childcare licensing agency, regulations and background check rules.",links:[["State resources","https://childcare.gov/state-resources"]]},
 {n:"U.S. Copyright Office",who:"Protect creative work and code",pills:["Official"],fit:["creative","software"],
  d:"Register copyrights in art, writing, music, photos and software. Registration is required before suing for infringement.",links:[["Register a work","https://www.copyright.gov/registration/"]]},
 {n:"SAM.gov",who:"Selling to the government",pills:["Free","Official"],fit:["services","software","trades","home","transport","creative"],
  d:"Free registration to bid on federal contracts. Your SBDC or an APEX Accelerator can help you find contracts that fit. Never pay a site to register.",links:[["SAM.gov","https://sam.gov"]]}
];
const OK_STATE=[
 {n:"Oklahoma Commercialization Network (OCN)",who:"Statewide front door for tech startups",pills:["Tech","May cost"],fit:["software","ecommerce"],
  d:"Connects tech and high-growth founders with mentoring, workspace, pitch prep, investors and commercialization support.",
  tip:"Ask for a referral to a program suited to a pre-revenue, bootstrapped business. Confirm fees and whether applications are open.",
  links:[["OCN overview","https://www.reiok.org/business-resources/programs-initiatives/oklahoma-commercialization-network/"],["Partner network","https://i2e.org/network/"]]},
 {n:"i2E — Innovation to Enterprise",who:"Nonprofit for scalable, tech-enabled businesses",pills:["Tech","May cost"],fit:["software"],
  d:"Early-stage support, customer and market validation, pitch prep, and introductions to the right OCN partner or funding pathway.",
  phone:"918-582-5592",addr:"12 N. Cheyenne Ave., Suite 112, Tulsa, OK 74103",links:[["i2E website","https://i2e.org/"]]},
 {n:"OCAST",who:"Oklahoma Center for the Advancement of Science and Technology",pills:["Selective","Official"],fit:["software"],
  d:"State funding for technology commercialization, including the Industry Innovation Program and seed capital. Aimed at real technical innovation, not routine registration costs.",
  tip:"Worth asking if your product has a novel technical approach, defensible IP or a research component. Matching rules vary.",
  links:[["Funding opportunities","https://www.oklahoma.gov/ocast/funding-opportunities.html"],["State startup directory","https://www.okcommerce.gov/doing-business/startups-entrepreneurs/entrepreneurship-resources/"]]},
 {n:"Oklahoma SBDC",who:"Statewide small business advising",pills:["Free"],fit:ALL,
  d:"Free one-on-one advising for pre-launch businesses: idea evaluation, business plan, budget, registration and financing options.",links:[["Find an adviser","https://www.oksbdc.org/"]]},
 {n:"Oklahoma Secretary of State",who:"Where you file an Oklahoma LLC",pills:["Official"],fit:ALL,
  d:"Articles of Organization $100; annual certificate $25. Confirm the current total before filing.",
  phone:"405-521-3912",links:[["Registration instructions","https://oklahoma.gov/business/launch/register-your-business.html"],["Dept. of Commerce","https://oklahoma.gov/business/launch.html"]]},
 {n:"Oklahoma Tax Commission",who:"State tax registration",pills:["Official"],fit:ALL,
  d:"Find which state tax registrations apply. Selling taxable products requires a sales tax permit.",
  links:[["New Business Center","https://oklahoma.gov/tax/businesses/new-business-center.html"],["Licenses & permits","https://oklahoma.gov/business/operate/licenses-and-permits.html"]]},
 {n:"Legal Aid Services of Oklahoma",who:"Civil legal help for eligible low-income residents",pills:["Free if eligible"],fit:ALL,
  d:"Mostly not business law, but ask whether your issue qualifies or for a pro bono referral.",
  phone:"918-584-3338",phone2:["Toll-free","800-299-3338"],links:[["Legal Aid Oklahoma","https://oklaw.org/"]]}
];
const TULSA=[
 {n:"Build in Tulsa",who:"Founder programs and selective accelerators",pills:["Selective"],fit:["software","ecommerce"],deadline:true,
  d:"Programs for tech and tech-enabled companies. ARCH is a 12-week in-person accelerator for digital health, energy, aerospace and advanced manufacturing companies with early revenue, and has advertised $70,000 in non-dilutive funding for selected participants.",
  tip:"Other 2026 cohorts have closed, so ask about the next one if ARCH doesn't fit.",
  addr:"124 E. Reconciliation Way, Tulsa",links:[["Programs & deadlines","https://www.buildintulsa.com/programming"],["Website","https://www.buildintulsa.com/"]]},
 {n:"Gradient Innovation Hub",who:"Tulsa Arts District founder community",pills:["May cost"],fit:["software","ecommerce","creative","services"],
  d:"Meet founders, find workshops and mentors, and learn which local programs are active. Ask about free events, scholarships or no-cost founder support before paying for workspace.",
  phone:"918-935-0280",addr:"12 N. Cheyenne Ave., Tulsa",links:[["Gradient website","https://gradient.works/"]]},
 {n:"Tulsa Innovation Labs",who:"Tulsa technology-sector development",pills:["Tech"],fit:["software"],
  d:"Not a direct grant program, but useful for industry networks, events and referrals in Tulsa's strategic tech sectors.",links:[["Tulsa Innovation Labs","https://www.tulsainnovationlabs.com/"]]},
 {n:"Avanzando Juntos",who:"Tulsa nonprofit supporting entrepreneurs",pills:["Ask about microgrants"],fit:ALL,
  d:"Ask about current microgrants, startup capital, mentoring and help formalizing or registering a business.",
  phone:"918-212-0750",phone2:["Loans","918-236-5579"],addr:"1801 S. Garnett Road, Tulsa (confirm before visiting)",links:[["Official website","https://www.ajtulsa.org/"]]},
 {n:"SCORE Tulsa",who:"Local volunteer mentors",pills:["Free"],fit:ALL,
  d:"Free mentoring on business model, pricing, customer research, marketing and projections.",
  phone:"405-393-6222 ext. 455",email:"consult.tulsa@scorevolunteer.org",links:[["SCORE Tulsa","https://www.score.org/tulsa"]]},
 {n:"TEDC / Creative Capital",who:"Tulsa Economic Development Corporation",pills:["Loans"],fit:ALL,
  d:"Business lending programs. Ask whether a pre-revenue startup without collateral can qualify, and skip a loan you can't realistically repay.",
  phone:"918-585-8332",addr:"125 W. Third Street, Tulsa (confirm before visiting)",links:[["Lending programs","https://www.tedcnet.com/lending/"]]},
 {n:"Greenwood Women's Business Center",who:"SBA Women's Business Center in Tulsa's Greenwood District",pills:["Free or low cost"],fit:ALL,
  d:"Announced by the SBA in 2021 to serve women entrepreneurs across the Tulsa metro, operated by U.S. Black Chambers Inc. with the Greenwood Chamber of Commerce. Use the SBA locator for current contact details.",
  links:[["SBA locator","https://www.sba.gov/local-assistance/find"]]},
 {n:"Partner Tulsa",who:"Economic development and capital referrals",pills:["Free"],fit:ALL,
  d:"Local access-to-capital referrals. Ask which programs are open to a pre-launch business and when windows open.",links:[["Access to Capital","https://partnertulsa.org/doing-business/small-business-entrepreneurs/access-to-capital/"]]},
 {n:"Tulsa City-County Library",who:"Business research center",pills:["Free"],fit:ALL,
  d:"Free market research databases, startup guides and business information.",links:[["Start a Business","https://www.tulsalibrary.org/research/business-center/start-a-business"]]},
 {n:"TU College of Law clinics",who:"University of Tulsa",pills:["Free if eligible"],fit:ALL,
  d:"Ask whether a current clinic takes startup formation, operating agreements or contract questions. Intake periods vary.",links:[["Clinics & intake","https://utulsa.edu/academics/law/opportunities/legal-clinics/"]]},
 {n:"Tulsa County Bar Lawyer Referral",who:"Low-cost consultation",pills:["Low fee"],fit:ALL,
  d:"Has advertised a 30-minute lawyer consultation for $25. Confirm the current fee.",phone:"918-584-5243",links:[["Referral program","https://www.tulsabar.com/index.cfm?pg=Lawyer-Referral-Program"]]}
];
/* Texas and Dallas: every entry verified on its official page in Oct 2026; phones only where the official page shows them */
const TX_STATE=[
 {n:"North Texas SBDC Network",who:"Hosted by Dallas College · field centers across North Texas",pills:["Free"],fit:ALL,
  d:"Advising, workshops and financing help for people starting or growing a business, delivered through local field centers hosted by area colleges. Find the center that serves your county.",
  tip:"Outside North Texas? Other regions have their own SBDC networks; use “Find your SBDC” under Across the U.S.",
  phone:"214-860-5831",addr:"1402 Corinth Street, Suite 2100, Dallas, TX 75215",links:[["Find your center","https://ntsbdc.org/local-sbdcs/field-centers/"],["North Texas SBDC","https://ntsbdc.org/"]]},
 {n:"Texas Secretary of State",who:"Where you file a Texas LLC or corporation",pills:["Official"],fit:ALL,
  d:"An LLC files a Certificate of Formation (Form 205); the filing fee is $300. Entities file assumed names here ($25 each); sole proprietors file with the county clerk instead.",
  tip:"Online filing is moving from SOSDirect to the new SOSPortal. Card payments add a small convenience fee.",
  phone:"512-463-5555",links:[["Form 205 instructions","https://www.sos.state.tx.us/corp/instructions/205.shtml"],["Business filings","https://www.sos.state.tx.us/corp/index.shtml"],["Name filings FAQ","https://www.sos.state.tx.us/corp/namefilingsfaqs.shtml"]]},
 {n:"Texas Comptroller of Public Accounts",who:"Sales tax permit and franchise tax",pills:["Official"],fit:ALL,
  d:"Get a sales and use tax permit if you sell or lease tangible goods or sell taxable services in Texas. Every LLC and corporation files annually by May 15: at or below the no-tax-due threshold ($2.65 million for 2026 and 2027 reports), only the Public Information Report or Ownership Information Report, since the No Tax Due Report is no longer filed; above it, the franchise tax report.",
  links:[["Sales tax permit","https://comptroller.texas.gov/taxes/permit/"],["Franchise tax","https://comptroller.texas.gov/taxes/franchise/"],["No tax due reporting","https://comptroller.texas.gov/taxes/franchise/ntd-rpt-updates-2024.php"]]},
 {n:"Texas Workforce Commission",who:"Employer registration and unemployment tax",pills:["Official"],fit:ALL,
  d:"Employers must register with TWC within 10 days of becoming liable for state unemployment tax. Most employers register online through Unemployment Tax Registration (UTR).",
  phone:"800-628-5115",links:[["Register a tax account","https://www.twc.texas.gov/services/register-tax"]]},
 {n:"Governor's Office of Small Business Assistance",who:"With the Texas Business Permit Office",pills:["Free","Official"],fit:ALL,
  d:"Help with state permitting, licensing and regulatory compliance, small business resource referrals, and free webinars and events.",
  tip:"Use the contact form on the page to reach the Small Business Assistance team.",links:[["Small business help","https://gov.texas.gov/business/page/small-business"]]},
 {n:"Texas Department of Licensing and Regulation",who:"State occupational licenses",pills:["Official"],fit:["trades","home","care"],
  d:"Licenses many occupations, including electricians, air conditioning and refrigeration contractors, cosmetology, barbering and massage therapy. Check whether your work needs a TDLR license before you take paying jobs.",
  phone:"512-463-6599",links:[["TDLR","https://www.tdlr.texas.gov/"]]},
 {n:"Texas Department of State Health Services",who:"Food safety and cottage food rules",pills:["Official"],fit:["food"],
  d:"Explains Texas cottage food rules: home-based operations can sell certain foods, the annual gross income limit is $150,000, and operations selling time and temperature controlled (TCS) foods must register. Restaurants and food trucks usually get permits from the local city or county health department.",
  links:[["Cottage food","https://www.dshs.texas.gov/retail-food-establishments/permits-retail-food-establishments/texas-cottage-food-production"],["Retail food","https://www.dshs.texas.gov/retail-food-establishments"]]},
 {n:"Texas Alcoholic Beverage Commission",who:"Alcohol licenses and permits",pills:["Official"],fit:["food"],
  d:"Selling, serving or making alcohol in Texas needs a TABC license or permit. Start here before signing a lease for a bar, restaurant or brewery.",links:[["TABC","https://www.tabc.texas.gov/"]]},
 {n:"Texas HHS Child Care Regulation",who:"Child care licensing",pills:["Official"],fit:["child"],
  d:"Licenses and registers child care centers and homes. You choose your operation type, attend an orientation and apply; check first whether an exemption applies.",
  links:[["Become a provider","https://www.hhs.texas.gov/providers/child-care-regulation/become-a-provider"]]},
 {n:"LiftFund",who:"Nonprofit small business lender",pills:["Loans"],fit:ALL,
  d:"Lends to start-up and existing small businesses in Texas and other states, including SBA Community Advantage loans. Loans must be repaid; ask about requirements before you apply.",
  phone:"888-215-2373",links:[["Loan products","https://www.liftfund.com/funding/our-products"],["LiftFund","https://www.liftfund.com/"]]},
 {n:"Texas Mezzanine Fund",who:"Statewide CDFI based in Dallas",pills:["Loans"],fit:ALL,
  d:"A community development financial institution (CDFI) that offers business loans across Texas, with a focus on underserved communities. Usually a fit once you have revenue and a plan for growth.",
  phone:"214-943-5900",addr:"320 South R.L. Thornton Freeway, Suite 110, Dallas, TX 75203",links:[["Texas Mezzanine Fund","https://www.tmfund.com/"]]},
 {n:"TexasLawHelp.org",who:"Free legal information for Texans",pills:["Free"],fit:ALL,
  d:"Free legal guides and forms, plus a tool to match with local legal aid. Mostly not business law, but useful for finding help you qualify for.",links:[["TexasLawHelp.org","https://texaslawhelp.org/"]]}
];
const DALLAS=[
 {n:"Dallas Metropolitan SBDC",who:"Hosted by Dallas College · Dallas, Collin and Rockwall counties",pills:["Free"],fit:ALL,
  d:"No-cost, confidential one-on-one counseling for startups and existing businesses, plus training on business topics.",
  tip:"The center's website has a Spanish (Español) section.",
  phone:"214-860-5848",email:"dsbdc@dcccd.edu",addr:"1402 Corinth St., Suite 1520, Dallas, TX 75215",links:[["Dallas Metropolitan SBDC","https://dallasmetropolitansbdc.com/"]]},
 {n:"Tarrant SBDC",who:"Hosted by Tarrant County College · Tarrant County, including Arlington",pills:["Free"],fit:ALL,
  d:"No-cost business advising for Tarrant County, part of the North Texas SBDC Network.",
  phone:"817-515-2600",email:"admin@tarrantsbdc.org",addr:"1150 South Freeway, Suite 229, Fort Worth, TX 76104",links:[["Tarrant SBDC","https://www.tarrantsbdc.org/"]]},
 {n:"SCORE Dallas",who:"Local volunteer mentors",pills:["Free"],fit:ALL,
  d:"Free mentoring from experienced business owners and executives, for the life of your business. Some workshops may charge a small fee.",links:[["SCORE Dallas","https://www.score.org/dallas"]]},
 {n:"City of Dallas Office of Economic Development",who:"Small business help from the City",pills:["Free","Official"],fit:ALL,
  d:"Staff help you navigate City of Dallas processes for starting a business, check whether City funding programs fit, and connect you to resources. The Small Business Assistance Program gives reimbursable grants for real estate and capital improvement projects (minimum project cost $150,000 in Target Areas or $250,000 outside them, not counting property purchase or lease; 75% of project costs committed from non-City sources; 20 or fewer employees), so it rarely fits a pre-launch business.",
  tip:"Building permits and certificates of occupancy: Planning and Development Department, Oak Cliff Municipal Center, 320 E. Jefferson, Dallas, 214-948-4480.",
  phone:"214-670-1685",addr:"1500 Marilla Street, Dallas, TX 75201",links:[["Small business","https://www.dallasecodev.org/691/Small-Business"],["Assistance Program","https://www.dallasecodev.org/693/Small-Business-Assistance-Program"]]},
 {n:"Dallas Public Library",who:"Business & Entrepreneurship resources",pills:["Free"],fit:ALL,
  d:"Business databases with a library login, including Gale's entrepreneurship collection with sample business plans and Reference Solutions for finding customers. The Central Library's Patent and Trademark Resource Center offers free help searching patents and trademarks.",
  phone:"214-670-1400",phone2:["Patents & trademarks","214-670-1468"],addr:"Central Library, 1515 Young Street, Dallas, TX 75201",links:[["Business & Entrepreneurship","https://www.dallaslibrary.org/research/business-entrepreneurship"]]},
 {n:"Business & Community Lenders of Texas",who:"Nonprofit lender with a Dallas office",pills:["Loans","Free"],fit:ALL,
  d:"Offers a no-cost consultation on your business goals and lending for growing businesses across Texas. Loans must be repaid.",
  phone:"214-688-7456",addr:"400 S. Zang Blvd., Suite 1220, Dallas, TX 75208",links:[["BCL of Texas","https://www.bcloftexas.org/"]]},
 {n:"Greater Dallas Hispanic Chamber of Commerce",who:"Chamber founded in 1939",pills:["May cost"],fit:ALL,
  d:"Advocacy, education and connections for Hispanic and small business owners of every background in North Texas, including bid opportunities and a business directory.",
  phone:"214-521-6007",links:[["GDHCC","https://www.gdhcc.com/"]]},
 {n:"Dallas Black Chamber of Commerce",who:"Chamber for Black-owned businesses",pills:["May cost"],fit:ALL,
  d:"Advocacy, business training and access to funding for Black-owned businesses, including grant programs run with partners.",
  phone:"214-702-6652",addr:"2922 Martin Luther King Jr. Blvd., Building A, Suite 104, Dallas, TX 75215",links:[["DBCC","https://www.dbcc.org/"]]},
 {n:"Dallas Regional Chamber",who:"Regional business chamber",pills:["May cost"],fit:ALL,
  d:"Events, leadership programs and economic development work across the Dallas region. Has advertised free one-on-one AI Office Hours sessions for businesses.",links:[["Dallas Regional Chamber","https://www.dallaschamber.org/"]]},
 {n:"Legal Aid of NorthWest Texas",who:"Civil legal help for eligible low-income residents",pills:["Free if eligible"],fit:ALL,
  d:"Free civil legal services in 114 North and West Texas counties. Mostly not business law, but ask whether your issue qualifies.",
  phone:"888-529-5277",phone2:["Dallas office","214-748-1234"],addr:"1515 Main St., Dallas, TX 75201",links:[["How to apply","https://legalaidtx.org/get-help/how-to-apply/"],["Legal Aid of NorthWest Texas","https://legalaidtx.org/"]]}
];
const fits=(r,t)=>r.fit===ALL||r.fit.includes(t);
const specific=(r,t)=>r.fit!==ALL&&r.fit.includes(t);
function crow(l,v){return `<div class="crow"><span class="lbl">${esc(l)}</span><span class="val">${esc(v)}</span><button type="button" class="copy" data-copy-text="${esc(v)}">${u("copy")}</button></div>`}
function pillCls(p){return p==="Free"?"":["Selective","Tech","Official","Non-dilutive"].includes(p)?" sel":" alt"}
function archText(){const t0=new Date();t0.setHours(0,0,0,0);const d=Math.round((new Date(2026,10,20)-t0)/864e5);return u("arch",d)}
const tw=(map,k)=>(es()&&ES[map]&&ES[map][k])||k;
function richCard(r0){
  const r=es()&&ES.res[r0.n]?Object.assign({},r0,ES.res[r0.n]):r0;
  const c=[];if(r.phone)c.push(crow(u("phone"),r.phone));if(r.phone2)c.push(crow(tw("lbl",r.phone2[0]),r.phone2[1]));if(r.email)c.push(crow(u("email"),r.email));
  if(r.addr)c.push(`<div class="crow"><span class="lbl">${u("address")}</span><span class="val">${esc(r.addr)}</span></div>`);
  const best=specific(r,S.type)?`<span class="pill fit">${u("bestFit")}</span>`:"";
  return `<article class="panel card"><div class="row">${best}${r.pills.map(p=>`<span class="pill${pillCls(p)}">${esc(tw("pill",p))}</span>`).join("")}</div><h3>${esc(r.n)}</h3><div class="who">${esc(r.who)}</div>
  ${r.deadline?`<div class="deadline">${archText()}</div>`:""}<p>${esc(r.d)}</p>${c.length?`<div class="contacts">${c.join("")}</div>`:""}
  ${r.tip?`<div class="tip">${esc(r.tip)}</div>`:""}<div class="row">${r.links.map((l,i)=>`<a class="btn${i===0?" primary":""}" href="${l[1]}" target="_blank" rel="noopener">${esc(tw("link",l[0]))} ↗</a>`).join("")}</div></article>`;
}
let showAllHelp=false;
function group(title,sub,list,fresh){
  const t=S.type;
  const shown=(showAllHelp?[...list]:list.filter(r=>fits(r,t))).sort((a,b)=>specific(b,t)-specific(a,t));
  if(!shown.length)return "";
  const f=fresh?`<div class="fresh">${freshHTML(fresh[0],fresh[1],S.state)}</div>`:"";
  return `<div class="group"><div class="group-head"><h3>${title}</h3><span class="small muted">${sub}</span>${f}</div><div class="cards">${shown.map(richCard).join("")}</div></div>`;
}
function renderHelp(){
  const t=S.type,parts=[];let hidden=0;
  const count=l=>l.filter(r=>!fits(r,t)).length;
  if(isTulsa()){
    if(t==="software")parts.push(`<div class="callout mb-14">${u("tulsaTech")}</div>`);
    parts.push(group(u("gTulsa"),u("gTulsaSub"),TULSA,[UI.sTulsa,"tulsa"]));hidden+=count(TULSA);
  }
  if(S.state==="Oklahoma"){parts.push(group(u("gOk"),u("gOkSub"),OK_STATE,[UI.sOk,"oklahoma"]));hidden+=count(OK_STATE);
    if(!isTulsa())parts.push(`<p class="small muted group-hint">${u("tulsaHint")}</p>`);}
  if(isDallas()){parts.push(group(u("gDallas"),u("gDallasSub"),DALLAS,[UI.sDallas,"dallas"]));hidden+=count(DALLAS)}
  if(S.state==="Texas"){parts.push(group(u("gTx"),u("gTxSub"),TX_STATE,[UI.sTx,"texas"]));hidden+=count(TX_STATE);
    if(!isDallas())parts.push(`<p class="small muted group-hint">${u("dallasHint")}</p>`);}
  parts.push(group(u("gUs"),u("gUsSub"),NATIONAL));hidden+=count(NATIONAL);
  if(t==="software")parts.push(`<div class="note mb-24">${u("appReality")}</div>`);
  if(hidden||showAllHelp)parts.push(`<p class="small muted mb-14">${showAllHelp?u("showingAll"):u("hiddenCount",hidden)} <button type="button" class="linkbtn" id="helpToggle">${showAllHelp?u("showMatches"):u("showAll")}</button></p>`);
  $("#helpGroups").innerHTML=parts.join("");
  $("#helpLead").textContent=u("helpLead",SH(t),S.state);
}
$("#helpGroups").addEventListener("click",e=>{if(e.target.id==="helpToggle"){showAllHelp=!showAllHelp;renderHelp();$("#helpToggle").focus()}});

/* ---------- LLC by state ---------- */
$("#llcState").innerHTML=STATES.map(s=>`<option>${s}</option>`).join("");
function renderLLC(){
  const st=isState(S.llcState)?S.llcState:isState(S.state)?S.state:"Alabama";$("#llcState").value=st;const d=LLC[st],x=llcText(st);
  const special=x[2]?`<div class="${/publish|\$800|\$400|\$500/i.test(d[4])?"warn":"callout"}"><strong>${u("llcSpecial")}</strong> ${esc(x[2])}</div>`:`<div class="callout">${esc(u("llcNone",st))}</div>`;
  $("#llcCard").innerHTML=`<div><div class="kicker">${esc(st)}</div><h3 class="llc-doc">${docName(st)}</h3><p class="small muted">${u("llcDocSub")}</p></div>
   <div class="facts">
    <div class="fact"><div class="k">${u("llcFee")}</div><div class="v">${money(d[0])}</div><div class="s">${u("llcFeeSub")}</div></div>
    <div class="fact"><div class="k">${u("llcOngoing")}</div><div class="v">${ongoing(d)}</div><div class="s">${esc(x[1])}</div></div>
    <div class="fact wide"><div class="k">${u("llcFiling")}</div><div class="fact-text">${esc(x[0])}</div></div>
    <div class="fact wide"><div class="k">${u("llcNexus")}</div><div class="fact-text">${nexusText(st)}</div></div>
   </div>${special}
   <div class="row"><a class="btn primary" href="https://www.nass.org/initiatives/business-services" target="_blank" rel="noopener">${esc(u("llcOffice",st))}</a><button type="button" class="btn" data-copy-text="${esc(u("llcSummary",st,docName(st),money(d[0]),x[0],ongoing(d),x[1],x[2]))}">${u("llcCopy")}</button></div>`;
  $("#llcAsOf").textContent=u("llcAsOf",monthText(VERIFIED.llc));
  document.querySelector('[data-fresh="llc"]').innerHTML=freshHTML(UI.sLlc,"llc",st);
  renderLLCTable();
}
$("#llcState").addEventListener("change",()=>{const v=$("#llcState").value;if(isState(v)){S.llcState=v;save()}renderLLC()});
let llcSort={k:"name",dir:1};
function renderLLCTable(){
  const f=($("#llcFilter").value||"").toLowerCase();const cur=S.llcState||S.state;
  const rows=STATES.filter(s=>s.toLowerCase().includes(f)).map(s=>({s,d:LLC[s]}));
  const val=(r,k)=>k==="name"?r.s:k==="fee"?r.d[0]:(r.d[1]===null?-1:r.d[1]);
  rows.sort((a,b)=>{const va=val(a,llcSort.k),vb=val(b,llcSort.k);return (va>vb?1:va<vb?-1:0)*llcSort.dir});
  $("#llcTable tbody").innerHTML=rows.map(({s,d})=>{const x=llcText(s);return `<tr class="${s===cur?"me":""}"><th scope="row">${s}</th><td class="num">${money(d[0])}</td><td class="num">${d[1]===null?"—":ongoing(d)}</td><td>${esc(x[0])}<div class="small muted">${esc(x[1])}</div></td><td class="small">${esc(x[2]||"—")}</td></tr>`}).join("")||`<tr><td colspan="5" class="muted">${u("noMatch")}</td></tr>`;
  document.querySelectorAll("#llcTable thead th[scope=col]").forEach((th,i)=>{const b=th.querySelector("[data-sort]");if(!b){th.removeAttribute("aria-sort");return}
    th.setAttribute("aria-sort",b.dataset.sort===llcSort.k?(llcSort.dir>0?"ascending":"descending"):"none")});
}
$("#llcFilter").addEventListener("input",renderLLCTable);
$("#llcTable thead").addEventListener("click",e=>{const b=e.target.closest("[data-sort]");if(!b)return;const k=b.dataset.sort;llcSort=llcSort.k===k?{k,dir:-llcSort.dir}:{k,dir:1};renderLLCTable()});

/* ---------- Selling across states ---------- */
$("#pickGrid").innerHTML=STATES.map((s,i)=>`<label><input type="checkbox" id="pk${i}" value="${s}"> ${s}</label>`).join("");
function syncReach(){
  document.querySelectorAll("#reach button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.reach===S.reach)));
  $("#pickWrap").hidden=S.reach!=="some";
  document.querySelectorAll("#pickGrid input").forEach(i=>i.checked=S.pick.includes(i.value));
  $("#pickCount").textContent=u("pickCount",S.pick.length);
}
$("#reach").addEventListener("click",e=>{const b=e.target.closest("[data-reach]");if(!b||!REACH_SET.has(b.dataset.reach))return;S.reach=b.dataset.reach;save();syncReach();renderReach();renderChecklist()});
$("#pickGrid").addEventListener("change",()=>{S.pick=statesOf([...document.querySelectorAll("#pickGrid input:checked")].map(i=>i.value));save();syncReach();renderReach()});
$("#pickNone").addEventListener("click",()=>{S.pick=[];save();syncReach();renderReach()});
function block(n,title,html){return `<div class="panel pad out-block"><h3><span class="n">${n}</span>${title}</h3>${html}</div>`}
const REG={
  software:"Apps that hold or move money (money transmission), lend, offer insurance, provide medical care (telehealth providers must be licensed where the patient is), broker real estate, run gambling, fantasy sports or paid sweepstakes, sell or deliver alcohol, cannabis or firearms, or collect debts usually need licenses state by state. Some categories are banned in certain states.",
  ecommerce:"Alcohol, tobacco and vaping products, firearms and ammunition, CBD and hemp, supplements and cosmetics carry state-specific shipping and licensing rules. Some states ban certain products outright.",
  retail:"Alcohol, tobacco, firearms, CBD and some chemicals carry state-specific rules when sold or shipped across state lines.",
  food:"Cottage food usually can't be sold across state lines. Shipping food interstate generally means a licensed facility, FDA food facility registration and labeling compliance. Meat and poultry need USDA inspection. Alcohol shipping is heavily restricted state by state.",
  services:"Licensed professionals (accountants, lawyers, therapists, engineers, real estate agents, financial advisers) generally need a license in the client's state, though some professions have interstate compacts or mobility rules.",
  care:"Health and wellness providers generally need a license in the state where the client is, including for telehealth. Some professions have interstate licensure compacts.",
  child:"Childcare licensing is state-specific. Online tutoring generally isn't licensed, but background-check and child-privacy rules still apply.",
  trades:"Contractor licenses rarely transfer. You'll usually need a license, bond and registration in each state where you perform work.",
  home:"Business licenses are local and pesticide applicator licenses are state-specific. Expect to register in each state and city where you work.",
  transport:"Interstate for-hire carriers need federal USDOT registration and operating authority. Household goods movers have additional federal and state rules.",
  creative:"Event and sales permits are local. Selling art or merchandise at out-of-state events usually needs a temporary sales tax permit there.",
  other:"Check whether your activity is licensed in each target state using the licensed occupations finder."
};
function reachCtx(){
  const others=(S.reach==="all"?STATES:S.reach==="some"?S.pick:[]).filter(s=>s!==S.state);
  return {S,others,t:S.type,block,esc,L,LIC,NEXUS,nexusText,nexusNote,
    rows:others.filter(s=>NEXUS[s]!==null).map(s=>`<tr><th scope="row">${esc(s)}</th><td class="num">${nexusText(s)}</td><td class="small">${esc(nexusNote(s))}</td></tr>`).join(""),
    noTax:others.filter(s=>NEXUS[s]===null),asOf:monthText(VERIFIED.nexus),fresh:`<div class="fresh">${freshHTML(UI.sNexus,"nexus",S.state)}</div>`};
}
function renderReach(){
  if(es()){$("#reachOut").innerHTML=ES.reach(reachCtx()).join("");return}
  const c=reachCtx(),t=S.type,home=S.state||"your home state",others=c.others;
  const out=[];let n=1;
  if(S.reach==="home"){
    out.push(block(n++,"Selling only in "+esc(home),`<p>You register, collect sales tax and get licenses in ${esc(home)} only. Two cautions: online sales can still reach customers in other states, and once out-of-state sales pass a state's threshold you owe that state's sales tax. To stay in-state, limit sales by shipping address or the customer's location.</p>`));
  }else{
    out.push(block(n++,"Do you need to register your LLC in other states?",`<p>Usually <strong>not</strong> just for selling online or shipping to customers there. You must register as a “foreign” LLC in a state when you are <strong>doing business</strong> there, which typically means:</p>
      <ul class="clean"><li>An office, store, warehouse or other physical location</li><li>Employees working there, including remote employees</li><li>Regular in-person work there, such as jobs on client sites</li><li>Owning or leasing property, or holding inventory there (some states count marketplace warehouses)</li></ul>
      <p class="small muted">Each foreign registration needs a registered agent in that state and its own annual report and fee. One remote employee in another state usually also means registering there for payroll tax and unemployment insurance.</p>`));
    if(S.reach==="some"&&!others.length){out.push(`<div class="callout">Select the states where you'll sell, above, to see each one's sales tax threshold.</div>`)}
    else{
      const label=S.reach==="all"?"all states":`${others.length} selected`;
      let note="";
      if(t==="software")note=`<div class="callout"><strong>For apps:</strong> sales through the Apple App Store and Google Play are handled by the store, which collects and remits sales tax as a marketplace facilitator. For direct web sales or subscriptions, whether SaaS and digital products are taxable differs state by state. A merchant-of-record service can take this on for you.</div>`;
      else if(["ecommerce","retail","creative"].includes(t))note=`<div class="callout"><strong>Marketplaces help:</strong> Amazon, Etsy, eBay and similar marketplaces collect and remit sales tax on sales made through them. Sales on your own website count toward your own thresholds.</div>`;
      else if(t==="food")note=`<div class="callout">Grocery-type food is exempt or taxed at a reduced rate in many states, while prepared food is usually taxable. Check each state's rules for what you sell.</div>`;
      else note=`<div class="callout">Many services aren't subject to sales tax, but some states tax certain services, such as cleaning, repairs or digital services. Ask each state's revenue department about your specific service.</div>`;
      out.push(block(n++,"Sales tax: when you owe it in each state",`<p>States can require out-of-state sellers to collect sales tax once sales into the state pass a threshold (“economic nexus”). Below it, you generally don't collect there. Your home state taxes taxable sales from day one.</p>${note}
        ${c.rows?`<div class="scroll-table panel mh-360" tabindex="0" role="region" aria-label="Sales tax thresholds by state"><table class="tbl-480"><thead><tr><th scope="col">State (${label})</th><th scope="col">Collect after</th><th scope="col">Note</th></tr></thead><tbody>${c.rows}</tbody></table></div>`:""}
        ${c.noTax.length?`<p class="small"><strong>No statewide sales tax:</strong> ${c.noTax.map(esc).join(", ")}.</p>`:""}
        <p class="small muted">Measured over the current or prior year (a rolling 12 months in some states). As listed ${c.asOf}. Once you cross a threshold, register with that state before collecting.</p>${c.fresh}`));
    }
    out.push(block(n++,"Income and franchise taxes",`<p>Some states tax businesses that earn revenue from their residents even with no physical presence, using their own thresholds. Because an LLC usually passes income through to you, growing sales can mean filing returns in more than one state. A tax adviser can tell you when that starts for you.</p>`));
    out.push(block(n++,"Privacy and consumer laws",`<p>About 20 states now have comprehensive consumer privacy laws. Most apply only above thresholds, such as handling personal data of 100,000 or more of the state's residents. California's applies at about $26 million in annual revenue (adjusted yearly) or 100,000+ California consumers; Texas's applies to most businesses that aren't SBA-defined small businesses.</p>
      <ul class="clean"><li>Publish a clear privacy policy everywhere you sell.</li><li>Every state has a data-breach notification law.</li><li>Many states have automatic-renewal laws for subscriptions: clear terms, consent and easy online cancellation.</li>${t==="software"?"<li>Apps aimed at children under 13 must follow COPPA nationwide.</li>":""}</ul>`));
    out.push(block(n++,"Regulated activity in each state",`<p>${REG[t]}</p><p>${L("Search licenses by state and occupation",LIC)}</p>`));
    if(t==="software")out.push(block(n++,S.reach==="some"?"Launching your app in selected states only":"Launching your app nationwide",
      S.reach==="some"?`<p><strong>The App Store and Google Play restrict availability by country, not by U.S. state.</strong> To launch in selected states, control it inside your app:</p>
        <ul class="clean"><li>Ask for the user's state at sign-up and check it against your allowed list.</li><li>Use device location or IP checks if your category legally requires it (gambling, sweepstakes, telehealth).</li><li>Show a “coming soon to your state” waitlist instead of a dead end. It's free demand data for your next launch.</li><li>List eligible states in your terms of service.</li></ul>`
      :`<p>A typical nationwide app needs only your home-state LLC, a privacy policy and terms, and sales tax handled by the app store or a merchant-of-record service. Revisit registration when you hire out of state, open an office or pass sales tax thresholds. If any feature is regulated, turn it on only in states where you're licensed.</p>`));
  }
  $("#reachOut").innerHTML=out.join("");
}

/* ---------- Get known ---------- */
const CHANNELS={
  software:[["Pilot customers","Hand-pick 3–5 organizations with the exact problem. Their results become your case studies."],["Launch communities","Product Hunt, Show HN on Hacker News and relevant subreddits. Read each community's self-promotion rules first."],["App store optimization","A clear name and subtitle, a keyword-rich description, real screenshots and an early run of honest reviews."],["LinkedIn and email for B2B","Personal, specific outreach to the role that feels the problem. Share what you're learning in public."],["Content and SEO","Answer the exact questions your customers search. It compounds over time."],["Integrations and partners","Get listed in the marketplaces of tools your customers already use."]],
  ecommerce:[["Marketplaces","Etsy, Amazon, eBay or niche marketplaces bring buyers you don't have yet."],["Short video","Show the product in use on TikTok, Instagram and YouTube Shorts."],["Email list from day one","Offer something useful for sign-ups; email is the channel you own."],["Search","Product pages written for what buyers search, with real photos and reviews."],["Creator partnerships","Send product to small creators in your niche, with clear #ad disclosure."],["Pop-ups and markets","Sell in person to test pricing and collect emails."]],
  services:[["Your network","Tell everyone what you do and who you help, specifically. Most early clients come from referrals."],["LinkedIn","Post useful insights from your field and engage with clients' posts."],["Speaking and workshops","Chambers, libraries and associations need speakers. Teach something useful."],["Partnerships","Team up with businesses that serve the same clients but don't compete."],["Google Business Profile","Free and important for local searches."],["Case studies","Write up each result with the client's permission."]],
  retail:[["Google Business Profile","Hours, photos, products and reviews show up in Maps."],["Opening and events","Give people a reason to come in: classes, launches, local makers."],["Local partnerships","Cross-promote with nearby businesses."],["Instagram and Facebook","New arrivals, behind the scenes, staff picks."],["Window and signage","Your storefront is your billboard; check sign permits."],["Loyalty program","Reward repeat visits; repeat customers cost far less to win."]],
  food:[["Farmers markets and events","Sampling is the fastest way to win food customers."],["Instagram and TikTok","Food is visual. Show the making, not only the final dish."],["Google and Yelp listings","Accurate hours, menu and photos."],["Local food writers","Invite them to try you, with no strings attached."],["Catering and offices","Office lunches and events can build steady volume."],["Delivery apps","Reach new customers, but check commissions against your margins."]],
  trades:[["Google Business Profile and Local Services Ads","Google screens and badges eligible providers in many trades."],["Nextdoor","Neighbors recommend contractors constantly."],["Yard signs and vehicle wraps","Every job site advertises the next one (check sign rules)."],["Realtors and property managers","They need reliable trades every week."],["Before-and-after photos","Show your work with the homeowner's permission."],["Referral thank-yous","Reward customers who send you jobs."]],
  home:[["Nextdoor and neighborhood groups","Where people ask for cleaners and lawn crews."],["Google Business Profile","Essential for “near me” searches."],["Door hangers in a tight radius","Route density saves drive time. Check local solicitation rules."],["Recurring-service plans","Weekly or biweekly plans build predictable revenue."],["Realtors and property managers","Move-in and move-out cleans, turnovers and yard work."],["Referral rewards","A free service for every referral that books."]],
  care:[["Online booking","Let people book instantly from your profile and website."],["Instagram","Before-and-after work, with written client consent."],["Intro offers","A discounted first visit or class lowers the barrier."],["Partnerships","Gyms, salons, clinics and wellness businesses can refer to each other."],["Google reviews","Ask after great visits."],["Community classes","Free workshops or events to meet new clients."]],
  child:[["Word of mouth","Parents trust other parents most."],["Child Care Resource & Referral agencies","Licensed providers can be listed with their local CCR&R agency."],["Parent groups and schools","Local parent groups, PTAs and community boards."],["Open houses","Let parents see the space and meet you."],["Google Business Profile","With licensing info and real photos (no children's faces without consent)."],["Employer partnerships","Local employers may help staff find care."]],
  transport:[["Direct outreach to local businesses","Florists, pharmacies, shops and restaurants need dependable delivery."],["Load boards and platforms","For freight, reputable load boards; for moving, review platforms."],["Google Business Profile","Show your service area and reviews."],["Property managers and realtors","Movers get steady referrals from them."],["Reliability record","On-time stats and reviews are your best pitch."],["B2B contracts","Recurring routes beat one-off jobs."]],
  creative:[["Portfolio site","Your best ten pieces, clear pricing or a booking link."],["Social platforms","Instagram, TikTok, Behance or YouTube, wherever your buyers browse."],["Markets, festivals and shows","Sell in person and collect emails."],["Collaborations","Partner with other creators and local venues."],["Commissions","Offer custom work to past buyers."],["Press and local media","Pitch a story, not an ad."]],
  other:[["Talk to customers","Find where your customers already gather, online and off."],["Google Business Profile","Free and useful for most local businesses."],["Your network","Referrals drive most early sales."],["Partnerships","Businesses serving the same customers."],["Email list","Own your audience from day one."],["Local events","Meet people in person."]]
};
function renderGrow(){
  if(es()){const g=ES.grow({t:S.type,sh:SH(S.type),L});$("#growLead").textContent=g.lead;["pilot","trial","promo","chan","rules"].forEach(k=>$("#panel-"+k).innerHTML=g[k]);return}
  const t=S.type,sh=SHORT[t],b2b=["software","services","transport"].includes(t);
  $("#growLead").textContent=`Proven ways to win your first customers in ${sh}, plus the rules that keep your marketing legal.`;
  $("#panel-pilot").innerHTML=`<div class="grid2">
    <div class="panel pad stack"><h3>Run a pilot that turns into a paying customer</h3>
    <ol class="steps-list">
      <li><div><strong>Pick 3 to 5 ideal customers</strong><span>People with the exact problem you solve and the ability to buy. ${b2b?"Know who signs and who'll use it.":"Friends are fine for feedback, but real customers prove demand."}</span></div></li>
      <li><div><strong>Agree on success up front</strong><span>One or two measurable results, such as hours saved, no-shows cut or sales added. Record today's number so you can compare.</span></div></li>
      <li><div><strong>Time-box it</strong><span>${t==="software"?"30 to 90 days for software.":"2 to 8 weeks for most products and services."} Set the end date and a decision meeting on day one.</span></div></li>
      <li><div><strong>Charge something if you can</strong><span>A discounted paid pilot gets more commitment than a free one. If it's free, ask for something in return: time, data, a testimonial or a referral.</span></div></li>
      <li><div><strong>Put it in writing</strong><span>Scope, length, price, what happens after (conversion price and start date), confidentiality and data use, and permission to share results. The letter builder has a pilot proposal.</span></div></li>
      <li><div><strong>Check in weekly</strong><span>Short check-ins catch problems early and build the relationship that leads to a purchase.</span></div></li>
      <li><div><strong>Ask for the decision</strong><span>Share the results against the success measures and ask directly whether they'll continue at the agreed price.</span></div></li>
    </ol></div>
    <div class="stack">
      <div class="callout"><strong>Pilot agreement checklist</strong><ul class="clean mt-6"><li>Who, what and for how long</li><li>Price, or why it's free and what you get in exchange</li><li>Success measures and how they're tracked</li><li>Support you'll provide</li><li>Data handling, confidentiality and who owns improvements</li><li>Conversion terms: price, start date and notice to cancel</li><li>Permission for a testimonial or case study</li></ul></div>
      <div class="note"><strong>Common mistakes:</strong> no end date, no success measure, or building custom features for one pilot. Keep the pilot close to the product you'll sell to everyone.</div>
      <div class="panel pad"><h4>Where to find pilot customers</h4><p class="small muted mt-4">Your customer interviews, your SBDC or SCORE mentor's network, local business associations, industry groups and LinkedIn. The people who described the problem in the most detail are your best candidates.</p></div>
    </div></div>`;
  const offers=[["Free trial (7–30 days)","Full access for a limited time. Best when value shows up quickly. Requiring a card up front usually raises conversion but lowers sign-ups."],["Freemium","A free plan with paid upgrades. Works when the free plan costs you little and naturally leads to the paid plan."],["Money-back guarantee","Charge from day one and refund if unhappy. Builds trust where a free trial isn't practical."],["Intro offer or first-visit discount","Common for services, food, fitness and personal care. Price it so a first visit is profitable or close to it."],["Samples and demos","Tastings, samples or a live walkthrough. Let people experience it before they buy."]];
  const rec={software:"Free trial or freemium",ecommerce:"Money-back guarantee",services:"Paid pilot or a small first project",retail:"Samples and demos",food:"Samples and demos",trades:"Free estimates and a workmanship guarantee",home:"Intro offer on the first service",care:"Intro offer or first-visit discount",child:"Open house or trial day",transport:"Discounted first route",creative:"Small commission or mini-session",other:"Intro offer"}[t];
  $("#panel-trial").innerHTML=`<div class="grid2">
    <div class="panel pad stack"><h3>Choose the right trial or offer</h3><div class="callout"><strong>Usually best for ${sh}:</strong> ${rec}.</div>
      <div class="stack gap-10">${offers.map(([h,p])=>`<div class="panel offer"><h4>${h}</h4><p class="small muted">${p}</p></div>`).join("")}</div></div>
    <div class="stack">
      <div class="panel pad stack"><h3>Make trials convert</h3><ul class="clean"><li>Get new users to the one moment where they see value, as fast as possible.</li><li>Send short check-ins during the trial with tips, not sales pressure.</li><li>Remind people before a trial ends or converts to paid.</li><li>Ask people who don't convert why. That's your roadmap.</li></ul></div>
      <div class="warn"><strong>Subscription and auto-renew rules:</strong> many states require you to show renewal terms clearly before purchase, get clear consent, send reminders in some cases, and let people cancel as easily as they signed up, often online. A federal FTC rule on this was struck down in 2025, but state laws such as California's still apply. Follow the strictest version everywhere you sell.</div>
    </div></div>`;
  $("#panel-promo").innerHTML=`<div class="grid2">
    <div class="panel pad stack"><h3>Launch and promotion ideas for ${sh}</h3>
    <ul class="clean">
      <li><strong>Founding-customer pricing:</strong> a lasting discount for the first 25 or 50 customers. Creates urgency without cutting prices for everyone.</li>
      <li><strong>Referral program:</strong> reward both the referrer and the new customer. Simple rewards work best.</li>
      <li><strong>Launch moment:</strong> ${t==="software"?"a live demo or online launch day with a limited-time offer.":"an opening, tasting, open house or pop-up with a reason to come now."}</li>
      <li><strong>Partner promotions:</strong> bundle with a complementary local business or tool.</li>
      <li><strong>Calendar hooks:</strong> tie offers to dates your customers already care about.</li>
      <li><strong>Press:</strong> local news, trade publications and podcasts want stories. Pitch the problem you solve and a real customer result.</li>
    </ul></div>
    <div class="stack">
      <div class="warn"><strong>Giveaways and sweepstakes:</strong> a prize awarded by chance must be free to enter (“no purchase necessary,” with an equally visible free way to enter), or it can be an illegal lottery. Publish official rules. New York and Florida require registration and bonding for sweepstakes with prizes over $5,000. Social platforms also have their own promotion rules.</div>
      <div class="panel pad"><h4>Measure every promotion</h4><p class="small muted mt-4">Use a unique code or link per promotion, set a goal before you start, and compare the cost with the profit from new customers. Stop what doesn't pay back.</p></div>
    </div></div>`;
  $("#panel-chan").innerHTML=`<p class="muted mb-12">The highest-value channels for ${sh}. Pick two, work them consistently for 90 days, then add more.</p>
    <div class="chan">${(CHANNELS[t]||CHANNELS.other).map(([h,p])=>`<div class="panel"><h4>${h}</h4><p>${p}</p></div>`).join("")}</div>
    <div class="callout mt-14"><strong>Free for nearly every business:</strong> a one-page website with a clear offer and contact method, an email list, and asking every happy customer for a review and a referral.</div>`;
  const rules=[["Endorsements and influencers","Anyone paid or given free product to promote you must clearly disclose it in the post itself, such as #ad. You're responsible for making sure they do.",["FTC endorsement guides","https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews"]],
       ["Reviews","Fake reviews, buying reviews, and rewarding only positive ones are illegal under the FTC's 2024 rule, with civil penalties. Asking every customer for an honest review is fine.",["FTC reviews guidance","https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews"]],
       ["Email marketing (CAN-SPAM)","Accurate sender and subject lines, your physical mailing address, and a working unsubscribe honored within 10 business days.",["FTC CAN-SPAM guide","https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business"]],
       ["Texts and calls (TCPA)","Marketing texts and autodialed calls need prior express written consent, plus opt-out instructions. Penalties are per message.",["FCC: telemarketing and robocalls","https://www.fcc.gov/general/telemarketing-and-robocalls"]],
       ["Truth in advertising","Claims must be true and backed by evidence. “Made in USA” means all or virtually all. “Free” must really be free.",["FTC advertising guidance","https://www.ftc.gov/business-guidance/advertising-marketing"]],
       ["Contests and sweepstakes","No purchase necessary for chance-based prizes, published official rules, and state registration for large prizes in some states.",null]];
  $("#panel-rules").innerHTML=`<div class="grid2">${rules.map(([h,p,l])=>`<div class="panel pad stack"><h3>${h}</h3><p class="fs-93">${p}</p>${l?`<p class="small">${L(l[0],l[1])}</p>`:""}</div>`).join("")}</div>`;
}
const tabList=()=>[...document.querySelectorAll('#growTabs [role="tab"]')];
$("#growTabs").addEventListener("click",e=>{const b=e.target.closest('[role="tab"]');if(b)selectTab(b)});
$("#growTabs").addEventListener("keydown",e=>{const tabs=tabList();const i=tabs.indexOf(document.activeElement);if(i<0)return;
  let nx=null;if(e.key==="ArrowRight"||e.key==="ArrowLeft")nx=tabs[(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length];else if(e.key==="Home")nx=tabs[0];else if(e.key==="End")nx=tabs[tabs.length-1];
  if(nx){e.preventDefault();nx.focus();selectTab(nx)}});
function selectTab(b){tabList().forEach(t=>{const on=t===b;t.setAttribute("aria-selected",String(on));t.tabIndex=on?0:-1;document.getElementById(t.getAttribute("aria-controls")).hidden=!on})}
tabList().forEach((t,i)=>t.tabIndex=i?-1:0);

/* ---------- Letter builder ---------- */
const EXTRA={
  advice:[["exHelp","What you need help with","textarea","choosing a structure, the licenses I need, and funding I may qualify for"]],
  pilot:[["exLen","Pilot length","text","60 days"],["exPrice","Pilot price","text","no cost, or $250 for the pilot"],["exGoal","Success measure","text","cut missed appointments by 25%"],["exAfter","Price after the pilot","text","$99 per month"]],
  intro:[["exProblem","The problem you solve for them","text","missed appointments that cost clinics revenue every week"],["exProof","Proof or early result (optional)","text","Pilot clinics cut no-shows by 30% in two months."]],
  partner:[["exAsk","What you're asking for","text","a co-hosted workshop for local small business owners"],["exGive","What they get in return","textarea","logo placement, a speaking slot and introductions to our customers"]],
  loi:[["exUse","How they'd use your product or service","text","appointment reminders for two clinic locations"],["exQty","Expected quantity or users","text","2 locations, about 40 staff"],["exWhen","Expected start","text","Q1 2027"],["exPrice2","Indicative price","text","$99 per month per location"]],
  program:[["exProgram","Program name","text","Small Business Innovation Program"],["exStage","Your stage","text","a working prototype with three pilot customers"],["exUseFunds","How you'd use support","textarea","finishing the product and running two more pilots"]],
  followup:[["exMet","When and how you met","text","our call on Tuesday"],["exNext","Agreed next step","text","a 30-day pilot starting next month"]]
};
const HINTS={advice:"To an SBDC, SCORE chapter, Women's Business Center or local program.",pilot:"Proposes a time-boxed trial with clear success measures and terms.",intro:"A short first-contact letter to a potential customer.",partner:"Asks a business or organization to partner with or sponsor you.",loi:"A non-binding statement of interest that a customer signs. Useful for grant and loan applications.",program:"Asks a grant or support program about eligibility.",followup:"Thanks someone after a meeting and confirms next steps."};
const XT=()=>es()?ES.EXTRA:EXTRA;
const LF=["lName","lTitle","lBiz","lContact","lWhat","lToName","lToTitle","lToOrg"];
function renderExtra(){
  const ty=LETTER_TYPES.has($("#lType").value)?$("#lType").value:"advice",L0=S.letter||{},X=XT()[ty];
  $("#extraWrap").innerHTML=X.map(([id,lab,kind,ph])=>`<div class="field${kind==="textarea"?" full":""}"><label for="${id}">${lab}</label>${kind==="textarea"?`<textarea id="${id}" rows="2" placeholder="${esc(u("eg",ph))}"></textarea>`:`<input id="${id}" type="text" placeholder="${esc(u("eg",ph))}">`}</div>`).join("");
  X.forEach(([id])=>{document.getElementById(id).value=L0[id]||""});
  $("#lTypeHint").textContent=es()?ES.HINTS[ty]:HINTS[ty];
}
const vv=id=>{const el=document.getElementById(id);return el?el.value.trim():""};
function buildLetter(){
  const ty=LETTER_TYPES.has($("#lType").value)?$("#lType").value:"advice";
  if(es())return ES.letter(ty,{vv,S,X:ES.EXTRA[ty],kind:SH(S.type),date:new Date().toLocaleDateString("es-US",{month:"long",day:"numeric",year:"numeric"})});
  const name=vv("lName")||"[Your name]",title=vv("lTitle"),biz=vv("lBiz")||"[Business name]",contact=vv("lContact")||"[Email · Phone]";
  const what=vv("lWhat")||"[what you offer]",toName=vv("lToName"),toTitle=vv("lToTitle"),toOrg=vv("lToOrg")||"[Organization]";
  const place=[S.city,S.state].filter(Boolean).join(", ")||"[City, State]";
  const date=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  const g=id=>vv(id)||"["+((EXTRA[ty].find(x=>x[0]===id)||[0,"detail"])[1]).toLowerCase()+"]";
  const sal=toName?`Dear ${toName}:`:`Dear ${vv("lToOrg")?vv("lToOrg")+" team":"Sir or Madam"}:`;
  const kind=SHORT[S.type];
  let subject="",body="";
  switch(ty){
    case "advice":subject=`Request for free advising: new business in ${place}`;
      body=`I am the founder of ${biz}, a new ${kind} business in ${place} offering ${what}. I am at an early stage with limited startup funds, and I would value your guidance.\n\nSpecifically, I would like help with ${g("exHelp")}.\n\nCould we schedule a free advising session? I am glad to meet online or in person at a time that suits you. Thank you for the work you do supporting local businesses.`;break;
    case "pilot":subject=`Pilot proposal: ${biz} and ${toOrg}`;
      body=`Thank you for sharing the challenges ${toOrg} faces. ${biz} offers ${what}, and I would like to propose a short pilot to show the results we can deliver for you.\n\nProposed pilot:\n• Length: ${g("exLen")}\n• Price: ${g("exPrice")}\n• Success measure: ${g("exGoal")}, compared with your current numbers\n• Support: setup, training and a weekly check-in\n• After the pilot: if the goal is met and you choose to continue, the price would be ${g("exAfter")}. There is no obligation to continue.\n\nWe would agree in writing on how your data is handled and kept confidential, and with your permission we would share the results as a case study.\n\nIf this sounds useful, I would welcome a brief call to confirm the details and a start date.`;break;
    case "intro":subject=`Helping ${toOrg} with ${g("exProblem")}`;
      body=`I am reaching out because many organizations like ${toOrg} deal with ${g("exProblem")}. ${biz} offers ${what}.\n\n${vv("exProof")?vv("exProof")+"\n\n":""}I would appreciate 15 minutes to learn how you handle this today and whether we could help. If now is not the right time, I would be grateful if you could point me to the right person.`;break;
    case "partner":subject=`Partnership request from ${biz}`;
      body=`${biz} is a ${place}-based business offering ${what}. Because we serve many of the same people as ${toOrg}, I believe a partnership could benefit us both.\n\nI would like to propose ${g("exAsk")}. In return, ${toOrg} would receive ${g("exGive")}.\n\nI am happy to adjust the details to fit your goals and would welcome a short conversation to explore the idea.`;break;
    case "loi":subject=`Letter of intent: ${toOrg} and ${biz}`;
      body=`This non-binding letter confirms that ${toOrg} is interested in using ${biz}'s offering, ${what}, subject to a final written agreement.\n\n• Intended use: ${g("exUse")}\n• Expected quantity or users: ${g("exQty")}\n• Expected start: ${g("exWhen")}\n• Indicative price: ${g("exPrice2")}\n\nThis letter expresses intent only. It does not create a binding obligation for either party to buy or sell, and any purchase will be governed by a separate written agreement.\n\nAcknowledged for ${toOrg}:\n\nSignature: ______________________\nName: ${toName||"______________________"}\nTitle: ${toTitle||"______________________"}\nDate: ______________________`;break;
    case "program":subject=`Inquiry about ${g("exProgram")}`;
      body=`I am the founder of ${biz} in ${place}. We offer ${what}, and we are currently at this stage: ${g("exStage")}.\n\nI am interested in ${g("exProgram")} and would like to confirm whether we are eligible. Support would help us with ${g("exUseFunds")}.\n\nCould you tell me:\n• Whether applications are open, and the next deadline\n• Eligibility requirements, including stage, revenue and location\n• Whether this is a grant, loan, investment or reimbursement\n• Which documents are required\n\nThank you for your time. I look forward to hearing from you.`;break;
    case "followup":subject=`Thank you, and next steps`;
      body=`Thank you for speaking with me during ${g("exMet")}. I appreciated learning more about ${toOrg} and your priorities.\n\nAs discussed, our next step is ${g("exNext")}. I will send any materials you need ahead of time and am glad to answer questions in the meantime.\n\nI look forward to working together.`;break;
  }
  const head=`${name}${title?", "+title:""}\n${biz}\n${place}\n${contact}\n\n${date}\n\n${[toName,toTitle,toOrg].filter(Boolean).join("\n")}\n\nRe: ${subject}\n\n${sal}\n\n`;
  const sign=`\n\nSincerely,\n\n\n${name}\n${title?title+", ":""}${biz}\n${contact}`;
  return {letter:head+body+sign,email:`Subject: ${subject}\n\n${toName?"Dear "+toName+",":"Hello,"}\n\n${body}\n\nBest regards,\n${name}\n${title?title+", ":""}${biz}\n${contact}`};
}
function renderLetter(){$("#letterOut").textContent=buildLetter().letter}
$("#lType").addEventListener("change",()=>{if(LETTER_TYPES.has($("#lType").value))S.letter.type=$("#lType").value;save();renderExtra();renderLetter()});
$("#letterForm").addEventListener("input",e=>{if(LETTER_FIELDS.has(e.target.id)){S.letter[e.target.id]=e.target.value;save()}renderLetter()});
function initLetter(){if(!isPlain(S.letter))S.letter={};$("#lType").value=LETTER_TYPES.has(S.letter.type)?S.letter.type:"advice";LF.forEach(id=>{document.getElementById(id).value=S.letter[id]||""});renderExtra();renderLetter()}
function flash(k){const m=$("#letterMsg");m.textContent=u(k);setTimeout(()=>m.textContent="",2200)}
$("#copyLetter").addEventListener("click",async function(){const ok=await copyText(buildLetter().letter,this);if(!ok)sel($("#letterOut"));flash(ok?"letterCopied":"letterSelect")});
$("#copyEmail").addEventListener("click",async function(){const ok=await copyText(buildLetter().email,this);flash(ok?"emailCopied":"emailFail")});
$("#clearLetter").addEventListener("click",function(){armed(this,"clearFields",()=>{const ty=S.letter.type;S.letter={type:ty};save();initLetter();flash("fieldsCleared")})});

/* ---------- Print or save as PDF ---------- */
let printSnap=null,printQuiet=0;
const printing=()=>printSnap!==null||Date.now()<printQuiet;
function preparePrint(){
  if(printSnap)return;
  printSnap=[...document.querySelectorAll("details")].map(d=>[d,d.open]);
  printSnap.forEach(([d])=>d.open=true);
}
function restorePrint(){
  if(printSnap){printSnap.forEach(([d,o])=>d.open=o);printSnap=null;printQuiet=Date.now()+600}
  delete document.body.dataset.print;
}
window.addEventListener("beforeprint",preparePrint);
window.addEventListener("afterprint",restorePrint);
document.addEventListener("click",e=>{const b=e.target.closest("[data-print-target]");if(!b)return;
  document.body.dataset.print=b.dataset.printTarget;preparePrint();window.print()});

/* ---------- Common ---------- */
async function copyText(text,btn){
  let ok=false;try{await navigator.clipboard.writeText(text);ok=true}catch(e){}
  if(btn){const o=btn.textContent;btn.textContent=ok?u("copied"):u("selectCopy");setTimeout(()=>btn.textContent=o,1500)}return ok;
}
function sel(el){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}
document.addEventListener("click",e=>{
  const ct=e.target.closest("[data-copy-text]");if(ct){copyText(ct.dataset.copyText,ct);return}
  const cl=e.target.closest("[data-copy-list]");if(cl){copyText([...document.getElementById(cl.dataset.copyList).children].map(li=>"• "+li.textContent).join("\n"),cl)}
});
const THEMES=new Set(["light","dark","auto"]);
let theme="auto";try{const t=localStorage.getItem("biz-starter-theme");if(THEMES.has(t))theme=t}catch(e){}
function applyTheme(t){if(!THEMES.has(t))t="auto";if(t==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",t);
  document.querySelectorAll("[data-theme-set]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.themeSet===t)));try{localStorage.setItem("biz-starter-theme",t)}catch(e){}}
document.querySelectorAll("[data-theme-set]").forEach(b=>b.addEventListener("click",()=>applyTheme(b.dataset.themeSet)));
applyTheme(theme);

/* Static text: English comes from the HTML itself; Spanish from SR_ES.html / SR_ES.attr */
const EN_HTML={},EN_ATTR={};
document.querySelectorAll("[data-i18n]").forEach(el=>{EN_HTML[el.dataset.i18n]=el.innerHTML});
const attrPairs=el=>el.dataset.i18nAttr.split(",").map(p=>p.split("="));
document.querySelectorAll("[data-i18n-attr]").forEach(el=>attrPairs(el).forEach(([a,k])=>{if(!(k in EN_ATTR))EN_ATTR[k]=el.getAttribute(a)}));
function applyStatic(){
  const x=es();
  document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n,v=x&&ES.html[k]!=null?ES.html[k]:EN_HTML[k];if(el.innerHTML!==v)el.innerHTML=v});
  document.querySelectorAll("[data-i18n-attr]").forEach(el=>attrPairs(el).forEach(([a,k])=>el.setAttribute(a,x&&ES.attr[k]!=null?ES.attr[k]:EN_ATTR[k])));
}
function setLang(l,first){
  LANG=l==="es"&&ES?"es":"en";
  if(!first){try{localStorage.setItem(LANG_KEY,LANG)}catch(e){}}
  document.documentElement.lang=LANG;
  document.querySelectorAll("[data-lang-set]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.langSet===LANG)));
  const canon=document.querySelector('link[rel="canonical"]');if(canon){const base=canon.href.split("?")[0];canon.href=base+(LANG==="es"?"?lang=es":"")}
  applyStatic();fillSelects();zipHint();syncReach();
  if(!first){renderExtra();renderAll();writeURL()}
}
document.querySelectorAll("[data-lang-set]").forEach(b=>b.addEventListener("click",()=>{if(LANGS.has(b.dataset.langSet))setLang(b.dataset.langSet)}));
setLang(LANG,true);

const navLinks=[...document.querySelectorAll("#navlinks a")];
const io=new IntersectionObserver(ents=>ents.forEach(en=>{if(en.isIntersecting)navLinks.forEach(a=>{const on=a.getAttribute("href")==="#"+en.target.id;a.classList.toggle("on",on);if(on)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current")})}),{rootMargin:"-30% 0px -60% 0px"});
document.querySelectorAll("main section").forEach(s=>io.observe(s));

const toTop=$("#toTop");
const onScroll=()=>toTop.classList.toggle("show",window.scrollY>500);
window.addEventListener("scroll",onScroll,{passive:true});onScroll();
toTop.addEventListener("click",()=>{window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});document.querySelector(".brand").focus({preventScroll:true})});

function renderAll(){renderChecklist();renderHelp();renderLLC();renderReach();renderGrow();renderLetter()}
syncReach();initLetter();renderAll();writeURL();
document.documentElement.classList.add("ready");
})();
