import {ACTION_TYPES, MUTATION_TYPES} from '@/store/types';


export default {
  state: {
    stageLoaded: false,
    opened: null,
    hasDeposited: false,
    confirmed: {
      buyer: false,
      seller: false,
      middle: false
    },
  },
  actions: {
    [ACTION_TYPES.STAGES.GET_STAGES] ({ commit, rootState }) {
      var contract = rootState.TradeContract;
      setInterval(function() {
        contract.methods.opened().call().then(function(opened) {
          commit(MUTATION_TYPES.STAGES.COMMIT_STAGE_OPENED, opened);
        }).then(function() {
          return contract.methods.hasDeposit().call().then(function(hasDeposited) {
            commit(MUTATION_TYPES.STAGES.COMMIT_STAGE_DEPOSITED, hasDeposited);
          });
        }).then(function() {
          return contract.methods.getActorConfirmations().call().then(function(confirmations) {
            commit(MUTATION_TYPES.STAGES.COMMIT_STAGE_CONFIRMED, confirmations);
            commit(MUTATION_TYPES.STAGES.COMMIT_STAGE_LOADED, true);
          });
        });
      }, 5000);
    }
  },
  mutations: {
    [MUTATION_TYPES.STAGES.COMMIT_STAGE_OPENED] (state, isOpened) {
      state.opened = isOpened;
    },

    [MUTATION_TYPES.STAGES.COMMIT_STAGE_DEPOSITED] (state, hasDeposited) {
      state.hasDeposited = hasDeposited;
    },

    [MUTATION_TYPES.STAGES.COMMIT_STAGE_CONFIRMED] (state, confirmations) {
      state.confirmed = {
        buyer: confirmations[0],
        seller: confirmations[1],
        middle: confirmations[2]
      };
    },

    [MUTATION_TYPES.STAGES.COMMIT_STAGE_LOADED] (state, loaded) {
      state.stageLoaded = loaded;
    }
  }
}
