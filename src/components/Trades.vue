<template>
  <div class="trades">
    <div class="trades-container container">
      <div class="row trade-header">
        <div class="col">Email address</div>
        <div class="col">Coin</div>
        <div class="col">Amount</div>
        <div class="col">Price</div>
        <div class="col"></div>
      </div>

      <trade v-for="trade in trades" key="trade.id"
              :id="trade.id"
              :email="trade.email"
              :coin="trade.coin"
              :amount="trade.amount"
              :price="trade.price"/>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {GET_TRADE_API} from '@/constants/urls';
import Trade from '@/components/Trade';

export default {
  name: "Trades",

  data: function() {
    return {
      trades: []
    };
  },

  components: {
    'trade': Trade
  },

  created: function() {
    var that = this;
    axios.get(GET_TRADE_API).then(function(response) {
      response.data.forEach(function(trade) {
        that.trades.push({
          id: trade.id,
          email: trade.userId,
          coin: trade.coinName,
          amount: trade.coinAmount,
          price: trade.coinPrice
        });
      });
    }).catch(function(e) {
      console.error(e);
    });
  }
}
</script>

<style scope>
  .trade-header {
    height: 40px;
    margin-bottom: 25px;
    border-bottom: solid 1px;
    font-size: 15pt;
  }
</style>
