const axios = require('axios');
const xmljs = require('xml-js')
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const iso88592 = require('iso-8859-2');
admin.initializeApp();
const database = admin.firestore();

exports.scheduledFunction = functions.pubsub.schedule('0 0 * * *').onRun( (context) => {
  axios.get("https://us-central1-my-app-563be.cloudfunctions.net/insert")
  .then((res)=>{
    //console.log("RES: ",res);
  })
  console.log('This will be run every day at 9:00!');
  return null;
});

exports.insert = functions.https.onRequest((request, res) => {
  var today = new Date();
  var day = String(today.getDate() - 1).padStart(2, "0"); //Resto porque no se mete el mismo dia!
  var month = String(today.getMonth() + 1).padStart(2, "0"); //+1 porque enero es 0!
  var year = today.getFullYear();
  today = year + "-" + month + "-" + day;
  console.log("Today --> ",today);
  if (day === '1') { 
    switch(month){
      case '1':
        month = '12'; //Cambio mes a diciembre
        day = 31;
        break;
      case '2':
        month = month - 1; //Cambio mes a enero
        day = 31;
        break;
      case '3':
        month = month - 1; //Cambio mes a febrero
        day = 28;
        break;
      case '4':
        month = month - 1; //Cambio mes a marzo
        day = 31;
        break;
      case '5':
        month = month - 1; //Cambio mes a abril
        day = 30;
        break;
      case '6':
        month = month - 1; //Cambio mes a mayo
        day = 31;
        break;
      case '7':
        month = month - 1; //Cambio mes a junio
        day = 30;
        break;
      case '8':
        month = month - 1; //Cambio mes a julio
        day = 31;
        break;
      case '9':
        month = month - 1; //Cambio mes a agosto
        day = 31;
        break;
      case '10':
        month = month - 1; //Cambio mes a septiembre
        day = 30;
        break;
      case '11':
        month = month - 1; //Cambio mes a octubre
        day = 31;
        break;
      case '12':
        month = month - 1; //Cambio mes a noviembre
        day = 30;
        break;          
    }
  }
  console.log("Month "+month+" Day "+day);
  var newURL = "https://analisis.datosabiertos.jcyl.es/api/records/1.0/search/?dataset=bocyl&q=oposiciones&rows=50&sort=fecha_publicacion&facet=fecha_publicacion&facet=seccion&facet=subseccion&facet=organismo&refine.fecha_publicacion=2021%2F"+month+"%2F"+day;
  console.log("NEW URL:",newURL)
  axios
    .get(newURL,
      {
        headers: {
          Authorization:
            "",
        },
      }
    )
    .then(async (response) => {
      var batch = database.batch();
      for (var i in response.data.records) {
        var url = 'http://bocyl.jcyl.es/' + response.data.records[i].fields.enlace_fichero_xml.split('/').slice(3).join('/');
        //console.log("ESTOY CON ESTE XML ",response.data.records[i].fields.enlace_fichero_xml)
        var nycRef = database.collection("oposiciones2021").doc();
        const todo = await getJson(url);
        const tipito = clasificar(todo.elements[0].elements[11].elements[0].elements[0].text);
        try {
          if (todo.elements[0].elements[11].elements[2].elements[0].elements[0].text) {
            console.log("EXISTE localidad ", todo.elements[0].elements[11].elements[2].elements[0].elements[0].text)
            batch.set(nycRef, {
              id: response.data.records[i].recordid,
              organismo: response.data.records[i].fields.organismo,
              fecha_publicacion: response.data.records[i].fields.fecha_publicacion,
              rango: response.data.records[i].fields.rango,
              path: '/' + response.data.records[i].fields.enlace_fichero_xml.split('/').slice(3).join('/'),
              enlace_fichero_xml: response.data.records[i].fields.enlace_fichero_xml,
              enlace_fichero_pdf: response.data.records[i].fields.enlace_fichero_pdf,
              titulo: todo.elements[0].elements[11].elements[0].elements[0].text,
              localidad: todo.elements[0].elements[11].elements[2].elements[0].elements[0].text,
              fecha: todo.elements[0].elements[11].elements[2].elements[1].elements[0].text,
              tipo: tipito,
              JSON: todo.elements[0].elements[11].elements[1]
            })
          }
        } catch {
          console.log("NO EXISTE")
          batch.set(nycRef, {
            id: response.data.records[i].recordid,
            organismo: response.data.records[i].fields.organismo,
            fecha_publicacion: response.data.records[i].fields.fecha_publicacion,
            rango: response.data.records[i].fields.rango,
            path: '/' + response.data.records[i].fields.enlace_fichero_xml.split('/').slice(3).join('/'),
            enlace_fichero_xml: response.data.records[i].fields.enlace_fichero_xml,
            enlace_fichero_pdf: response.data.records[i].fields.enlace_fichero_pdf,
            titulo: todo.elements[0].elements[11].elements[0].elements[0].text,
            //localidad: todo.elements[0].elements[11].elements[2].elements[0].elements[0].text,
            //fecha: todo.elements[0].elements[11].elements[2].elements[1].elements[0].text,
            tipo: tipito,
            JSON: todo.elements[0].elements[11].elements[1]
          })
        }

      }
      await batch.commit();
      console.log("YA ACABADO FOR")
      res.sendStatus(200);
    })
    .catch((errorAxios) => {
      console.log("Error en la primera petición axios: ", errorAxios);
      res.sendStatus(500);
    });
});

