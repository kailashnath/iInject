var Processor = require('./index');

var CitiProcessor = function (currency) {
    this.minTransactionAmount = 50;
    this.currency = currency;
};
CitiProcessor.prototype = new Processor("Citi bank");

module.exports = CitiProcessor;
