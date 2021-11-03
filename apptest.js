const mongoose = require ('mongoose')
const Article = require('./database/models/Article')

mongoose.connect('mongodb://localhost:27017/blog-test');



Article.findByIdAndUpdate("5f71a16c596d73271575bc69",
    
{title: "SpiderMan-Venom"},

(error,post)=> {
    console.log(error,post);
})


// Article.findById("5f71a2e550b1d727dfed8393",(error,articles)=>{
//     console.log(error,articles);
// })


// Article.find({

   

// }, (error,article) => {
//     console.log(error,article);
// })

// Article.create({

//     title:"SpiderMan",
//     intro:"Test d'introduction ",
//     content:"Critique sur le film Spiderman",

// },(error,post)=>{
//     console.log(error,post);

// })