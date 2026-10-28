/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — shared core: saved state, share links, language, helpers, print and theme
*/
(function(SR){
"use strict";
const {VERIFIED,REPORT_EMAIL,STATES,CODE_OF,STATE_OF,TYPES,SHORT,WHERE,REACH,LETTER_TYPES,LETTER_FIELDS,LLC,docNameEn,NEXUS,ZIP3,ZIP_EXCEPTIONS}=SR.data;
const KEY="biz-starter-guide-v2";
const LANG_KEY="strike-right-lang";
const ES=window.SR_ES||null;
const $=s=>document.querySelector(s);
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const L=(t,u)=>`<a href="${u}" target="_blank" rel="noopener">${t} ↗</a>`;
/* Allowlists: own-property / Set membership only, so keys like __proto__ or constructor never match */
const own=(o,k)=>typeof k==="string"&&Object.prototype.hasOwnProperty.call(o,k);
const STATE_SET=new Set(STATES),WHERE_SET=new Set(WHERE),REACH_SET=new Set(REACH);
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
let SAVED=null;
try{SAVED=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("biz-starter-guide-v1")||"null")}catch(e){}
/* One state object for the whole session; it is changed in place, never replaced */
const S=normalize(SAVED);
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}writeURL()}

/* ---------- Language ---------- */
const QP=new URLSearchParams(location.search);
let LANG="en";
try{LANG=localStorage.getItem(LANG_KEY)||"en"}catch(e){}
const LANGS=new Set(["en","es"]);
/* ?lang= is an explicit choice: it wins over storage and is saved, so the next page keeps it */
if(LANGS.has(QP.get("lang"))){LANG=QP.get("lang");if(LANG==="es"&&!ES)LANG="en";try{localStorage.setItem(LANG_KEY,LANG)}catch(e){}}
if(LANG!=="es"||!ES)LANG="en";
const es=()=>LANG==="es"&&ES;
const lang=()=>LANG;
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
  chipEmpty:"Set your state & business",chipAria:t=>`Your business: ${t}. Edit`,
  homeDone:(n,m)=>`${n} of ${m} checklist items done`,startTitle:(sh,loc)=>loc?`Everything for ${sh} in ${loc}`:`Everything for ${sh}`,
  stHelp:(n,b)=>`${n} resources · ${b} best fit${b===1?"":"s"}`,stLlc:(st,fee)=>`${st}: ${fee} filing fee`,stLlcNone:"Pick your state",
  stReach:{home:"Only my state",all:"All states"},stReachSome:n=>`${n} selected state${n===1?"":"s"}`,stGrow:"5 playbooks",
  stLetterDraft:t=>`Draft: ${t}`,stLetterNone:"7 letter templates",stGuides:"Structures · Funding · FAQ",stAbout:"No accounts, no tracking cookies",
  letterTypes:{advice:"free advising request",pilot:"pilot proposal",intro:"introduction",partner:"partnership request",loi:"letter of intent",program:"program inquiry",followup:"follow-up"},
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

/* ---------- Shareable plan links (work on every page; each page keeps its own path) ---------- */
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

/* ---------- Data helpers in the current language ---------- */
const docName=st=>es()?ES.docName(docNameEn(st)):docNameEn(st);
/* LLC text fields in the current language: [ongoing filing, timing, special rules] */
const llcText=st=>{const d=LLC[st],x=es()&&ES.llc[st];return x?x:[d[2],d[3],d[4]]};
const money=n=>"$"+(n%1?n.toFixed(2):n.toLocaleString("en-US"));
const nexusText=st=>{const n=NEXUS[st];if(n===null)return u("noSalesTax");return u("nexus",money(n[0]),n[1],n[2])};
const nexusNote=st=>{const n=NEXUS[st];return (es()&&ES.nexusNote[st])||(n&&n[3])||""};
const ongoing=d=>d[1]===null?u("none"):d[1]===0?"$0":money(d[1])+u("perYear");
const zipState=z=>{if(own(ZIP_EXCEPTIONS,z))return ZIP_EXCEPTIONS[z];const n=parseInt(z.slice(0,3),10);const m=ZIP3.find(([a,b])=>n>=a&&n<=b);return m?m[2]:null};
/* A saved or shared ZIP decides the state on load, as the original page did */
if(S.zip.length===5){const st=zipState(S.zip);if(st&&S.state!==st){S.state=st;S.llcState=st}}
function isTulsa(){
  const c=(S.city||"").toLowerCase();const z=(S.zip||"").slice(0,3);
  return S.state==="Oklahoma"&&(/tulsa|broken arrow|owasso|jenks|bixby|sand springs|sapulpa|glenpool|catoosa|skiatook|collinsville/.test(c)||z==="740"||z==="741");
}
function isDallas(){
  const c=(S.city||"").toLowerCase();const z=parseInt((S.zip||"").slice(0,3),10);
  return S.state==="Texas"&&(/\b(dallas|irving|garland|mesquite|richardson|plano|carrollton|grand prairie|arlington|duncanville|desoto|de soto|lancaster|rowlett|addison|farmers branch)\b/.test(c)||(S.zip.length>=3&&z>=750&&z<=753));
}

