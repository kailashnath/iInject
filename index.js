(function () {

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m

    , bind = function (name, func, options) {
        if (!(name && func) || typeof(name) !== 'string') {
                return null;
        }
        var injectable = new Injectable();
        injectable.name = name;
        injectable.func = func;
        injectable.options = options;
        injectable.parent = this;

        this.injectables[name] = injectable;
        return injectable;
    }
    , resolve = function (name) {

        if (this.injectables) {
            var obj = this.injectables[name];
            if (!obj) {
                return resolve.call(this.parent, name);
            }
            return obj;
        }
        return name;
    };

    function Injectable() {
        this.injectables = {};
        this.singletons = {};

        this.resolveDependencies = function () {
            var match = this.func.toString().match(FN_ARGS)
            , dependencies = [];

            if (!match) {
                return dependencies;
            }

            var args = match[1].split(',');

            for (var i = 0; i < args.length; i++) {
                var dependency = resolve.call(this, args[i])
                ,        value = null;

                if (dependency.constructor === Injectable) {
                    value = dependency.invoke();
                } else {
                    value = dependency;
                }
                dependencies.push(value);
            }
            return dependencies;
        };

        this.invoke = function () {
            var func = this.func
            , options = this.options;

            if (typeof func === "object" || [String, Number].indexOf(func.constructor) > -1) {
                return func;
            } else {
                var isSingleton = options && options.singleton
                , singletons = this.singletons
                , name = this.name;

                if (isSingleton) {
                    var inst = singletons[name];

                    if (inst) {
                        return inst;
                    }
                }
                var dependencies = this.resolveDependencies()
                , scope = Object.create(func.prototype);

                func.apply(scope, dependencies);

                if (isSingleton)
                    singletons[name] = scope;

                return scope;
            }
        };

        this.bind = function (name, func, options) {
            return bind.call(this, name, func, options);
        };
    };

    var root = new Injectable()
    , configure = function (func) {
        remove();
        func.call(root);
    }
    , inject = function (name) {
        var resolved = resolve.call(root, name);
        if (resolved.constructor === Injectable) {
            return resolved.invoke();
        }
        return resolved;
    }
    , remove = function (name) {
        if (name) {
            delete root.injectables[name];
        } else {
            delete root;
            root = new Injectable();
        }
    };

    module.exports = {configure: configure, inject: inject, remove: remove};
}());
