const User = require ('../database/models/User')

module.exports = (req, res, next) => {

    // console.log('Middle Auth')
    // console.log(req.session)
    // console.log('test')
    // connecte toi dans la base de donnée
    User.findById(req.session.userId, ( error, user ) => {

        // console.log('Middle Auth')
        // console.log(user)
        // console.log('test2')
        
        if (error || !user){
            return res.redirect('/')
        }  
        next()
    })
   

  
    // Vérifier le user 

    // Si il est dans la base de donnée 

    // Sinon tu le redirige
}