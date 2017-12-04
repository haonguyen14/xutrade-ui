<template>
  <div class="transaction-container">
    <div class="card blue-grey darken-1">
      <div class="card-content white-text">
        <span class="card-title">{{txName}} - ({{confirmations}})</span>
        <div class="progress">
          <div class="determinate" :style="{ width: percent + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const STAGES = {
  started: 0,
  mined: 1,
  awaiting: 2,
  confirmed: 3,
  unconfirmed: 4
};

export default {
  name: "Transaction",

  props: ["txName", "txHash"],

  data () {
    return {
      interval: null,
      requiredBlocks: 3,
      startBlock: null,
      txInfo: null,
      confirmations: 0,
      receipt: null,
      currentStage: STAGES.started,
      attempts: 0,
      timeout: 300 // seconds
    };
  },

  computed: {
    percent () {
      return (this.confirmations / this.requiredBlocks) * 100.0;
    }
  },

  methods: {
    poll () {
      const web3 = this.$store.state.eth;
      if(this.currentStage === STAGES.started) {
        web3.eth.getTransaction(this.txHash, function(e, txInfo) {
          if (e || txInfo == null) {
            return;
          }
          if (txInfo.blockHash != null) {
            this.startBlock = txInfo.blockNumber;
            this.txInfo = txInfo;
            this.currentStage = STAGES.mined;
          }
        }.bind(this));
      } else if(this.currentStage === STAGES.mined) {
        web3.eth.getBlockNumber(function (e, blockNum) {
          if (e) {
            return;
          }
          if (blockNum >= (this.requiredBlocks + this.startBlock)) {
            this.currentStage = STAGES.awaiting;
          }
          this.confirmations = blockNum - this.startBlock;
        }.bind(this));
      } else if(this.currentStage === STAGES.awaiting) {
        web3.eth.getTransactionReceipt(this.txHash, function(e, receipt) {
          if (e || receipt == null) {
            return;
          }
          // confirm we didn't run out of gas
          clearInterval(this.interval);
          if (receipt.gasUsed >= this.txInfo.gas) {
            this.currentStage = STAGES.unconfirmed;
            console.error("Transaction ran out of gas");
          } else {
            this.currentStage = STAGES.confirmed;
            this.receipt = receipt;
            this.$emit('confirmed', this.txHash, this.txName);
          }
        }.bind(this));
      }

      this.attempts++;
      if(this.attemps >= this.timeout) {
        clearInterval(this.interval);
        this.currentStage = STAGES.unconfirmed;
      }
    }
  },

  mounted () {
    this.interval = setInterval(this.poll, 1000);
  },

  beforeDestroy () {
    console.log("Clearing intervals");
    clearInterval(this.interval);
  }
}
</script>

<style scoped>
  .transaction-container {
    margin-top: 10px;
  }
</style>
