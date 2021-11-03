const Article = require('../database/models/Article')
const fs = require('fs')
const path = require('path')

module.exports = async (req, res) => {
    const article = await Article.findById(req.params.id)

    console.log('Controller Delete Article')
    console.log(article)


    fs.unlink( './public/' + article.image , (err) => {
        if (err) console.log(err)
        console.log('Mon Image est supprimer !')
        // Method DeleteOne
        // Fonction de suppression de un Articles rechercher par son _id
        Article.deleteOne({
            // On va venir chercher parmis tout les _id celui égale à notre req.params (id recupéré dans l'URL)
            _id: req.params.id,
            // ici nous avons un callback err
        }, (err) => {
            // Si nous avons pas d'erreur alors on redirige
            if (!err) return res.redirect('/')
            // Sinon on renvoit l'err
            else res.send(err)
        })
    })

}