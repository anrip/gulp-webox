#!/usr/bin/env node

// code from www.anrip.com

'use strict';

var path = require('path');
var http = require('http');
var url  = require('url');
var fs   = require('fs');

var wbmime = require('./wbmime');
var dfmine = 'application/octet-stream';

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

// parse config

var config = process.argv.slice(2);
var wbroot = config[1] || 'webroot';
var listen = config[0] ? config[0].split(':') : [];

listen[0] = listen[0] || '0.0.0.0';
listen[1] = listen[1] > 0 ? parseInt(listen[1]) : 80;

// create server

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

webox.on('error', function (e) {
    if(e.code == 'EADDRINUSE') {
        console.log('端口已被占用', listen[0], listen[1], '\n');
        console.log('尝试新的端口', listen[0], ++listen[1]);
        webox.listen(listen[1], listen[0], 1024);
    }
});

webox.on('listening', function () {
    var host = listen[0] === '0.0.0.0' ? '127.0.0.1' : listen[0];
    console.log('服务启动成功', 'http://' + host + ':' + listen[1], '\n');
});

// start server

webox.listen(listen[1], listen[0], 1024);
