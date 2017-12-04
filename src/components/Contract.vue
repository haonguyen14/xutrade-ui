<template>
  <div class="new-trade">
    <div class="row">
      <div class="col s8">
        <div class="trade-form card-panel blue-grey darken-1">
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
            <div class="col s12 contract-stages">
              <div>
                Tiến trình: {{progress.status}}
              </div>
              <div class="progress">
                <div class="determinate" :style="{ width: progress.percent + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col s12">
              <button type="button" class="btn-large submit-contract"
                          :disabled="!actionEnabled"
                          v-on:click="submit">
                {{buttonText}}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col s4">
        <div v-for="e in contractEvents">
          <transaction
              :tx-name="e.name"
              :tx-hash="e.txHash"
              @confirmed="txConfirmed"/>
        </div>
      </div>
    </div>

    <div id="modal" class="modal modal-fixed-footer" style="height: 54px; top: 50%">
      <button type="button" class="btn-large login-button"
                v-on:click="login">Đăng nhập</button>
   </div>
  </div>
</template>

<script>
import axios from 'axios';
import tradeContract from '@/contracts/tradecontract';
import eventNames from '@/constants/events';
import contractStages from '@/constants/stages';
import {ACTION_TYPES, MUTATION_TYPES} from '@/store/types';
import TradeService from './TradeService';
import SignatureService from './SignatureService';
import ethUtil from 'ethereumjs-util';
import Transaction from './Transaction';

