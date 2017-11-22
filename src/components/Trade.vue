<template>
  <div class="card trade">
    <div class="container">
      <div class="row">
        <div class="col">{{email}}</div>
        <div class="col">{{coin}}</div>
        <div class="col">{{amount}}</div>
        <div class="col">{{price}}</div>
        <div class="col">
          <button type="button" class="btn btn-primary btn-sm" v-on:click="submit">Trade</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {CREATE_TRADE_API, PROPOSE_API} from '@/constants/urls';

export default {
  name: "Trade",

  props: ["id", "email", "coin", "amount", "price"],

  data: function() {
    return {};
  },

  methods: {
    submit: function() {
      const userId = "39be6746-2dd2-4267-96c9-c3a8735b24aa";

      axios.post(PROPOSE_API, {
        userId: userId,
        id: this.id
      }).then(this.deployContract.bind(this)).catch(console.error);
    },

    deployContract: function() {
      this.$store.state.TradeContract.deploy({
        arguments: [
        "0x20d5079dbf85d6fc921ab69965b192e223fcba7f",
        "0x18c5c776b3b81c70f3e868286eff42edc33278f6",
        this.$store.state.coinbase,
        60, 5, 1
      ]}).send({
        from: this.$store.state.coinbase,
        gas: 1500000,
        gasPrice: this.$store.state.eth.utils.toWei("20", "gwei")
      })
      .on("error", this.contractDeployError.bind(this))
      .on("confirmation", this.contractDeployConfirmation.bind(this));
    },

    contractDeployError: function(error) {
      console.error(error);
    },

    contractDeployConfirmation: function(_, receipt) {
      console.log("Transaction Hash: " + receipt.transactionHash);
      console.log("Contract Address: " + receipt.contractAddress);

      axios.post(CREATE_TRADE_API + "/" + this.id + "/close", {
        transactionHash: receipt.transactionHash,
        contractAddress: receipt.contractAddress,
        buyerId: "39be6746-2dd2-4267-96c9-c3a8735b24aa"
      }).then(function() {
        console.log("Contract created");
      }).catch(function(e) {
        console.error(e);
      });
    }
  }
}
</script>

<style scope>
  .trade {
    height: 80px;
  }

  .trade+.trade {
    margin-top: 15px;
  }

  .card.trade {
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
  }

  .trade > .container {
    margin: 27px 0px;
  }
</style>
