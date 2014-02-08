var PizzaVendor = require('./index');

var Pizzahut = function (transactionHandler) {
    this.vendor = 'Pizza hut';
    this.types = {'cheese': 100, 'veggie': 300};
    this.transactionHandler = transactionHandler;
};

Pizzahut.prototype = new PizzaVendor();

module.exports = Pizzahut;
