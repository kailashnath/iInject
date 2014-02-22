var assert = require('chai').assert,
   di = require('./index');

suite('di', function () {
    test('should expose "inject", "remove", and "configure" methods', function () {
        assert.ok(di.inject, 'inject should be exposed');
        assert.ok(di.configure, 'configure should be exposed');
        assert.ok(di.remove, 'remove should be exposed');
    });

    test('should expose a provider method "get"', function () {
        assert.ok(di.get);
        assert.ok(di.get(), 'inject');
        assert.ok(di.get(), 'configure');
        assert.ok(di.get(), 'remove');
    });
});


suite('di#configure', function () {
    test('should support "bind" method in it\'s scope', function () {
        di.configure(function () {
            assert.ok(this.bind);
        });
    });

    test('#bind should be able to register a string type with either of "string", "int", "function"',
            function () {
                di.configure(function () {
                    assert.ok(this.bind('String', 'another dummy'));
                    assert.ok(this.bind('Integer', 5));
                    assert.ok(this.bind('Function', function () {}));

                    assert.notOk(this.bind());
                    assert.notOk(this.bind('fail'));
                    assert.notOk(this.bind(null, 'fail'));
                    assert.notOk(this.bind(function () {}, 'failFunc'));
                });
            });

    test('#bind should always allow currying way of binding', function () {
        di.configure(function () {
            assert.ok(this.bind('name', 'kailash').bind);
        });
    });

    test('should not clear the previous mapping but update when called again', function () {
        di.configure(function () {
            this.bind('name', 'kailash');
            this.bind('country', 'India');
        });
        assert.strictEqual('kailash', di.inject('name'));

        di.configure(function () {
            this.bind('name', 'Bruce Lee');
        });
        assert.strictEqual('Bruce Lee', di.inject('name'));
        assert.strictEqual('India', di.inject('country'));
    });

    test('should always clear the previous mapping when invoked with option "flush == true"', function () {
        di.configure(function () {
            this.bind('name', 'kailash');
        });
        assert.strictEqual('kailash', di.inject('name'));

        di.configure(function () {
        }, {flush: true});
        assert.strictEqual(null, di.inject('name'));
    });

    test('should throw an error if binding a provider which doesn\'t implement get method',
            function () {

                di.configure(function () {
                    var self = this;
                    assert.throw(function () {
                        self.bind('failProvider', function () {}, {'provider': true});
                    }, TypeError);
                });

            }
    );

    test('should throw an error if provider "get" is not a function', function () {
            di.configure(function () {
                var self = this;
                assert.throw(function () {
                    self.bind('invalidGetProvider', {get: 'fail'}, {'provider': true});
                }, TypeError);
            });
        });
});

suite('di#remove', function () {
    test('should remove an entry from injectables list', function () {
        di.configure(function () {
            this.bind('number', 100);
            this.bind('name', 'kailash');
        });
        assert.strictEqual(100, di.inject('number'));

        di.remove('number');
        assert.strictEqual(null, di.inject('number'));
        assert.strictEqual('kailash', di.inject('name'));
    });

    test('should remove all entries from injectables list if no param is given', function () {
        di.configure(function () {
            this.bind('name', 'kailash');
            this.bind('location', 'bangalore');
        });

        assert.strictEqual('bangalore', di.inject('location'));
        di.remove();

        assert.strictEqual(null, di.inject('location'));
        assert.strictEqual(null, di.inject('name'));
    });
});

suite('di#inject', function () {
    setup(function () {
        var self = this,
            id = 0;
        this.db = function () {
            this.type = 'database';
        };
        this.user = function (db) {
            this.type = db? 'user': null;
        };
        this.employee = function (user) {
            this.type = user? 'employee': null;
        };
        this.developer = function (db, employee) {
            this.type = employee? 'developer': null;
            this.db = db;
        };

        this.singleton = function () {
            this.uid = id++;
        };
        this.singleton.prototype.id = function () {
            return this.uid;
        };
        di.configure(function () {
            this.bind('number', 100);
            this.bind('string', 'kailash');
            this.bind('db', self.db);
            this.bind('user', self.user);
            this.bind('employee', self.employee);
            this.bind('developer', self.developer);
            this.bind('singleton', self.singleton, {singleton: true});
        });
    });
    test('should inject number if bound to a number', function () {
        assert.isTrue(100 === di.inject('number'));
    });
    test('should inject string if bound to a string', function () {
        assert.isTrue('kailash' === di.inject('string'));
    });
    test('should inject return value of function if bound to a function', function () {
        assert.strictEqual('database', di.inject('db').type);
    });

    test('should inject into the constructor of the function being injected if any dependency matches', function () {
        var user = di.inject('user');
        assert.strictEqual(user.type, 'user');
    });
    test('should inject into the constructor of the function being injected if any dependency matches across all its tree', function () {
        assert.strictEqual('developer', di.inject('developer').type);
    });

    test('should not create a new object if injecting a singleton function', function () {
        var inst = di.inject('singleton');
        assert.strictEqual(inst.id(), di.inject('singleton').id());
    });

    test('should inject variables as per the dependency graph when used nested binding', function () {
        var CreditCard = function (currency) {
            this.currency = currency;
        };

        di.configure(function () {
            this.bind('india', CreditCard).bind('currency', 'rupees');
            this.bind('sweden', CreditCard).bind('currency', 'kronos');
        });
        assert.strictEqual('rupees', di.inject('india').currency);
        assert.strictEqual('kronos', di.inject('sweden').currency);
    });

    test('should inject variables from parent scope if not found in current scope', function () {
        di.configure(function () {
            this.bind('user', function (name) { this.name = name;});
            this.bind('name', 'global');
        });

        assert.strictEqual('global', di.inject('user').name);
    });

    test('should inject variables from local scope if found and shouldn\'t be overriden by global scope', function () {
        di.configure(function () {
            this.bind('user', function (name) { this.name = name;}).bind('name', 'local');
            this.bind('name', 'global');
        });

        assert.strictEqual('local', di.inject('user').name);
    });

    test('should inject from node_modules if the injectable isn\'t configured in nodejs env',
            function () {
                assert.strictEqual(require('fs'), di.inject('fs'));
            });

    test('should call the "get" method if injecting a provider class',
            function () {
                var Db = function () {
                    this.type = 'provider';
                };
                Db.get = function () {
                    return new Db();
                };
                di.configure(function () {
                    this.bind('dbConnectionProvider', Db, {'provider': true});
                });
                assert.equal('provider', di.inject('dbConnectionProvider').type);
            });

    test('should call the "get" method if injecting a provider object',
            function () {
                var provider = {
                    get: function () {
                             return 100;
                         }
                };
                di.configure(function () {
                    this.bind('intProvider', provider, {provider: true});
                });

                assert.equal(100, di.inject('intProvider'));
            });

});

