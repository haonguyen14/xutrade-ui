export default {
  getTransactionReceipt: function (web3, txnHash, interval) {
    interval = interval ? interval : 500;

    var transactionReceiptAsync = function(txnHash, resolve, reject) {
      web3.eth.getTransactionReceipt(txnHash, function(e, receipt) {
        if(e) {
          reject(e);
        }
        if (receipt == null) {
            setTimeout(function () {
                transactionReceiptAsync(txnHash, resolve, reject);
            }, interval);
        } else {
            resolve(receipt);
        }
      });
    };

    return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
    });
  }
}
