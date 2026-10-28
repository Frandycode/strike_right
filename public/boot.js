/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — runs before first paint: marks the page as script-enabled and sends old
            single-page links (/#llc, /#faq…) to their new pages, keeping the query string
*/
(function(){
  "use strict";
  var OLD={"#checklist":"/checklist/","#help":"/help/","#llc":"/llc/","#states":"/selling/","#grow":"/grow/","#letters":"/letters/","#structure":"/guides/#structure","#funding":"/guides/#funding","#faq":"/guides/#faq","#about":"/about/"};
  var p=location.pathname,h=location.hash;
  if((p==="/"||p==="/index.html")&&Object.prototype.hasOwnProperty.call(OLD,h)){
    var to=OLD[h].split("#");
    location.replace(to[0]+location.search+(to[1]?"#"+to[1]:""));
    return;
  }
  document.documentElement.classList.add("js");
})();
