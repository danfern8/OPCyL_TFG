<template>
  <div>
    <v-card>
      <v-card-title> {{ organismo }}</v-card-title>

      <v-card-text>Fecha de publicación: {{ fechaPublicacion }}</v-card-text>
      <v-card-text>Rango: {{ rango }}</v-card-text>
      <v-card-text
        >Enlace PDF:
        <a target="a_blank" :href="enlace_fichero_pdf">{{ enlace_fichero_pdf }}</a></v-card-text
      >
      <v-card-text
        >Enlace xml:
        <a target="a_blank" :href="enlace_fichero_xml">{{ enlace_fichero_xml }}</a></v-card-text
      >
    </v-card>
  </div>
</template>

<script>
import { db } from "../plugins/firebase";

export default {
  name: "ContentOposicion",
  data() {
    return {
      id: this.$route.params.id,
      organismo: null,
      fechaPublicacion: null,
      rango: null,
      puesto: null,
      grupo: null,
      localidad: null,
      enlace_fichero_pdf: null,
      enlace_fichero_xml: null,
      path: null,
      json: null,
    };
  },
  methods: {
  },
  mounted() {
    db.where("id", "==", this.id)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          this.organismo = doc.data().organismo;
          this.fechaPublicacion = doc.data().fecha_publicacion;
          this.rango = doc.data().rango;
          this.enlace_fichero_pdf = doc.data().enlace_fichero_pdf;
          this.enlace_fichero_xml = doc.data().enlace_fichero_xml;
          this.path = doc.data().path;
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  },
};
</script>
