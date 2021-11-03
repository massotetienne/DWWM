module.exports = (req,res) =>{

    if(req.session.userId){
        return res.render("article/add")
    }

    res.redirect("/user/login")
}