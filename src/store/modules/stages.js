import {ACTION_TYPES, MUTATION_TYPES} from '@/store/types';
import contractStages from '@/constants/stages';

export default {
  state: {
    stageLoaded: false,
    subscription: null,
    contractEvents: [],
    observedTx: null
  },

  getters: {
    contractEventSet: state => {
      return new Set(state.contractEvents.map((e) => e.id));
    },
    contractEventNames: state => {
      const eventNames = new Set();
      state.contractEvents.forEach((e) => {
        if(e.name === "confirmed" && eventNames.has(e.name)) {
          eventNames.add("confirmed_2");
        } else {
          eventNames.add(e.name);
        }
      });
      return eventNames;
    },
    contractStage: (state, getters) => {
      if(getters.contractEventNames.has("closed")) {
        return contractStages.CLOSED;
      } else if(getters.contractEventNames.has("confirmed")) {
        return contractStages.WAITING_CONFIRMATIONS;
      } else if(getters.contractEventNames.has("deposit")) {
        return contractStages.DEPOSITED;
      } else if(getters.contractEventNames.has("deployed")) {
        return contractStages.DEPLOYED;
      } else {
        return contractStages.DRAFTED;
      } return contractStages.UNDEFINED;
    }
  },

  actions: {
    [ACTION_TYPES.EVENTS.SUBSCRIBE] ({ commit, state, getters, rootState}, txHash) {
      var contract = rootState.TradeContract;
      const poll = function() {
        contract.getPastEvents("allEvents", {
          fromBlock: 0,
          toBlock: "latest"
        }).then(function(events) {
          events.forEach(function(e) {
            if(!getters.contractEventSet.has(e.id)) {
              commit(MUTATION_TYPES.EVENTS.ADD_EVENT, {
                id: e.id,
                name: e.event.toLowerCase(),
                txHash: e.transactionHash
              });
            }
          });
          commit(MUTATION_TYPES.EVENTS.EVENT_LOADED, true);
        });
      };
      commit(MUTATION_TYPES.EVENTS.CREATE_SUBSCRIPTION, setInterval(poll, 1000));
    }
  },

  mutations: {
    [MUTATION_TYPES.EVENTS.EVENT_LOADED] (state, loaded) {
      state.stageLoaded = loaded;
    },

    [MUTATION_TYPES.EVENTS.CREATE_SUBSCRIPTION] (state, interval) {
      state.subscription = interval;
    },

    [MUTATION_TYPES.EVENTS.DESTROY_SUBSCRIPTION] (state) {
      clearInterval(state.subscription);
    },

    [MUTATION_TYPES.EVENTS.ADD_EVENT] (state, newEvent) {
      state.contractEvents.push(newEvent);
    },

    [MUTATION_TYPES.EVENTS.SET_OBSERVED_TX] (state, txHash) {
      state.observedTx = txHash;
    }
  }
}
