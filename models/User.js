/**
 * Created by mac on 12/5/16.
 */
var Waterline = require('Waterline');

var User = Waterline.Collection.extend({
    identity: 'user',
    connection: 'mySQL',

    attributes: {
        id: {
            type: 'int',
            required: true,
            unique: true
        },

        username: {
            type: 'string',
            required: true,
        },

        cash: {
            type: 'string',
            required: true
        }
    }
});

module.exports = User;
