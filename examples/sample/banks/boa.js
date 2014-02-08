var Processor = require('./index');


var BOAProcessor = function (currency) {
    this.minTransactionAmount = 100;
    this.currency = currency;
    this.code = Math.floor(Math.random() * 100);
};
BOAProcessor.prototype = new Processor('Bank of America');

module.exports = BOAProcessor;
