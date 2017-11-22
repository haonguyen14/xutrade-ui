export default {
  getTransactionMinedAsync: function (txnHash, interval) {
      var transactionReceiptAsync;
      interval = interval ? interval : 500;
      transactionReceiptAsync = function(txnHash, resolve, reject) {
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

      if (Array.isArray(txnHash)) {
          var promises = [];
          txnHash.forEach(function (oneTxHash) {
            promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval));
          });
          return Promise.all(promises);
      } else {
          return new Promise(function (resolve, reject) {
            transactionReceiptAsync(txnHash, resolve, reject);
          });
      }
  }
}
