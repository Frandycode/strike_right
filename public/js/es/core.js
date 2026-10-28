/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Spanish (Español): shared interface text, business types, LLC rows
*/
/* Proper names, agency names, form names and URLs stay in English; the Spanish term follows in parentheses where it helps.
   Page files (js/es/*.js) add their own text to window.SR_ES. */
window.SR_ES=(function(){
"use strict";
const TYPES={software:"Software, aplicación o SaaS",ecommerce:"Tienda en línea / comercio electrónico",services:"Servicios profesionales / consultoría",retail:"Tienda minorista o productos físicos",food:"Alimentos o bebidas",trades:"Construcción / oficios especializados",home:"Limpieza, jardinería y servicios del hogar",care:"Cuidado personal, salud o ejercicio",child:"Cuidado infantil o educación",transport:"Entregas, mudanzas o transporte",creative:"Trabajo creativo, medios o eventos",other:"Otra cosa / aún no lo sé"};
const SHORT={software:"software y aplicaciones",ecommerce:"tiendas en línea",services:"servicios profesionales",retail:"comercio minorista",food:"alimentos y bebidas",trades:"construcción y oficios",home:"servicios del hogar",care:"cuidado personal y salud",child:"cuidado infantil y educación",transport:"transporte",creative:"trabajo creativo y eventos",other:"negocios nuevos"};
const ui={
  chooseState:"Elija un estado…",zipEmpty:"Completa su estado",zipMore:"Siga escribiendo…",zipBad:"No es un código postal de un estado de EE. UU. Elija su estado.",zipOk:st=>"✓ "+st+" (cámbielo abajo si no es correcto)",
  planTitle:loc=>loc?`Lista para empezar en ${loc}`:"Lista para empezar",
  planLead:(sh,hire,st)=>`Adaptada para ${sh}${hire?", con contratación de personal":""}${st?"":". Elija su estado arriba para ver notas de su estado"}. Avance de arriba hacia abajo; la ayuda gratuita va primero.`,
  done:(n,m)=>`${n} de ${m} hechos`,phaseDone:"✓ Hecho",phaseCount:(k,m)=>k+" de "+m,expandAll:"Abrir todo",collapseAll:"Cerrar todo",
  tapClear:"Toque otra vez para borrar",clearChecks:"Borrar marcas",clearFields:"Borrar campos",copied:"Copiado",selectCopy:"Seleccione el texto para copiar",copy:"Copiar",
  phone:"Teléfono",email:"Correo",address:"Dirección",bestFit:"Más adecuado",
  verified:"Última verificación:",report:"Informar de datos desactualizados",
  helpLead:(sh,st)=>`Filtrado para ${sh}${st?" en "+st:""}. Los recursos creados para su tipo de negocio llevan la etiqueta “Más adecuado”; también aparecen recursos generales que sirven a todo negocio.`,
  hiddenCount:n=>n===1?"Hay 1 recurso oculto dirigido a otros tipos de negocio.":`Hay ${n} recursos ocultos dirigidos a otros tipos de negocio.`,
  showingAll:"Se muestran todos los recursos, incluidos los dirigidos a otros tipos de negocio.",showAll:"Mostrar todos",showMatches:"Mostrar solo los adecuados",
  gTulsa:"Área de Tulsa",gTulsaSub:"Programas y oficinas locales",gOk:"En todo Oklahoma",gOkSub:"Programas y oficinas estatales",
  gDallas:"Área de Dallas",gDallasSub:"Programas y oficinas locales",gTx:"En todo Texas",gTxSub:"Programas y oficinas estatales",gUs:"En todo EE. UU.",gUsSub:"Disponibles en todos los estados",
  tulsaTech:`<strong>El mejor primer paso para un fundador de tecnología en Tulsa:</strong> contacte a OCN e i2E, y luego a Gradient y Build in Tulsa. Explique que es un fundador con base en Tulsa y poco capital inicial, y pregunte qué programa abierto acepta fundadores en su etapa.`,
  tulsaHint:"¿Está en el área de Tulsa? Escriba arriba una ciudad o código postal del área de Tulsa para ver también los programas de Tulsa.",
  dallasHint:"¿Está en el área de Dallas? Escriba arriba una ciudad o código postal del área de Dallas para ver también los programas de Dallas.",
  appReality:`<strong>Realidad para fundadores de aplicaciones:</strong> una idea de aplicación por sí sola rara vez califica para subvenciones de innovación. Los programas ayudan más cuando puede mostrar un problema real de clientes, demanda, innovación técnica o un camino hacia la creación de empleos. No pague por una aceleradora antes de confirmar sus condiciones y si le conviene.`,
  arch:d=>d>0?`Fecha límite de ARCH: 20 de noviembre de 2026 · faltan ${d} día${d===1?"":"s"}`:d===0?"La fecha límite de ARCH es hoy":"La fecha límite de ARCH (20 de noviembre de 2026) ya pasó; pregunte por el próximo grupo",
  llcDocSub:"El documento que presenta para formar la LLC.",llcFee:"Tarifa de presentación",llcFeeSub:"Una sola vez, tarifa estatal",llcOngoing:"Costo continuo",llcFiling:"Presentación continua",llcNexus:"Los vendedores de otros estados cobran impuesto sobre ventas a partir de",
  llcSpecial:"Reglas especiales:",llcNone:st=>`No se indica requisito de publicación ni impuesto estatal inusual para ${st}.`,llcOffice:st=>`Oficina de registro de ${st} ↗`,llcCopy:"Copiar resumen",
  llcSummary:(st,doc,fee,filing,ong,timing,special)=>`LLC en ${st}: ${doc}, tarifa de presentación ${fee}; continuo: ${filing} (${ong}), ${timing}.${special?" "+special:""}`,
  llcAsOf:m=>`Tarifas estatales según lo publicado en ${m}.`,noMatch:"Ningún estado coincide.",
  none:"Ninguno",perYear:"/año",noSalesTax:"Sin impuesto estatal sobre ventas",nexus:(base,n,conj)=>n?`${base} en ventas ${conj==="and"?"y":"o"} ${n} transacciones`:`${base} en ventas`,
  pickCount:n=>n?`${n} estado${n===1?"":"s"} seleccionado${n===1?"":"s"}`:"Seleccione los estados donde venderá",
  letterCopied:"Carta copiada.",letterSelect:"Seleccione el texto de la carta y cópielo.",emailCopied:"Versión de correo copiada.",emailFail:"No se pudo copiar automáticamente.",fieldsCleared:"Campos borrados.",
  eg:ph=>"p. ej., "+ph,
  chipEmpty:"Indique su estado y negocio",chipAria:t=>`Su negocio: ${t}. Editar`,
  homeDone:(n,m)=>`${n} de ${m} pasos de la lista hechos`,startTitle:(sh,loc)=>loc?`Todo para ${sh} en ${loc}`:`Todo para ${sh}`,
  stHelp:(n,b)=>`${n} recursos · ${b} más adecuado${b===1?"":"s"}`,stLlc:(st,fee)=>`${st}: tarifa de ${fee}`,stLlcNone:"Elija su estado",
  stReach:{home:"Solo mi estado",all:"Todos los estados"},stReachSome:n=>`${n} estado${n===1?"":"s"} seleccionado${n===1?"":"s"}`,stGrow:"5 guías prácticas",
  stLetterDraft:t=>`Borrador: ${t}`,stLetterNone:"7 modelos de carta",stGuides:"Estructuras · Financiamiento · Preguntas",stAbout:"Sin cuentas ni cookies de rastreo",
  letterTypes:{advice:"solicitud de asesoría",pilot:"propuesta de prueba piloto",intro:"presentación",partner:"solicitud de alianza",loi:"carta de intención",program:"consulta sobre un programa",followup:"seguimiento"}
};

/* ---------- Static text shared by every page (keys match data-i18n) ---------- */
const html={
  "th.light":"Claro","th.dark":"Oscuro","th.auto":"Auto",
  "hd.kicker":"Gratis · Cualquier estado de EE. UU. · Cualquier tipo de negocio",
  "hd.h1":"Empiece su negocio de la manera correcta",
  "hd.lead":"Una lista hecha para su negocio, los requisitos de una LLC en cada estado, cómo vender en otros estados, cómo ganar sus primeros clientes y cartas que puede enviar hoy. Escriba su código postal o elija su estado, y luego su ciudad y tipo de negocio.",
  "pk.zip":"Código postal (ZIP)","pk.state":"Su estado","pk.city":"Su ciudad o pueblo","pk.type":"Tipo de negocio","pk.where":"Dónde trabajará","pk.hire":"Pienso contratar personal",
  "wh.home":"Desde casa","wh.online":"Solo en línea","wh.site":"Local, oficina o espacio compartido","wh.mobile":"En ruta / en el lugar del cliente",
  "hd.free":"Sin registrarse. Sus opciones, marcas y borradores de cartas se quedan solo en este navegador.",
  "nv.checklist":"Lista","nv.help":"Ayuda gratuita","nv.llc":"LLC por estado","nv.states":"Vender en otros estados","nv.grow":"Darse a conocer","nv.letters":"Cartas","nv.structure":"Estructuras","nv.funding":"Financiamiento","nv.faq":"Preguntas","nv.about":"Acerca de",
  "ck.kicker":"Su plan","ck.copy":"Copiar lista","ck.clear":"Borrar marcas","ck.link":"Copiar enlace a mi plan","pr.btn":"Imprimir o guardar como PDF",
  "hp.kicker":"Sin costo o de bajo costo","hp.h2":"Ayuda según su negocio",
  "hp.also":"Consulte también la oficina de desarrollo económico de su ciudad o condado, su cámara de comercio, los colegios comunitarios y la biblioteca pública. Muchos ofrecen talleres gratuitos y tienen listas de subvenciones locales.",
  "st.kicker":"Más allá de su estado","st.h2":"Vender en todos los estados o en algunos","st.lead":"Dónde vende cambia lo que registra, qué impuestos cobra y qué reglas aplican. Elija su alcance para ver lo que aplica a su negocio.",
  "st.where":"¿Dónde venderá?","st.home":"Solo en mi estado","st.some":"Estados seleccionados","st.all":"Todos los estados","st.clear":"Borrar",
  "gr.kicker":"Primeros clientes","gr.h2":"Pruebas piloto, ofertas, promociones y darse a conocer",
  "gr.tPilot":"Pruebas piloto","gr.tTrial":"Pruebas y ofertas","gr.tPromo":"Promociones y lanzamiento","gr.tChan":"Hacerse visible","gr.tRules":"Reglas de mercadeo",
  "lt.kicker":"Listas para enviar","lt.h2":"Generador de cartas comerciales","lt.lead":"Elija una carta, complete los datos y copie una carta comercial o un correo terminado. Usa el estado, la ciudad y el tipo de negocio de su perfil.",
  "lt.type":"Tipo de carta",
  "lo.advice":"Solicitud de asesoría gratuita","lo.pilot":"Propuesta de prueba piloto a un posible cliente","lo.intro":"Presentación a un posible cliente","lo.partner":"Solicitud de alianza o patrocinio","lo.loi":"Carta de intención (para que la firme un cliente)","lo.program":"Consulta sobre una subvención o programa","lo.followup":"Seguimiento después de una reunión",
  "lt.name":"Su nombre","lt.title":"Su cargo","lt.biz":"Nombre del negocio","lt.contact":"Correo y/o teléfono","lt.what":"Lo que ofrece, en una frase","lt.toName":"Nombre del destinatario","lt.toTitle":"Cargo del destinatario","lt.toOrg":"Organización del destinatario",
  "lt.copy":"Copiar carta","lt.copyEmail":"Copiar como correo","lt.clear":"Borrar campos",
  "lt.note":"Los espacios en blanco aparecen entre [corchetes] hasta que los complete. Las cartas de intención se redactan como no vinculantes; haga revisar cualquier documento vinculante por un abogado o una clínica legal gratuita.",
  "ft.p":"Una guía gratuita para empezar cualquier tipo de negocio en cualquier estado de EE. UU. Empiece con asesoría gratuita, confirme las reglas donde vive y gaste con cuidado.",
  "ft.guide":"Guía","ft.official":"Recursos oficiales","ft.sba":"Guía de negocios de la SBA ↗","ft.ein":"IRS: EIN gratuito ↗","ft.nass":"Oficinas de registro estatales ↗","ft.sbdc":"Encuentre su SBDC ↗",
  "nv.home":"Inicio","nv.selling":"Vender","nv.lettersShort":"Cartas","nv.guides":"Guías",
  "skip":"Saltar al contenido","mn.menu":"Menú","pp.title":"Su negocio","pp.note":"Los cambios se aplican de inmediato en todas las páginas. Solo se guardan en este navegador.","pp.done":"Listo","pp.edit":"Editar",
  "pg.prev":"← Anterior","pg.next":"Siguiente →",
  "t.home":"Strike Right · Empiece su negocio de la manera correcta","t.checklist":"Lista para empezar · Strike Right","t.help":"Ayuda gratuita · Strike Right","t.llc":"LLC por estado · Strike Right","t.selling":"Vender en otros estados · Strike Right","t.grow":"Darse a conocer · Strike Right","t.letters":"Cartas · Strike Right","t.guides":"Guías · Strike Right","t.about":"Acerca de · Strike Right","t.404":"Página no encontrada · Strike Right",
  "hm.progK":"Su progreso","hm.continue":"Continuar la lista →","hm.startK":"Empiece aquí",
  "cd.checklist.k":"Paso a paso","cd.checklist.h":"Lista","cd.checklist.p":"Seis pasos, de la ayuda gratuita al lanzamiento, adaptados a usted.",
  "cd.help.k":"Sin costo","cd.help.h":"Ayuda gratuita","cd.help.p":"Asesores, mentores y programas según su negocio.",
  "cd.llc.k":"Formar","cd.llc.h":"LLC por estado","cd.llc.p":"Tarifas, informes y reglas especiales de los 50 estados + DC.",
  "cd.selling.k":"Alcance","cd.selling.h":"Vender en otros estados","cd.selling.p":"Registro, umbrales del impuesto sobre ventas y actividades reguladas.",
  "cd.grow.k":"Primeros clientes","cd.grow.h":"Darse a conocer","cd.grow.p":"Pruebas piloto, ofertas, promociones y reglas de mercadeo.",
  "cd.letters.k":"Listas para enviar","cd.letters.h":"Cartas","cd.letters.p":"Siete cartas comerciales completadas con sus datos.",
  "cd.guides.k":"Decidir","cd.guides.h":"Guías","cd.guides.p":"Estructuras de negocio, escalera de financiamiento y respuestas claras.",
  "cd.about.k":"Acerca de","cd.about.h":"Acerca de y privacidad","cd.about.p":"Quién hace Strike Right y qué se queda en su navegador.",
  "nf.kicker":"Error 404","nf.h1":"No encontramos esa página","nf.lead":"Puede que el enlace sea antiguo o tenga un error. Empiece desde el inicio o elija una sección.","nf.home":"Ir al inicio"
};
const attr={
  "a.home":"Strike Right, inicio","a.lang":"Idioma","a.theme":"Tema de color","a.picker":"Adapte esta guía","a.sections":"Secciones","a.reach":"Dónde venderá","a.tabs":"Temas para darse a conocer","a.top":"Volver arriba","a.llcTable":"Requisitos de LLC, todos los estados","a.structTable":"Estructuras de negocio comparadas",
  "ft.guide":"Guía","ft.official":"Recursos oficiales",
  "ph.zip":"p. ej., 75201","ph.city":"p. ej., Springfield","ph.filter":"Filtrar estados…","ph.title":"Fundador(a)","ph.what":"p. ej., una aplicación de citas que reduce las ausencias en clínicas pequeñas",
  "a.main":"Principal","a.crumbs":"Ruta de navegación","a.pager":"Páginas anterior y siguiente","a.jump":"En esta página","pp.close":"Cerrar","mn.menu":"Menú"
};

const DOC={"Certificate of Formation":"Certificate of Formation (certificado de formación)","Certificate of Organization":"Certificate of Organization (certificado de organización)","Articles of Organization":"Articles of Organization (artículos de organización)"};
const docName=n=>DOC[n]||n;
/* [ongoing filing, timing, special rules] */
const llc={
"Alabama":["Declaración del business privilege tax (impuesto de privilegio)","Anual","Sin tarifa de informe; el impuesto de privilegio se basa en el patrimonio neto y puede ser pequeño o cero."],
"Alaska":["Informe bienal ($100)","Cada 2 años, vence el 2 de enero",""],
"Arizona":["Sin informe anual","—","Debe publicar un aviso de formación, salvo que el agente estatutario o el lugar de negocio de la LLC esté en el condado de Maricopa o Pima."],
"Arkansas":["Informe anual del franchise tax (impuesto de franquicia)","Anual, vence el 1 de mayo",""],
"California":["Impuesto anual de LLC de $800 + Statement of Information ($20 cada 2 años)","Impuesto anual; primera declaración dentro de 90 días de la formación","Impuesto mínimo de franquicia de $800 cada año, aunque no tenga ingresos."],
"Colorado":["Informe periódico","Anual, alrededor del mes de formación",""],
"Connecticut":["Informe anual","Anual, del 1 de enero al 31 de marzo",""],
"Delaware":["Impuesto anual de LLC","Anual, vence el 1 de junio","El impuesto anual subió de $300 a $400 en 2026. Formar aquí no evita registrarse en el estado donde realmente opera."],
"District of Columbia":["Informe bienal ($300)","Cada 2 años, vence el 1 de abril",""],
"Florida":["Informe anual","Anual, del 1 de enero al 1 de mayo","Recargo de $400 después del 1 de mayo."],
"Georgia":["Registro anual","Anual, del 1 de enero al 1 de abril",""],
"Hawaii":["Informe anual","Anual, al final del trimestre de formación",""],
"Idaho":["Informe anual (sin tarifa)","Anual, al final del mes de aniversario",""],
"Illinois":["Informe anual","Anual, antes del mes de aniversario",""],
"Indiana":["Informe de entidad comercial ($31)","Cada 2 años, mes de aniversario",""],
"Iowa":["Informe bienal ($30)","Cada 2 años, años impares, antes del 1 de abril",""],
"Kansas":["Informe de información ($90)","Cada 2 años, antes del 15 de abril",""],
"Kentucky":["Informe anual","Anual, del 1 de enero al 30 de junio",""],
"Louisiana":["Informe anual","Anual, en el aniversario de formación",""],
"Maine":["Informe anual","Anual, vence el 1 de junio",""],
"Maryland":["Informe anual / declaración de bienes personales","Anual, vence el 15 de abril",""],
"Massachusetts":["Informe anual","Anual, antes del aniversario de formación","Uno de los estados más caros para formar y mantener una LLC."],
"Michigan":["Declaración anual","Anual, vence el 15 de febrero",""],
"Minnesota":["Renovación anual (sin tarifa)","Anual, antes del 31 de diciembre","La tarifa de presentación puede ser mayor en línea."],
"Mississippi":["Informe anual (sin tarifa)","Anual, del 1 de enero al 15 de abril",""],
"Missouri":["Sin informe anual","—",""],
"Montana":["Informe anual","Anual, vence el 15 de abril",""],
"Nebraska":["Informe bienal ($25)","Cada 2 años, años impares, antes del 1 de abril","Debe publicar un aviso de formación en un periódico local durante 3 semanas y presentar la prueba de publicación."],
"Nevada":["Lista anual + licencia comercial estatal","Anual, al final del mes de aniversario","El total de presentación incluye la lista inicial y la licencia comercial estatal de $200."],
"New Hampshire":["Informe anual","Anual, vence el 1 de abril",""],
"New Jersey":["Informe anual","Anual, al final del mes de aniversario",""],
"New Mexico":["Sin informe anual","—",""],
"New York":["Declaración bienal ($9)","Cada 2 años","Debe publicar un aviso en dos periódicos durante seis semanas dentro de 120 días y luego presentar un Certificate of Publication de $50. La publicación puede costar desde cientos hasta más de $1,000 según el condado. Se exige un operating agreement (acuerdo operativo) por escrito."],
"North Carolina":["Informe anual","Anual, vence el 15 de abril",""],
"North Dakota":["Informe anual","Anual, vence el 15 de noviembre",""],
"Ohio":["Sin informe anual","—",""],
"Oklahoma":["Certificado anual","Anual, en el aniversario de formación",""],
"Oregon":["Informe anual","Anual, en el aniversario de formación",""],
"Pennsylvania":["Informe anual","Anual, del 1 de enero al 30 de septiembre",""],
"Rhode Island":["Informe anual ($50) + impuesto mínimo comercial ($400)","Anual, del 1 de febrero al 1 de mayo","Impuesto mínimo comercial de $400 cada año, además del informe."],
"South Carolina":["Sin informe anual","—",""],
"South Dakota":["Informe anual","Anual, primer día del mes de aniversario",""],
"Tennessee":["Informe anual + franchise & excise tax (impuesto de franquicia y especial)","Anual, vence el 1 de abril (año fiscal de diciembre)","La presentación y el informe anual cuestan $50 por miembro, con un mínimo de $300. Impuesto de franquicia mínimo de $100 al año."],
"Texas":["Public Information Report (informe de información pública) u Ownership Information Report (informe de propiedad) si está en o por debajo del umbral sin impuesto; informe del franchise tax (impuesto de franquicia) si lo supera","Anual, vence el 15 de mayo","Toda LLC de Texas presenta cada año antes del 15 de mayo. En o por debajo del umbral sin impuesto a pagar (no-tax-due threshold: $2.65 millones para los informes de 2026 y 2027), presente solo el Public Information Report u Ownership Information Report; el No Tax Due Report ya no se presenta. Por encima del umbral, presente el informe del franchise tax."],
"Utah":["Renovación anual","Anual, en el aniversario de formación",""],
"Vermont":["Informe anual","Anual, dentro de 3 meses del cierre del año fiscal",""],
"Virginia":["Tarifa de registro anual","Anual, al final del mes de formación",""],
"Washington":["Informe anual","Anual, al final del mes de aniversario",""],
"West Virginia":["Informe anual","Anual, del 1 de enero al 1 de julio",""],
"Wisconsin":["Informe anual","Anual, al final del trimestre de formación",""],
"Wyoming":["Informe anual (license tax, impuesto de licencia)","Anual, primer día del mes de aniversario","Mínimo de $60; más si los activos en Wyoming superan $300,000."]
};
const nexusNote={"Alaska":"Solo impuestos locales sobre ventas, a través de la Alaska Remote Seller Sales Tax Commission","Illinois":"Se eliminó la prueba de transacciones el 1 de enero de 2026","Kentucky":"Se eliminó la prueba de transacciones el 1 de agosto de 2026"};

/* ---------- Checklist (same ids as the English items) ---------- */
const CHIP={software:"Software",ecommerce:"Tienda en línea",services:"Servicios",retail:"Comercio",food:"Alimentos",trades:"Oficios",home:"Hogar",care:"Cuidado personal",child:"Cuidado infantil",transport:"Transporte",creative:"Creativo",other:"Negocio nuevo"};

return {TYPES,SHORT,ui,html,attr,docName,llc,nexusNote,CHIP};
})();
