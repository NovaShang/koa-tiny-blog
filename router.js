const db = require('./model'),
    Router = require('koa-router'),
    swig = require('koa-swig'),
    path = require('path'),
    co = require('co'),
    bodyparser = require('koa-bodyparser'),
    marked = require('marked');


const blog = new Router();
module.exports = blog;
const render = co.wrap(swig({
    root: path.join(__dirname, 'views'),
    autoescape: true,
    cache: false,
    ext: 'html',
}));

const perpage = 20;

blog.use(bodyparser());

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

// Article page
blog.get('/articles/:id', async ctx => {
    let article = await db.Article.findOne({ where: { id: ctx.params.id } });
    if (!article) { ctx.redirect('/'); return; }
    ctx.body = await render('article.html', {
        article: article,
        article_content: marked(article.content),
        tags: ctx.tags,
        cates: ctx.cates
    });
});

// Blog editor
blog.get('/publish', async ctx => {
    ctx.body = await render('editor.html');
});

blog.post('/api/articles', async ctx => {
    if (!ctx.request.body.tags) { ctx.body = { result: 'failed', message: 'No Tags' }; return; }
    var tags = (await db.Tag.findAll()).filter(x => ctx.request.body.tags.some(y => y.name));
    var cate = await db.Category.findOne({ where: { name: ctx.request.body.cate } });
    if (!cate) { ctx.body = { result: 'failed', message: 'Invalid Category' }; return; }
    var article = await db.Article.create({
        title: ctx.request.body.title,
        summary: ctx.request.body.summary,
        content: ctx.request.body.content
    });
    article.setCategory(cate);
    article.setTags(tags);
    ctx.body = { result: 'success', url: 'articles/' + article.id };
});

blog.get('/api/tags', ctx => {
    ctx.body = ctx.tags;
});

blog.post('/api/tags', async ctx => {
    if (!ctx.request.body.name) { ctx.body = { result: 'failed', message: 'Invalid tag name' }; return; }
    let tag = await db.Tag.create({
        name: ctx.request.body.name,
    });
    ctx.body = { result: 'success', tag: tag };
});

blog.get('/api/categories', ctx => {
    ctx.body = ctx.cates;
});

blog.post('/api/categories', async ctx => {
    if (!(ctx.request.body.name && ctx.request.body.title)) { ctx.body = { result: 'failed', message: 'Invalid category' }; return; }
    let cate = await db.Category.create({
        name: ctx.request.body.name,
        title: ctx.request.body.title
    });
    ctx.body = { result: 'success', category: cate };
});