#!/usr/bin/env node

// code from www.anrip.com

'use strict';

var path = require('path');
var http = require('http');
var url  = require('url');
var fs   = require('fs');

var wbmime = require('./wbmime');

// set title
process.title = 'HTTP 服务器';

// set env var for ORIGINAL cwd
process.env.INIT_CWD = process.cwd();

// exit with 0 or 1
var failed = false;
process.once('exit', function(code) {
    console.log('服务已停止');
    if(code === 0 && failed) {
        process.exit(1);
    }
});

var config = process.argv.slice(2);

var listen = config[0] || '0.0.0.0:1986';
var wbroot = config[1] || 'webroot';

var dfmine = 'application/octet-stream';

var webox = http.createServer(function(request, response) {
    //解析请求参数
    var pathTemp = request.url.match(/\/$|^\/\?/) ? '/index.html' : request.url;
    var pathName = url.parse(pathTemp).pathname;
    var realPath = path.join(wbroot, pathName);
    console.log('请求源文件 ' + realPath);
    //尝试查找文件
    fs.exists(realPath, function(exists) {
        //找不到文件
        if(!exists) {
            response.writeHead(404, {'Content-Type': wbmime['txt']});
            response.write('找不到文件 ' + pathName);
            response.end();
            return;
        }
        //获取扩展名
        var ext = path.extname(realPath);
        ext = ext ? ext.slice(1) : 'unknown';
        //发送头信息
        response.writeHead(200, {'Content-Type': wbmime[ext] || dfmine});
        //尝试读取文件
        fs.createReadStream(realPath)
            .on('error', function(error) {
                response.writeHead(500, {'Content-Type': wbmime['txt']});
                response.write('服务器错误 ' + pathName);
                response.end();
            })
            .on('data', function(chunk) {
                response.write(chunk);
            })
            .on('end', function() {
                response.end();
            })
        ;
    });
});

var host = listen.split(':');
webox.listen(host[1], host[0], 1024);

console.log('服务已启动 http://' + listen);
