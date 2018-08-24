const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
mongoose.connect('mongodb://bludb2:RWPpgqlyS11lepSeV1mjBU22vn3tKB54@178.128.50.196:27017/bludb');

module.exports = {
    User: mongoose.model("clients", new mongoose.Schema({
        "account_type": Number,
        "email": {
            type: String,
            unique: true,
            required: true
        },
        "fname": String,
        "lname": String,
        "password": String,
        "status": Boolean,
        "assets": [{
            "asset_id": Number,
            "asset_name": String,
            "asset_symbol": String,
            "balance": SchemaTypes.Double,
        }],
        "email_conf": Boolean,
        "email_code": String,
        "country": String,
        "birthdate": String,
        "newsletter": {
            "annoucement": Boolean,
            "news": Boolean,
            "stories": Boolean
        },
        "emergency": String,
        "twofa": {
            "enabled": Boolean,
            "secret": String,
            "otpauth": String
        }
    })),
    Asset: mongoose.model("assets", new mongoose.Schema({
        "_id": Number,
        "asset_name": String,
        "asset_symbol": String
    }, {
        minimize: false
    })),
    ChartData: mongoose.model("charts", new mongoose.Schema({
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
    })),
    Deposit: mongoose.model("deposit", new mongoose.Schema({
        "address": String,
        "cid": Number,
        "uid": String
    }, {
        minimize: false
    })),
    Transactions: mongoose.model("transactions", new mongoose.Schema({
        "cid": Number,
        "uid": String,
        "txid": String,
        "to_address": String,
        "type": String,
        "status": Number,
        "timestamp": Number,
        "value": Number,
        "fee": Number
    }, {
        minimize: false
    }))
    
  };
