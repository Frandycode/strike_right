/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — shared data: states, business types, LLC rules, sales tax nexus, ZIP ranges
*/
(function(SR){
"use strict";
/* Data freshness: one place to update the "Last verified" dates (YYYY-MM) */
const VERIFIED={llc:"2026-10",nexus:"2026-10",oklahoma:"2026-10",tulsa:"2026-10",texas:"2026-10",dallas:"2026-10"};
const REPORT_EMAIL="frandyslueue@gmail.com";
const SBA="https://www.sba.gov/business-guide/";
const LIC="https://www.careeronestop.org/Toolkit/Training/find-licenses.aspx";
const STATES=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
const CODES=["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const CODE_OF=Object.fromEntries(STATES.map((s,i)=>[s,CODES[i]])),STATE_OF=Object.fromEntries(CODES.map((c,i)=>[c,STATES[i]]));
const TYPES={software:"Software, app or SaaS",ecommerce:"Online store / e-commerce",services:"Professional services / consulting",retail:"Retail store or physical products",food:"Food or beverage",trades:"Construction / skilled trades",home:"Cleaning, lawn & home services",care:"Personal care, health or fitness",child:"Childcare or education",transport:"Delivery, moving or transportation",creative:"Creative, media or events",other:"Something else / not sure yet"};
const SHORT={software:"software and apps",ecommerce:"online stores",services:"professional services",retail:"retail",food:"food and beverage",trades:"construction and trades",home:"home services",care:"personal care and health",child:"childcare and education",transport:"transportation",creative:"creative work and events",other:"new businesses"};
const WHERE=["home","online","site","mobile"],REACH=["home","some","all"];
const LETTER_TYPES=new Set(["advice","pilot","intro","partner","loi","program","followup"]);
const LETTER_FIELDS=new Set(["lName","lTitle","lBiz","lContact","lWhat","lToName","lToTitle","lToOrg","exHelp","exLen","exPrice","exGoal","exAfter","exProblem","exProof","exAsk","exGive","exUse","exQty","exWhen","exPrice2","exProgram","exStage","exUseFunds","exMet","exNext"]);

/* LLC: [filing fee, ongoing $/yr (null = none), ongoing filing, timing, special rules] — as listed Oct 2026 */
const CERT_FORM=["Delaware","Maine","Mississippi","New Hampshire","New Jersey","Texas","Washington"];
const CERT_ORG=["Connecticut","Massachusetts","Pennsylvania"];
const LLC={
"Alabama":[200,0,"Business privilege tax return","Yearly","No report fee; the privilege tax is based on net worth and may be small or zero."],
"Alaska":[250,50,"Biennial report ($100)","Every 2 years, due Jan 2",""],
"Arizona":[50,null,"No annual report","—","Must publish notice of formation unless the LLC's statutory agent or place of business is in Maricopa or Pima County."],
"Arkansas":[45,150,"Annual franchise tax report","Yearly, due May 1",""],
"California":[70,810,"$800 annual LLC tax + Statement of Information ($20 every 2 years)","Tax yearly; first SOI within 90 days of forming","$800 minimum franchise tax every year, even with no income."],
"Colorado":[50,25,"Periodic report","Yearly, around your formation month",""],
"Connecticut":[120,80,"Annual report","Yearly, Jan 1–Mar 31",""],
"Delaware":[110,400,"Annual LLC tax","Yearly, due June 1","Annual tax rose from $300 to $400 in 2026. Forming here doesn't avoid registering in the state where you actually operate."],
"District of Columbia":[99,150,"Biennial report ($300)","Every 2 years, due Apr 1",""],
"Florida":[125,138.75,"Annual report","Yearly, Jan 1–May 1","$400 late fee after May 1."],
"Georgia":[110,50,"Annual registration","Yearly, Jan 1–Apr 1",""],
"Hawaii":[50,15,"Annual report","Yearly, by the end of your formation quarter",""],
"Idaho":[100,0,"Annual report (no fee)","Yearly, by end of anniversary month",""],
"Illinois":[150,75,"Annual report","Yearly, before anniversary month",""],
"Indiana":[75,15.5,"Business entity report ($31)","Every 2 years, anniversary month",""],
"Iowa":[50,15,"Biennial report ($30)","Every 2 years, odd years, by Apr 1",""],
"Kansas":[85,45,"Information report ($90)","Every 2 years, by Apr 15",""],
"Kentucky":[40,15,"Annual report","Yearly, Jan 1–Jun 30",""],
"Louisiana":[125,35,"Annual report","Yearly, on formation anniversary",""],
"Maine":[175,85,"Annual report","Yearly, due June 1",""],
"Maryland":[100,300,"Annual report / personal property return","Yearly, due Apr 15",""],
"Massachusetts":[500,500,"Annual report","Yearly, by formation anniversary","Among the most expensive states to form and keep an LLC."],
"Michigan":[50,25,"Annual statement","Yearly, due Feb 15",""],
"Minnesota":[135,0,"Annual renewal (no fee)","Yearly, by Dec 31","Filing fee may be higher online."],
"Mississippi":[50,0,"Annual report (no fee)","Yearly, Jan 1–Apr 15",""],
"Missouri":[50,null,"No annual report","—",""],
"Montana":[35,20,"Annual report","Yearly, due Apr 15",""],
"Nebraska":[100,12.5,"Biennial report ($25)","Every 2 years, odd years, by Apr 1","Must publish notice of formation in a local newspaper for 3 weeks and file proof of publication."],
"Nevada":[425,350,"Annual list + state business license","Yearly, by end of anniversary month","Filing total includes the initial list and the $200 state business license."],
"New Hampshire":[100,100,"Annual report","Yearly, due Apr 1",""],
"New Jersey":[125,75,"Annual report","Yearly, by end of anniversary month",""],
"New Mexico":[50,null,"No annual report","—",""],
"New York":[200,4.5,"Biennial statement ($9)","Every 2 years","Must publish notice in two newspapers for six weeks within 120 days, then file a $50 Certificate of Publication. Publication can cost hundreds to over $1,000 depending on county. A written operating agreement is required."],
"North Carolina":[125,203,"Annual report","Yearly, due Apr 15",""],
"North Dakota":[135,50,"Annual report","Yearly, due Nov 15",""],
"Ohio":[99,null,"No annual report","—",""],
"Oklahoma":[100,25,"Annual certificate","Yearly, on formation anniversary",""],
"Oregon":[100,100,"Annual report","Yearly, on formation anniversary",""],
"Pennsylvania":[125,7,"Annual report","Yearly, Jan 1–Sep 30",""],
"Rhode Island":[150,450,"Annual report ($50) + minimum business tax ($400)","Yearly, Feb 1–May 1","$400 minimum business tax every year on top of the report."],
"South Carolina":[110,null,"No annual report","—",""],
"South Dakota":[150,70,"Annual report","Yearly, first day of anniversary month",""],
"Tennessee":[300,400,"Annual report + franchise & excise tax","Yearly, due Apr 1 (Dec fiscal year)","Filing and annual report are $50 per member, $300 minimum. Franchise tax minimum $100 yearly."],
"Texas":[300,0,"Public Information Report (or Ownership Information Report) at or below the no-tax-due threshold; franchise tax report above it","Yearly, due May 15","Every Texas LLC files every year by May 15. At or below the no-tax-due threshold ($2.65 million for 2026 and 2027 reports), file only the Public Information Report or Ownership Information Report; the No Tax Due Report is no longer filed. Above the threshold, file the franchise tax report."],
"Utah":[59,18,"Annual renewal","Yearly, on formation anniversary",""],
"Vermont":[155,45,"Annual report","Yearly, within 3 months of fiscal year end",""],
"Virginia":[100,50,"Annual registration fee","Yearly, by end of formation month",""],
"Washington":[180,70,"Annual report","Yearly, by end of anniversary month",""],
"West Virginia":[100,25,"Annual report","Yearly, Jan 1–Jul 1",""],
"Wisconsin":[130,25,"Annual report","Yearly, by end of formation quarter",""],
"Wyoming":[100,60,"Annual report (license tax)","Yearly, first day of anniversary month","$60 minimum; more if Wyoming assets exceed $300,000."]
};
const docNameEn=st=>CERT_FORM.includes(st)?"Certificate of Formation":CERT_ORG.includes(st)?"Certificate of Organization":"Articles of Organization";

/* Sales tax economic nexus, Oct 2026: [threshold, transactions, "or"/"and", note]; null = no statewide sales tax */
const NEXUS={"Alabama":[250000,0],"Alaska":[100000,0,"","Local sales taxes only, through the Alaska Remote Seller Sales Tax Commission"],"Arizona":[100000,0],"Arkansas":[100000,200,"or"],"California":[500000,0],"Colorado":[100000,0],"Connecticut":[100000,200,"and"],"Delaware":null,"District of Columbia":[100000,200,"or"],"Florida":[100000,0],"Georgia":[100000,200,"or"],"Hawaii":[100000,200,"or"],"Idaho":[100000,0],"Illinois":[100000,0,"","Transaction test removed Jan 1, 2026"],"Indiana":[100000,0],"Iowa":[100000,0],"Kansas":[100000,0],"Kentucky":[100000,0,"","Transaction test removed Aug 1, 2026"],"Louisiana":[100000,0],"Maine":[100000,0],"Maryland":[100000,200,"or"],"Massachusetts":[100000,0],"Michigan":[100000,200,"or"],"Minnesota":[100000,200,"or"],"Mississippi":[250000,0],"Missouri":[100000,0],"Montana":null,"Nebraska":[100000,200,"or"],"Nevada":[100000,200,"or"],"New Hampshire":null,"New Jersey":[100000,200,"or"],"New Mexico":[100000,0],"New York":[500000,100,"and"],"North Carolina":[100000,0],"North Dakota":[100000,0],"Ohio":[100000,200,"or"],"Oklahoma":[100000,0],"Oregon":null,"Pennsylvania":[100000,0],"Rhode Island":[100000,200,"or"],"South Carolina":[100000,0],"South Dakota":[100000,0],"Tennessee":[100000,0],"Texas":[500000,0],"Utah":[100000,0],"Vermont":[100000,200,"or"],"Virginia":[100000,200,"or"],"Washington":[100000,0],"West Virginia":[100000,200,"or"],"Wisconsin":[100000,0],"Wyoming":[100000,0]};

const ZIP3=[[5,5,"New York"],[10,27,"Massachusetts"],[28,29,"Rhode Island"],[30,38,"New Hampshire"],[39,49,"Maine"],[50,54,"Vermont"],[55,55,"Massachusetts"],[56,59,"Vermont"],[60,69,"Connecticut"],[70,89,"New Jersey"],[100,149,"New York"],[150,196,"Pennsylvania"],[197,199,"Delaware"],[200,200,"District of Columbia"],[201,201,"Virginia"],[202,205,"District of Columbia"],[206,219,"Maryland"],[220,246,"Virginia"],[247,268,"West Virginia"],[270,289,"North Carolina"],[290,299,"South Carolina"],[300,319,"Georgia"],[320,339,"Florida"],[341,349,"Florida"],[350,369,"Alabama"],[370,385,"Tennessee"],[386,397,"Mississippi"],[398,399,"Georgia"],[400,427,"Kentucky"],[430,459,"Ohio"],[460,479,"Indiana"],[480,499,"Michigan"],[500,528,"Iowa"],[530,549,"Wisconsin"],[550,567,"Minnesota"],[569,569,"District of Columbia"],[570,577,"South Dakota"],[580,588,"North Dakota"],[590,599,"Montana"],[600,629,"Illinois"],[630,658,"Missouri"],[660,679,"Kansas"],[680,693,"Nebraska"],[700,714,"Louisiana"],[716,729,"Arkansas"],[730,732,"Oklahoma"],[733,733,"Texas"],[734,749,"Oklahoma"],[750,799,"Texas"],[800,816,"Colorado"],[820,831,"Wyoming"],[832,838,"Idaho"],[840,847,"Utah"],[850,865,"Arizona"],[870,884,"New Mexico"],[885,885,"Texas"],[889,898,"Nevada"],[900,961,"California"],[967,968,"Hawaii"],[970,979,"Oregon"],[980,994,"Washington"],[995,999,"Alaska"]];
/* ZIPs that sit wholly in a different state from their three-digit range (U.S. Census Bureau 2020 ZCTA-to-county
   relationship file). null = not one of the 50 states + DC. Checked before the ranges. */
const ZIP_EXCEPTIONS={"06390":"New York","73960":"Texas","83414":"Wyoming","96799":null};
/* Short business-type labels for the header profile chip */
const CHIP={software:"Software",ecommerce:"Online store",services:"Services",retail:"Retail",food:"Food & drink",trades:"Trades",home:"Home services",care:"Personal care",child:"Childcare",transport:"Transport",creative:"Creative",other:"New business"};
SR.data={VERIFIED,REPORT_EMAIL,SBA,LIC,STATES,CODES,CODE_OF,STATE_OF,TYPES,SHORT,WHERE,REACH,LETTER_TYPES,LETTER_FIELDS,CERT_FORM,CERT_ORG,LLC,docNameEn,NEXUS,ZIP3,ZIP_EXCEPTIONS,CHIP};
})(window.SR=window.SR||{});
