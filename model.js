const Sequelize = require('sequelize')

module.exports = DB;

function DB(sequelize) {
    if (!sequelize) {
        sequelize = new Sequelize('blog', null, null, {
            dialect: 'sqlite',
            storage: 'blog.db'
        });
    }
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
    const BlogComment = sequelize.define('comment', {
        content: Sequelize.TEXT,
        uid: Sequelize.STRING,
        uname: Sequelize.STRING
    });
    //Build assosiation relationship between models
    Article.belongsTo(Category);
    BlogComment.belongsTo(Article);
    Article.belongsToMany(Tag, { through: 'article2tag' });
    Tag.belongsToMany(Article, { through: 'article2tag' });

    sequelize.sync();

    this.Article = Article;
    this.Tag = Tag;
    this.Category = Category;
    this.Comment = BlogComment;
    this.dbContext = sequelize;

}