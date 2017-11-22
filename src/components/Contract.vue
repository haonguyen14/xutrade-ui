<template>
  <div class="new-trade full-page-height">
    <div class="container-fluid full-page-height">
      <div class="row full-page-height">
        <div class="col-9 contract-content">
          <div class="trade-form-header">
      <h1>Contract to Trade Coin</h1>
    </div>
          <form class="trade-form container">
      <div class="row">
        <div class="form-group col">
          Địa chỉ wallet bên bán (A):
          <span class="contract-parameter">{{sellerAddr}}</span>
        </div>
      </div>

      <div class="row">
        <div class="form-group col">
          Địa chỉ wallet bên mua (B):
          <span class="contract-parameter">{{buyerAddr}}</span>
        </div>
      </div>

      <div class="row">
        <div class="col form-group">
          <div>
            Bên A đồng ý bán cho bên B <span class="contract-parameter">{{amount}}</span>
            coins <span class="contract-parameter">{{name}}</span>
            với giá <span class="contract-parameter">{{price}}</span> ether một coin
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col form-group">
          <div>
            Sau khi contract được tạo trên ethereum blockchain, bên B sẽ chuyển khoản với
            số tiền phải trả vào địa chỉ contract.
          </div>

          <div style="margin-top: 10px">
            Sau khi bên A chuyển coins cho bên B, A và B phải cùng xác nhận giao dịch thành công.
            Khi đó, bên A sẽ được nhận ethers từ contract. Giao dịch kết thúc!
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <button type="button" class="btn btn-primary btn-lg btn-block" v-on:click="submit">
            {{buttonText}}
          </button>
        </div>
      </div>
    </form>
        </div>

        <div class="col-3 contract-status">
          <div v-for="e in events">
            {{e.eventType}}
          </div>
        </div>
      </div>
    </div>

    <b-modal ref="keyForm" size="lg" centered :ok-only="true"
            title="Mở khoá contract"
            :hide-header-close="true"
            :no-close-on-esc="true"
            :no-close-on-backdrop="true"
            v-on:ok="enteredKey" v-on:cancel="cancelModal">
      <input class="form-control form-control-lg" type="text" v-model="key">
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
import tradeContract from '@/contracts/tradecontract';
import eventNames from '@/constants/events';
import contractStages from '@/constants/stages';
import {MUTATION_TYPES} from '@/store/types';

export default {
  name: "Contract",

  data () {
    return {
      sellerAddr: "",
      buyerAddr: "",
      name: "",
      amount: "",
      price: "",
      key: "",
      events: null,

      deployedStage: null,
      depositedStage: null,
      confirmedStage: null,
      closedStage: null
    }
  },

  computed: {
    currentStage: function() {
      if(this.closedStage) {
        return contractStages.CLOSED;
      } else if(this.confirmedStage) {
        return contractStages.CONFIRMED;
      } else if(this.depositedStage) {
        return contractStages.DEPOSITED;
      } else if(this.deployedStage) {
        return contractStages.DEPLOYED;
      }
      return contractStages.DRAFTED;
    },

    buttonText: function() {
      if(this.currentStage === contractStages.DRAFTED) {
        return "Thực thi contract";
      } else if(this.currentStage === contractStages.DEPLOYED) {
        return "Chuyển Ethereum vào contract";
      } else if(this.currentStage === contractStages.DEPOSITED) {
        return "Xác nhận";
      }
    },

    contractAddress: function() {
      return this.deployedStage ?
              JSON.parse(this.deployedStage.eventData).contractAddr :
              "";
    }
  },

  methods: {
    submit: function() {
      if(this.currentStage === contractStages.DRAFTED) {
        this.deploy();
      } else if(this.currentStage === contractStages.DEPLOYED) {
        this.deposit();
      } else if(this.currentStage === contractStages.DEPOSITED) {
        this.confirm();
      }
    },

    deploy: function() {
      this.$store.state.TradeContract.deploy({
        arguments: [
        this.buyerAddr,
        this.sellerAddr,
        this.$store.state.coinbase,
        60, this.amount, this.price
      ]}).send({
        from: this.$store.state.coinbase,
        gas: this.$store.state.gas,
        gasPrice: this.$store.state.gasPrice
      })
      .on("error", this.contractDeployError.bind(this))
      .on("confirmation", this.contractDeployConfirmation.bind(this));
    },

    deposit: function() {
      this.$store.state.TradeContract.methods.price()
            .call().then(function(totalPrice) {
              this.$store.state.TradeContract.methods.deposit().send({
                from: this.$store.state.coinbase,
                gas: this.$store.state.gas,
                gasPrice: this.$store.state.gasPrice,
                value: totalPrice
              })
              .on("error", console.error)
              .on("confirmation", function(_, receipt) {
                this.log(eventNames.DEPOSITED, "").catch(console.error);
              }.bind(this));
            }.bind(this));
    },

    confirm: function() {
      this.$store.state.TradeContract.methods.confirm().send({
        from: this.$store.state.coinbase,
        gas: this.$store.state.gas,
        gasPrice: this.$store.state.gasPrice
      })
      .on("error", console.error)
      .on("confirmation", function(_, receipt) {
        this.log(eventNames.CONFIRMED, "").catch(console.error);
      }.bind(this));
    },

    contractDeployError: function(error) {
      console.error(error);
    },

    contractDeployConfirmation: function(_, receipt) {
      this.log(eventNames.DEPLOYED, JSON.stringify({
        contractAddr: receipt.contractAddress,
        transactionHash: receipt.transactionHash
      })).catch(console.error);
    },

    enteredKey: function(evt) {
      evt.preventDefault();
      axios.post("/trade/" + this.$route.params["contractId"], {
        key: this.key
      }).then(function(data) {
        this.sellerAddr = data.data.sellerAddr;
        this.buyerAddr = data.data.buyerAddr;
        this.name = data.data.coinName;
        this.amount = data.data.coinAmount;
        this.price = data.data.coinPrice;
        this.$refs.keyForm.hide()
      }.bind(this));

      axios.post("/log/" + this.$route.params["contractId"], {
        key: this.key
      }).then(function(data) {
        var map = {};
        data.data.forEach(function(evt) { map[evt.eventType] = evt; });

        // get stages
        this.deployedStage = map[eventNames.DEPLOYED] || null;
        this.depositedStage = map[eventNames.DEPOSITED] || null;
        this.confirmedStage = map[eventNames.CONFIRMED] || null;
        this.closedStage = map[eventNames.CLOSED] || null;
        this.events = data.data;

        // point the deployed contract if already deployed
        if(this.currentStage !== contractStages.DRAFTED) {
          var contract = new this.$store.state.eth.eth.Contract(
            tradeContract.jsonInterface,
            this.contractAddress, { data: tradeContract.byteCode });
          this.$store.commit(MUTATION_TYPES.COMMIT_TRADE_CONTRACT, contract);
        }
      }.bind(this));
    },

    cancelModal: function(evt) {
      evt.preventDefault();
    },

    log: function(eventType, eventData) {
      return new Promise(function(resolve, reject) {
        axios.post("/log", {
          tradeId: this.$route.params["contractId"],
          eventType: eventType,
          eventData: eventData
        }).then(resolve).catch(reject);
      }.bind(this));
    }
  },

  mounted () {
    this.$refs.keyForm.show()
  }
}
</script>

<style scoped>
  .contract-content {
    padding-top: 100px;
    border-right: 1px solid;
  }

  .trade-form {
    text-align: left;
  }

  .contract-parameter {
    text-decoration: underline;
  }

  .full-page-height {
    height: 100%;
    min-height: 100%;
  }
</style>
