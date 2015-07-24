var fs      = require('fs');
var path    = require('path');
var gutil   = require('gulp-util');
var through = require('../library/through');

var asset = {
    require   : readFile('../asset/require.js'),
    template1 : readFile('../asset/script/template.1'),
    template2 : readFile('../asset/script/template.2')
};

/**
 * ��ȡ�ļ�����
 */

function readFile(name, dirname) {
    dirname = dirname || __dirname;
    return fs.readFileSync(path.join(dirname, name), 'utf-8').toString();
}

/**
 * ����������Ϣ
 */

function pluginError(file, message) {
    return new gutil.PluginError('gulp-xmerge-script', message);
}

/**
 * ע����չģ��
 */

module.exports = function(option) {

    option = option || {};

    if (typeof option.name !== 'string') {
        option.name = 'app';
    }

    if (typeof option.newline !== 'string') {
        option.newline = gutil.linefeed;
    }

    var first, cache = [];

    function bufferContent(file) {

        if (file.isNull()) {
            return;
        }

        if (file.isStream()) {
            return this.emit('error', pluginError('Streaming not supported'));
        }

        //�״�����ʱ�趨
        first || (first = file);

        //Ӧ�õ�ע��ģ��
        var code = asset.template1
            .replace('{{name}}', file.relative.replace(/\\/g, '/'))
            .replace('{{content}}', function() { return file.contents.toString() })
        ;

        //���浽�����б�
        cache.push(code);

    }

    function endStream() {

        //Ӧ�õ�ȫ��ģ��
        var code = asset.template2
            .replace(/{{name}}/g, option.name)
            .replace(/{{require}}/g, function() { return asset.require })
            .replace(/{{register}}/g, function() { return cache.join(option.newline) })
        ;

        //����ȫ���ļ���
        var file = first.clone({contents: false});
        file.contents = new Buffer(code);

        //ע�ᵽ��ǰ����
        this.emit('data', file);
        this.emit('end');

    }

    return through(bufferContent, endStream);

};
