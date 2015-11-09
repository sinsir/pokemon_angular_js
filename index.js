var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var pdexApi = require('./server/pdex-api');
var app = express();
app.use(favicon('./favicon.ico'));
app.use(bodyParser.json());
app.use(express.static('src'));
//app.use('/lib', express.static('bower_components'));
app.use('/api', pdexApi);
var server = app.listen(1337, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Pdex running @ http://%s:%s', host, port);
});
