/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — checklist builder shared by Home and Checklist
*/
(function(SR){
"use strict";
const {SBA,LIC,LLC,NEXUS,SHORT,docNameEn}=SR.data;
const C=SR.core,S=C.S,{L,esc,money,es,ES,isTulsa,isDallas,docName,llcText,ongoing}=C;
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
const allIds=P=>P.flatMap(p=>p.items.map(i=>i[0]));
SR.plan={buildPhases,allIds,TX_ITEMS};
})(window.SR=window.SR||{});
