const db = require('./model'),
    Router = require('koa-router'),
    swig = require('koa-swig'),
    path = require('path'),
    co = require('co');

const blog = new Router();
module.exports = blog;
const render = co.wrap(swig({
    root: path.join(__dirname, 'views'),
    autoescape: true,
    cache: false,
    ext: 'html',
}));

const perpage = 20;

blog.use(async(ctx, next) => {
    ctx.cates = await db.Category.findAll();
    ctx.tags = await db.Tag.findAll();
    await next();
})

blog.get('/', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let result = await db.Article.findAndCountAll({
        order: 'createdAt DESC',
        include: [db.Category, db.Tag],
        offset: (page - 1) * perpage,
        limit: perpage
    });
    ctx.body = await render('blog.html', {
        title: 'Koa Tiny Blog',
        sub_title: 'by Nova',
        articles: result.rows,
        pages: Math.ceil(result.count / perpage),
        cates: ctx.cates,
        tags: ctx.tags
    });
});

blog.get('/tag/:id', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let tag = await db.Tag.findById(ctx.params.id);
    if (!tag) { ctx.redirect('/'); return; }
    let num = await tag.countArticles()
    let articles = await tag.getArticles({
        include: [{ model: db.Tag }],
        order: 'article.createdAt DESC',
        offset: (page - 1) * perpage,
        limit: perpage
    });
    ctx.body = await render('blog.html', {
        title: tag.name,
        sub_title: 'Tag',
        articles: articles,
        pages: Math.ceil(num / perpage),
        cates: ctx.cates,
        tags: ctx.tags
    });
});

blog.get('/cate/:name', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let cate = await db.Category.findOne({ where: { name: ctx.params.name } });
    if (!cate) { ctx.redirect('/'); return; }
    let result = await db.Article.findAndCountAll({
        include: [db.Category, db.Tag],
        where: { categoryId: cate.id },
        offset: (page - 1) * perpage,
        limit: perpage
    });
    ctx.body = await render('blog.html', {
        title: cate.title,
        sub_title: 'Category',
        articles: result.rows,
        pages: Math.ceil(result.count / perpage),
        cates: ctx.cates,
        tags: ctx.tags
    });
});

// // Blog editor
// blog.get('/publish', function(request, response) {
//     response.render('blog/publish.html');
// });
// // Article page
// blog.get('/:id', function(request, response) {
//     Article.findOne({
//             where: { id: request.params.id }
//         })
//         .then(x => response.render('blog/article.html', {
//             article: x,
//             article_content: marked(x.content),
//             tags: request.tags,
//             cates: request.categories
//         }));
// });
// // Publish article
// blog.post('/api/publish', function(request, response) {
//     var article;
//     Promise.all([
//             Promise.all(
//                 request.body.tags.map(
//                     x => Tag.findOne({ where: { name: x } })
//                 )),
//             Promise.all([
//                 Article.create({
//                     title: request.body.title,
//                     summary: request.body.summary,
//                     content: request.body.content
//                 })
//                 .then(x => article = x),
//                 Category.findOne({
//                     where: { name: request.body.cate }
//                 })
//             ])
//             .then(
//                 x => article.setCategory(x[1]),
//                 x => response.json({
//                     result: "failed",
//                     message: x[0] + x[1]
//                 })),
//         ])
//         .then(x => article.setTags(x[0]),
//             x => response.json({
//                 result: "failed",
//                 message: x[0] + x[1]
//             }))
//         .then(() => response.json({
//             result: "success",
//             url: "/blog/" + article.id
//         }), x => response.json(x));
// });
// // Get tags
// blog.get('/api/tags', function(request, response) {
//     response.json(request.tags)
// });
// // Add a tag
// blog.post('/api/tags', function(request, response) {
//     Tag.create({ name: request.body.name })
//         .then(x => response.json({
//             result: "success",
//             url: ""
//         }), x => response.json(x));
// });
// // Get categories
// blog.get('/api/categories', function(request, response) {
//     response.json(request.Categories)
// });
// // Add a category
// blog.post('/api/categories', function(request, response) {
//     Category.create({
//             name: request.body.name,
//             title: request.body.title
//         })
//         .then(x => response.json({
//             result: "success",
//             url: ""
//         }), x => response.json(x));
// });