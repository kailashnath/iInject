var PizzaVendor = function () {
    this.order = function (type, card) {
        return this.transactionHandler.process(card, this.types[type], this.vendor);
    };
};

module.exports = PizzaVendor;
