import Vue from 'vue';
import Vuex from 'vuex';
import state from './state';
import mutations from './mutations';
import actions from  './actions';
import getters from './getters';

import stages from './modules/stages';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    stages: stages
  },
  state,
  getters,
  mutations,
  actions
});

export default store;
