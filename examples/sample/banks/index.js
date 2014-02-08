
var Processor = function (serviceProvider) {
    this.serviceProvider = serviceProvider;
}
Processor.prototype.process = function (card, amount, vendor) {
    console.log(this.code + ": Debited an amount of " + amount + this.currency +
                " against your '" + this.serviceProvider + 
                "' " + card + " card " +
                "at " + vendor);
    return true;
};

module.exports = Processor;
