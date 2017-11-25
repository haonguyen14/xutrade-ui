<template>
  <div class="new-trade">
    <div class="trade-form-header">
      <h1>Contract to Trade Coin</h1>
    </div>

    <!-- Contract -->
    <form class="trade-form container">
      <div class="row">
        <div class="form-group col">
          Địa chỉ wallet bên bán (A):
          <input class="contract-input" style="width: 500px" type="text" v-model="sellerAddr">
        </div>
      </div>

      <div class="row">
        <div class="form-group col">
          Địa chỉ wallet bên mua (B):
          <input class="contract-input" style="width: 500px" type="text" v-model="buyerAddr">
        </div>
      </div>

      <div class="row">
        <div class="col form-group">
          <div>
            Bên A đồng ý bán cho bên B <input class="contract-input" type="text" v-model="amount">
            coins <input class="contract-input" type="text" v-model="name">
            với giá <input class="contract-input" type="text" v-model="price"> ether một coin
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
            Tạo mẫu thử contract
          </button>
        </div>
      </div>
    </form>

    <!-- Status -->
    <div class="status-container">
    </div>

    <b-modal ref="contractCreated"
              size="lg"
              centered
              title="Gửi thông tin cho bên còn lại">
      <a :href="contractUrl">{{contractUrl}}</a>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
import generatePassword from 'password-generator';
import {CREATE_TRADE_API} from '@/constants/urls';

export default {
  name: 'NewTrade',
  data: function () {
    return {
      sellerAddr: '',
      buyerAddr: '',
      name: '',
      amount: '',
      price: '',
      contractUrl: ''
    }
  },
  methods: {
    submit: function() {
      axios.post(CREATE_TRADE_API, {
        "sellerAddr": this.sellerAddr,
        "buyerAddr": this.buyerAddr,
        "coinName": this.name,
        "amount": this.amount,
        "weiPerCoin": this.price
      }).then(this.onContractCreated.bind(this));
    },

    onContractCreated: function(data) {
      this.contractUrl = "http://localhost:8000/#/contract/" + data.data;
      this.$refs.contractCreated.show();
    }
  }
}
</script>

<style scoped>
  .new-trade {
    margin-top: 50px;
  }

  .trade-form {
    text-align: left;
  }

  .contract-input {
      border: 0;
      outline: 0;
      background: transparent;
      border-bottom: 1px solid black;
  }
</style>
