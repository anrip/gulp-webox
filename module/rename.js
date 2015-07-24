var through = require('../library/through');

/**
 * ×¢²áÀ©Õ¹Ä£¿é
 */

module.exports = function(name, callback) {

    function bufferContent(file) {

        if (file.isNull()) {
            return;
        }

        if (file.isStream()) {
            return this.emit('error', pluginError('Streaming not supported'));
        }

        file.path = file.path.replace(/[^\/\\]+$/, name);
        
        this.emit('data', file);

    }

    return through(bufferContent);

};
