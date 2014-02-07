var di = require('./index');

var Db = function (ip) {
    console.log(ip);
};
Db.new = function () {
    return new Db(di.inject('ip'));
};

var User = function (db) {
    console.log(db);
};

di.configure(function () {
    this.bind('ip', '127.0.0.1');
    this.bind('db', Db.new);
    this.bind('user', User);
});

console.log(di.inject('user', true));
