/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Spanish (Español): About page text
*/
(function(E){
"use strict";
const tgs=x=>`<span class="tag">${x}</span>`;
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
Object.assign(E.html,{
  "ab.kicker":"Acerca de","ab.h2":"Acerca de Strike Right",
  "ab.p1":"Strike Right es una guía gratuita para cualquier persona que empieza un negocio en Estados Unidos. Convierte información oficial dispersa en un solo plan: qué registrar, qué licencias aplican, dónde obtener ayuda gratuita y cómo ganar sus primeros clientes, adaptado a su estado, ciudad y tipo de negocio.",
  "ab.p2":"Sin registro y sin costo. Sus opciones se quedan en su propio navegador. Strike Right es información general, no asesoría legal, fiscal ni financiera.",
  "ab.privH":"Privacidad",
  "ab.privList":`<li>No hay cuentas ni nada que registrar.</li>
          <li>Sus opciones, marcas y borradores de cartas se guardan solo en su propio navegador (almacenamiento local). Puede borrarlos en cualquier momento borrando los datos de este sitio.</li>
          <li>Nada de lo que escribe se envía a un servidor. Un enlace a su plan contiene su código postal, estado, ciudad y opciones, nunca los campos de las cartas, nombres, correos ni teléfonos.</li>
          <li>El conteo de visitas proviene de Cloudflare Web Analytics, que no usa cookies. Las fuentes tipográficas se cargan desde Google Fonts.</li>`
});

})(window.SR_ES);
