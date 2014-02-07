var assert = require('chai').assert
,   di = require('./index');

suite('di', function () {
    test('should expose "inject", "remove", and "configure" methods', function () {
        assert.ok(di.inject, 'inject should be exposed');
        assert.ok(di.configure, 'configure should be exposed');
        assert.ok(di.remove, 'remove should be exposed');
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
                var bind = null;
                di.configure(function () {
                    bind = this.bind;
                });

                assert.isTrue(bind('String', 'another dummy'));
                assert.isTrue(bind('Integer', 5));
                assert.isTrue(bind('Function', function () {}));

                assert.isFalse(bind());
                assert.isFalse(bind('fail'));
                assert.isFalse(bind(null, 'fail'));
                assert.isFalse(bind(function () {}, 'failFunc'));
            });

    test('should always clear the previous mapping when invoked', function () {
        di.configure(function () {
            this.bind('name', 'kailash');
        });
        assert.strictEqual('kailash', di.inject('name'));

        di.configure(function () {
        });
        assert.strictEqual('name', di.inject('name'));
    });
});

suite('di#remove', function () {
    test('should remove an entry from injectables list', function () {
        di.configure(function () {
            this.bind('number', 100);
        });
        assert.strictEqual(100, di.inject('number'));

        di.remove('number');
        assert.strictEqual('number', di.inject('number'));
    });

    test('should remove all entries from injectables list if no param is given', function () {
        di.configure(function () {
            this.bind('name', 'kailash');
            this.bind('location', 'bangalore');
        });

        assert.strictEqual('bangalore', di.inject('location'));
        di.remove();

        assert.strictEqual('location', di.inject('location'));
        assert.strictEqual('name', di.inject('name'));
    });
});

suite('di#inject', function () {
    setup(function () {
        var self = this,
            shared = {};
        this.db = function () {
            return 'database';
        };
        this.user = function (db) {
            return db;
        };
        this.employee = function (user) {
            return user === 'database';
        };
        this.developer = function (employee) {
            return employee? 'developer': null;
        };

        this.singleton = function () {
            return self.shared;
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
        assert.strictEqual('database', di.inject('db'));
    });

    test('should inject into the constructor of the function being injected if any dependency matches', function () {
        var user = di.inject('user');
        assert.strictEqual('database', user);
    });
    test('should inject into the constructor of the function being injected if any dependency matches across all its tree', function () {
        var employee = di.inject('employee');
        assert.isTrue(employee);
        assert.strictEqual('developer', di.inject('developer'));
    });

    test('should not create a new object if injecting a singleton function', function () {
        assert.strictEqual(this.shared, di.inject('singleton'));
    });

});

