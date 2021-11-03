const Article = require('../database/models/Article')
const path = require('path')
const fs = require('fs')


module.exports = async (req, res) => {

    const b = req.body
    const q = req.params.id
    const f = req.files

    console.log('Controller Form Edit !')
    console.log(b);
    console.log(f);

    if (f) {
        const {
            image
        } = req.files;
        const uploadFile = path.resolve('./public/articles', image.name);
        const article = await Article.findById(req.params.id);

        fs.unlink('./public/' + article.image, (err) => {
            if (err) console.log(err)
            console.log('Mon Image est supprimer !')
            image.mv(uploadFile, (error) => {

                Article.findByIdAndUpdate(q, {
                    ...req.body,
                    image: `/articles/${image.name}`
                }, (error, post) => {
                    if (err) console.log(err);
                    res.redirect('/')

                })
            })
        })
    } else {

        Article.findByIdAndUpdate(q, {
            title: b.title,
            content: b.content,
            author: b.author,

        }, (err, d) => {
            console.log(d)
            if (err) console.log(err)
            res.redirect('/articles/edit/' + q)
        })
    }
}