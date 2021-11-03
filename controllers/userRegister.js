const User = require ('../database/models/User')

module.exports = (req,res) => {
    User.create(
        req.body,(error,user) => {    
         
            if(error){

                const registerError = Object.keys(error.errors).map(key => error.errors[key].message)
              

                req.flash('registerError',registerError)
                req.flash('data', req.body)


              return res.redirect('/user/create')
            }

            res.redirect('/')
        }
    )
}                   