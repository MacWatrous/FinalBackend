/**
 * Created by mac on 12/5/16.
 */
var Waterline = require('waterline');

var User = Waterline.Collection.extend({
    identity: 'user',
    connection: 'mySQL',

    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true,
            required: true,
            unique: true,
            primaryKey: true
        },

        username: {
            type: 'string',
            required: true
        },

        cash: {
            type: 'string',
            required: true
        }
    }
});

module.exports = User;
