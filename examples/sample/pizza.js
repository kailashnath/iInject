var di = require('../../index'),
    CitiProcessor = require('./banks/citi'),
    BOAProcessor = require('./banks/boa'),
    Pizzahut = require('./pizzas/pizzahut'),
    Dominos = require('./pizzas/dominos');


di.configure(function () {
    this.bind('dominos', Dominos)
        .bind('transactionHandler', BOAProcessor, {singleton: true})
        .bind('currency', '$');
    this.bind('pizzahut', Pizzahut)
        .bind('transactionHandler', CitiProcessor, {singleton: true})
        .bind('currency', 'Rs');
});

di.inject('dominos').order('cheese', 'visa');
di.inject('pizzahut').order('cheese', 'master');

// the bank code doesn't change as the processor is a singleton object
di.inject('pizzahut').order('veggie', 'master');
di.inject('dominos').order('veggie', 'master');

