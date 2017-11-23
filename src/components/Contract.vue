<template>
  <div class="new-trade full-page-height">
    <div class="container-fluid full-page-height">
      <div class="row full-page-height">
        <div class="col contract-content">
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
                <button type="button" class="btn btn-primary btn-lg btn-block"
                            :disabled="!actionEnabled"
                            v-on:click="submit">
                  {{buttonText}}
                </button>
              </div>
            </div>
          </form>
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
import {ACTION_TYPES, MUTATION_TYPES} from '@/store/types';
import TradeService from './TradeService';

export default {
  name: "Contract",

  data () {
    return {
      sellerAddr: "",
      buyerAddr: "",
      name: "",
      amount: "",
      price: "",
      key: ""
    }
  },

  computed: {
    currentStage: function() {
      const isOpened = this.$store.state.stages.opened;
      const hasDeposited = this.$store.state.stages.hasDeposited;
      const confirmations = this.$store.state.stages.confirmed;

      if(isOpened === null) {
        return contractStages.DRAFTED;
      } else if(isOpened === true) {
        if(confirmations.buyer || confirmations.seller || confirmations.middle) {
          return contractStages.WAITING_CONFIRMATIONS;
        }
        if(hasDeposited) {
          return contractStages.DEPOSITED;
        }
        return contractStages.DEPLOYED;
      } else {
        return contractStages.CLOSED;
      }
    },

    buttonText: function() {
      switch(this.currentStage) {
        case contractStages.DRAFTED:
          return "Thực thi contract";
        case contractStages.DEPLOYED:
          return "Chuyển tiền vào contract";
        case contractStages.DEPOSITED:
        case contractStages.WAITING_CONFIRMATIONS:
          return "Xác nhận";
        case contractStages.CLOSED:
          return "Contract hoàn tất";
      }
    },

    actionEnabled: function() {
      return this.$store.state.stages.stageLoaded &&
                (this.currentStage !== contractStages.CLOSED);
    }
  },

  methods: {
    submit: function() {
      const contract = this.$store.state.TradeContract;
      if(this.currentStage === contractStages.DRAFTED) {
        // deploying contract to blockchain
        TradeService.deploy(contract, [
          this.buyerAddr,
          this.sellerAddr,
          "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b",
          60, this.amount, this.price
        ], {
          from: this.$store.state.coinbase,
          gas: this.$store.state.gas,
          gasPrice: this.$store.state.gasPrice
        })
        .then(this.contractDeployTransaction.bind(this))
        .catch(console.error);
      } else if(this.currentStage === contractStages.DEPLOYED) {
        // deposit to contract with the EXACT price
        contract.methods.price().call().then(function(totalPrice) {
          return TradeService.deposit(contract, totalPrice, {
            from: this.$store.state.coinbase,
            gas: this.$store.state.gas,
            gasPrice: this.$store.state.gasPrice,
            value: totalPrice
          });
        }.bind(this)).catch(console.error);
      } else if(this.currentStage === contractStages.DEPOSITED ||
            this.currentStage === contractStages.WAITING_CONFIRMATIONS) {
        // confirm
        TradeService.confirm(contract, {
          from: this.$store.state.coinbase,
          gas: this.$store.state.gas,
          gasPrice: this.$store.state.gasPrice
        }).catch(console.error);
      }
    },

    contractDeployTransaction: function(transactionHash) {
      this.log(eventNames.DEPLOYED, JSON.stringify({
        transactionHash: transactionHash
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

        var deployedStage = map[eventNames.DEPLOYED] || null;
        if(deployedStage) {
          var transactionHash = JSON.parse(deployedStage.eventData).transactionHash;
          this.$store.dispatch(ACTION_TYPES.GET_CONTRACT_ADDRESS, transactionHash).then(function() {
            this.$store.dispatch(ACTION_TYPES.STAGES.GET_STAGES);
          }.bind(this));
        } else {
          this.$store.commit(MUTATION_TYPES.STAGES.COMMIT_STAGE_LOADED, true);
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
