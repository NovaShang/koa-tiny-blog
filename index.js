// Import packages
const Koa = require('koa');
const blog = require('./router');
const api = require('./api');
const app = new Koa();
const static = require('koa-static');
const Router = require('koa-router');
const render = co.wrap(swig({
    root: path.join(__dirname, 'views'),
    autoescape: true,
    cache: false,
    ext: 'html',
}));
const router = new Router();

router.use('/api/blog', api);
router.use('/blog', blog)

app.use(router.routes());

app.use(static('public'));
app.listen(3000);