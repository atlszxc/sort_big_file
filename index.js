"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path = require("path");
var targetPath = path.join(process.cwd(), "target.txt");
console.log(targetPath);
var stream = (0, fs_1.createReadStream)(targetPath, 'utf-8');
stream.on('data', function (chunk) {
    console.log('zxc', chunk);
});
stream.close();
