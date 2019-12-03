const blockchainRepo = require('../data/blockchain.repo');
const encryptionSvc = require('./encryption.service');
const responseSvc = require('./response.service');

const add = async(data) => {
    const uuid = encryptionSvc.getUuid();
    data.id = uuid;

    try{
        const status = await blockchainRepo.add(data);

        return responseSvc.successMessage(true,200);
    } catch(err) {
        return responseSvc.errorMessage(err, 400);
    }
}

const update = async(data) => {
    const bc = await blockchainRepo.get(data.symbol);
    if(!bc) {
        return responseSvc.errorMessage(`${data.symbol} does not exist`, 400);
    }
    if(bc.id !== data.id) {
        return responseSvc.errorMessage(`Invalid blockchain`, 400);
    }

    try{
        const status = await blockchainRepo.update(data);

        return responseSvc.successMessage(true,200);
    } catch(err) {
        return responseSvc.errorMessage(err, 400);
    }
}

const getAll = async() => {
    const blockchains = await blockchainRepo.getAll();

    return responseSvc.successMessage(blockchains, 200);
}

module.exports = {
    add,
    update,
    getAll
}