import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import NewTrade from '@/components/NewTrade'
import Contract from '@/components/Contract'
import Landing from '@/components/Landing'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing
    },
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
