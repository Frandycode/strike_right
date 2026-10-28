/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Free help page
*/
(function(SR){
"use strict";
const D=SR.data,C=SR.core,S=C.S;
const {STATES,TYPES,SHORT,LLC,NEXUS,VERIFIED,LIC}=D;
const {u,UI,es,ES,TY,SH,$,esc,L,isState,isPlain,statesOf,REACH_SET,save,update,monthText,freshHTML,docName,llcText,money,nexusText,nexusNote,ongoing,isTulsa,isDallas,copyText,sel,armed,printing,writeURL,planLink}=C;
const {ALL,NATIONAL,OK_STATE,TULSA,TX_STATE,DALLAS,fits,specific}=SR.resources;
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
  return `<div class="group"><div class="group-head"><h2>${title}</h2><span class="small muted">${sub}</span>${f}</div><div class="cards">${shown.map(richCard).join("")}</div></div>`;
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
C.onRender(renderHelp);
})(window.SR=window.SR||{});
