/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Spanish (Español): selling across states
*/
(function(E){
"use strict";
const tgs=x=>`<span class="tag">${x}</span>`;
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const REG={
  software:"Las aplicaciones que guardan o mueven dinero (transmisión de dinero), prestan, ofrecen seguros, dan atención médica (los proveedores de telesalud deben tener licencia donde está el paciente), corretean bienes raíces, operan apuestas, deportes de fantasía o sorteos pagados, venden o entregan alcohol, cannabis o armas de fuego, o cobran deudas suelen necesitar licencias estado por estado. Algunas categorías están prohibidas en ciertos estados.",
  ecommerce:"El alcohol, el tabaco y los productos de vapeo, las armas de fuego y municiones, el CBD y el cáñamo, los suplementos y los cosméticos tienen reglas de envío y licencias propias de cada estado. Algunos estados prohíben ciertos productos por completo.",
  retail:"El alcohol, el tabaco, las armas de fuego, el CBD y algunos químicos tienen reglas propias de cada estado cuando se venden o envían a otros estados.",
  food:"Por lo general, los alimentos caseros (cottage food) no se pueden vender a otros estados. Enviar alimentos a otros estados suele requerir una instalación con licencia, el registro de la instalación ante la FDA y cumplir con el etiquetado. La carne y las aves necesitan inspección del USDA. El envío de alcohol está muy restringido estado por estado.",
  services:"Los profesionales con licencia (contadores, abogados, terapeutas, ingenieros, agentes de bienes raíces, asesores financieros) por lo general necesitan licencia en el estado del cliente, aunque algunas profesiones tienen acuerdos interestatales o reglas de movilidad.",
  care:"Los proveedores de salud y bienestar por lo general necesitan licencia en el estado donde está el cliente, incluso para telesalud. Algunas profesiones tienen acuerdos interestatales de licencias.",
  child:"Las licencias de cuidado infantil son propias de cada estado. Las tutorías en línea por lo general no requieren licencia, pero aplican las reglas de verificación de antecedentes y de privacidad infantil.",
  trades:"Las licencias de contratista rara vez se transfieren. Por lo general necesitará licencia, fianza y registro en cada estado donde trabaje.",
  home:"Las licencias comerciales son locales y las de aplicador de pesticidas son estatales. Espere registrarse en cada estado y ciudad donde trabaje.",
  transport:"Los transportistas interestatales por contrato necesitan registro federal del USDOT y autoridad operativa. Las mudanzas de artículos del hogar tienen reglas federales y estatales adicionales.",
  creative:"Los permisos de eventos y de ventas son locales. Vender arte o mercancía en eventos de otro estado suele requerir allí un permiso temporal de impuesto sobre ventas.",
  other:"Verifique si su actividad requiere licencia en cada estado objetivo con el buscador de ocupaciones con licencia."
};
function reach(c){
  const S=c.S,t=c.t,home=S.state||"su estado",others=c.others,b=c.block,out=[];let n=1;
  if(S.reach==="home"){
    out.push(b(n++,"Vender solo en "+esc(home),`<p>Se registra, cobra el impuesto sobre ventas y obtiene licencias solo en ${esc(home)}. Dos advertencias: las ventas en línea pueden llegar a clientes de otros estados, y cuando sus ventas a otro estado superan su umbral, le debe a ese estado el impuesto sobre ventas. Para quedarse en su estado, limite las ventas según la dirección de envío o la ubicación del cliente.</p>`));
    return out;
  }
  out.push(b(n++,"¿Necesita registrar su LLC en otros estados?",`<p>Por lo general <strong>no</strong>, solo por vender en línea o enviar a clientes allí. Debe registrarse como LLC “extranjera” (foreign LLC) en un estado cuando está <strong>haciendo negocios</strong> allí (doing business), lo que normalmente significa:</p>
    <ul class="clean"><li>Una oficina, tienda, almacén u otro local físico</li><li>Empleados que trabajan allí, incluidos empleados remotos</li><li>Trabajo presencial frecuente allí, como trabajos en el lugar del cliente</li><li>Tener o arrendar propiedad, o guardar inventario allí (algunos estados cuentan los almacenes de los mercados en línea)</li></ul>
    <p class="small muted">Cada registro como entidad extranjera necesita un agente registrado en ese estado y su propio informe anual y tarifa. Un solo empleado remoto en otro estado por lo general también implica registrarse allí para el impuesto de nómina y el seguro de desempleo.</p>`));
  if(S.reach==="some"&&!others.length){out.push(`<div class="callout">Seleccione arriba los estados donde venderá para ver el umbral del impuesto sobre ventas de cada uno.</div>`)}
  else{
    const label=S.reach==="all"?"todos los estados":`${others.length} seleccionado${others.length===1?"":"s"}`;
    let note="";
    if(t==="software")note=`<div class="callout"><strong>Para aplicaciones:</strong> las ventas por la Apple App Store y Google Play las maneja la tienda, que cobra y paga el impuesto sobre ventas como marketplace facilitator (facilitador de mercado). En ventas directas por la web o suscripciones, que el SaaS y los productos digitales estén gravados varía de un estado a otro. Un servicio merchant of record puede encargarse de esto por usted.</div>`;
    else if(["ecommerce","retail","creative"].includes(t))note=`<div class="callout"><strong>Los mercados en línea ayudan:</strong> Amazon, Etsy, eBay y mercados similares cobran y pagan el impuesto sobre ventas de las ventas hechas por ellos. Las ventas en su propio sitio web cuentan para sus propios umbrales.</div>`;
    else if(t==="food")note=`<div class="callout">En muchos estados los alimentos de supermercado están exentos o tienen una tasa reducida, mientras que la comida preparada suele estar gravada. Revise las reglas de cada estado para lo que vende.</div>`;
    else note=`<div class="callout">Muchos servicios no pagan impuesto sobre ventas, pero algunos estados gravan ciertos servicios, como limpieza, reparaciones o servicios digitales. Pregunte al departamento de ingresos de cada estado por su servicio específico.</div>`;
    out.push(b(n++,"Impuesto sobre ventas: cuándo lo debe en cada estado",`<p>Los estados pueden exigir que los vendedores de otros estados cobren el impuesto sobre ventas cuando sus ventas al estado superan un umbral (“economic nexus”, nexo económico). Por debajo de él, por lo general no cobra allí. Su propio estado grava las ventas gravables desde el primer día.</p>${note}
      ${c.rows?`<div class="scroll-table panel mh-360" tabindex="0" role="region" aria-label="Umbrales del impuesto sobre ventas por estado"><table class="tbl-480"><thead><tr><th scope="col">Estado (${label})</th><th scope="col">Cobrar a partir de</th><th scope="col">Nota</th></tr></thead><tbody>${c.rows}</tbody></table></div>`:""}
      ${c.noTax.length?`<p class="small"><strong>Sin impuesto estatal sobre ventas:</strong> ${c.noTax.map(esc).join(", ")}.</p>`:""}
      <p class="small muted">Se mide sobre el año actual o el anterior (12 meses consecutivos en algunos estados). Según lo publicado en ${c.asOf}. Cuando supere un umbral, regístrese en ese estado antes de cobrar.</p>${c.fresh}`));
  }
  out.push(b(n++,"Impuestos sobre la renta y de franquicia",`<p>Algunos estados gravan a los negocios que obtienen ingresos de sus residentes aunque no tengan presencia física, con sus propios umbrales. Como una LLC por lo general transfiere los ingresos a usted, al crecer sus ventas puede tener que presentar declaraciones en más de un estado. Un asesor fiscal puede decirle cuándo empieza eso en su caso.</p>`));
  out.push(b(n++,"Leyes de privacidad y del consumidor",`<p>Unos 20 estados ya tienen leyes integrales de privacidad del consumidor. La mayoría aplica solo por encima de ciertos umbrales, como manejar datos personales de 100,000 o más residentes del estado. La de California aplica a partir de unos $26 millones en ingresos anuales (ajustados cada año) o más de 100,000 consumidores de California; la de Texas aplica a la mayoría de los negocios que no son pequeños negocios según la definición de la SBA.</p>
    <ul class="clean"><li>Publique una política de privacidad clara en todos los lugares donde vende.</li><li>Todos los estados tienen una ley de notificación de filtraciones de datos.</li><li>Muchos estados tienen leyes de renovación automática para suscripciones: condiciones claras, consentimiento y cancelación fácil en línea.</li>${t==="software"?"<li>Las aplicaciones dirigidas a menores de 13 años deben cumplir con COPPA en todo el país.</li>":""}</ul>`));
  out.push(b(n++,"Actividades reguladas en cada estado",`<p>${REG[t]}</p><p>${c.L("Buscar licencias por estado y ocupación",c.LIC)}</p>`));
  if(t==="software")out.push(b(n++,S.reach==="some"?"Lanzar su aplicación solo en algunos estados":"Lanzar su aplicación en todo el país",
    S.reach==="some"?`<p><strong>La App Store y Google Play limitan la disponibilidad por país, no por estado de EE. UU.</strong> Para lanzar en algunos estados, contrólelo dentro de su aplicación:</p>
      <ul class="clean"><li>Pregunte el estado del usuario al registrarse y compárelo con su lista de estados permitidos.</li><li>Use la ubicación del dispositivo o verificaciones por IP si su categoría lo exige por ley (apuestas, sorteos, telesalud).</li><li>Muestre una lista de espera “próximamente en su estado” en lugar de un callejón sin salida. Son datos gratuitos de demanda para su próximo lanzamiento.</li><li>Indique los estados elegibles en sus términos de servicio.</li></ul>`
    :`<p>Una aplicación típica para todo el país solo necesita la LLC en su estado, una política de privacidad y términos, y que el impuesto sobre ventas lo maneje la tienda de aplicaciones o un servicio merchant of record. Revise el registro cuando contrate en otro estado, abra una oficina o supere umbrales del impuesto sobre ventas. Si alguna función está regulada, actívela solo en los estados donde tenga licencia.</p>`));
  return out;
}

/* ---------- Get known ---------- */
E.reach=reach;
})(window.SR_ES);
