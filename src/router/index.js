import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import NewTrade from '@/components/NewTrade'
import Contract from '@/components/Contract'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/contract',
      name: 'CreateContract',
      component: NewTrade
    },
    {
      path: '/contract/:contractId',
      name: 'Contract',
      component: Contract
    }
  ]
});

export default router;
