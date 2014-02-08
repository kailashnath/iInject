(function () {
    var injectables = {}
    ,    singletons = {}
    ,       FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;

    function Injectable(name, func, options) {
        this.isSticky = false;

        this.resolveDependencies = function () {
            var match = func.toString().match(FN_ARGS)
            , dependencies = [];

            if (!match) {
                return dependencies;
            }

            var args = match[1].split(',');

            for (var i = 0; i < args.length; i++) {
                var dependency = container.resolve(args[i])
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
            if (typeof func === "object" || [String, Number].indexOf(func.constructor) > -1) {
                return func;
            } else {
                var isSingleton = options && options.singleton;

                if (isSingleton) {
                    var inst = singletons[name];

                    if (inst) {
                        return inst;
                    }
                }
                var dependencies = this.resolveDependencies(),
                    scope = Object.create(func.prototype);

                func.apply(scope, dependencies);

                if (isSingleton)
                    singletons[name] = scope;

                return scope;
            }
        };
    };


    function DIContainer () {
        var isInjectable = function (obj) {
            return obj.constructor === Injectable;
        };

        this.bind = function (name, func, options) {
            if (!(name && func) || typeof(name) !== 'string') {
                return false;
            }

            injectables[name] = new Injectable(name, func, options);
            return true;
        };

        this.resolve = function (name) {
            try {
                if (name === '') {
                    return name;
                }
                return injectables[name] || require(name);
            } catch (e) {
                return name;
            }
        };
    };

    var container = new DIContainer()
    , configure = function (func) {
        remove();
        func.call(container);
    }
    , inject = function (name) {
        var resolved = container.resolve(name);
        if (resolved.constructor === Injectable) {
            return resolved.invoke();
        }
        return resolved;
    }
    , remove = function (name) {
        if (name) {
            delete injectables[name];
        } else {
            delete injectables;
            injectables = {};
        }
    };

    module.exports = {configure: configure, inject: inject, remove: remove};
}());
