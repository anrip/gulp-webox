var through = require('../library/through');

/**
 * ×¢²áÀ©Õ¹Ä£¿é
 */

module.exports = function(expr, callback) {

    function bufferContent(file) {

        if (file.isNull()) {
            return;
        }

        if (file.isStream()) {
            return this.emit('error', pluginError('Streaming not supported'));
        }
        
        var code;

        code = file.contents.toString();
        code = code.replace(expr, callback);

        file.contents = new Buffer(code);
        
        this.emit('data', file);

    }

    return through(bufferContent);

};
