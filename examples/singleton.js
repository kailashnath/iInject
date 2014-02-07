var di = require('../index');

var IdGen = function (idBegin) {
    this.next = function () {
        return idBegin++;
    };
};

var User = function (idGen) {
    this.id = idGen.next();
};
User.create = function (name) {
    var u = di.inject('user');
    u.name = name;
    return u;
};


di.configure(function () {
    this.bind('idBegin', 100);
    this.bind('idGen', IdGen, {singleton: true});
    this.bind('user', User);
});

var u1 = User.create('u1')
    u2 = User.create('u2')
    u3 = User.create('u3');

// 100, 101, 102
console.log([u1.id, u2.id, u3.id]);
