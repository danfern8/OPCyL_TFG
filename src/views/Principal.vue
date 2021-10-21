<template>
  <v-app>
    <ListadoOposiciones />
  </v-app>
</template>
<script>
import ListadoOposiciones from "../components/ListadoOposiciones";
export default {
  name: "Principal",
  components: {
    ListadoOposiciones,
  },
};
</script>