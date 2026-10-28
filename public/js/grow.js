/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Get known page
*/
(function(SR){
"use strict";
const D=SR.data,C=SR.core,S=C.S;
const {STATES,TYPES,SHORT,LLC,NEXUS,VERIFIED,LIC}=D;
const {u,UI,es,ES,TY,SH,$,esc,L,isState,isPlain,statesOf,REACH_SET,save,update,monthText,freshHTML,docName,llcText,money,nexusText,nexusNote,ongoing,isTulsa,isDallas,copyText,sel,armed,printing,writeURL,planLink}=C;
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
    <div class="panel pad stack"><h2 class="h3">Run a pilot that turns into a paying customer</h2>
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
      <div class="panel pad"><h3 class="h4">Where to find pilot customers</h3><p class="small muted mt-4">Your customer interviews, your SBDC or SCORE mentor's network, local business associations, industry groups and LinkedIn. The people who described the problem in the most detail are your best candidates.</p></div>
    </div></div>`;
  const offers=[["Free trial (7–30 days)","Full access for a limited time. Best when value shows up quickly. Requiring a card up front usually raises conversion but lowers sign-ups."],["Freemium","A free plan with paid upgrades. Works when the free plan costs you little and naturally leads to the paid plan."],["Money-back guarantee","Charge from day one and refund if unhappy. Builds trust where a free trial isn't practical."],["Intro offer or first-visit discount","Common for services, food, fitness and personal care. Price it so a first visit is profitable or close to it."],["Samples and demos","Tastings, samples or a live walkthrough. Let people experience it before they buy."]];
  const rec={software:"Free trial or freemium",ecommerce:"Money-back guarantee",services:"Paid pilot or a small first project",retail:"Samples and demos",food:"Samples and demos",trades:"Free estimates and a workmanship guarantee",home:"Intro offer on the first service",care:"Intro offer or first-visit discount",child:"Open house or trial day",transport:"Discounted first route",creative:"Small commission or mini-session",other:"Intro offer"}[t];
  $("#panel-trial").innerHTML=`<div class="grid2">
    <div class="panel pad stack"><h2 class="h3">Choose the right trial or offer</h2><div class="callout"><strong>Usually best for ${sh}:</strong> ${rec}.</div>
      <div class="stack gap-10">${offers.map(([h,p])=>`<div class="panel offer"><h3 class="h4">${h}</h3><p class="small muted">${p}</p></div>`).join("")}</div></div>
    <div class="stack">
      <div class="panel pad stack"><h2 class="h3">Make trials convert</h2><ul class="clean"><li>Get new users to the one moment where they see value, as fast as possible.</li><li>Send short check-ins during the trial with tips, not sales pressure.</li><li>Remind people before a trial ends or converts to paid.</li><li>Ask people who don't convert why. That's your roadmap.</li></ul></div>
      <div class="warn"><strong>Subscription and auto-renew rules:</strong> many states require you to show renewal terms clearly before purchase, get clear consent, send reminders in some cases, and let people cancel as easily as they signed up, often online. A federal FTC rule on this was struck down in 2025, but state laws such as California's still apply. Follow the strictest version everywhere you sell.</div>
    </div></div>`;
  $("#panel-promo").innerHTML=`<div class="grid2">
    <div class="panel pad stack"><h2 class="h3">Launch and promotion ideas for ${sh}</h2>
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
      <div class="panel pad"><h3 class="h4">Measure every promotion</h3><p class="small muted mt-4">Use a unique code or link per promotion, set a goal before you start, and compare the cost with the profit from new customers. Stop what doesn't pay back.</p></div>
    </div></div>`;
  $("#panel-chan").innerHTML=`<p class="muted mb-12">The highest-value channels for ${sh}. Pick two, work them consistently for 90 days, then add more.</p>
    <div class="chan">${(CHANNELS[t]||CHANNELS.other).map(([h,p])=>`<div class="panel"><h3 class="h4">${h}</h3><p>${p}</p></div>`).join("")}</div>
    <div class="callout mt-14"><strong>Free for nearly every business:</strong> a one-page website with a clear offer and contact method, an email list, and asking every happy customer for a review and a referral.</div>`;
  const rules=[["Endorsements and influencers","Anyone paid or given free product to promote you must clearly disclose it in the post itself, such as #ad. You're responsible for making sure they do.",["FTC endorsement guides","https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews"]],
       ["Reviews","Fake reviews, buying reviews, and rewarding only positive ones are illegal under the FTC's 2024 rule, with civil penalties. Asking every customer for an honest review is fine.",["FTC reviews guidance","https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews"]],
       ["Email marketing (CAN-SPAM)","Accurate sender and subject lines, your physical mailing address, and a working unsubscribe honored within 10 business days.",["FTC CAN-SPAM guide","https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business"]],
       ["Texts and calls (TCPA)","Marketing texts and autodialed calls need prior express written consent, plus opt-out instructions. Penalties are per message.",["FCC: telemarketing and robocalls","https://www.fcc.gov/general/telemarketing-and-robocalls"]],
       ["Truth in advertising","Claims must be true and backed by evidence. “Made in USA” means all or virtually all. “Free” must really be free.",["FTC advertising guidance","https://www.ftc.gov/business-guidance/advertising-marketing"]],
       ["Contests and sweepstakes","No purchase necessary for chance-based prizes, published official rules, and state registration for large prizes in some states.",null]];
  $("#panel-rules").innerHTML=`<div class="grid2">${rules.map(([h,p,l])=>`<div class="panel pad stack"><h2 class="h3">${h}</h2><p class="fs-93">${p}</p>${l?`<p class="small">${L(l[0],l[1])}</p>`:""}</div>`).join("")}</div>`;
}
const tabList=()=>[...document.querySelectorAll('#growTabs [role="tab"]')];
$("#growTabs").addEventListener("click",e=>{const b=e.target.closest('[role="tab"]');if(b)selectTab(b)});
$("#growTabs").addEventListener("keydown",e=>{const tabs=tabList();const i=tabs.indexOf(document.activeElement);if(i<0)return;
  let nx=null;if(e.key==="ArrowRight"||e.key==="ArrowLeft")nx=tabs[(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length];else if(e.key==="Home")nx=tabs[0];else if(e.key==="End")nx=tabs[tabs.length-1];
  if(nx){e.preventDefault();nx.focus();selectTab(nx)}});
function selectTab(b){tabList().forEach(t=>{const on=t===b;t.setAttribute("aria-selected",String(on));t.tabIndex=on?0:-1;document.getElementById(t.getAttribute("aria-controls")).hidden=!on})}
tabList().forEach((t,i)=>t.tabIndex=i?-1:0);
C.onRender(renderGrow);
})(window.SR=window.SR||{});
