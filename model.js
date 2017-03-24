const Sequelize = require('sequelize')

const sequelize = new Sequelize('blog', null, null, {
    dialect: 'sqlite',
    storage: 'blog.db'
});

//Define data models
const Article = sequelize.define('article', {
    title: Sequelize.TEXT,
    summary: Sequelize.TEXT,
    content: Sequelize.TEXT,
});
const Tag = sequelize.define('tag', {
    name: Sequelize.STRING
});
const Category = sequelize.define('category', {
    name: Sequelize.STRING,
    title: Sequelize.STRING
});

//Build assosiation relationship between models
Article.belongsTo(Category);
Article.belongsToMany(Tag, { through: 'article2tag' });
Tag.belongsToMany(Article, { through: 'article2tag' });

exports.Article = Article;
exports.Tag = Tag;
exports.Category = Category;
exports.dbContext = sequelize;