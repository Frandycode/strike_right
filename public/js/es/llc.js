/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Spanish (Español): LLC page text
*/
(function(E){
"use strict";
const tgs=x=>`<span class="tag">${x}</span>`;
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
Object.assign(E.html,{
  "lc.kicker":"Formar una LLC","lc.h2":"Qué se necesita para formar una LLC en cada estado","lc.lead":"Elija un estado para ver su tarifa de presentación, los informes continuos y las reglas especiales, además de todo lo que debe tener listo antes de presentar.","lc.state":"Estado",
  "lc.needH":"Lo que necesita antes de presentar (todos los estados)",
  "lc.needList":`<li><strong>Un nombre único</strong> que termine en "LLC", "L.L.C." o "Limited Liability Company" (compañía de responsabilidad limitada). Primero busque el nombre en el registro de negocios del estado.</li>
        <li><strong>Un registered agent (agente registrado)</strong> con una dirección física en ese estado (no apartados postales), disponible en horario laboral. Usted puede ser su propio agente.</li>
        <li><strong>Una dirección principal del negocio</strong>, que puede estar en otro estado. Los registros son públicos, así que algunos dueños usan una dirección comercial en lugar de la de su casa.</li>
        <li><strong>Nombres del organizador y de los miembros o gerentes</strong>, según el formulario del estado.</li>
        <li><strong>Tipo de administración</strong>: administrada por los miembros (los dueños la dirigen) o por gerentes.</li>
        <li><strong>La tarifa de presentación</strong>, que en la mayoría de los estados se paga en línea con tarjeta.</li>`,
  "lc.afterH":"Justo después de presentar",
  "lc.afterList":`<li>Obtenga un <a href="https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number" target="_blank" rel="noopener">EIN gratuito del IRS ↗</a> (número de identificación del empleador).</li>
        <li>Firme un operating agreement (acuerdo operativo). Nueva York exige uno por escrito; toda LLC debería tenerlo, sobre todo si hay más de un dueño.</li>
        <li>Abra una cuenta bancaria del negocio y mantenga el dinero del negocio separado.</li>
        <li>Anote en su calendario la fecha del informe anual o del impuesto. Si no lo presenta, la LLC puede ser disuelta.</li>
        <li>Regístrese para los impuestos estatales y obtenga las licencias que requiera su trabajo.</li>
        <li>Informes federales de beneficiarios reales (BOI): FinCEN ahora exime a las compañías formadas en EE. UU. Revise <a href="https://www.fincen.gov/boi" target="_blank" rel="noopener">fincen.gov ↗</a> por si hay cambios.</li>`,
  "lc.compare":"Comparar los 50 estados + DC","lc.sortHint":"Toque un encabezado para ordenar.",
  "lc.thState":"Estado ↕","lc.thFee":"Tarifa ↕","lc.thAnn":"Continuo ↕","lc.thReport":"Informe","lc.thRules":"Reglas especiales",
  "lc.feeNote":"Las tarifas en línea, por correo y urgentes pueden variar, y cambian con el tiempo. Confírmelas en el sitio oficial de su estado antes de pagar.","lc.findOffice":"Oficina de registro de su estado ↗"
});

})(window.SR_ES);
