const express         = require('express');
const bodyParser      = require('body-parser');
const mongoose        = require('mongoose');
const exphbs          = require('express-handlebars');
const methodeOverride = require('method-override');
const path            = require('path');
const sharp           = require('sharp');
const dotenv          =require('dotenv').config()

// algolia
const mongooseAlgolia  = require ('mongoose-algolia');
const algoliasearch    = require ("algoliasearch")
const client           = algoliasearch('9HFENBYKRM', '1d92b3c916f7fa05ba5a903f920a972a');
const index            = client.initIndex('products')
// port
const port = 1987;

// upload image


const multer = require ("multer");
// const { default: algoliasearch } = require('algoliasearch');
const storage = multer.diskStorage({

    destination : function(req,file,cb){
        cb(null,'./public/uploads')
    },

    filename: function(req,file,cb){
        const ext = path.extname(file.originalname)
        const d   = Date.now()
        cb(null,file.originalname + '-' + d + ext)

    }
})





const upload = multer({ 
                        storage: storage,
                        limits: {
                            fieldSize: 1 * 2048 * 2048,
                            files: 1,
                        },


                        fileFilter: function (req, file , cb) {
                                if(
                                    file.mimetype === 'image/png'  || 
                                    file.mimetype === 'image/jpg'  ||
                                    file.mimetype === 'image/jpeg' || 
                                    file.mimetype === 'image/gif'  ||
                                    file.mimetype === 'image/webp'
                                ){
                                    cb(null,true)
                                }else
                                    cb(new Error('le fichier doit etre au format JPG,JPEG,PNG ou GIF .'))
                                                                          
                        }
})
// const upload = multer({ dest: 'uploads/'})

// express
const app = express();

// express static
app.use(express.static("public"));

// handlebars
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: 'hbs'
}));
app.set('view engine', 'hbs')

//override
app.use(methodeOverride('_method'));

// BodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));

// MongoDB

mongoose.connect("mongodb://localhost:27017/boutiqueGame", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const productSchema = new mongoose.Schema ({
    title: String,
    content: String,
    price: Number,
    category:{type:mongoose.Schema.Types.ObjectId, ref:"category"},

    cover:{
        name:String,
        originalName:String,
        path:String,
        urlSharp:String,
        createAt:Date
    }
});

const categorySchema = new mongoose.Schema({
    title : String
})

productSchema.plugin(mongooseAlgolia, {
    appId: "9HFENBYKRM",
    apiKey: "1d92b3c916f7fa05ba5a903f920a972a",
    indexName: 'products', //The name of the index in Algolia, you can also pass in a function
    selector: 'title category', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
    populate: {
      path: 'category',
      select: 'title',
    },
    defaults: {
      author: 'unknown',
    },
    mappings: {
      title: function(value) {
        return value
      },
    },
    virtuals: {
      whatever: function(doc) {
        return `Custom data ${doc.title}`
      },
    },
    debug: true, // Default: false -> If true operations are logged out in your console
  })

const Product = mongoose.model("product", productSchema)
const Category = mongoose.model("category", categorySchema)


// Routes
                           // ************************************
                           
app.route("/search")

    .get(async (req, res) => {

            // const objects = await Product.find()
            const objects = []
            // const objects = [
            //     {
            //       objectID: 1,
            //       name: "Foo"
            //     }
            //   ];

            index
            .saveObjects(objects)
            // .saveObjects(objects, { autoGenerateObjectIDIfNotExist: true })
            .then(({ objectIDs }) => {
                    console.log(objectIDs);
                    res.render('search')
                })
                .catch(err => {
                    console.log(err);
                });

    })
    .post((req, res) => {
        if (req.body.q) {
            index
                .search(req.body.q)
                .then(({ hits }) => {
                    console.log(hits);
                    res.render('search', {
                        results: hits
                    })
                })
                .catch(err => {
                    console.log(err);
                });
        } else {
            res.render('search')
        }
    })


                       // *******************************************


app.route("/category")
.get((req,res)=> {
    Category.find((err, category)=>{
        if(!err){
            res.render("category",{
                category:category
            })
        }else{
            res.send(err)
        }
    })
})

// =====================================================
.post((req,res)=>{
    const newCategory = new Category({
        title : req.body.title
    })
    newCategory.save(function(err){
        if(!err){
            res.send("Category save")
        }else{
            res.send(err)
        }
        
    })
})

// =====================================================


app.route("/")
    .get((req, res) => {
        
        Product
        .find()
        .populate("category")
        .exec(function (err, produit) {
            if (!err) {
                Category.find(function(err,category){
                    res.render("index", {
                        product: produit,
                        category:category
                })    
            })
        } else {
                res.send(err)
            }
        })
    })
// =====================================================

    .post( upload.single("cover"),(req, res) => {

        const file= req.file;
        console.log('Post Create')
        console.log(file);

        console.log(req.body)

        // .resize ({width : 300}) = .rezise (300) et la hauteur ce dimentionne automatiquement
        // .split('-').slice(0,-1).join('-') = permet de supprimer le .jpg .jpeg .gif etc ... et de rajouter une autre enxtention avec join('-') .webp par exemple
    

        sharp (file.path)
         .resize( 200) 
         .webp({ quality: 80})  
         .toFile('./public/uploads/web/' + file.originalname.split('.').slice(0,-1).join('.') + '.webp', (err,info) => { });

        const newProduct = new Product({

            title: req.body.title,
            content: req.body.content,
            price: req.body.price,
            category:req.body.category
        });
        if(file){
            newProduct.cover ={
                name:file.filename,
                originalName:file.originalname,
                path:file.path.replace("public",""),
                urlSharp : '/uploads/web/' + file.originalname.split('.').slice(0,-1).join('.') + ".webp",
                createAt:Date.now(),
        
            }
        }

        newProduct.save(function (err) {
            if (!err) {
                res.send("save ok")
            } else {
                res.send(err)
            }
        })
    })

// =====================================================

    .delete((req, res) => {
        Product.deleteMany(function (err) {
            if (!err) {
                res.send("all delete")
            } else {
                res.send(err)
            }
        })
    })

// =====================================================

// route édition

app.route("/:id")
    // Adventure.findOne({type:'iphone }, function (err,adventure) {});
    .get(function (req, res) {
        Product.findOne({
                _id: req.params.id
            },
            function (err, produit) {
                if (!err) {
                    res.render("edition", {
                        _id: produit._id,
                        title: produit.title,
                        content: produit.content,
                        price: produit.price
                    })
                } else {
                    res.send("err")
                }
            }
        )
    })

    .put(function (req, res) {
        Product.update(
            // condition
            {
                _id: req.params.id
            },
            // update
            {
                title: req.body.title,
                content: req.body.content,
                price: req.body.price
            },
            // option
            {
                multi: true
            },
            // exec
            function (err) {
                if (!err) {
                    res.send("Update OK!")
                } else {
                    res.send("err")
                }
            }
        )
    })

    .delete(function (req, res) {
        Product.deleteOne(
            {_id: req.params.id},
            function (err) {
                if (!err) {
                    res.send("product delete")
                } else {
                    res.send(err)
                }



            }
        )
    })
app.listen(1987, function () {
    console.log(`ecoute le port ${port}, lancé à : ${new Date().toLocaleString()}`);
})