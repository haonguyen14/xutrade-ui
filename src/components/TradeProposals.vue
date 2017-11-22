<template>
  <div class="trade-proposals">
    <div class="trade-proposal-container container">
      <div class="row trade-proposal-header">
        <div class="col-4">Email address</div>
        <div class="col-1">Coins</div>
        <div class="col-5">Message</div>
        <div class="col-1"></div>
      </div>

      <proposal v-for="(proposal, index) in proposals" :key="proposal.id"
                  :id="proposal.id"
                  :email="proposal.email"
                  :amount="proposal.amount"
                  :message="proposal.message"></proposal>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Proposal from '@/components/Proposal';

export default {
  name: 'TradeProposals',
  data: function() {
    return {
      tradeId: this.$route.params.id,
      proposals: [
        {
          id: 0,
          email: "test_1@test.com",
          amount: "10",
          message: "please sell me those coin!!"
        },
        {
          id: 1,
          email: "test_2@test.com",
          amount: "15",
          message: "please sell me those coin!!"
        },
        {
          id: 2,
          email: "test_2@test.com",
          amount: "15",
          message: "please sell me those coin!!"
        },
        {
          id: 3,
          email: "test_2@test.com",
          amount: "15",
          message: "please sell me those coin!!"
        }
      ]
    };
  },

  methods: {
    getProposals: function() {
      axios.get();
    }
  },

  components: {
    'proposal': Proposal
  }
}
</script>

<style scope>
  .trade-proposal {
    height: 80px;
  }

  .trade-proposal-header{
    height: 40px;
    margin-bottom: 25px;
    border-bottom: solid 1px;
    font-size: 15pt;
  }
</style>
