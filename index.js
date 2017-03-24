// Import packages
const Koa = require('koa');
const blog = require('./router');
const app = new Koa();
const static = require('koa-static');
app.use(static('public'));
app.use(blog.routes());
app.listen(3000);