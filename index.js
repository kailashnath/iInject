(function () {

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        isNode = (typeof module !== 'undefined') && module.exports,
        isValid = function (val) {
            return val && val !== '';
        },
        bind = function (name, func, options) {
            if (!(name && func) || typeof(name) !== 'string') {
                    return null;
            }

            if (func.constructor === Object || (options && options.provider)) {
                if (!func.get || func.get.constructor !== Function) {
                    throw new TypeError("A provider should implement 'get' method");
                }
            } else if ([Function, String, Number].indexOf(func.constructor) === -1) {
                return null;
            }


            var injectable = new Injectable();
            injectable.name = name.trim();
            injectable.func = func;
            injectable.options = options;
            injectable.parent = this;

            this.injectables[name] = injectable;
            return injectable;
        },
        resolve = function (name, overrides) {
            name = name.trim();
            var overide = overrides && overrides[name];

            if (this.injectables) {
                var obj = overide || this.injectables[name];
                if (!obj) {
                    // if not found in current scope go up in the tree
                    return resolve.call(this.parent, name, overrides);
                }
                return obj;
            }
            if (isNode) {
                var exists = false;
                try {
                    return overide || require(name);
                } catch (e) {
                    exists = false;
                }
            }

            return null;
        },
        utils = {
            asProvider: function (module) {
               return {
                   get: function () {
                       return module;
                   }
               };
        }};


    function Injectable() {
        this.injectables = {};
        this.singletons = {};

        this.release = function (name) {
            if (name) {
                delete this.injectables[name];
                delete this.singletons[name];
            } else {
                delete this.injectables;
                delete this.singletons;

                this.injectables = {};
                this.singletons = {};
            }
        };

        this.resolveDependencies = function (overrides) {
            var match = this.func.toString().match(FN_ARGS),
                dependencies = [];

            if (!match) {
                return dependencies;
            }

            var args = match[1].split(',').filter(isValid);
            for (var i = 0; i < args.length; i++) {
                var dependency = resolve.call(this, args[i], overrides),
                    value = null;

                // if dependency is of type Injectable invoke it's dependencies
                if (dependency && dependency.constructor === Injectable) {
                    value = dependency.invoke();
                } else {
                    value = dependency;
                }
                dependencies.push(value);
            }
            return dependencies;
        };

        this.invoke = function (overrides) {
            var func = this.func,
                options = this.options;

            if ([String, Number].indexOf(func.constructor) > -1) {
                return func;
            }
            else if (options && options.provider) {
                // call the get method with scope of iinject, hence the exports
                return func.get.call(exports);
            } else {
                var isSingleton = options && options.singleton,
                    singletons = this.singletons,
                    name = this.name;

                if (isSingleton) {
                    var inst = singletons[name];

                    if (inst) {
                        return inst;
                    }
                }
                var dependencies = this.resolveDependencies(overrides),
                    scope = Object.create(func.prototype);

                func.apply(scope, dependencies);

                if (isSingleton)
                    singletons[name] = scope;

                return scope;
            }
        };

        this.bind = function (name, func, options) {
            return bind.call(this, name, func, options);
        };
    }

    var root = new Injectable(),
        configure = function (func, options) {
            if (options && options.flush === true) {
                remove();
            }
            func.call(root);
        },
        inject = function (name, overrides) {
            var resolved = resolve.call(root, name, overrides);
            if (resolved && resolved.constructor === Injectable) {
                return resolved.invoke(overrides);
            }
            return resolved;
        },
        remove = function (name) {
            root.release(name);
        },

        exports = {configure: configure, inject: inject, remove: remove, get: function () {
            return exports;
        }, utils: utils};

    module.exports = exports;
}());
