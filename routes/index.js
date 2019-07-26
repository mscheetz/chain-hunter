const api = require('./api');
const users = require('./user');
const visits = require('./visit');

module.exports = app => {
    app.use('/api', api);
    app.use('/users', users);
    app.use('/visits', visits);
}