export default {
  name: "Contract",

  components:{
    'transaction': Transaction
  },

  data () {
    return {
      sellerAddr: "",
      buyerAddr: "",
      name: "",
      amount: "",
      price: "",
      locked: false,
    }
  },

  computed: {
    currentStage: function() {
      return this.$store.getters.contractStage;
    },

    buttonText: function() {
      if(!this.$store.state.stages.stageLoaded) {
        return "Loading...";
      }

      if(this.locked) {
        return "Waiting for enough confirmations..."
      }

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
      return !this.locked && this.$store.state.stages.stageLoaded &&
                (this.currentStage !== contractStages.CLOSED);
    },

    progress: function() {
      if(!this.$store.state.stages.stageLoaded) {
        return { percent: 0, status: '' };
      }

      switch(this.currentStage) {
        case contractStages.DRAFTED:
          return { percent: 20, status: 'contract mẫu (tham khảo)' };
        case contractStages.DEPLOYED:
          return { percent: 40, status: 'contract tải lên blockchain' };
        case contractStages.DEPOSITED:
          return { percent: 60, status: 'ether được chuyển vào contract' };
        case contractStages.WAITING_CONFIRMATIONS:
          return { percent: 80, status: 'đợi xác nhận...' };
        case contractStages.CLOSED:
          return { percent: 100, status: 'contract thành công' };
      }
    },

    contractEvents: function() {
      return this.$store.state.stages.contractEvents;
    },
  },

  methods: {
    submit: function() {
      const contract = this.$store.state.TradeContract;
      this.locked = true;

      if(this.currentStage === contractStages.DRAFTED) {
        // deploying contract to blockchain
        TradeService.deploy(contract, [
          this.buyerAddr,
          this.sellerAddr,
          "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b",
          60, this.amount, this.$store.state.eth.utils.toWei(this.price, "ether")
        ], {
          from: this.$store.state.coinbase,
          gas: this.$store.state.gas,
          gasPrice: this.$store.state.gasPrice
        })
        .then(function(txHash) {
          this.$store.commit(MUTATION_TYPES.EVENTS.SET_OBSERVED_TX, txHash);
          this.logTransactionHash(eventNames.DEPLOYED, txHash);
          this.loadContext(txHash);
        }.bind(this))
        .catch(console.error)
      } else if(this.currentStage === contractStages.DEPLOYED) {
        // deposit to contract with the EXACT price
        contract.methods.price().call().then(function(totalPrice) {
          return TradeService.deposit(contract, totalPrice, {
            from: this.$store.state.coinbase,
            gas: this.$store.state.gas,
            gasPrice: this.$store.state.gasPrice,
            value: totalPrice
          });
        }.bind(this))
        .then(function(txHash) {
          this.$store.commit(MUTATION_TYPES.EVENTS.SET_OBSERVED_TX, txHash);
        }.bind(this))
        .catch(console.error)
      } else if(this.currentStage === contractStages.DEPOSITED ||
            this.currentStage === contractStages.WAITING_CONFIRMATIONS) {
        // confirm
        TradeService.confirm(contract, {
          from: this.$store.state.coinbase,
          gas: this.$store.state.gas,
          gasPrice: this.$store.state.gasPrice
        })
        .then(function(txHash) {
          this.$store.commit(MUTATION_TYPES.EVENTS.SET_OBSERVED_TX, txHash);
        }.bind(this))
        .catch(console.error)
      }
    },

    login: function(evt) {
      evt.preventDefault();
      var message = "signature";

      SignatureService.sign(
        this.$store.state.signatureProvider,
        this.$store.state.eth.utils.utf8ToHex(message),
        this.$store.state.coinbase
      ).then(function(result) {
        var sigParams = ethUtil.fromRpcSig(result);
        return axios.post("/auth", {
          address: this.$store.state.coinbase,
          message: message,
          hexV: ethUtil.bufferToHex(sigParams.v),
          hexR: ethUtil.bufferToHex(sigParams.r),
          hexS: ethUtil.bufferToHex(sigParams.s),
        });
      }.bind(this)).then(function(result) {
        this.$store.commit(MUTATION_TYPES.COMMIT_AUTHORIZATION_TOKEN, result.data);
        axios.get("/trade/" + this.$route.params["contractId"], {
          headers: {
            'Authorization': this.$store.state.token,
          }
        }).then(function(data) {
          this.sellerAddr = data.data.sellerAddr;
          this.buyerAddr = data.data.buyerAddr;
          this.name = data.data.coinName;
          this.amount = data.data.coinAmount;
          this.price = this.$store.state.eth.utils.fromWei(data.data.coinPrice, "ether");
          $("#modal").modal("close");
        }.bind(this));

        axios.get("/log/" + this.$route.params["contractId"], {
          headers: {
            'Authorization': this.$store.state.token,
          }
        }).then(function(data) {
          var map = {};
          data.data.forEach(function(evt) { map[evt.eventType] = evt; });

          if(map[eventNames.DEPLOYED]) {
            this.loadContext(JSON.parse(map[eventNames.DEPLOYED].eventData).transactionHash);
          } else {
            this.$store.commit(MUTATION_TYPES.EVENTS.EVENT_LOADED, true);
          }
        }.bind(this));
      }.bind(this));
    },

    loadContext: function(transactionHash) {
      this.$store.dispatch(ACTION_TYPES.GET_CONTRACT_ADDRESS, transactionHash).then(function() {
        this.$store.commit(MUTATION_TYPES.EVENTS.ADD_EVENT, {
          id: "deployed_event",
          name: "deployed",
          txHash: transactionHash
        });
        this.$store.dispatch(ACTION_TYPES.EVENTS.SUBSCRIBE, transactionHash);
      }.bind(this));
    },

    txConfirmed: function(txHash, txName) {
      if(this.$store.state.stages.observedTx === txHash) {
        console.log("Unlocked ", txHash, txName);
        this.locked = false;
        this.$store.commit(MUTATION_TYPES.EVENTS.SET_OBSERVED_TX, null);
      }
    },

    logTransactionHash: function(e, txHash) {
      return axios.post("/log", {
        tradeId: this.$route.params["contractId"],
        eventType: e,
        eventData: JSON.stringify({ transactionHash: txHash })
      });
    },

    cancelModal: function(evt) {
      evt.preventDefault();
    },
  },

  mounted () {
    $('#modal').modal({
      dismissible: false,
      endingTop: '30%',
    }).modal("open");
  },

  beforeDestroy () {
    if(this.eventPolling) {
      console.log("Clearing intervals");
      this.$store.commit(MUTATION_TYPES.EVENTS.DESTROY_SUBSCRIPTION);
    }
  }
}
</script>

<style scoped>
  .new-trade {
    margin-top: 50px;
  }

  .contract-content {
    padding-top: 100px;
  }

  .trade-form {
    text-align: left;
    color: #fff;
  }

  .contract-parameter {
    text-decoration: underline;
  }

  .full-page-height {
    height: 100%;
    min-height: 100%;
  }

  .contract-stages {
    margin-top: 25px;
    margin-bottom: 10px;
  }

  .login-container {
    margin: 10px;
  }

  .login-button {
    width: 100%;
  }

  .submit-contract {
    width: 100%;
  }
</style>
