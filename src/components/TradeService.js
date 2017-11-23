export default {
  deploy: function(contract, args, txOptions) {
    return new Promise(function(resolve, reject) {
      contract.deploy({ arguments: args }).send(txOptions)
        .on("error", reject).on("transactionHash", resolve);
    });
  },

  deposit: function(contract, totalPrice, txOptions) {
    return new Promise(function(resolve, reject) {
      contract.methods.deposit().send(txOptions)
        .on("error", reject).on("transactionHash", resolve);
    });
  },

  confirm: function(contract, txOptions) {
    return new Promise(function(resolve, reject) {
      contract.methods.confirm().send(txOptions)
        .on("error", reject).on("transactionHash", resolve);
    });
  }
}
