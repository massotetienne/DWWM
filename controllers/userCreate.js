module.exports= (req,res) => { 
    
        


    res.render("register",{
        errors : req.flash('registerError'),
        data : req.flash ('data')[0]
    })
}