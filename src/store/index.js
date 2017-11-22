import Vue from 'vue';
import Vuex from 'vuex';
import state from './state';
import mutations from './mutations';
import actions from  './actions';

import events from './modules/events';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    events: events
  },
  state,
  mutations,
  actions
});

export default store;
