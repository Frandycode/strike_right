/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — shared layout: tailoring form, profile chip and panel, mobile menu, logo animation
*/
(function(SR){
"use strict";
const {STATES,TYPES,CODE_OF,CHIP}=SR.data;
const C=SR.core,S=C.S,{u,TY,$,esc,isState,isType,WHERE_SET,zipState}=C;

/* ---------- Tailoring form (Home hero and the profile panel share this) ---------- */
/* Fields carry data-f; ids differ per form (Home: zip, state…; panel: p-zip, p-state…) */
function formHTML(p){
  return `<div class="pf"><label for="${p}zip" data-i18n="pk.zip">ZIP code</label><input type="text" id="${p}zip" data-f="zip" inputmode="numeric" maxlength="5" placeholder="e.g. 74103" data-i18n-attr="placeholder=ph.zip" autocomplete="postal-code"><span class="zip-hint" data-f="hint" aria-live="polite"></span></div>
    <div class="pf"><label for="${p}state" data-i18n="pk.state">Your state</label><select id="${p}state" data-f="state"></select></div>
    <div class="pf"><label for="${p}city" data-i18n="pk.city">Your city or town</label><input type="text" id="${p}city" data-f="city" placeholder="e.g. Springfield" data-i18n-attr="placeholder=ph.city" autocomplete="address-level2"></div>
    <div class="pf"><label for="${p}btype" data-i18n="pk.type">Type of business</label><select id="${p}btype" data-f="type"></select></div>
    <div class="pf"><label for="${p}where" data-i18n="pk.where">Where you'll work</label><select id="${p}where" data-f="where"><option value="home" data-i18n="wh.home">From home</option><option value="online" data-i18n="wh.online">Online only</option><option value="site" data-i18n="wh.site">Storefront, office or shared space</option><option value="mobile" data-i18n="wh.mobile">On the road / at clients' sites</option></select></div>
    <label class="chk"><input type="checkbox" id="${p}hire" data-f="hire"> <span data-i18n="pk.hire">I plan to hire</span></label>`;
}
const forms=[];
let renderT=null;
function scheduleRender(){clearTimeout(renderT);renderT=setTimeout(()=>{renderT=null;C.renderAll()},300)}
function flushRender(){if(renderT){clearTimeout(renderT);renderT=null;C.renderAll()}}
C.onFlush(flushRender);
function bindForm(root){
  if(!root)return;forms.push(root);
  const f=k=>root.querySelector(`[data-f="${k}"]`);
  f("zip").addEventListener("input",()=>{
    const el=f("zip"),z=el.value.replace(/\D/g,"").slice(0,5);if(el.value!==z)el.value=z;
    S.zip=z;const st=z.length===5?zipState(z):null;
    if(st&&S.state!==st){S.state=st;S.llcState=st}
    C.update();
  });
  /* Every keystroke is saved at once; only the re-render waits for a pause in typing */
  f("city").addEventListener("input",()=>{S.city=f("city").value.trim().slice(0,80);C.save();scheduleRender()});
  root.addEventListener("change",e=>{
    const k=e.target.dataset.f;if(!k||k==="zip"||k==="city")return;
    /* The city is already saved; drop its pending re-render (it would rebuild this select) and render once below */
    clearTimeout(renderT);renderT=null;
    if(k==="state"){const prev=S.state,v=e.target.value;S.state=isState(v)?v:"";if(S.state&&S.state!==prev)S.llcState=S.state}
    if(k==="type"&&isType(e.target.value))S.type=e.target.value;
    if(k==="where"&&WHERE_SET.has(e.target.value))S.where=e.target.value;
    if(k==="hire")S.hire=e.target.checked;
    C.update();
  });
}
/* Keep every form in step with the saved state; never rewrite the field the visitor is typing in */
function syncForms(){
  forms.forEach(root=>{
    const f=k=>root.querySelector(`[data-f="${k}"]`),active=document.activeElement;
    const st=f("state"),ty=f("type");
    st.innerHTML=`<option value="">${esc(u("chooseState"))}</option>`+STATES.map(s=>`<option${s===S.state?" selected":""}>${s}</option>`).join("");
    ty.innerHTML=Object.keys(TYPES).map(k=>`<option value="${k}"${k===S.type?" selected":""}>${esc(TY(k))}</option>`).join("");
    if(f("zip")!==active)f("zip").value=S.zip;
    if(f("city")!==active)f("city").value=S.city;
    f("where").value=S.where;f("hire").checked=S.hire;
    const h=f("hint"),z=S.zip;
    if(z.length<5){h.className="zip-hint";h.textContent=z.length?u("zipMore"):u("zipEmpty")}
    else{const s=zipState(z);if(!s){h.className="zip-hint";h.textContent=u("zipBad")}else{h.className="zip-hint ok";h.textContent=u("zipOk",s)}}
  });
}
bindForm(document.querySelector('[data-form="hero"]'));

/* ---------- Dialogs: focus trap, Escape, focus return ---------- */
const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let openDlg=null;
function openDialog(panel,trigger){
  if(openDlg)closeDialog(false);
  openDlg={panel,trigger};
  panel.hidden=false;trigger.setAttribute("aria-expanded","true");
  document.body.classList.add("dialog-open");
  const first=panel.querySelector("[data-autofocus]")||panel.querySelector(FOCUSABLE);
  if(first)first.focus();
}
function closeDialog(restore=true){
  if(!openDlg)return;
  const {panel,trigger}=openDlg;openDlg=null;
  panel.hidden=true;trigger.setAttribute("aria-expanded","false");
  document.body.classList.remove("dialog-open");
  if(restore)trigger.focus();
}
document.addEventListener("keydown",e=>{
  if(!openDlg)return;
  if(e.key==="Escape"){e.preventDefault();closeDialog();return}
  if(e.key!=="Tab")return;
  const items=[...openDlg.panel.querySelectorAll(FOCUSABLE)].filter(el=>el.offsetParent!==null||el===document.activeElement);
  if(!items.length)return;
  const first=items[0],last=items[items.length-1];
  if(!openDlg.panel.contains(document.activeElement)){e.preventDefault();first.focus();return}
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
document.addEventListener("click",e=>{
  if(!openDlg)return;
  if(e.target.closest("[data-close-dialog]")){closeDialog();return}
  if(!openDlg.panel.contains(e.target)&&!openDlg.trigger.contains(e.target))closeDialog(false);
});

/* ---------- Profile chip and panel ---------- */
const chip=$("#profileBtn");
const backdrop=document.createElement("div");backdrop.className="sheet-backdrop";backdrop.setAttribute("data-close-dialog","");
const profile=document.createElement("div");
profile.className="profile-panel";profile.id="profilePanel";profile.hidden=true;
profile.setAttribute("role","dialog");profile.setAttribute("aria-modal","true");profile.setAttribute("aria-labelledby","profileTitle");
profile.innerHTML=`<div class="pp-head"><h2 id="profileTitle" data-i18n="pp.title">Your business</h2><button type="button" class="pp-close" data-close-dialog aria-label="Close" data-i18n-attr="aria-label=pp.close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <p class="small muted" data-i18n="pp.note">Changes apply right away on every page. Saved only in this browser.</p>
  <div class="picker" data-form="profile">${formHTML("p-")}</div>
  <div class="panel-foot"><button type="button" class="btn" data-copy-link data-i18n="ck.link">Copy link to my plan</button><button type="button" class="btn primary" data-close-dialog data-i18n="pp.done">Done</button></div>`;
if(chip){
  document.body.append(backdrop,profile);
  bindForm(profile.querySelector('[data-form="profile"]'));
  chip.addEventListener("click",()=>{if(openDlg&&openDlg.panel===profile)closeDialog();else openDialog(profile,chip)});
}
profile.querySelector('[data-f="zip"]').setAttribute("data-autofocus","");
function chipText(){
  const place=[S.city,S.state?CODE_OF[S.state]:""].filter(Boolean).join(", ");
  if(!place&&!S.state)return u("chipEmpty");
  const t=C.es()&&C.ES.CHIP?C.ES.CHIP[S.type]:CHIP[S.type];
  return place+" · "+t;
}

/* ---------- Mobile menu ---------- */
const menuBtn=$("#menuBtn");
const menu=document.createElement("div");
menu.className="menu-panel";menu.id="menuPanel";menu.hidden=true;
menu.setAttribute("role","dialog");menu.setAttribute("aria-modal","true");menu.setAttribute("aria-label","Menu");menu.setAttribute("data-i18n-attr","aria-label=mn.menu");
if(menuBtn){
  const links=[...document.querySelectorAll("#navlinks a")].map(a=>{const c=a.cloneNode(true);c.removeAttribute("class");return c.outerHTML});
  const about=document.querySelector('footer a[href="/about/"]');
  const tools=[...document.querySelectorAll(".top-tools .theme")].map(t=>{const c=t.cloneNode(true);c.classList.remove("js-only");return c.outerHTML}).join("");
  menu.innerHTML=`<div class="mp-head"><span class="mp-title" data-i18n="mn.menu">Menu</span><button type="button" class="pp-close" data-close-dialog aria-label="Close" data-i18n-attr="aria-label=pp.close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><nav aria-label="Main" data-i18n-attr="aria-label=a.main">${links.join("")}${about?about.outerHTML.replace("<a ",'<a data-about '):""}</nav><div class="tools">${tools}</div>`;
  menu.querySelectorAll("nav a").forEach(a=>{if(a.getAttribute("href")===location.pathname)a.setAttribute("aria-current","page")});
  document.body.append(menu);
  menuBtn.addEventListener("click",()=>{if(openDlg&&openDlg.panel===menu)closeDialog();else openDialog(menu,menuBtn)});
  matchMedia("(min-width: 901px)").addEventListener("change",e=>{if(e.matches&&openDlg&&openDlg.panel===menu)closeDialog(false)});
}

/* ---------- Logo animation: once per browser session, replayed on hover or focus (CSS does the motion) ---------- */
const brand=document.querySelector(".site-band .brand"),mark=brand&&brand.querySelector(".mark");
function rise(){if(!mark)return;mark.classList.remove("rise");void mark.getBoundingClientRect();mark.classList.add("rise")}
if(mark){
  let seen=false;try{seen=sessionStorage.getItem("sr-logo")==="1";sessionStorage.setItem("sr-logo","1")}catch(e){}
  if(!seen)rise();
  brand.addEventListener("mouseenter",rise);brand.addEventListener("focus",rise);
}

C.onRender(()=>{
  syncForms();
  if(chip){const t=chipText();$("#chipText").textContent=t;chip.setAttribute("aria-label",u("chipAria",t))}
});
SR.layout={formHTML,bindForm,openDialog,closeDialog,rise,flushRender};
})(window.SR=window.SR||{});
