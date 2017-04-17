const DB = require('./model');
const api = require('./api');
const Router = require('koa-router');
const marked = require('marked');
module.exports = blog;

/**
 * 啦啦啦
 * 啦啦啦
 *   {
 *       urlbase: '/blog',
 *       apiurl:  '/api/blog',
 *       title:  'Koa Tiny Blog',
 *       views:  {
 *            manager: 'manager.html',
 *            editor: 'editor.html',
 *            manager: 'manager.html',
 *            editor: 'editor.html',
 *   }
 * @param {Object} newconf 
 */
function blog(newconf) {

    const router = new Router();
    const config = {
        urlbase: newconf.urlbase ? newconf.urlbase : '/blog',
        apiurl: newconf.apiurl ? newconf.apiurl : '/api/blog',
        title: newconf.title ? newconf.title : 'Koa Tiny Blog',
        views: newconf.views ? newconf.views : {
            index: 'blog.html',
            article: 'article.html',
            manager: 'manager.html',
            editor: 'editor.html',
        },
        datebase: newconf.database,
        perpage: newconf.perpage ? newconf.perpage : 20
    }

    const db = new DB(config.datebase);

    router.use('/api', api(config, db));


    // Add midware : Categories and Tags
    router.use(async(ctx, next) => {
        ctx.cates = await db.Category.findAll();
        ctx.tags = await db.Tag.findAll();
        await next();
    })

    // Article list
    router.get('/', async ctx => {
        let page = parseInt(ctx.query.page);
        if (!page) { page = 1; }
        let result = await db.Article.findAndCountAll({
            order: 'createdAt DESC',
            include: [db.Category, db.Tag],
            offset: (page - 1) * config.perpage,
            limit: config.perpage
        });
        ctx.body = await ctx.render(config.views.index, {
            title: config.title,
            articles: result.rows,
            pages: Math.ceil(result.count / config.perpage),
            cates: ctx.cates,
            tags: ctx.tags,
            config: config
        });
    });

    // Article list of a tag
    router.get('/tag/:id', async ctx => {
        let page = parseInt(ctx.query.page);
        if (!page) { page = 1; }
        let tag = await db.Tag.findById(ctx.params.id);
        if (!tag) { ctx.redirect(config.urlbase); return; }
        let num = await tag.countArticles()
        let articles = await tag.getArticles({
            include: [{ model: db.Tag }],
            order: 'article.createdAt DESC',
            offset: (page - 1) * config.perpage,
            limit: config.perpage
        });
        ctx.body = await ctx.render(config.views.index, {
            title: tag.name,
            sub_title: 'Tag',
            articles: articles,
            pages: Math.ceil(num / config.perpage),
            cates: ctx.cates,
            tags: ctx.tags,
            config: config
        });
    });

    // Article list of a category
    router.get('/cate/:name', async ctx => {
        let page = parseInt(ctx.query.page);
        if (!page) { page = 1; }
        let cate = await db.Category.findOne({ where: { name: ctx.params.name } });
        if (!cate) { ctx.redirect(config.urlbase); return; }
        let result = await db.Article.findAndCountAll({
            include: [db.Category, db.Tag],
            where: { categoryId: cate.id },
            offset: (page - 1) * config.perpage,
            limit: config.perpage
        });
        ctx.body = await ctx.render(config.views.index, {
            title: cate.title,
            sub_title: 'Category',
            articles: result.rows,
            pages: Math.ceil(result.count / config.perpage),
            cates: ctx.cates,
            tags: ctx.tags,
            config: config
        });
    });

    // Article content page
    router.get('/articles/:id', async ctx => {
        let article = await db.Article.findOne({ where: { id: ctx.params.id } });
        if (!article) { ctx.redirect(config.urlbase); return; }
        ctx.body = await ctx.render(config.views.article, {
            article: article,
            article_content: marked(article.content),
            tags: ctx.tags,
            cates: ctx.cates,
            config: config
        });
    });

    // Blog editor
    router.get('/publish', async ctx => {
        ctx.body = await ctx.render(config.views.editor, { config: config });
    });


    // Blog Manager
    router.get('/manage', async ctx => {
        ctx.body = await ctx.render(config.views.manager, { config: config })

    });

    return router.routes();
}