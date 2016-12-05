/**
 * Created by mac on 12/5/16.
 */
var mysqlAdapter = require('sails-mysql');
var Waterline = require('waterline');

var orm = new Waterline();

var config = {
    adapters: {
        mysql: mysqlAdapter
    },

    connections: {
        mySQL: {
            adapter: 'mysql',
            host: 'us-cdbr-iron-east-04.cleardb.net',
            user: 'b2f823031ac8aa',
            password: '7231b3d0',
            database: 'heroku_3841ee16ff9e842'
        }
    },
    defaults: {
        migrate: 'alter'
    }

};

var fs = require('fs');
var path      = require("path");

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = require(path.join(__dirname, file));
        orm.loadCollection(model);
    });

module.exports = {waterline: orm, config: config};