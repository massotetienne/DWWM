const Article = require('../database/models/Article')

module.exports = async (req, res) => {
    const q = req.params.id
    const articleID = await Article.findById(q)
    console.log(articleID)

    res.render('article/edit', {
        articleID: articleID
    })
}