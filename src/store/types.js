export const ACTION_TYPES = {
  GET_ETH_ABSTRACTION: "get_eth_abstraction",
  GET_COINBASE: "get_coinbase",
  GET_GAS_PRICE: "get_gas_price",
  GET_CONTRACT_ADDRESS: "get_contract_address",

  STAGES: {
    GET_STAGES: "get_stages"
  }
};

export const MUTATION_TYPES = {
  COMMIT_ETH_ABSTRACTION: "commit_eth_abstraction",
  COMMIT_COINBASE: "commit_coinbase",
  COMMIT_TRADE_CONTRACT: "commit_trade_contract",
  COMMIT_GAS_PRICE: "commit_gas_price",

  STAGES: {
    COMMIT_STAGE_OPENED: "commit_stage_opened",
    COMMIT_STAGE_DEPOSITED: "commit_stage_deposited",
    COMMIT_STAGE_CONFIRMED: "commit_stage_confirmed",
    COMMIT_STAGE_LOADED: "commit_stage_loaded"
  }
}
