module.exports = {
    generateQR: function (text, callback) {
        callback(qr.image(text, {
            type: 'png',
            ec_level: 'H',
            size: 10,
            margin: 1
        }))
    },
    api_asset: function (uid, assetid, callback) {
        model.User.findById(uid, function (err, user) {
            model.Transactions.find({
                uid: uid,
                cid: assetid
            }, function (err, transactions) {
                model.ChartData.find({
                    year: new Date().getUTCFullYear(),
                    month: new Date().getUTCMonth(),
                    day: new Date().getUTCDate(),
                    hour: new Date().getUTCHours(),
                    cid: {
                        $in: [0, assetid]
                    }
                }, {}, {
                    sort: {
                        hour: 1
                    }
                }, function (err, chart) {
                    model.Deposit.find({
                        uid: uid,
                        cid: assetid
                    }, function (err, addy) {
                        if (addy.length == 0) {
                            model.Asset.findById(assetid, function (err, asset) {
                                getdeposit(asset.asset_symbol, function (address) {
                                    new model.Deposit({
                                        address: address.address,
                                        uid: uid,
                                        cid: assetid
                                    }).save(function (
                                        err, data
                                    ) {
                                        if (assetid == 0) {
                                            callback({
                                                info: user.assets[assetid],
                                                trans: transactions,
                                                deposit: data,
                                                price: chart[0].data,
                                                btcprice: chart[0].data.value
                                            })
                                        } else {
                                            callback({
                                                info: user.assets[assetid],
                                                trans: transactions,
                                                deposit: data,
                                                price: chart[1].data,
                                                btcprice: chart[0].data.value
                                            })
                                        }

                                    })

                                })
                            })
                        } else {
                            if (assetid == 0) {
                                callback({
                                    info: user.assets[assetid],
                                    trans: transactions,
                                    deposit: addy,
                                    price: chart[0].data,
                                    btcprice: chart[0].data.value
                                })
                            } else {
                                callback({
                                    info: user.assets[assetid],
                                    trans: transactions,
                                    deposit: addy,
                                    price: chart[1].data,
                                    btcprice: chart[0].data.value
                                })
                            }
                        }
                    })
                })
            })
        })
    },
    api_dashboard: function (uid, callback) {
        model.ChartData.find({
            "year": new Date().getUTCFullYear(),
            "month": new Date().getUTCMonth(),
            "day": new Date().getUTCDate() - 1,
        }, {}, {
            sort: {
                hour: 1
            }
        }, function (err, data) {
            model.User.findById(uid, function (err, user) {
                callback({
                    chart: data,
                    asset: user.assets
                })
            })
        })
    },
    api_profile: function (uid, callback) {
        model.User.findById(uid, function (err, user) {
            delete user.password
            delete user.twofa
            callback(user)
        })
    },
    api_settings: function (uid, callback) {
        model.User.findById(uid, function (err, user) {
            delete user.password
            delete user.asset
            callback(user)
        })
    },
    api_verifyemail: function (code, callback) {
        model.User.findOne({
            email_code: code
        }, function (err, result) {
            if (result) {
                result.email_conf = true
                result.save(function (err, data) {
                    callback(true)
                })
            } else {
                callback(false)
            }
        })
    },
    post_login: function (req, body, callback) {
        model.User.findOne({
            email: body.email
        }, function (err, user) {
            if (user != null && user.password == body.pass) {
                if (user.email_conf) {
                    if (user.twofa.enabled) {
                        if (speakeasy.totp.verify({
                                secret: user.twofa.secret,
                                encoding: 'base32',
                                token: body.twofa,
                                window: 6
                            })) {
                            req.session.logged = true
                            req.session._id = user._id
                            req.session.type = user.account_type
                            callback({
                                success: true,
                                message: "Logged in successfully. Redirecting..."
                            })
                        } else {
                            callback({
                                success: false,
                                message: "2FA code is incorrect."
                            })
                        }
                    } else {
                        req.session.logged = true
                        req.session._id = user._id 
                        req.session.type = user.account_type
                        callback({
                            success: true,
                            message: "Logged in successfully. Redirecting..."
                        })
                    }
                } else {
                    callback({
                        success: false,
                        message: "Your account is unconfirmed. Please check your SPAM folder. If you cannot see the email after 30 minutes, please contact support@blucloud.io"
                    })
                }
            } else {
                callback({
                    success: false,
                    message: "Either username or password is incorrect"
                })
            }
        });
    },
    post_register: function (body, callback) {
        var twofa = speakeasy.generateSecret({
            length: 32
        })
        var client = new model.User({
            "account_type": 0,
            "email": body.email,
            "fname": body.fname,
            "lname": body.lname,
            "password": body.pass,
            "status": 0,
            "assets": newAssets,
            "email_conf": false,
            "email_code": randomstring.generate(64),
            "country": body.country,
            "birthdate": body.bday,
            "newsletter": {
                "annoucement": body.ann,
                "news": body.news,
                "stories": body.stories
            },
            "emergency": "",
            "twofa": {
                "enabled": false,
                "secret": twofa.base32,
                "otpauth": twofa.otpauth_url
            }
        })
        if (body.cpass == body.pass) {
            if (body.email == body.cemail) {
                client.save(function (err, data) {
                    if (err) {
                        console.log(err)
                        callback({
                            success: false,
                            message: "Email has already been taken."
                        })
                    } else {
                        callback({
                            success: true,
                            message: "Registered. Please check your email address for confirmation."
                        })
                    }
                })
            } else {
                callback({
                    success: false,
                    message: "Email address does not match."
                })
            }
        } else {
            callback({
                success: false,
                message: "Password does not match."
            })
        }
    },
    post_settings: function (uid, body, callback) {
        model.User.findById(uid, function (err, user) {
            if (user != null) {
                user.fname = body.fname
                body.lname = body.lname
                user.email = body.email
                user.country = body.country
                user.birthdate = body.bday
                user.twofa.enabled = body.twofa == "on" ? true : false
                user.save(function (err, data) {
                    if (!err) {
                        callback({
                            success: true,
                            message: "You have updated your profile."
                        })
                    } else {
                        callback({
                            success: false,
                            message: err
                        })
                    }
                })
            } else {
                callback({
                    success: false,
                    message: "An error occured."
                })
            }
        })
    },
    post_password: function (uid, body, callback) {
        model.User.findById(uid, function (err, user) {
            if (user.password == body.current) {
                if (body.npass != "") {
                    if (body.npass == body.cnpass) {
                        user.password = body.npass
                        user.save(function (err, data) {
                            callback({
                                success: true,
                                message: "You have updated your profile."
                            })
                        })
                    } else {
                        callback({
                            success: false,
                            message: "Your new password doesnt match."
                        })
                    }
                } else {
                    callback({
                        success: false,
                        message: "You cannot submit an empty password."
                    })
                }
            } else {
                callback({
                    success: false,
                    message: "Your current password is incorrect."
                })
            }
        })
    },
    post_twofa: function (uid, body, callback) {
        model.User.findById(uid, function (err, user) {
            if (speakeasy.totp.verify({
                    secret: user.twofa.secret,
                    encoding: 'base32',
                    token: body.twofa,
                    window: 6
                })) {
                user.twofa.enabled = true
                user.save(function (err, data) {
                    callback({
                        success: true,
                        message: "2FA successfully enabled."
                    })
                })
            } else {
                callback({
                    success: false,
                    message: "2FA Code is incorrect."
                })
            }

        })
    },
    post_disable2fa: function (uid, body, callback) {
        model.User.findById(uid, function (err, user) {
            if (speakeasy.totp.verify({
                    secret: user.twofa.secret,
                    encoding: 'base32',
                    token: body.twofa,
                    window: 6
                })) {
                user.twofa.enabled = false
                user.save(function (err, data) {
                    callback({
                        success: true,
                        message: "2FA successfully disabled."
                    })
                })
            } else {
                callback({
                    success: false,
                    message: "2FA Code is incorrect."
                })
            }

        })
    },
    post_deposit: function (body, callback) {
        model.Deposit.find({
            address: body.address
        }, function (err, data) {
            if (data.length > 0) {
                new model.Transactions({
                    "cid": data[0].cid,
                    "uid": data[0].uid,
                    "txid": body.txn_id,
                    "to_address": body.address,
                    "type": "Deposit",
                    "status": 1,
                    "timestamp": Math.round((new Date()).getTime() / 1000),
                    "fee": body.fee,
                    "value": parseFloat(body.amount)
                }).save(function (err, result) {
                    if (err) throw err;
                    model.User.findById(data[0].uid, function (err, user) {
                        user.assets[data[0].cid].balance = parseFloat(body.amount) + parseFloat(user.assets[data[0].cid].balance.value)
                        user.save(function (err, result) {
                            callback(true)
                        })
                    })
                })
            } else {
                callback(true)
            }
        })
    }
};
var model = require('./models');
var Coinpayments = require('coinpayments');
var randomstring = require("randomstring");
var qr = require('qr-image');
var speakeasy = require('speakeasy');
var client = new Coinpayments({
    key: "e267d6219c83afe66ab114964ff04958472d280baceeb54d0580d7689655317d",
    secret: "826e670E9e011EDE02A6d746819Ea80034c2772D6c3e12F7fE4599c754b938e7"
});
var newAssets = [{
    "asset_id": 0,
    "asset_name": "Bitcoin",
    "asset_symbol": "BTC",
    "balance": 0.0
}, {
    "asset_id": 1,
    "asset_name": "Ethereum",
    "asset_symbol": "ETH",
    "balance": 0.0
}, {
    "asset_id": 2,
    "asset_name": "Ripple",
    "asset_symbol": "XRP",
    "balance": 0.0
}, {
    "asset_id": 3,
    "asset_name": "Bitcoin Cash",
    "asset_symbol": "BCC",
    "balance": 0.0
}, {
    "asset_id": 4,
    "asset_name": "EOSCoin",
    "asset_symbol": "EOS",
    "balance": 0.0
}, {
    "asset_id": 5,
    "asset_name": "Stellar",
    "asset_symbol": "XLM",
    "balance": 0.0
}, {
    "asset_id": 6,
    "asset_name": "Litecoin",
    "asset_symbol": "LTC",
    "balance": 0.0
}, {
    "asset_id": 7,
    "asset_name": "Cardano",
    "asset_symbol": "ADA",
    "balance": 0.0
}, {
    "asset_id": 8,
    "asset_name": "MIOTA",
    "asset_symbol": "IOTA",
    "balance": 0.0
}, {
    "asset_id": 9,
    "asset_name": "Tether",
    "asset_symbol": "USDT",
    "balance": 0.0
}, {
    "asset_id": 10.0,
    "asset_name": "Tronix",
    "asset_symbol": "TRX",
    "balance": 0.0
}, {
    "asset_id": 11,
    "asset_name": "Monero",
    "asset_symbol": "XMR",
    "balance": 0.0
}, {
    "asset_id": 12,
    "asset_name": "Neo",
    "asset_symbol": "NEO",
    "balance": 0.0
}, {
    "asset_id": 13,
    "asset_name": "Dash",
    "asset_symbol": "DASH",
    "balance": 0.0
}, {
    "asset_id": 14,
    "asset_name": "Ethereum Classic",
    "asset_symbol": "ETC",
    "balance": 0.0
}, {
    "asset_id": 15,
    "asset_name": "Nem",
    "asset_symbol": "XEM",
    "balance": 0.0
}, {
    "asset_id": 16,
    "asset_name": "Tezos",
    "asset_symbol": "XTZ",
    "balance": 0.0
}, {
    "asset_id": 17,
    "asset_name": "Binance Coin",
    "asset_symbol": "BNB",
    "balance": 0.0
}, {
    "asset_id": 18,
    "asset_name": "VeChain",
    "asset_symbol": "VEN",
    "balance": 0.0

}, {
    "asset_id": 19,
    "asset_name": "OmiseGO",
    "asset_symbol": "OMG",
    "balance": 0.0
}, {
    "asset_id": 20.0,
    "asset_name": "Zcash",
    "asset_symbol": "ZEC",
    "balance": 0.0
}]

function getdeposit(coin, cb) {
    client.getCallbackAddress(coin, function (err, response) {
        cb(response)
    })
}