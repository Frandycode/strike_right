/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — LLC by state page
*/
(function(SR){
"use strict";
const D=SR.data,C=SR.core,S=C.S;
const {STATES,TYPES,SHORT,LLC,NEXUS,VERIFIED,LIC}=D;
const {u,UI,es,ES,TY,SH,$,esc,L,isState,isPlain,statesOf,REACH_SET,save,update,monthText,freshHTML,docName,llcText,money,nexusText,nexusNote,ongoing,isTulsa,isDallas,copyText,sel,armed,printing,writeURL,planLink}=C;
$("#llcState").innerHTML=STATES.map(s=>`<option>${s}</option>`).join("");
function renderLLC(){
  const st=isState(S.llcState)?S.llcState:isState(S.state)?S.state:"Alabama";$("#llcState").value=st;const d=LLC[st],x=llcText(st);
  const special=x[2]?`<div class="${/publish|\$800|\$400|\$500/i.test(d[4])?"warn":"callout"}"><strong>${u("llcSpecial")}</strong> ${esc(x[2])}</div>`:`<div class="callout">${esc(u("llcNone",st))}</div>`;
  $("#llcCard").innerHTML=`<div><div class="kicker">${esc(st)}</div><h2 class="llc-doc">${docName(st)}</h2><p class="small muted">${u("llcDocSub")}</p></div>
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
C.onRender(renderLLC);
})(window.SR=window.SR||{});
