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
 * 获取文件内容
 */

function readFile(name, dirname) {
    dirname = dirname || __dirname;
    return fs.readFileSync(path.join(dirname, name), 'utf-8').toString();
}

/**
 * 创建错误信息
 */

function pluginError(file, message) {
    return new gutil.PluginError('gulp-xmerge-script', message);
}

/**
 * 注册扩展模块
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

        //首次运行时设定
        first || (first = file);

        //应用到注册模板
        var code = asset.template1
            .replace('{{name}}', file.relative.replace(/\\/g, '/'))
            .replace('{{content}}', function() {
                return file.contents.toString()
            })
        ;

        //保存到内容列表
        cache.push(code);

    }

    function endStream() {

        //应用到全局模板
        var code = asset.template2
            .replace(/{{name}}/g, option.name)
            .replace(/{{require}}/g, function() {
                return asset.require
            })
            .replace(/{{register}}/g, function() {
                return cache.join(option.newline)
            })
        ;

        //创建全新文件流
        var file = first.clone({contents: false});
        file.contents = new Buffer(code);

        //注册到当前任务
        this.emit('data', file);
        this.emit('end');

    }

    return through(bufferContent, endStream);

};
