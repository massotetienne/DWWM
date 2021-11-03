const path = require('path')
const Post = require ("../database/models/Article")


module.exports = ( req, res ) => {

    console.log(req.body)
    const { image } = req.files

    // console.log(image)

    const uploadFile = path.resolve(__dirname,'..', 'public/articles', image.name)

    image.mv(uploadFile, (error)=>{
        Post.create(
            {
                ...req.body,
                image:`/articles/${image.name}`
            }
            , (error,post) => {
            res.redirect('/')
    
        })

    })
}