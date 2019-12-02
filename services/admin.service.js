const userRepo = require('../data/user.repo');
const userDataRepo = require('../data/user-data.repo');
const responseSvc = require('./response.service');

const getUserCounts = async() => {
    const users = await userRepo.getAll();
    const userData = await userDataRepo.getCount();

    const userCounts = {
        total: users.length,
        active: users.filter(u => u.validated !== null).length,
        free: users.filter(u => +u.accountTypeId === 1).length,
        basic: users.filter(u => +u.accountTypeId === 2).length,
        pro: users.filter(u => +u.accountTypeId === 3).length,
        saves: userData.counts
    }

    return responseSvc.successMessage(userCounts);
}

module.exports = {
    getUserCounts
}