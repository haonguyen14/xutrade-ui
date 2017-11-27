export const ACTION_TYPES = {
  GET_ETH_ABSTRACTION: "get_eth_abstraction",
  GET_COINBASE: "get_coinbase",
  GET_GAS_PRICE: "get_gas_price",
  GET_CONTRACT_ADDRESS: "get_contract_address",
  GET_NETWORK: "get_network",

  EVENTS: {
    SUBSCRIBE: "event_subscribe"
  },
};

export const MUTATION_TYPES = {
  COMMIT_ETH_ABSTRACTION: "commit_eth_abstraction",
  COMMIT_COINBASE: "commit_coinbase",
  COMMIT_TRADE_CONTRACT: "commit_trade_contract",
  COMMIT_GAS_PRICE: "commit_gas_price",
  COMMIT_SIGNATURE_PROVIDER: "commit_signature_provider",
  COMMIT_AUTHORIZATION_TOKEN: "commit_authorization_token",
  COMMIT_NETWORK: "commit_network",

  EVENTS: {
    SUBSCRIBE: "event_subscribe",
    ADD_EVENT: "add_event",
    CREATE_SUBSCRIPTION: "create_subscription",
    SET_OBSERVED_TX: "set_observed_tx",
    EVENT_LOADED: "event_loaded"
  },
}
