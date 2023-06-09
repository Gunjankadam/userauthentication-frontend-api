if(process.env.NODE_ENV!=="production"){
    require("dotenv").config()
}

const express = require("express");
const app= express();
const PORT=5000
const bcrypt=require("bcrypt")
const passport = require("passport")
const initializepassport =require("./passport-conf")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
initializepassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


const users=[]
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret : "secret",
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

//configuring the login post functionality
app.post("/login",checkNotAuthenticated,passport.authenticate("local",{
    successRedirect : "/",
    failureRedirect : "/login",
    failureFlash : true,
}))


//configuring the register post functionality
app.post("/register",checkNotAuthenticated,async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword,
        })
        console.log(users);
        res.redirect("/login")
    }catch(err){
     console.log(err);
     res.redirect("/register")
    }
})
//routes
app.get("/",checkAuthenticated,(req,res)=>{
    res.render("index.ejs",{name: req.user.name})
})

app.get("/login",checkNotAuthenticated,(req,res)=>{
    res.render("login.ejs")
})

app.get("/register",checkNotAuthenticated,(req,res)=>{
    res.render("register.ejs")
})
//end routes

app.delete("/logout",(req,res)=>{
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);})