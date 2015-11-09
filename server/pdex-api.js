var express = require('express');
var data = require('./data');
var router = express.Router();

router.get('/', function (request, response) {
    data.pokedex.list(function (err, pokemon) {
        if (err) {
            response.sendStatus(500);
        }
        else {
            response.send(pokemon);
        }
    });
});

router.get('/:number', function (request, response) {
    data.pokedex.get(request.params.number, function (err, pokemon) {
        if (err) {
            response.sendStatus(500);
        }
        else if (!pokemon) {
            response.sendStatus(404);
        }
        else {
            response.send(pokemon);
        }
    });
});

router.post('/', function (request, response) {
    data.pokedex.add(request.body, function (err) {
        if (err) {
            response.sendStatus(500);
        }
        else {
            response.sendStatus(201);
        }
    });
});

router.put('/:number', function (request, response) {
    data.pokedex.update(request.body, function (err) {
        if (err) {
            response.sendStatus(500);
        }
        else {
            response.sendStatus(201);
        }
    });
});

module.exports = router;
