<template>
  <div>
    <div data-app>
      <v-card>
        <v-card-title> Gestor y localizador de oposiciones en Castilla y León </v-card-title>
        <v-card-text>
          <div class="description"> Esta página es una herramienta que se ha creado con el fin de consultar diferentes oposiciones en el territorio de Castilla y León.
          Las oposiciones son gestionadas por las etapas que pasan con el objetivo de agilizar el proceso de búsqueda. Además, se pueden aplicar una serie de filtros para que la búsqueda sea 
          aún más concreta.</div>
        </v-card-text>
        <v-tabs v-model="tab" align-with-title>
          <v-tab :disabled="loading" v-for="tipo in tipos" :key="tipo">
            <v-tooltip content-class="tooltipEtapas" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon 
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                  {{tipo}}
                  </v-icon>
                </template>
                <span v-if="tipo==='APROBADO'">Todos los documentos relacionados con las ofertas de empleo aprobadas</span>
                <span v-else-if="tipo==='ABIERTO'">Todos los documentos relacionados con las convocatorias de oposiciones abiertas.</span>
                <span v-else-if="tipo==='PROVISIONAL'">Todos los documentos relacionados con los resultados provisionales. Lista de admitidos y excluidos provisionales, resultados de examenes provionales, etc.</span>
                <span v-else-if="tipo==='DEFINITIVO'">Todos los documentos relacionados con los resultados definitivos. Lista de admitidos y excluidos definitivos, resultados de examenes definitivos, etc.</span>
                <span v-else-if="tipo==='MODIFICACIONES'">Todos los documentos relacionados con correcciones, ampliaciones de plazo, modificaciones de listas de admitidos y excluidos, resultados, etc.</span>
                <span v-else-if="tipo==='OTROS'">Otros documentos.</span>
                <span v-else>Últimos documentos publicados</span>
            </v-tooltip>
          </v-tab>
        </v-tabs>

          <v-tabs-items v-model="tab">
            <v-tab-item v-for="tipo in tipos" :key="tipo">
              <v-data-table
                :headers="headers"
                :items="loading ? [] : filterArray"
                :search="search"
                @click:row="goToOposicion"
                :loading="loading"
                loading-text="Espera un momento, por favor"
                item-key="id"
                class="elevation-1"
              >
                <template v-slot:[`header.localidad`]="{ header }">
                  {{ header.text }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-help
                      </v-icon>
                    </template>
                    <span>Filtro que permite localizar los documentos por localidad</span>
                  </v-tooltip>
                  <v-menu ref="menuLocalidad" offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon small :color="localidad ? '#FF33C4' : ''">
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div style="background-color: white; width: 280px">
                      <v-text-field
                        v-model="localidad"
                        :disabled="localidadDisabled"
                        class="pa-4"
                        type="text"
                        label="Introduzca localidad a filtrar"
                        @keypress.native.enter="filterLocalidad(); localidadDisabled=true"
                      ></v-text-field>
                      <v-btn
                        @click="filterLocalidad(); localidadDisabled=true"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Buscar</v-btn
                      >
                      <v-btn
                        @click="localidad = ''; filterAndOrder(); localidadDisabled=false"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Limpiar</v-btn
                      >
                    </div>
                  </v-menu>
                </template>

                <template v-slot:[`header.fecha`]="{ header }">
                  {{ header.text }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-help
                      </v-icon>
                    </template>
                    <span>Filtro que permite consultar en base a su fecha de disposición (fecha en la que se dicta la resolución, orden, etc.) </span>
                  </v-tooltip>
                  <v-menu offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon small :color="fechaDisposicion ? '#FF33C4' : ''">
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div style="background-color: white; width: 280px">
                      <v-date-picker
                        v-model="fechaDisposicion"
                        range
                        label="Eliga dos fechas o clica dos veces sobre el mismo día"
                      ></v-date-picker>
                      <v-btn
                        @click="fechaDisposicion = undefined; filterAndOrder()"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Limpiar</v-btn
                      >
                    </div>
                  </v-menu>
                </template>

                <template v-slot:[`header.rango`]="{ header }">
                  {{ header.text }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-help
                      </v-icon>
                    </template>
                    <span>Filtro que permite consultar en base al rango (categoría normativa de la disposición: ley, orden, sentencia, directiva, etc.)</span>
                  </v-tooltip>
                  <v-menu ref="menuRango" offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon small :color="rango.length<5 ? '#FF33C4' : ''"> 
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div style="background-color: white; width: 280px">
                      <v-select
                        v-model="rango"
                        class="pa-4"
                        :items="rangos"
                        multiple
                        label="Selecciona un rango"
                        @input="filterAndOrder"
                      ></v-select>
                      <v-btn
                        @click="rango = ['ORDEN','RESOLUCIÓN','ACUERDO','DECRETO','OTROS']; filterAndOrder()"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Limpiar</v-btn
                      >
                    </div>
                  </v-menu>
                </template>

                <template v-slot:[`header.organismo`]="{ header }">
                  {{ header.text }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-help
                      </v-icon>
                    </template>
                    <span>Filtro que permite consultar en base al organismo que emite la disposición.</span>
                  </v-tooltip>
                  <v-menu ref="menuOrganismo" offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon small :color="organismo ? '#FF33C4' : ''">
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div style="background-color: white; width: 280px">
                      <v-select
                        v-model="organismo"
                        class="pa-4"
                        :items="organismos"
                        label="Selecciona un organismo"
                        @input="filterAndOrder"
                      ></v-select>
                      <v-btn
                        @click="filterAndOrder()"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Buscar</v-btn
                      >
                      <v-btn
                        @click="organismo = ''; filterAndOrder()"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Limpiar</v-btn
                      >
                    </div>
                  </v-menu>
                </template>

                <template v-slot:[`header.fechaPublicacion`]="{ header }">
                  {{ header.text }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-help
                      </v-icon>
                    </template>
                    <span>Filtro que permite consultar en base a su fecha de publicación (fecha en la que se publica la resolución, orden, etc.) </span>
                  </v-tooltip>
                  <v-menu offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon small :color="fechaPublicacion ? '#FF33C4' : ''">
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div style="background-color: white; width: 280px">
                      <v-date-picker
                        v-model="fechaPublicacion"
                        range
                        label="Eliga dos fechas o clica dos veces sobre el mismo día"
                      ></v-date-picker>
                      <v-btn
                        @click="fechaPublicacion = undefined; filterAndOrder()"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Limpiar</v-btn
                      >
                    </div>
                  </v-menu>
                </template>

              <template v-slot:[`header.orden`]="{ header }">
                  {{ header.text }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-help
                      </v-icon>
                    </template>
                    <span>Filtro que permite localizar aquellos documentos que contengan el número de la disposición del documento. Su estructura es: código alfabético del departamento/número/año.</span>
                  </v-tooltip>
                  <v-menu ref="menuOrden" offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon small :color="orden ? '#FF33C4' : ''">
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div style="background-color: white; width: 280px">
                      <v-text-field
                        v-model="orden"
                        :disabled="ordenDisabled"
                        class="pa-4"
                        type="text"
                        label="Introduzca orden a filtrar"
                        @keypress.native.enter="filterOrden(); ordenDisabled=true"
                      ></v-text-field>
                      <v-btn
                        @click="filterOrden(); ordenDisabled=true"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Buscar</v-btn
                      >
                      <v-btn
                        @click="orden = ''; filterAndOrder(); ordenDisabled=false"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Limpiar</v-btn
                      >
                    </div>
                  </v-menu>
                </template>  

              <template v-slot:[`header.jotasonn`]="{ header }">
                  {{ header.text }}
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-help
                      </v-icon>
                    </template>
                    <span>Filtro que permite localizar aquellos documentos que contengan la palabra o palabras.</span>
                  </v-tooltip>
                  <v-menu ref="menuWord" offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon small :color="keywords.length>0 ? '#FF33C4' : ''">
                          mdi-filter
                        </v-icon>
                      </v-btn>
                    </template>
                    <div style="background-color: white; width: 280px">
                      <v-text-field
                        v-model="jotasonn"
                        class="pa-4"
                        type="text"
                        label="Introduzca palabra clave"
                        @keypress.native.enter="keywords.push(jotasonn); filterAndOrder()" 
                      ></v-text-field>
                      <div class="container">
                        <keyword-tag 
                        v-for="(word,index) in keywords"
                        :key="index"
                        :wordComponent="word"
                        :indexComponent="index"
                        @remove="removeWord"
                        >
                        </keyword-tag>
                      </div>
                      <v-btn
                        @click="keywords.push(jotasonn); filterAndOrder()"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Buscar</v-btn
                      >
                      <v-btn
                        @click="jotasonn = ''; keywords=[]; filterAndOrder()"
                        small
                        text
                        color="primary"
                        class="ml-2 mb-2"
                        >Limpiar</v-btn
                      >
                    </div>
                  </v-menu>
                </template>

              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
      </v-card>
      <v-btn v-show="!loading" @click="resetAllFilters" depressed color="error" align-center> Eliminar todos los filtros</v-btn>
    </div>
  </div>
</template>

<script>
import { db } from "../plugins/firebase";
import KeywordTag from "./KeywordTag.vue";

export default {
  name: "ListadoOposiciones",
  components:{
    KeywordTag
  },
  data() {
    return {
      search: "",

      localidad: "",
      localidadDisabled: false,
      ordenDisabled: false,
      rango: ["ORDEN",  "RESOLUCIÓN", "ACUERDO", "DECRETO", "OTROS"],
      rangos: ["ORDEN", "RESOLUCIÓN", "ACUERDO", "DECRETO", "OTROS"], //Lo necesito para mostrarlo en v-select
      organismo: "",
      organismos: ["CONSEJERÍA", "UNIVERSIDAD", "AYUNTAMIENTO", "DIPUTACIÓN", "CORTES", "CONSEJO", "MANCOMUNIDAD"], //Lo necesito para mostrarlo en v-select
      fechaPublicacion: undefined,
      fechaDisposicion: undefined,
      orden: "",
      jotasonn: "",
      keywords: [],

      tab: null,
      infoOpos: [],
      infoOposAprobado: [],
      infoOposAbierto: [],
      infoOposProvisional: [],
      infoOposDefinitivo: [],
      infoOposModificaciones: [],
      loading: null,
      filterArray: [],
      headers: [
        { text: "Localidad", value: "localidad" },
        { text: "Fecha de disposición", value: "fecha" },
        { text: "Rango", value: "rango" },
        { text: "Organismo", value: "organismo" },
        { text: "Fecha de publicacion", value: "fechaPublicacion" },
        { text: "Orden", value: "orden"},
        { text: "Palabra clave", value: "jotasonn" }, 
      ],
      tipos: [
        "RECIENTES",
        "APROBADO",
        "ABIERTO",
        "PROVISIONAL",
        "DEFINITIVO",
        "MODIFICACIONES",

      ],
    };
  },
  watch: {
    tab(){
      this.filterAndOrder();
    },
    fechaDisposicion(dates){
      if (dates && dates.length === 2){
        this.filterAndOrder();
      }
    },
    fechaPublicacion(dates){
      if (dates && dates.length === 2){
        this.filterAndOrder();
      }
    }
  },
  methods: {
    removeWord(index){
      this.keywords.splice(index,1)
      this.filterAndOrder();
    },
    goToOposicion(value) {
      this.$router.push("/informationOposicion/" + value.id);
    },
    resetAllFilters() {
      this.localidad="";
      this.localidadDisabled=false;
      this.ordenDisabled=false;
      this.fechaDisposicion=undefined;
      this.rango= ["ORDEN",  "RESOLUCIÓN", "ACUERDO", "DECRETO", "OTROS"];
      this.organismo = "";
      this.fechaPublicacion= undefined;
      this.orden="";
      this.jotasonn="";
      this.keywords=[];
      this.filterAndOrder();
    },
    async filterAndOrder(){

      let query;
      switch (this.tipos[this.tab]){
        case 'RECIENTES':
          this.infoOpos=[];
          this.loading=true;
          query = await db.orderBy("fecha_publicacion", 'desc')/*.startAt(0)*/.limit(50).get();
          query.forEach((doc) => {
            let datadoc = doc.data();
            const data = {
              id: datadoc.id,
              organismo: datadoc.organismo,
              fechaPublicacion: datadoc.fecha_publicacion,
              rango: datadoc.rango,
              titulo: datadoc.titulo,
              path: datadoc.path,
              enlace_fichero_xml: datadoc.enlace_fichero_xml,
              enlace_fichero_pdf: datadoc.enlace_fichero_pdf,
              tipo: datadoc.tipo,
              localidad: datadoc.localidad,
              fecha: datadoc.fecha,
              jotason: datadoc.JSON,
            };
            this.infoOpos.push(data);
          });
          this.loading=false;
          this.tabDisabled=false;
          this.filterArray = JSON.parse(JSON.stringify(this.infoOpos));
          break;
        case 'APROBADO':
          this.infoOpos=[];
          this.loading=true;
          if (this.infoOposAprobado.length === 0){
            query = await db.where("tipo", "==", "APROBADO").get();
            query.forEach((doc) => {
              let datadoc = doc.data();
              const data = {
                id: datadoc.id,
                organismo: datadoc.organismo,
                fechaPublicacion: datadoc.fecha_publicacion,
                rango: datadoc.rango,
                titulo: datadoc.titulo,
                path: datadoc.path,
                enlace_fichero_xml: datadoc.enlace_fichero_xml,
                enlace_fichero_pdf: datadoc.enlace_fichero_pdf,
                tipo: datadoc.tipo,
                localidad: datadoc.localidad,
                fecha: datadoc.fecha,
                jotason: datadoc.JSON,
              };
              this.infoOposAprobado.push(data);
            });
          }
          this.filterArray = JSON.parse(JSON.stringify(this.infoOposAprobado));
          this.loading=false;
          break;
        case 'ABIERTO':
          this.infoOpos=[];
          this.loading=true;
          if (this.infoOposAbierto.length === 0){
            query = await db.where("tipo", "==", "ABIERTO").get();
            query.forEach((doc) => {
              let datadoc = doc.data();
              const data = {
                id: datadoc.id,
                organismo: datadoc.organismo,
                fechaPublicacion: datadoc.fecha_publicacion,
                rango: datadoc.rango,
                titulo: datadoc.titulo,
                path: datadoc.path,
                enlace_fichero_xml: datadoc.enlace_fichero_xml,
                enlace_fichero_pdf: datadoc.enlace_fichero_pdf,
                tipo: datadoc.tipo,
                localidad: datadoc.localidad,
                fecha: datadoc.fecha,
                jotason: datadoc.JSON,
              };
              this.infoOposAbierto.push(data);
            });
          }
          this.filterArray = JSON.parse(JSON.stringify(this.infoOposAbierto));
          this.loading=false;
          break;
        case 'PROVISIONAL':
          this.infoOpos=[];
          this.loading=true;
          if (this.infoOposProvisional.length === 0){
            query = await db.where("tipo", "==", "PROVISIONAL").get();
            query.forEach((doc) => {
              let datadoc = doc.data();
              const data = {
                id: datadoc.id,
                organismo: datadoc.organismo,
                fechaPublicacion: datadoc.fecha_publicacion,
                rango: datadoc.rango,
                titulo: datadoc.titulo,
                path: datadoc.path,
                enlace_fichero_xml: datadoc.enlace_fichero_xml,
                enlace_fichero_pdf: datadoc.enlace_fichero_pdf,
                tipo: datadoc.tipo,
                localidad: datadoc.localidad,
                fecha: datadoc.fecha,
                jotason: datadoc.JSON,
              };
              this.infoOposProvisional.push(data);
            });
          }
          this.filterArray = JSON.parse(JSON.stringify(this.infoOposProvisional));
          this.loading=false;
          break;
        case 'DEFINITIVO':
          this.infoOpos=[];
          this.loading=true;
          if (this.infoOposDefinitivo.length === 0){
            query = await db.where("tipo", "==", "DEFINITIVO").get();
            query.forEach((doc) => {
              let datadoc = doc.data();
              const data = {
                id: datadoc.id,
                organismo: datadoc.organismo,
                fechaPublicacion: datadoc.fecha_publicacion,
                rango: datadoc.rango,
                titulo: datadoc.titulo,
                path: datadoc.path,
                enlace_fichero_xml: datadoc.enlace_fichero_xml,
                enlace_fichero_pdf: datadoc.enlace_fichero_pdf,
                tipo: datadoc.tipo,
                localidad: datadoc.localidad,
                fecha: datadoc.fecha,
                jotason: datadoc.JSON,
              };
              this.infoOposDefinitivo.push(data);
            });
          }
          this.filterArray = JSON.parse(JSON.stringify(this.infoOposDefinitivo));
          this.loading=false;
          break;
        case 'MODIFICACIONES':
          this.infoOpos=[];
          this.loading=true;
          if (this.infoOposModificaciones.length === 0){
            query = await db.where("tipo", "==", "MODIFICACIONES").get();
            query.forEach((doc) => {
              let datadoc = doc.data();
              const data = {
                id: datadoc.id,
                organismo: datadoc.organismo,
                fechaPublicacion: datadoc.fecha_publicacion,
                rango: datadoc.rango,
                titulo: datadoc.titulo,
                path: datadoc.path,
                enlace_fichero_xml: datadoc.enlace_fichero_xml,
                enlace_fichero_pdf: datadoc.enlace_fichero_pdf,
                tipo: datadoc.tipo,
                localidad: datadoc.localidad,
                fecha: datadoc.fecha,
                jotason: datadoc.JSON,
              };
              this.infoOposModificaciones.push(data);
            });
          }
          this.filterArray = JSON.parse(JSON.stringify(this.infoOposModificaciones));
          this.loading=false;
          break;
        case 'OTROS':
          this.infoOpos=[];
          this.loading=true;
          query = await db.where("tipo", "==", "OTROS").get();
          query.forEach((doc) => {
            let datadoc = doc.data();
            const data = {
              id: datadoc.id,
              organismo: datadoc.organismo,
              fechaPublicacion: datadoc.fecha_publicacion,
              rango: datadoc.rango,
              titulo: datadoc.titulo,
              path: datadoc.path,
              enlace_fichero_xml: datadoc.enlace_fichero_xml,
              enlace_fichero_pdf: datadoc.enlace_fichero_pdf,
              tipo: datadoc.tipo,
              localidad: datadoc.localidad,
              fecha: datadoc.fecha,
              jotason: datadoc.JSON,
            };
            console.log("Título: ",data.titulo);
            console.log("Enlace: ",data.enlace_fichero_pdf);
            this.infoOpos.push(data);
          });
          this.filterArray = JSON.parse(JSON.stringify(this.infoOpos));
          this.loading=false;
          break;
      }

      if (this.localidad){
        this.filterLocalidad();
      }
      if (this.fechaDisposicion){
        this.filterFechaDisposicion();
      }
      if (this.rango){
        this.filterRango();
      }
      if (this.organismo){
        this.filterOrganismo();
      }
      if (this.fechaPublicacion){
        this.filterFechaPublicacion();
      }
      if (this.orden){
        this.filterOrden();
      }
      if (this.jotasonn || this.keywords.length != 0){ // Con la segunda condición funcionan los demás filtros!!!
        this.keywords.forEach(kw => this.filterWords(kw))
      }
      
    },
    filterLocalidad(){
      this.filterArray = this.filterArray.filter(oposicion => oposicion.localidad && oposicion.localidad.toLowerCase().includes(this.localidad.toLowerCase()));
      if (this.$refs.menuLocalidad.length>1){
        this.$refs.menuLocalidad[this.$refs.menuLocalidad.length-1].isActive = false;
      }else{
        this.$refs.menuLocalidad[0].isActive = false;
      }
    },
    filterFechaDisposicion(){
      this.filterArray= this.filterArray.filter(oposicion => {
        if (oposicion.fecha >= this.fechaDisposicion[0] &&
        oposicion.fecha <= this.fechaDisposicion[1]) {
        return (
          oposicion.fecha >= this.fechaDisposicion[0] &&
          oposicion.fecha <= this.fechaDisposicion[1]
        );
      }
      {
        return (
          oposicion.fecha <= this.fechaDisposicion[0] &&
          oposicion.fecha >= this.fechaDisposicion[1]
        );
      }
      })
    },
    filterRango() {
      this.filterArray = this.filterArray.filter(oposicion => this.rango.some((rank)=> oposicion.rango === rank));
      //this.$refs.menuRango[0].isActive = false; esto es otra propiedad del v-select
    },
    filterOrganismo(){
      this.filterArray = this.filterArray.filter(oposicion => oposicion.organismo && oposicion.organismo.includes(this.organismo));
      if (this.$refs.menuOrganismo.length>1){
        this.$refs.menuOrganismo[this.$refs.menuOrganismo.length-1].isActive = false;
      }else{
        this.$refs.menuOrganismo[0].isActive = false;
      }
    },
    filterOrden(){
      this.filterArray = this.filterArray.filter(oposicion => {
        var nombreObjeto = oposicion.jotason.elements;
        if (oposicion.titulo.toLowerCase().includes("orden "+this.orden.toLowerCase())){ // COMPRUEBO título
          return true;
        }
        for (var j in nombreObjeto){
          switch (nombreObjeto[j].name){
            case 'p':
              if (nombreObjeto[j].elements && nombreObjeto[j].elements[0].text.toLowerCase().includes("orden "+this.orden.toLowerCase())){
                return true;
              }
              break;
            case 'table':
              if (nombreObjeto[j].elements){
                var flat = nombreObjeto[j].elements[0].elements.flat();
                for (var x in flat){
                  for (var y in flat[x].elements){  
                    if (flat[x].elements[y].elements[0].elements && flat[x].elements[y].elements[0].elements[0].text.toLowerCase().includes("orden "+this.orden.toLowerCase())){
                      return true;
                    }else{
                    }
                  } 
                }
              }
              break;
            default:
              console.log("DEFAULT");
          }
        }
      })
    },
    filterWords(unknowWord){
      this.filterArray = this.filterArray.filter(oposicion => {
        var nombreObjeto = oposicion.jotason.elements;
        if (oposicion.titulo.toLowerCase().includes(unknowWord.toLowerCase())){ // COMPRUEBO título
          return true;
        }
        for (var j in nombreObjeto){
          switch (nombreObjeto[j].name){
            case 'p': //COMPRUEBO las que NO son tablas 
              if (nombreObjeto[j].elements && nombreObjeto[j].elements[0].text.toLowerCase().includes(unknowWord.toLowerCase())){
                return true;
              }
              break;
            case 'table': //COMPRUEBO las que SI son tablas
              if (nombreObjeto[j].elements){
                var flat = nombreObjeto[j].elements[0].elements.flat();
                for (var x in flat){
                  for (var y in flat[x].elements){
                    if (flat[x].elements[y].elements[0].elements && flat[x].elements[y].elements[0].elements[0].text.toLowerCase().includes(unknowWord.toLowerCase())){
                      return true
                    }  
                  }
                }
              }
              break;
            default:
              console.log("DEFAULT")
          }
        }

        return false;
      })
      this.jotasonn = '';
    },
    filterFechaPublicacion(){
      this.filterArray= this.filterArray.filter(oposicion => {
        if (oposicion.fechaPublicacion >= this.fechaPublicacion[0] &&
        oposicion.fechaPublicacion <= this.fechaPublicacion[1]) {
        return (
          oposicion.fechaPublicacion >= this.fechaPublicacion[0] &&
          oposicion.fechaPublicacion <= this.fechaPublicacion[1]
        );
      }
      {
        return (
          oposicion.fechaPublicacion <= this.fechaPublicacion[0] &&
          oposicion.fechaPublicacion >= this.fechaPublicacion[1]
        );
      }
      })
    }
  },
  created() {

    this.filterAndOrder();
  },
};
</script>

<style scoped>
.container{
  display:flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.description{
  text-align: left;
}
.tooltipEtapas{
  max-width: 20rem;
}
</style>