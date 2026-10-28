/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Checklist page
*/
(function(SR){
"use strict";
const D=SR.data,C=SR.core,S=C.S;
const {STATES,TYPES,SHORT,LLC,NEXUS,VERIFIED,LIC}=D;
const {u,UI,es,ES,TY,SH,$,esc,L,isState,isPlain,statesOf,REACH_SET,save,update,monthText,freshHTML,docName,llcText,money,nexusText,nexusNote,ongoing,isTulsa,isDallas,copyText,sel,armed,printing,writeURL,planLink}=C;
const {buildPhases}=SR.plan;
let PH=[];
function renderChecklist(){
  PH=buildPhases();
  const loc=[S.city,S.state].filter(Boolean).join(", ");
  $("#planTitle").textContent=u("planTitle",loc);
  $("#planLead").textContent=u("planLead",SH(S.type),S.hire,S.state);
  const first=PH.findIndex(p=>p.items.some(i=>!S.done[i[0]]));
  $("#phases").innerHTML=PH.map((p,idx)=>{
    const open=(p.n in S.open)?S.open[p.n]:idx===first;
    return `<details class="phase" data-step="${p.n}"${open?" open":""}><summary><span class="badge">${idx+1}</span><div class="minw-0"><div class="sn">${p.label}</div><h2 class="h3">${p.t}</h2></div><div class="meta"><span class="c"></span><span class="mb"><span></span></span></div><span class="chev" aria-hidden="true"></span></summary>
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
$("#clearPlan").addEventListener("click",function(){armed(this,"clearChecks",()=>{S.done={};S.open={};save();renderChecklist()})});
$("#copyPlan").addEventListener("click",function(){
  /* <template> content is inert: nothing in it loads or runs while we read its text */
  const tmp=document.createElement("template");const lines=[$("#planTitle").textContent.toUpperCase(),""];
  PH.forEach(p=>{lines.push(`${p.label}: ${p.t}`);p.items.forEach(([id,label])=>{tmp.innerHTML=label;lines.push(`  [${S.done[id]?"x":" "}] ${tmp.content.textContent.trim()}`)});lines.push("")});
  copyText(lines.join("\n"),this);
});
C.onRender(renderChecklist);
})(window.SR=window.SR||{});
