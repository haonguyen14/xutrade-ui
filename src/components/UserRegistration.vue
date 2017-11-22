<template>
  <div class="registration-form">
    <div>
      <h1>Registration</h1>
    </div>

    <div class="registration-container container">
      <div class="row">
        <div class="col form-group email-form-group">
          <label for="email">Email Address:</label>
          <input type="text" class="form-control" id="email" v-model="email">
        </div>
      </div>

      <div class="row">
        <div class="col">
          <button type="button" class="btn btn-primary btn-lg btn-block" v-on:click="submit">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserRegistration",

  data () {
    return {
      email: ""
    };
  },

  methods: {
    submit: function() {
      const userRegistry = this.$store.state.UserRegistryContract;
      userRegistry.methods.register()
        .send({from: this.$store.state.coinbase})
        .on("confirmation", this.onRegistrationConfirmed.bind(this))
        .on("error", this.onRegistrationError.bind(this));
    },

    onRegistrationConfirmed: function(_, receipt) {
      console.log(receipt);
    },

    onRegistrationError: function(error) {
      console.log(error);
    }
  }
}
</script>

<style scoped>
  .registration-form {
    margin-top: 150px;
  }

  .registration-container {
    width: 45%;
  }

  .email-form-group {
    text-align: left;
  }
</style>
