/*********************************************************************************
*  WEB322 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: __Md Habibor Rahman Hira_____ Student ID: __122646219__ Date: ___September 16th,2022_____________
*
*  Online (Cyclic) URL: https://nice-puce-rhinoceros-wig.cyclic.app/about
*
********************************************************************************/


var express = require("express");
var app = express();
var path = require("path");
var blog_service = require("./blog-service.js");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

var HTTP_PORT = process.env.PORT || 8080;

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
    cloud_name: 'dibosfbpv',
    api_key: '596446867237414',
    api_secret: '8rrc2JG0GqPY--nr3BuOJdFCCRc',
    secure: true
});

const upload = multer();


app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});
// app.post('/posts/add', upload.single("featureImage"), function (req, res, next) {
//     let streamUpload = (req) => {
//         return new Promise((resolve, reject) => {
//             let stream = cloudinary.uploader.upload_stream(
//                 (error, result) => {
//                     if (result) {
//                         resolve(result);
//                     } else {
//                         reject(error);
//                     }
//                 }
//             );

//             streamifier.createReadStream(req.file.buffer).pipe(stream);
//         });
//     };

//     async function upload(req) {
//         let result = await streamUpload(req);
//         console.log(result);
//         return result;
//     }

//     upload(req).then((uploaded) => {
//         req.body.featureImage = uploaded.url;

//         // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
//         res.redirect('/posts');
//     }).catch((err) => {
//         console.log(err);


//     });

// });


app.get("/posts", (req, res) => {
    blog_service.getAllPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.status(500).json({
            message: err
        });
    });
});

app.get("/post/:id", (req, res) => {
    blog_service.getPostById(req.params.id).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.status(500).json({
            message: err
        });
    });
});


app.get("/posts", (req, res) => {
    blog_service.getAllPosts().then((data) => {
        res.render("posts", {
            posts: data
        });
    }).catch((err) => {
        res.status(500).json({
            message: err
        });
    });
});



// app.post("/posts/add", (req, res) => {
//     blog_service.addPost(req.body).then((data) => {
//         res.redirect("/posts");
//     }).catch((err) => {
//         res.status(500).json({
//             message: err
//         });
//     });
// });

// app.get("/posts/edit/:id", (req, res) => {
//     blog_service.getPostById(req.params.id).then((data) => {
//         res.render("editPost", {
//             post: data
//         });
//     }).catch((err) => {
//         res.status(500).json({
//             message: err
//         });
//     });
// });

// app.post("/posts/edit/:id", (req, res) => {
//     blog_service.updatePost(req.body).then
//         (data => {
//             res.redirect("/posts");
//         }).catch((err) => {
//             res.status(500).json({
//                 message: err
//             });
//         });
// });

app.get("/posts/category/:category", (req, res) => {
    blog_service.getPostsByCategory(req.params.category).then((data) => {
        res.render("posts", {
            posts: data
        });
    }).catch((err) => {
        res.status(500).json({
            message: err
        });
    });
});

app.get("/posts/date/:date", (req, res) => {
    blog_service.getPostsByMinDate(req.params.date).then((data) => {
        res.render("posts", {
            posts: data
        });
    }).catch((err) => {
        res.status(500).json({
            message: err
        });
    });
});



app.get("/posts/:id", (req, res) => {
    blog_service.getPostById(req.params.id).then((data) => {
        res.render("post", {
            post: data
        });
    }).catch((err) => {
        res.status(500).json({
            message: err
        });
    });
});






function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
    return new Promise((res, req) => {
        blog_service.initialize().then((data) => {
            console.log(data)
        }).catch((err) => {
            console.log(err);
        });
    });
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
    res.redirect("/about");
});



app.use(express.static('public')); 

// setup another route to listen on /about
app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});




app.get("/categories", (req, res) => {
    blog_service.getCategories().then((data) => {
        res.json(data);
        // res.render("catagorieslist", { data: data, title: "Catagories" });
    }).catch((err) => {
        res.json({ message: err });
    });
});


app.get("/posts", (req, res) => {
    blog_service.getAllPosts().then((data) => {
        res.json(data);
        // res.render("catagorieslist", { data: data, title: "Catagories" });
    }).catch((err) => {
        res.json({ message: err });
    });
});

app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);

