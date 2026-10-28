/*
   Author: Frandy Slueue | Alias: CodeBreeder | Title: Software Engineering · DevOps Security · IT Ops
   Portfolio: https://frandycode.dev | GitHub: https://github.com/frandycode
   Email: frandyslueue@gmail.com | Location: Tulsa, OK & Dallas, TX (Central Time)
   Project: Strike Right — Spanish (Español): letter builder
*/
(function(E){
"use strict";
const tgs=x=>`<span class="tag">${x}</span>`;
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const EXTRA={
  advice:[["exHelp","En qué necesita ayuda","textarea","elegir una estructura, las licencias que necesito y el financiamiento para el que podría calificar"]],
  pilot:[["exLen","Duración de la prueba","text","60 días"],["exPrice","Precio de la prueba","text","sin costo, o $250 por la prueba"],["exGoal","Medida de éxito","text","reducir las citas perdidas en un 25%"],["exAfter","Precio después de la prueba","text","$99 al mes"]],
  intro:[["exProblem","El problema que les resuelve","text","las citas perdidas que les cuestan ingresos a las clínicas cada semana"],["exProof","Prueba o resultado inicial (opcional)","text","Las clínicas piloto redujeron las ausencias en un 30% en dos meses."]],
  partner:[["exAsk","Lo que solicita","text","un taller organizado en conjunto para dueños de pequeños negocios locales"],["exGive","Lo que reciben a cambio","textarea","su logotipo en los materiales, un espacio para hablar y presentaciones a nuestros clientes"]],
  loi:[["exUse","Cómo usarían su producto o servicio","text","recordatorios de citas para dos sedes de la clínica"],["exQty","Cantidad o usuarios previstos","text","2 sedes, unas 40 personas"],["exWhen","Inicio previsto","text","primer trimestre de 2027"],["exPrice2","Precio indicativo","text","$99 al mes por sede"]],
  program:[["exProgram","Nombre del programa","text","Programa de Innovación para Pequeñas Empresas"],["exStage","Su etapa","text","un prototipo funcional con tres clientes piloto"],["exUseFunds","Cómo usaría el apoyo","textarea","terminar el producto y hacer dos pruebas piloto más"]],
  followup:[["exMet","Cuándo y cómo se reunieron","text","nuestra llamada del martes"],["exNext","Siguiente paso acordado","text","una prueba piloto de 30 días que empieza el próximo mes"]]
};
const HINTS={advice:"Para un SBDC, un capítulo de SCORE, un Women's Business Center o un programa local.",pilot:"Propone una prueba con plazo, medidas de éxito claras y condiciones.",intro:"Una carta breve de primer contacto con un posible cliente.",partner:"Pide a un negocio u organización que sea su aliado o patrocinador.",loi:"Una declaración de interés no vinculante que firma un cliente. Útil para solicitudes de subvenciones y préstamos.",program:"Pregunta a un programa de subvenciones o apoyo sobre los requisitos.",followup:"Agradece a alguien después de una reunión y confirma los siguientes pasos."};
function letter(ty,c){
  const vv=c.vv,S=c.S,X=c.X;
  const name=vv("lName")||"[Su nombre]",title=vv("lTitle"),biz=vv("lBiz")||"[Nombre del negocio]",contact=vv("lContact")||"[Correo · Teléfono]";
  const what=vv("lWhat")||"[lo que ofrece]",toName=vv("lToName"),toTitle=vv("lToTitle"),toOrg=vv("lToOrg")||"[Organización]";
  const place=[S.city,S.state].filter(Boolean).join(", ")||"[Ciudad, Estado]";
  const g=id=>vv(id)||"["+((X.find(x=>x[0]===id)||[0,"dato"])[1]).toLowerCase()+"]";
  const sal=toName?`Estimado(a) ${toName}:`:vv("lToOrg")?`Estimado equipo de ${vv("lToOrg")}:`:"A quien corresponda:";
  const kind=c.kind;
  let subject="",body="";
  switch(ty){
    case "advice":subject=`Solicitud de asesoría gratuita: nuevo negocio en ${place}`;
      body=`Soy fundador(a) de ${biz}, un nuevo negocio de ${kind} en ${place} que ofrece ${what}. Me encuentro en una etapa inicial, con fondos limitados, y le agradecería mucho su orientación.\n\nEn concreto, me gustaría recibir ayuda con ${g("exHelp")}.\n\n¿Podríamos programar una sesión de asesoría gratuita? Con gusto me reúno en línea o en persona cuando le resulte conveniente. Gracias por su labor de apoyo a los negocios locales.`;break;
    case "pilot":subject=`Propuesta de prueba piloto: ${biz} y ${toOrg}`;
      body=`Gracias por compartir los retos que enfrenta ${toOrg}. ${biz} ofrece ${what}, y quisiera proponerle una prueba piloto breve para mostrarle los resultados que podemos lograr.\n\nPrueba piloto propuesta:\n• Duración: ${g("exLen")}\n• Precio: ${g("exPrice")}\n• Medida de éxito: ${g("exGoal")}, en comparación con sus cifras actuales\n• Apoyo: instalación, capacitación y una revisión semanal\n• Después de la prueba: si se cumple la meta y deciden continuar, el precio sería de ${g("exAfter")}. No hay obligación de continuar.\n\nAcordaríamos por escrito cómo se manejan sus datos y cómo se mantienen confidenciales y, con su permiso, compartiríamos los resultados como caso de éxito.\n\nSi le parece útil, me encantaría tener una breve llamada para confirmar los detalles y la fecha de inicio.`;break;
    case "intro":subject=`Cómo ayudar a ${toOrg} con ${g("exProblem")}`;
      body=`Me comunico con usted porque muchas organizaciones como ${toOrg} enfrentan ${g("exProblem")}. ${biz} ofrece ${what}.\n\n${vv("exProof")?vv("exProof")+"\n\n":""}Le agradecería 15 minutos para conocer cómo manejan esto hoy y si podríamos ayudarles. Si este no es el momento adecuado, le agradecería que me indicara la persona indicada.`;break;
    case "partner":subject=`Solicitud de alianza de ${biz}`;
      body=`${biz} es un negocio con sede en ${place} que ofrece ${what}. Como atendemos a muchas de las mismas personas que ${toOrg}, creo que una alianza podría beneficiarnos a ambos.\n\nQuisiera proponerle ${g("exAsk")}. A cambio, ${toOrg} recibiría ${g("exGive")}.\n\nCon gusto ajusto los detalles a sus objetivos y me encantaría conversar brevemente para explorar la idea.`;break;
    case "loi":subject=`Carta de intención: ${toOrg} y ${biz}`;
      body=`Mediante esta carta no vinculante, ${toOrg} confirma su interés en usar la oferta de ${biz}, ${what}, sujeto a un acuerdo final por escrito.\n\n• Uso previsto: ${g("exUse")}\n• Cantidad o usuarios previstos: ${g("exQty")}\n• Inicio previsto: ${g("exWhen")}\n• Precio indicativo: ${g("exPrice2")}\n\nEsta carta expresa solo una intención. No crea una obligación vinculante de comprar o vender para ninguna de las partes, y cualquier compra se regirá por un acuerdo escrito aparte.\n\nRecibido y aceptado por ${toOrg}:\n\nFirma: ______________________\nNombre: ${toName||"______________________"}\nCargo: ${toTitle||"______________________"}\nFecha: ______________________`;break;
    case "program":subject=`Consulta sobre ${g("exProgram")}`;
      body=`Soy fundador(a) de ${biz} en ${place}. Ofrecemos ${what}, y actualmente estamos en esta etapa: ${g("exStage")}.\n\nMe interesa ${g("exProgram")} y quisiera confirmar si cumplimos los requisitos. El apoyo nos ayudaría a ${g("exUseFunds")}.\n\n¿Podría indicarme:\n• Si las solicitudes están abiertas y cuál es la próxima fecha límite\n• Los requisitos de elegibilidad, incluidos etapa, ingresos y ubicación\n• Si se trata de una subvención, un préstamo, una inversión o un reembolso\n• Qué documentos se requieren?\n\nGracias por su tiempo. Quedo atento(a) a su respuesta.`;break;
    case "followup":subject=`Gracias y próximos pasos`;
      body=`Gracias por conversar conmigo durante ${g("exMet")}. Me dio mucho gusto conocer más sobre ${toOrg} y sus prioridades.\n\nComo acordamos, nuestro siguiente paso es ${g("exNext")}. Le enviaré con anticipación cualquier material que necesite y con gusto respondo sus preguntas mientras tanto.\n\nEspero que trabajemos juntos.`;break;
  }
  const dateLine=(S.city||S.state?place+", ":"")+c.date;
  const head=`${name}${title?", "+title:""}\n${biz}\n${place}\n${contact}\n\n${dateLine}\n\n${[toName,toTitle,toOrg].filter(Boolean).join("\n")}\n\nAsunto: ${subject}\n\n${sal}\n\n`;
  const sign=`\n\nAtentamente,\n\n\n${name}\n${title?title+", ":""}${biz}\n${contact}`;
  return {letter:head+body+sign,email:`Asunto: ${subject}\n\n${toName?"Estimado(a) "+toName+":":"Buen día:"}\n\n${body}\n\nSaludos cordiales,\n${name}\n${title?title+", ":""}${biz}\n${contact}`};
}
Object.assign(E,{EXTRA,HINTS,letter});
})(window.SR_ES);
