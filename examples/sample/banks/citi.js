var Processor = require('./index');

var CitiProcessor = function (currency) {
    this.minTransactionAmount = 50;
    this.currency = currency;
    this.code = Math.floor(Math.random() * 100);
};
CitiProcessor.prototype = new Processor("Citi bank");

module.exports = CitiProcessor;