/* ---------- Rendering: every page registers its renderers; any change re-renders the page ---------- */
const renderers=[];
const onRender=fn=>renderers.push(fn);
/* Pending work (a debounced re-render) that must finish before a link is copied or the page is left */
const flushers=[];
const onFlush=fn=>flushers.push(fn);
const flushAll=()=>flushers.forEach(f=>f());
window.addEventListener("pagehide",flushAll);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flushAll()});
function renderAll(){renderers.forEach(fn=>fn())}
function update(){save();renderAll()}
function armed(btn,doneLabel,run){
  if(btn.dataset.armed){delete btn.dataset.armed;btn.textContent=u(doneLabel);run();return}
  btn.dataset.armed="1";btn.textContent=u("tapClear");setTimeout(()=>{if(btn.dataset.armed){delete btn.dataset.armed;btn.textContent=u(doneLabel)}},3000);
}

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

/* ---------- Copy, theme, language ---------- */
async function copyText(text,btn){
  let ok=false;try{await navigator.clipboard.writeText(text);ok=true}catch(e){}
  if(btn){const o=btn.textContent;btn.textContent=ok?u("copied"):u("selectCopy");setTimeout(()=>btn.textContent=o,1500)}return ok;
}
function sel(el){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}
document.addEventListener("click",e=>{
  const cp=e.target.closest("[data-copy-link]");if(cp){flushers.forEach(f=>f());writeURL();copyText(planLink(),cp);return}
  const ls=e.target.closest("[data-lang-set]");if(ls){if(LANGS.has(ls.dataset.langSet))setLang(ls.dataset.langSet);return}
  const ts=e.target.closest("[data-theme-set]");if(ts){applyTheme(ts.dataset.themeSet);return}
  const ct=e.target.closest("[data-copy-text]");if(ct){copyText(ct.dataset.copyText,ct);return}
  const cl=e.target.closest("[data-copy-list]");if(cl){copyText([...document.getElementById(cl.dataset.copyList).children].map(li=>"• "+li.textContent).join("\n"),cl)}
});
const THEMES=new Set(["light","dark","auto"]);
let theme="auto";try{const t=localStorage.getItem("biz-starter-theme");if(THEMES.has(t))theme=t}catch(e){}
function applyTheme(t){if(!THEMES.has(t))t="auto";if(t==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",t);
  document.querySelectorAll("[data-theme-set]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.themeSet===t)));try{localStorage.setItem("biz-starter-theme",t)}catch(e){}}
applyTheme(theme);

/* Static text: English comes from the HTML itself; Spanish from SR_ES.html / SR_ES.attr */
const EN_HTML={},EN_ATTR={};
const attrPairs=el=>el.dataset.i18nAttr.split(",").map(p=>p.split("="));
function captureEnglish(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{if(!(el.dataset.i18n in EN_HTML))EN_HTML[el.dataset.i18n]=el.innerHTML});
  document.querySelectorAll("[data-i18n-attr]").forEach(el=>attrPairs(el).forEach(([a,k])=>{if(!(k in EN_ATTR))EN_ATTR[k]=el.getAttribute(a)}));
}
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
  applyStatic();
  if(!first){renderAll();writeURL()}
}

/* ---------- Back to top ---------- */
const toTop=$("#toTop");
if(toTop){
  const onScroll=()=>toTop.classList.toggle("show",window.scrollY>500);
  window.addEventListener("scroll",onScroll,{passive:true});onScroll();
  toTop.addEventListener("click",()=>{window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});const b=document.querySelector(".site-band .brand");if(b)b.focus({preventScroll:true})});
}

/* Start after every deferred script has registered its renderers */
document.addEventListener("DOMContentLoaded",()=>{
  captureEnglish();setLang(LANG,true);renderAll();writeURL();
  document.documentElement.classList.add("ready");
});

SR.core={S,KEY,ES,es,lang,UI,u,TY,SH,$,esc,L,own,isType,isState,isPlain,statesOf,stateOfCode,WHERE_SET,REACH_SET,
  save,update,onRender,onFlush,flushAll,renderAll,writeURL,planLink,monthText,freshHTML,docName,llcText,money,nexusText,nexusNote,ongoing,zipState,
  isTulsa,isDallas,copyText,sel,armed,printing,captureEnglish,applyStatic,setLang};
})(window.SR=window.SR||{});
