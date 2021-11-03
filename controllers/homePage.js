const Post = require ("../database/models/Article")

module.exports =  async (req,res) => {
    
    const post = await Post.find({})
    
    // console.log(req.session);

    res.render("index", { post })
}
