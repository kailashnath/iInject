var Processor = require('./index');


var BOAProcessor = function (currency) {
    this.minTransactionAmount = 100;
    this.currency = currency;
};
BOAProcessor.prototype = new Processor('Bank of America');

module.exports = BOAProcessor;
