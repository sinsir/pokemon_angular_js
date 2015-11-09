var fs = require('fs');
var path = require('path');
var async = require('async');
var request = require('request');
var utf8 = { encoding: 'utf8' };

var dataPath = path.join('server','data');

var PokedexData = (function () {
    function PokedexData() {
    }
    PokedexData.prototype.list = function (listCb) {
        fs.readdir(dataPath, function (err, items) {
            if (err) {
                listCb(err);
                return;
            }
            async.map(items, function (item, cb) {
                var dataFile = path.join(dataPath, item);
                fs.readFile(dataFile, utf8, function (err, json) {
                    var pokemon = JSON.parse(json);
                    cb(null, pokemon);
                });
            }, function (err, pokedex) {
                if (err) {
                    listCb(err);
                }
                else {
                    listCb(null, pokedex.filter(function (p) { return !!p; }));
                }
            });
        });
    };
    PokedexData.prototype.get = function (number, getCb) {
        var dir = path.join(dataPath, number + ".json");
        fs.exists(dir, function (exists) {
            if (!exists) {
                getCb(null, null);
                return;
            }
            fs.readFile(dir, utf8, function (err, data) {
                if (err) {
                    getCb(err, null);
                    return;
                }
                try {
                    var pokemon = JSON.parse(data);
                    getCb(null, pokemon);
                }
                catch (e) {
                    getCb(e, null);
                }
            });
        });
    };
    PokedexData.prototype.createData = function (listCb) {
        var nums = [];
        for (var i = 1; i <= 151; i++) {
            nums.push(i);
        }
        async.map(nums, function (item, cb) {
            request('http://pokeapi.co/api/v1/pokemon/' + item + '/', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body);
                    var pokemon = {
                        number: item,
                        name: body.name,
                        types: body.types,
                        attack: body.attack,
                        defense: body.defense,
                        speed: body.speed,
                        specialAttack: body['sp_atk'],
                        specialDefense: body['sp_def'],
                        species: body.species,
                        weight: body.weight,
                        image: 'http://pokeapi.co/media/img/' + item + '.png',
                        caught: null
                    };
                    request('http://pokeapi.co' + body.descriptions[0]['resource_uri'], function (error, response, desc) {
                        if (!error && response.statusCode == 200) {
                            desc = JSON.parse(desc);
                            pokemon.description = desc.description;
                            var pokemonString = JSON.stringify(pokemon, null, 4);
                            var dir = path.join(dataPath, item + '.json');
                            fs.writeFile(dir, pokemonString);
                            cb(null, item);
                            console.log(item + ' is done!');
                        }
                    });
                }
            });
        }, function (err, pokedex) {
            if (err) {
                listCb(err);
            }
            else {
                listCb(null, []);
            }
        });
    };
    PokedexData.prototype.add = function (pokemon, addCb) {
        var dir = path.join(dataPath, pokemon.number);
        fs.mkdir(dir, function (err) {
            if (err) {
                return addCb(err);
            }
            fs.writeFile(path.join(dir, pokemon.number + ".json"), JSON.stringify(pokemon), function(err) {
                addCb(err);
            });
        });
    };
    PokedexData.prototype.update = function (pokemon, addCb) {
        var _this = this;
        var dir = path.join(dataPath, pokemon.number + ".json");
        fs.exists(dir, function (exists) {
            if (!exists) {
                _this.add(pokemon, addCb);
                return;
            }
            fs.writeFile(path.join(dir), JSON.stringify(pokemon), function (err) {
                addCb(err);
            });
        });
    };
    return PokedexData;
})();
exports.pokedex = new PokedexData();
