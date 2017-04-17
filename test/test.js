// Import packages
const Koa = require('koa');
const blog = require('..')
const request = require('supertest')
const static = require('koa-static');
const Router = require('koa-router');
const swig = require('koa2-swig');
const path = require('path');

const app = new Koa();
app.use(static('./example/public'))
app.context.render = swig({
    root: './example/views',
    autoescape: true,
    cache: false,
    ext: 'html',
});

const router = new Router();
router.use('/blog', blog({}))
app.use(router.routes());

app.listen(3000);