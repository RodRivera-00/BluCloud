const express = require('express')
const app = express()
var session = require('express-session')
var qs = require('querystring');
var functions = require('./app/functions');
//Express
app.use(express.static("public"));
app.use(session({
    secret: 'YeoninTheGreat'
}))

app.get('/', function (req, res) {
    res.sendFile('sites/index.html', {
        root: __dirname
    })
})

app.get('/login', function (req, res) {
    if (req.session.logged) {
        res.redirect('/dashboard')
    } else {
        res.sendFile('sites/login.html', {
            root: __dirname
        })
    }
})

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/wallet')
})

app.get('/register', function (req, res) {
    if (req.session.logged) {
        res.redirect('/dashboard')
    } else {
        res.sendFile('sites/register.html', {
            root: __dirname
        })
    }
})
app.get('/wallet', function (req, res) {
    if (req.session.logged) {
        res.redirect('/dashboard')
    } else {
        res.sendFile('sites/wallet.html', {
            root: __dirname
        })
    }
})

app.get('/dashboard', function (req, res) {
    if (!req.session.logged) {
        req.session.destroy();
        res.redirect('/wallet')
    } else {
        console.log(req.session.type)
        if(req.session.type == 1){
            res.redirect('/admin/')
        }else{
            res.sendFile('sites/dashboard/maindashboard.html', {
                root: __dirname
            })
        }
        
    }
})
app.get('/settings', function (req, res) {
    if (!req.session.logged) {
        req.session.destroy();
        res.redirect('/wallet')
    } else {
        res.sendFile('sites/dashboard/profile.html', {
            root: __dirname
        })
    }

})
app.get('/transhistory', function (req, res) {
    if (!req.session.logged) {
        req.session.destroy();
        res.redirect('/wallet')
    } else {
        res.sendFile('sites/dashboard/transhistory.html', {
            root: __dirname
        })
    }

})
app.get('/assets/:id', function (req, res) {
    if (!req.session.logged) {
        req.session.destroy();
        res.redirect('/wallet')
    } else {
        res.sendFile('sites/dashboard/asset.html', {
            root: __dirname
        })
    }

})
app.get('/qr/:text', function (req, res) {
    functions.generateQR(req.params.text, function (qrcode) {
        res.setHeader('Content-type', 'image/png');
        qrcode.pipe(res);
    })
})
app.get('/qr/secret/:text', function (req, res) {
    functions.generateQR("otpauth://totp/BluCloud?secret=" + req.params.text, function (qrcode) {
        res.setHeader('Content-type', 'image/png');
        qrcode.pipe(res);
    })
})
//Admin Dashboard
app.get('/admin', function (req, res) {
    if(req.session.logged && req.session.type == 1){
        res.sendFile('sites/admin/admin1.html', {
            root: __dirname
        })
    }else{
        req.session.destroy();
        res.redirect('/wallet')
    }
})
app.get('/admin/user/:id', function (req, res) {
    if(req.session.logged && req.session.type == 1){
        res.sendFile('sites/admin/admin2.html', {
            root: __dirname
        })
    }else{
        req.session.destroy();
        res.redirect('/wallet')
    }
})
//API
app.get('/api/assets/:id', function (req, res) {
    if (req.session.logged) {
        functions.api_asset(req.session._id, req.params.id, function (data) {
            res.send(data)
        })
    } else {
        res.send({
            success: false,
            message: "You are not logged in!"
        })
    }
})

app.get('/api/dashboard', function (req, res) {
    if (req.session.logged) {
        functions.api_dashboard(req.session._id, function (data) {
            res.send(data)
        })
    } else {
        res.send({
            success: false,
            message: "You are not logged in!"
        })
    }
})

app.get('/api/profile', function (req, res) {
    if (req.session.logged) {
        functions.api_profile(req.session._id, function (data) {
            res.send(data)
        })
    } else {
        res.send({
            success: false,
            message: "You are not logged in!"
        })
    }
})

app.get('/api/settings', function (req, res) {
    if (req.session.logged) {
        functions.api_settings(req.session._id, function (data) {
            res.send(data)
        })
    } else {
        res.send({
            success: false,
            message: "You are not logged in!"
        })
    }
})

app.get('/api/verify/:code', function (req, res) {
    if (!req.session.logged) {
        functions.api_verifyemail(req.params.code, function (result) {
            if (result) {
                res.redirect('/wallet')
            } else {
                res.send({
                    success: false,
                    message: "Verification code not found."
                })
            }
        })
    } else {
        res.redirect("/dashboard")
    }
})

//POST
app.post('/login', function (req, res) {
    if (!req.session.logged) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            body = qs.parse(body)
            functions.post_login(req, body, function (result) {
                res.send(result)
            })
        });
    }
})
app.post('/register', function (req, res) {
    if (!req.session.logged) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            body = qs.parse(body)
            body.ann = body.ann == "on" ? true : false
            body.news = body.news == "on" ? true : false
            body.stories = body.stories == "on" ? true : false
            functions.post_register(body, function (result) {
                res.send(result)
            })
        });
    }
})
app.post('/settings', function (req, res) {
    if (req.session.logged) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            body = qs.parse(body)
            functions.post_settings(req.session._id, body, function (result) {
                res.send(result)
            })
        });
    }
})
app.post('/settings/password', function (req, res) {
    if (req.session.logged) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            body = qs.parse(body)
            functions.post_password(req.session._id, body, function (result) {
                res.send(result)
            })
        });
    }
})
app.post('/settings/twofa', function (req, res) {
    if (req.session.logged) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            body = qs.parse(body)
            console.log(body)
            functions.post_twofa(req.session._id, body, function (result) {
                res.send(result)
            })
        });
    }
})
app.post('/settings/twofa/disable', function (req, res) {
    if (req.session.logged) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            body = qs.parse(body)
            functions.post_disable2fa(req.session._id, body, function (result) {
                res.send(result)
            })
        });
    }
})
app.post('/api/wallet', function (req, res) {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        body = qs.parse(body)
        if (body.status == '100') {
            functions.post_deposit(body, function (result) {
                (result ? res.send("ok") : res.send("not ok"))
            })
        }
    });

})
app.use(function (req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.send({
            error: 'Not found'
        });
        return;
    }
    // respond with json
    if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        });
        return;
    }
    // default to plain-text. send()
    res.type('txt').send('Not found');
});
app.listen(80)