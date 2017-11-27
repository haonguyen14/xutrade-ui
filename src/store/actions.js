import {ACTION_TYPES, MUTATION_TYPES} from './types'
import Web3 from 'web3';
import Eth from 'ethjs';
import tradeContract from '@/contracts/tradecontract';
import utils from '@/contracts/utils';


var createContract = function(instance, contract, address) {
  return new instance.eth.Contract(contract.jsonInterface, address, {
    data: contract.byteCode
  });
}

export default {
  [ACTION_TYPES.GET_ETH_ABSTRACTION] ({ commit, dispatch }) {
    return new Promise(function(resolve, reject) {
      window.addEventListener('load', function() {
        var web3 = window.web3;

        if (typeof web3 !== 'undefined') {
          const instance = new Web3(web3.currentProvider);
          const signatureProvider = new Eth(web3.currentProvider);
          commit(MUTATION_TYPES.COMMIT_ETH_ABSTRACTION, instance);
          commit(MUTATION_TYPES.COMMIT_SIGNATURE_PROVIDER, signatureProvider);
          commit(MUTATION_TYPES.COMMIT_TRADE_CONTRACT,
            createContract(instance, tradeContract));

          dispatch(ACTION_TYPES.GET_COINBASE, instance).then(function() {
            resolve();
          }).catch(reject);

          dispatch(ACTION_TYPES.GET_GAS_PRICE, instance).then(function() {
            resolve();
          }).catch(reject);

          dispatch(ACTION_TYPES.GET_NETWORK, instance).then(function() {
            resolve();
          }).catch(reject);
        } else {
          reject('Install MetaMask!')
        }
      })
    });
  },

  [ACTION_TYPES.GET_COINBASE] ({ commit }, instance) {
    return new Promise(function(resolve, reject) {
      instance.eth.getCoinbase().then(function(coinbase) {
        commit(MUTATION_TYPES.COMMIT_COINBASE, coinbase);
        resolve();
      }).catch(reject);
    });
  },

  [ACTION_TYPES.GET_NETWORK] ({ commit }, instance) {
    return new Promise(function(resolve, reject) {
      instance.eth.net.getNetworkType().then(function(network) {
        commit(MUTATION_TYPES.COMMIT_NETWORK, network);
        resolve();
      }).catch(reject);
    });
  },

  [ACTION_TYPES.GET_GAS_PRICE] ({ commit }, instance) {
    return new Promise(function(resolve, reject) {
      instance.eth.getGasPrice().then(function(gasPrice) {
        commit(MUTATION_TYPES.COMMIT_GAS_PRICE, gasPrice);
        resolve();
      }).catch(reject);
    });
  },

  [ACTION_TYPES.GET_CONTRACT_ADDRESS] ({ commit }, txHash) {
    var instance = this.state.eth;
      return new Promise(function(resolve, reject) {
        utils.awaitBlockConsensus(instance, txHash, 1, 5*60, function(e, receipt) {
          if(e) {
            reject(e);
            return
          }
          commit(MUTATION_TYPES.COMMIT_TRADE_CONTRACT,
            createContract(instance, tradeContract, receipt.contractAddress));
          resolve();
        });
      });
    }
}
