import {MUTATION_TYPES} from './types'

export default {
  [MUTATION_TYPES.COMMIT_ETH_ABSTRACTION] (state, instance) {
    state.eth = instance;
  },

  [MUTATION_TYPES.COMMIT_TRADE_CONTRACT] (state, contract) {
    state.TradeContract = contract;
  },

  [MUTATION_TYPES.COMMIT_COINBASE] (state, coinbase) {
    state.coinbase = coinbase;
  },

  [MUTATION_TYPES.COMMIT_GAS_PRICE] (state, gasPrice) {
    state.gasPrice = gasPrice
  }
}
