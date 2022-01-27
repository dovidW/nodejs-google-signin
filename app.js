const express = require('express')
const googleSignIn = require('./google-signin');

const app = express();

const session = require('express-session');

app.use(session({
    secret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


function forceSigned(req, res, next) {
    if (!req.session.user)
        res.redirect("/sign-in?returnUrl=" + encodeURIComponent(req.url));
    else
        next();
}

let admins = ['admin-myapp@gmail.com'];

function mustAdmin(req, res, next) {
    if (admins.includes(req.session.user.email))
        next();
    else
        res.sendStatus(403);
}

app.get('/sign-in', (req, res) => {
    if (!req.session.user)
        res.redirect(googleSignIn.createUrl(JSON.stringify({ returnUrl: req.query.returnUrl })));
    else if (req.query.returnUrl)
        res.redirect(req.query.returnUrl);
    else
        res.sendStatus(400);
});

app.get('/user-area', forceSigned, (req, res) => {
    res.send(`${JSON.stringify(req.session.user)}<br><a href="/admin">ניהול</a>`);
});

app.get('/admin', mustAdmin, (req, res) => {
    res.send('you are admin!');
});

app.get('/', (req, res) => {
    req.session.ifff = 456;
    res.send(`hello! <a href="/user-area">My Profile</a>`);
})

app.get('/google-callback', async function (req, res) {
    let data = await googleSignIn.getUser(req.query.code);
    if (!data)
        return res.sendStatus(500);
    req.session.user = { name: data.name, email: data.email };
    let state = JSON.parse(Buffer.from(req.query.state, 'base64').toString('utf-8'));
    if (state.returnUrl && /(^\/$|^\/[^\/])/.test(state.returnUrl))
        res.redirect(state.returnUrl);
    else res.json(state)
});

const port = process.env.port || 3000;
app.listen(port, () => console.log(`Server running at ${port}`));