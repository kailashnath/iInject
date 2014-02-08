var PizzaVendor = require('./index');

var Dominos = function (transactionHandler) {
    this.vendor = 'Dominos';
    this.types = {'cheese': 5, 'veggie': 3};
    this.transactionHandler = transactionHandler;
};

Dominos.prototype = new PizzaVendor();

module.exports = Dominos;
