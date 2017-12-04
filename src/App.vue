<template>
  <div>
    <nav class="blue-grey darken-4">
      <div class="nav-wrapper">
        <a href="#" class="brand-logo"></a>
        <ul id="nav-mobile" class="right hide-on-med-and-down">
          <li><a>{{coinbase}}</a></li>
          <li><a>{{network}}</a></li>
        </ul>
      </div>
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
  font-family: 'Arial';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100%;
  height: 100%;
}
</style>
