/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Selling across states page
*/
(function(SR){
"use strict";
const D=SR.data,C=SR.core,S=C.S;
const {STATES,TYPES,SHORT,LLC,NEXUS,VERIFIED,LIC}=D;
const {u,UI,es,ES,TY,SH,$,esc,L,isState,isPlain,statesOf,REACH_SET,save,update,monthText,freshHTML,docName,llcText,money,nexusText,nexusNote,ongoing,isTulsa,isDallas,copyText,sel,armed,printing,writeURL,planLink}=C;
$("#pickGrid").innerHTML=STATES.map((s,i)=>`<label><input type="checkbox" id="pk${i}" value="${s}"> ${s}</label>`).join("");
function syncReach(){
  document.querySelectorAll("#reach button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.reach===S.reach)));
  $("#pickWrap").hidden=S.reach!=="some";
  document.querySelectorAll("#pickGrid input").forEach(i=>i.checked=S.pick.includes(i.value));
  $("#pickCount").textContent=u("pickCount",S.pick.length);
}
$("#reach").addEventListener("click",e=>{const b=e.target.closest("[data-reach]");if(!b||!REACH_SET.has(b.dataset.reach))return;S.reach=b.dataset.reach;save();syncReach();renderReach()});
$("#pickGrid").addEventListener("change",()=>{S.pick=statesOf([...document.querySelectorAll("#pickGrid input:checked")].map(i=>i.value));save();syncReach();renderReach()});
$("#pickNone").addEventListener("click",()=>{S.pick=[];save();syncReach();renderReach()});
function block(n,title,html){return `<div class="panel pad out-block"><h2 class="h3"><span class="n">${n}</span>${title}</h2>${html}</div>`}
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
C.onRender(()=>{syncReach();renderReach()});
})(window.SR=window.SR||{});
