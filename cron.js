const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
mongoose.connect('mongodb://bludb2:RWPpgqlyS11lepSeV1mjBU22vn3tKB54@178.128.50.196:27017/bludb');
const request = require('request');
const Asset = mongoose.model("assets", new mongoose.Schema({
    "_id": Number,
    "asset_name": String,
    "asset_symbol": String
}, {
    minimize: false
}))
const ChartData = mongoose.model("charts", new mongoose.Schema({
    "year": Number,
    "month": Number,
    "day": Number,
    "hour": Number,
    "cid": Number,
    "data": {
        "from": String,
        "to": String,
        "value": Number
    }
}, {
    minimize: false
}))
var CronJob = require('cron').CronJob;
new CronJob('0 0 * * * *', function () {
    var time = new Date()
    Asset.find(function (err, assets) {
        if (err) {
            throw err
        }
        assets.forEach(function (asset) {
            if (asset.asset_symbol == "BTC" || asset.asset_symbol == "USDT") {
                if (asset.asset_symbol == "BTC") {
                    request('https://api.binance.com/api/v3/ticker/price?symbol=' + asset.asset_symbol + "USDT", {
                        json: true
                    }, (err, res, body) => {
                        new ChartData({
                            "year": time.getFullYear(),
                            "month": time.getMonth(),
                            "day": time.getDate(),
                            "hour": time.getHours(),
                            "cid": asset._id,
                            "data": {
                                "from": asset.asset_symbol,
                                "to": "USDT",
                                "value": body.price
                            }
                        }).save()
                    });
                } else {
                    new ChartData({
                        "year": time.getFullYear(),
                        "month": time.getMonth(),
                        "day": time.getDate(),
                        "hour": time.getHours(),
                        "cid": asset._id,
                        "data": {
                            "from": "USDT",
                            "to": "USDT",
                            "value": 1
                        }
                    }).save()
                }
            } else {
                request('https://api.binance.com/api/v3/ticker/price?symbol=' + asset.asset_symbol + "BTC", {
                    json: true
                }, (err, res, body) => {
                    new ChartData({
                        "year": time.getFullYear(),
                        "month": time.getMonth(),
                        "day": time.getDate(),
                        "hour": time.getHours(),
                        "cid": asset._id,
                        "data": {
                            "from": asset.asset_symbol,
                            "to": "BTC",
                            "value": body.price
                        }
                    }).save()
                });
            }
        })
    })

}, null, true, 'UTC');