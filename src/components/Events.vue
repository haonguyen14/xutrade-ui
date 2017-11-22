<template>
</template>

<script>
import {ACTION_TYPES} from '@/store/types';
import EthFilter from 'ethjs-filter';

export default {
  name: "Events",

  data () {
    return {

    };
  },

  created () {
    this.$store.dispatch(ACTION_TYPES.EVENTS.GET_EVENT_ETH_PROVIDER).then(function() {
      console.log("filtering...");
      const filters = new EthFilter(this.$store.state.events.ethEventProvider);
      const filter = new filters.Filter({ delay: 300 })
                            .new({ toBlock: 2 })
                            .then(console.log)
                            .catch(console.error);
      console.log(filter);
    }.bind(this));
  }
}
</script>
