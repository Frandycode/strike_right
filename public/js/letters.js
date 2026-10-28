/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Letter builder page
*/
(function(SR){
"use strict";
const D=SR.data,C=SR.core,S=C.S;
const {STATES,TYPES,SHORT,LLC,NEXUS,VERIFIED,LIC}=D;
const {u,UI,es,ES,TY,SH,$,esc,L,isState,isPlain,statesOf,REACH_SET,save,update,monthText,freshHTML,docName,llcText,money,nexusText,nexusNote,ongoing,isTulsa,isDallas,copyText,sel,armed,printing,writeURL,planLink}=C;
const {LETTER_TYPES,LETTER_FIELDS}=D;
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
initLetter();
C.onRender(()=>{renderExtra();renderLetter()});
})(window.SR=window.SR||{});
