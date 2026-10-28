/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Home page: overall progress and live status on the Start here cards
*/
(function(SR){
"use strict";
const {LLC,LETTER_FIELDS}=SR.data;
const C=SR.core,S=C.S,{u,SH,$,money,isTulsa,isDallas}=C;
const {buildPhases,allIds}=SR.plan;
const {NATIONAL,OK_STATE,TULSA,TX_STATE,DALLAS,fits,specific}=SR.resources;

function render(){
  const ids=allIds(buildPhases()),n=ids.filter(id=>S.done[id]).length;
  $("#homeDone").textContent=u("homeDone",n,ids.length);
  $("#homePbar").style.width=(ids.length?n/ids.length*100:0)+"%";
  const loc=[S.city,S.state].filter(Boolean).join(", ");
  $("#startTitle").textContent=u("startTitle",SH(S.type),loc);
  const set=(k,t)=>{const el=document.querySelector(`[data-status="${k}"]`);if(el)el.textContent=t};
  set("checklist",u("done",n,ids.length));
  const lists=[...(isTulsa()?TULSA:[]),...(S.state==="Oklahoma"?OK_STATE:[]),...(isDallas()?DALLAS:[]),...(S.state==="Texas"?TX_STATE:[]),...NATIONAL];
  set("help",u("stHelp",lists.filter(r=>fits(r,S.type)).length,lists.filter(r=>specific(r,S.type)).length));
  set("llc",S.state?u("stLlc",S.state,money(LLC[S.state][0])):u("stLlcNone"));
  set("selling",S.reach==="some"?u("stReachSome",S.pick.length):u("stReach")[S.reach]);
  set("grow",u("stGrow"));
  const drafted=Object.keys(S.letter).some(k=>k!=="type"&&LETTER_FIELDS.has(k)&&S.letter[k].trim());
  set("letters",drafted?u("stLetterDraft",u("letterTypes")[S.letter.type||"advice"]):u("stLetterNone"));
  set("guides",u("stGuides"));
  set("about",u("stAbout"));
}
C.onRender(render);
})(window.SR=window.SR||{});
