var di = require('../../index'),
    CitiProcessor = require('./banks/citi'),
    BOAProcessor = require('./banks/boa'),
    Pizzahut = require('./pizzas/pizzahut'),
    Dominos = require('./pizzas/dominos');


di.configure(function () {
    this.bind('dominos', Dominos)
        .bind('transactionHandler', BOAProcessor)
        .bind('currency', '$');
    this.bind('pizzahut', Pizzahut)
        .bind('transactionHandler', CitiProcessor)
        .bind('currency', 'Rs');
});

di.inject('dominos').order('cheese', 'visa');
di.inject('pizzahut').order('cheese', 'master');


