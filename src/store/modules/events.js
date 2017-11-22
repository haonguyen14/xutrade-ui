import Eth from 'ethjs';
import {ACTION_TYPES, MUTATION_TYPES} from '@/store/types';

export default {
  state: {
    ethEventProvider: null,
  },

  actions: {
    [ACTION_TYPES.EVENTS.GET_EVENT_ETH_PROVIDER] ({ commit }) {
      return new Promise(function(resolve, reject) {
        window.addEventListener('load', function() {
            var web3 = window.web3;
            if (typeof web3 !== 'undefined') {
              const instance = new Eth(web3.currentProvider);
              commit(MUTATION_TYPES.EVENTS.COMMIT_EVENT_ETH_PROVIDER, instance);
              resolve();
            } else {
              reject('Install MetaMask!')
            }
        });
      });
    }
  },

  mutations: {
    [MUTATION_TYPES.EVENTS.COMMIT_EVENT_ETH_PROVIDER] (state, instance) {
      state.ethEventProvider = instance;
    }
  }
}
