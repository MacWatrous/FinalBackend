/**
 * Created by mac on 12/5/16.
 */
var Waterline = require('waterline');

var Stocks = Waterline.Collection.extend({
    identity: 'stocks',
    connection: 'mySQL',

    attributes: {
        id: {
            type: 'integer',
            required: true,
            unique: true
        },
        stockTicker: {
            type: 'string',
            required: true,
        },
        purchaseDate: {
            type: 'date',
            required: true
        },
        purchasePrice: {
            type: 'string',
            required: true
        },
        purchaseAmount: {
            type: 'integer',
            required: true
        }
    }
});

module.exports = Stocks;
