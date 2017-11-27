<template>
  <div>
    <nav class="navbar navbar-dark bg-primary">
      <!-- Navbar content -->
      <a class="navbar-brand" href="#">
        Xutrade
      </a>

      <span class="navbar-text">
        {{coinbase}} | {{network}}
      </span>
    </nav>
    <div id="app">
      <router-view/>
    </div>
  </div>
</template>

<script>
import {ACTION_TYPES} from '@/store/types'

export default {
  name: 'app',

  computed: {
    coinbase: function() {
      return this.$store.state.coinbase;
    },
    network: function() {
      return this.$store.state.network;
    }
  },

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
