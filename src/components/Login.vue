<template>
  <div class="login-form">
    <div>
      <h1>Login</h1>
    </div>

    <div class="login-container container">
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
import {MUTATION_TYPES} from '@/store/types';

export default {
  name: "Login",

  data () {
    return {
      email: ""
    };
  },

  methods: {
    submit: function() {
      const userRegistry = this.$store.state.UserRegistryContract;
      userRegistry.methods.login()
        .call({from: this.$store.state.coinbase})
        .then(this.loginCallback.bind(this));
    },

    loginCallback: function(isAuthenticated) {
      this.$store.commit(MUTATION_TYPES.COMMIT_IS_LOGGED_IN, true);
    }
  }
}
</script>

<style scoped>
  .login-form {
    margin-top: 150px;
  }

  .login-container {
    width: 45%;
  }

  .email-form-group {
    text-align: left;
  }
</style>
