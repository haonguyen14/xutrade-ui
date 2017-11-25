export default {
  sign: function(provider, msg, address) {
    return provider.personal_sign(msg, address);
  }
}
