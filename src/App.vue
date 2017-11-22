<template>
  <!-- JuiQx21SLGyqmqEI8Zdq INFURA -->
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import {ACTION_TYPES} from '@/store/types'

export default {
  name: 'app',

  beforeCreate () {
    var $store = this.$store;
    $store.dispatch(ACTION_TYPES.GET_ETH_ABSTRACTION)
    .then(function() {
      console.log("Ethereum Abstraction Setup");
    }).catch(function(e) {
      console.error(e);
    });
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  text-align: center;
  min-height: 100%;
  height: 100%;
}
</style>
