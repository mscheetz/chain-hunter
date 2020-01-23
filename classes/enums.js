/**
 * Search types
 */
const searchType = {
    nothing: 1,
    address: 2,
    transaction: 4,
    contract: 8,
    block: 16,
    blocks: 32
}

/**
 * Blockchain types
 * from 
 * https://steemitimages.com/p/JvFFVmatwWHRfvmtd53nmEJ94xpKydwmbSC5H5svBACH7z9fCvxPj3CUpU5kRMqxvo3QmGpg9v2A69xAuWstsksJTeppQPZHkdEz9cKdbch8TSxpsm43E3KokjEFFRqzaREev4uQqU?format=match&mode=fit&width=640
 * and
 * https://coinnewstelegraph.com/wp-content/uploads/2018/06/cryptocurrency-periodic-table-chart-9-types-of-blockchain-assets-categories.jpg
 */
const blockchainType = {
    PAYMENT : 'Payment',
    PROTOCOL : 'Protocol',
    STORAGE : 'Storage',
    PLATFORM : 'Platform',
    PRIVACY : 'Privacy',
    COMPUTATION : 'Computation',
    STABLECOIN : 'Stable Coin',
    EXCHANGE : 'Exchange',
    STREAMING : 'Streaming',
    CONTENT : 'Content',
    ENTERPRISE : 'Enterprise',
    GAMING : 'Gaming',
    SOCIAL : 'Social',
    IOT : 'IoT',
    DATABASE: 'Database'
}

/**
 * Represents a blockchain transaction type
 */
const transactionType = {
    TRANSFER : 'Transfer',
    CONTRACT: 'Contract',
    FEE : 'Fee',
    STAKING : 'Staking',
    MINING : 'Mining',
    CHANGETRUST : 'Change Trust',
    PAYMENT : 'Payment',
    TRADE : 'Trade',
    CREDIT : 'Credit',
    TRUSTREMOVED : 'Trustline Removed',
    TRUSTCREATED : 'Trustline Created',
    MANAGEOFFER : 'Manage Offer',
    MANAGEBUYOFFER : 'Manage Buy Offer',
    ENDORSEMENT : 'Endorsement',
    DELEGATION : 'Delegation',
    ORIGINATION : 'Origination',
    ACTIVATION : 'Activation',
    REWARD : 'Reward',
    CANCEL_ORDER : 'Cancel Order',
    NEW_ORDER : 'Place Order',
    CLAIM : 'Gas Claim',
    CREATE_ACCOUNT : 'Create Account',
    UNDELEGATE : 'Undelegate',
    ISSUE: 'Issue',
    NONSTANDARD: 'Non-Standard',
    INVOCATION: 'Invocation',
    OFFERCREATE: 'Offer Create',
    OFFERCANCEL: 'Offer Cancel',
    NAME_PRECLAIM: 'Name Preclaim',
    CONTRACT_CREATION: 'Contract Creation',
    ALIASED: 'Aliased',
    REGISTER_NODE: 'Register Node',
    CANCEL_CONSENSUS: 'Cancel Consensus',
    YELLOW_CARD: 'Yellow Card',
    RED_CARD: 'Red Card',
    UNREGISTER_NODE: 'Unregister Node',
    DELETE_CONTRACT: 'Delete Contract',
    CONTRACT_TRANSFER: 'Contract Transfer',
    CONTRACT_RETURN: 'Contract Return',
    CONTRACT_STAKE: 'Contract Stake',
    CONTRACT_CONSENSUS: 'Contract Consensus',
    CROSS_TRADING: 'Cross Trading',
    CROSS_REGISTER: 'Cross Register',
    CROSS_CANCELLATION: 'Cross Cancellation',
    ADD_CROSS_ASSETS: 'Add Cross Asset',
    CANCEL_CROSS_ASSETS: 'Cancel Cross Asset',
    CONTRACT_CREATION_NODE: 'Contract Creation Node',
    CONTRACT_CANCELLATION_NODE: 'Contract Cancellation Node',
    VERIFIER_CHANGE: 'Verifier Change',
    VERIFIER_INITIALIZATION: 'Verifier Initialization'
}

/**
 * Represents a user account type
 */
const accountType = {
    FREE : 'free',
    BASIC : 'basic',
    PRO : 'pro',
    ADMIN : 'admin'
}

/**
 * Represents a payment source type
 */
const paymentSource = {
    creditCard: 0,
    cryptocurrency: 1
}

module.exports = {
    searchType,
    blockchainType,
    transactionType,
    accountType,
    paymentSource
}