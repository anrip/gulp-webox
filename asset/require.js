/**
 * Require the given path
 * @param {String} path
 * @return {Object} exports
 */

function require(p) {
    var path = require.resolve(p);
    var mod = require.modules[path];
    if(!mod) {
        throw new Error('failed to require "' + p + '"');
    }
    if(!mod.exports) {
        mod.exports = {};
        mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
}

require.modules = {};

require.resolve = function(path) {
    var ext = path + '.js';
    var idx = path + '/index.js';
    return require.modules[ext] && ext
        || require.modules[idx] && idx
        || path;
};

require.register = function(path, fn) {
    require.modules[path] = fn;
};

require.relative = function(parent) {
    return function(p){
        if('.' != p.charAt(0)) {
            return require(p);
        }
        var segs = p.split('/');
        var path = parent.split('/');
        path.pop(); //delete the last item
        for(var i = 0; i < segs.length; i++) {
            if('..' === segs[i]) {
                path.pop();
                continue;
            }
            if('.' !== segs[i]) {
                path.push(segs[i]);
            }
        }
        return require(path.join('/'));
    };
};