function getJson(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.request({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        responseEncoding: 'binary'
      });

      let xml = iso88592.decode(response.data.toString('binary'));
      //console.log("XML crudo creo ", xml)
      const respuesta = xmljs.xml2js(xml, {
        ignoreCdata: false,
      });
      //console.log("Respuesta de getJson" + JSON.stringify(respuesta));
      resolve(respuesta);
    } catch (error) {
      reject(error);
    };
  })
}

function clasificar(texto){
  var sinSaltosDeLinea = texto.replace(/(\r\n|\n|\r)/gm, "");
  let modificaciones =/(corrección|modifica|concede|corrige|acuerda.*amplia|aprueba.*modificación|(amplía|suspende).*plazo|rectifica|nuev[o,a].*(inscripciones|puntuaci|presenta)|relativa.*(puesto.*trabajo|oferta.*empleo))/; 
  let aprobado =/(apr[ueo]{1,2}|anuncia|p.blica)(?!.*(modificación|bases|convocatoria|aspirantes|lista|definitiv)).*oferta/;
  let provisional =/(apr[ueo]|publica|resuelve|adjudica).*(lista|relaci)?(provisional)/; // aprueba, aprobadas
  let definitivo =/(aprueba(?!.*(convocatoria.\w|bases|provisional))|declara(?!.*(provisional))|eleva|p.blic|acuerda|(determina|anuncia).*fecha).*(proce|lista|aspirantes)?(select|definitiv|designar|solicitud|inici)/;
  let abierto =/(aprueba|convoca|levanta|efectúa|resuelve|acuerda|anuncia.*fecha.*corte|abre|config.*ordena.*lista)(?!.*(provisional|admitidos|excluidos|superado|parte.*dispositiva|sentencia|vocal)).*(proce|convocatoria|concurso|bases|programa|pruebas|cubrir|renovaci|presentación|puesto|provisión|sistema|comisiones|permisos|contratación|apertura.*lista)/;
  if (aprobado.test(sinSaltosDeLinea.toLowerCase())){
    return "APROBADO";
  }else if (provisional.test(sinSaltosDeLinea.toLowerCase()) && !modificaciones.test(sinSaltosDeLinea.toLowerCase())){
    return "PROVISIONAL";
  }else if (definitivo.test(sinSaltosDeLinea.toLowerCase()) && !modificaciones.test(sinSaltosDeLinea.toLowerCase())){
    return "DEFINITIVO";
  }else if (modificaciones.test(sinSaltosDeLinea.toLowerCase())){
    return "MODIFICACIONES";
  }else if (abierto.test(sinSaltosDeLinea.toLowerCase()) && !aprobado.test(sinSaltosDeLinea.toLowerCase()) && !provisional.test(sinSaltosDeLinea.toLowerCase()) && !definitivo.test(sinSaltosDeLinea.toLowerCase()) && !modificaciones.test(sinSaltosDeLinea.toLowerCase())){
    return "ABIERTO";
  }else{
    return "OTROS";
  }
}