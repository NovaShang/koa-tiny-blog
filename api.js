const Router = require("koa-router");
const bodyparser = require('koa-bodyparser');

module.exports = api;

function api(config, db) {
    const router = new Router();

    router.get('/articles', async ctx => {
        ctx.body = await db.Article.findAll();
    });

    router.use(bodyparser());

    router.post('/articles', async ctx => {
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

    router.put('/articles', async ctx => {
        var article = await db.Article.findOne({
            where: { id: ctx.request.body.id }
        });
        if (!article) { ctx.body = { result: 'failed', message: 'Article Not Found!' }; return; }
        article.title = ctx.request.body.title;
        article.content = ctx.request.body.content;
        article.summary = ctx.request.body.summary;
        await article.save();
        ctx.body = { result: 'success', url: 'articles/' + article.id };
    });

    router.delete('/articles', async ctx => {
        var article = await db.Article.findOne({ where: { id: ctx.request.body.id } });
        if (!article) { ctx.body = { result: 'failed', message: 'Article Not Found!' }; return; }
        await article.remove();
        ctx.body = { result: 'success' };

    })

    router.get('/tags', async ctx => {
        ctx.body = await db.Tag.findAll();
    });

    router.post('/tags', async ctx => {
        if (!ctx.request.body.name) { ctx.body = { result: 'failed', message: 'Invalid tag name' }; return; }
        let tag = await db.Tag.create({
            name: ctx.request.body.name,
        });
        ctx.body = { result: 'success', tag: tag };
    });

    router.put('/tags', async ctx => {
        let tag = db.Tag.findOne({ where: { id: ctx.request.body.id } });
        if (!tag) { ctx.body = { result: 'failed', message: 'Tag Not Found!' }; return; }
        tag.name = ctx.request.body.name;
        await tag.save();
        ctx.body = { result: 'success' };
    });

    router.delete('api/tags', async ctx => {
        let tag = db.Tag.findOne({ where: { id: ctx.request.body.id } });
        if (!tag) { ctx.body = { result: 'failed', message: 'Tag Not Found!' }; return; }
        await tag.remove();
        ctx.body = { result: 'success' };
    })

    router.get('/categories', async ctx => {
        ctx.body = await db.Category.findAll();
    });

    router.post('/categories', async ctx => {
        if (!(ctx.request.body.name && ctx.request.body.title)) { ctx.body = { result: 'failed', message: 'Invalid category' }; return; }
        let cate = await db.Category.create({
            name: ctx.request.body.name,
            title: ctx.request.body.title
        });
        ctx.body = { result: 'success', category: cate };
    });

    router.put('/categories', async ctx => {
        let category = await db.Category.findOne({ where: { id: ctx.request.body.id } });
        if (!category) { ctx.body = { result: 'failed', message: 'Category Not Found!' }; return; }
        category.name = ctx.request.body.name;
        category.title = ctx.request.body.title;
        await category.save()
        ctx.body = { result: 'success', category: cate };
    });

    router.delete('/categories', async ctx => {
        let category = await db.Category.findOne({ where: { id: ctx.request.body.id } });
        if (!category) { ctx.body = { result: 'failed', message: 'Category Not Found!' }; return; }
        await category.remove()
        ctx.body = { result: 'success', category: cate };
    });

    return router.routes();

}