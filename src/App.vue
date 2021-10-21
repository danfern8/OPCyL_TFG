<template>
  <div id="app">

    <v-app-bar color="deep-purple accent-4" dense dark>
        <v-toolbar-title>OPCyL</v-toolbar-title>
        <v-spacer></v-spacer>
    </v-app-bar>
    <keep-alive include="Principal">
      <router-view />
    </keep-alive>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
