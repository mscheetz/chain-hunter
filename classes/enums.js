/**
 * Search types
 */
const searchType = {
    nothing: 1,
    address: 2,
    transaction: 4,
    contract: 8
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
    IOT : 'IoT'
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
    CREATE_ACCOUNT : 'Create Account'
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

module.exports = {
    searchType,
    blockchainType,
    transactionType,
    accountType
}