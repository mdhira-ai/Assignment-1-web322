/*********************************************************************************
*  WEB322 – Assignment 6
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

const stripJs = require('strip-js');
const authData = require("./auth-service.js");


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

app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer();
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',

    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        }
    }
}));
app.set('view engine', '.hbs');





app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});
app.get('/about', (req, res) => {
    res.render('about');
})

app.get('/posts/add', (req, res) => {
    res.render('addPost')
})


app.get('/posts', (req, res) => {
    if (req.query.category) {
        blog_service.getPostsByCategory(req.query.category).then(data => res.render("posts", { posts: data })).catch(err => res.render("posts", { message: "no results" }));
    } else if (req.query.minDate) {
        blog_service.getPostsByMinDate(req.query.minDate).then(data => res.render("posts", { posts: data })).catch(err => res.render("posts", { message: "no results" }));
    } else {
        blog_service.getAllPosts().then(data => res.render("posts", { posts: data })).catch(err => res.render("posts", { message: "no results" }));
    }
})
app.get('/categories', (req, res) => {
    blog_service.getCategories().then(data => res.render('categories', { categories: data })).catch(err => res.render("categories", { message: "no results" }));

})

app.get("/post/:id", (req, res) => {
    blog_service.getPostById(req.params.id).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.status(500).json({
            message: err
        });
    });
});

app.get('/blog', async (req, res) => {

    let viewData = {};

    try {

        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post = await blog_service.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});


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






// function onHttpStart() {
//     console.log("Express http server listening on: " + HTTP_PORT);
//     return new Promise((res, req) => {
//         blog_service.initialize().then((data) => {
//             console.log(data)
//         }).catch((err) => {
//             console.log(err);
//         });
//     });
// }

function onHttpStart() {
    // console.log("Express http server listening on: " + HTTP_PORT);
    return new Promise((res, req) => {
        blog_service.initialize()
            .then(authData.initialize)
            .then(function () {
                console.log("app listening on: " + HTTP_PORT)
               
            }).catch(function (err) {
                console.log("unable to start server: " + err);
            });

    });
}


app.get("/login", (req, res) => {
    res.render('login')
   
});

app.get("/register", (req, res) => {


    res.render('register')
   
});

// GET /register
// •	This "GET" route simply renders the "register" view without any data (See register.hbs under Adding New Routes below)

// POST /register

// app.get("/register", (req, res) => {
//     res.render("register", {
//         title: "Register"
//     });
// });

app.post("/register", (req, res) => {

    if (!req.body.userName || !req.body.password) {
        res.render("register", {
            title: "Register",
            errorMessage: "All fields are required"
        });
    } else {
        // attempt to register the user
        authData.registerUser(req.body)
            .then(function () {
                res.render("register", {
                    title: "Register",
                    successMessage: "Registration Successful"
                });
            })
            .catch(function (err) {
                res.render("register", {
                    title: "Register",
                    errorMessage: err,
                    userName: req.body.userName
                });
            });
    }
});

// GET /logout
// •	This "GET" route simply clears the user's session data and redirects them to the /login page (See logout.hbs under Adding New Routes below)

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/about");
});

// Step 6: Adding New Views:
// Now that our routes are in place, we need to create the corresponding views to render the data for each route.

// login.hbs
//





// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
    res.redirect("/about");
});



app.use(express.static('public'));



app.get('/about', (req, res) => {
    res.render('about');
})




app.get("/posts", (req, res) => {
    blog_service.getAllPosts().then((data) => {
        res.json(data);
        // res.render("catagorieslist", { data: data, title: "Catagories" });
    }).catch((err) => {
        res.json({ message: err });
    });
});


// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);


// Step 5: Adding New Routes:
// With our app now capable of respecting client sessions and communicating with MongoDB to register/validate users, we need to create routes that enable the user to register for an account and login / logout of the system (above our 404 middleware function).  Once this is complete, we will create the corresponding views (Step 6).
// GET /login
// •	This "GET" route simply renders the "login" view without any data (See login.hbs under Adding New Routes below)

// POST /login

