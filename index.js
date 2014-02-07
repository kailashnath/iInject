(function () {
    var injectables = {};

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    function Injectable(name, func) {
        this.isSticky = false;

        this.resolveDependencies = function () {
            var match = func.toString().match(FN_ARGS),
                dependencies = [];

            if (!match) {
                return dependencies;
            }

            var args = match[1].split(',');

            for (var i = 0; i < args.length; i++) {
                var dependency = container.resolve(args[i]),
                    value = null;

                if (dependency.constructor === Injectable) {
                    value = dependency.invoke();
                } else {
                    value = dependency;
                }
                dependencies.push(value);
            }
            return dependencies;
        };

        this.invoke = function (asnewObject) {
            if (typeof func === "object" || func.constructor === String) {
                return func;
            } else {
                var skeleton = Object.create(func.prototype);
                return func.apply(skeleton, this.resolveDependencies());
            }
        };
    };


    function DIContainer () {
        var isInjectable = function (obj) {
            return obj.constructor === Injectable;
        };

        var bindSticky = function (name, func, is_sticky) {
            var injectable = new Injectable(name, func);
            injectable.isSticky = (!!is_sticky);

            // if this is a sticky bind, update the collection
            if (is_sticky) {
                injectables[name] = injectable;
            } else {
                var exists = injectables[name];
                // if already a bind exists and it's not a sticky bind or
                // if the bind doesn't exist
                if ((exists && !exists.isSticky) || !exists) {
                    injectables[name] = injectable;
                }
            }
        };

        this.bind = function (name, func, is_sticky) {
            bindSticky(name, func, is_sticky);
        };

        this.resolve = function (name) {
            try {
                if (name === '') {
                    return name;
                }
                return injectables[name] || require(name);
            } catch (e) {
                console.log(e.stack);
                return name;
            }
        };

        this.inject = function (name, as_new_object) {
            var resolved = this.resolve(name);
            if (isInjectable(resolved)) {
                return as_new_object === true ? resolved.invokeNewObject(): resolved.invoke();
            }
            return resolved;
        };

        this.injectNew = function (name) {
            return this.inject(name, true);
        };

        this.configure = function (module_loader) {
            module_loader.call(this);
        };

        this.release = function () {
            delete injectables;
            injectables = {};
        }
    };

    var container = new DIContainer();

    var configure = function (func) {
        func.call(container);
    },
    inject = function (name, asNewObject) {
        var resolved = container.resolve(name);
        if (resolved.constructor === Injectable) {
            return resolved.invoke(asNewObject === true);
        }
        return resolved;
    };

    module.exports = {configure: configure, inject: inject};
}());
