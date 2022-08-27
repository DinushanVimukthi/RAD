import express from 'express'
import {engine} from 'express-handlebars'
import passport from 'passport'
import localStrategy from 'passport-local'
import session from 'express-session'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const app=express();
const port=8080;

app.engine('hbs',engine({extname:'hbs'}))
app.set('view engine','hbs')
app.use(express.static('public'))



mongoose.connect('mongodb://localhost:27017').then(r=>{
    console.log('connected')
})
const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
})
const User=mongoose.model('User',UserSchema)

//Middlewares

app.use(session({
    secret:"veryGood",
    resave:false,
    saveUninitialized:true
}))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Passport
app.use(passport.initialize(undefined))
app.use(passport.session(undefined))
passport.serializeUser(function(user,done){
    done(null,user.id)
})
passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user)
    })
})
passport.use('local',new localStrategy(function(username,password,done){
    User.findOne({username:username},function(err,user){
            if(err) return done(err)
            if(!user) return done(null,false,{message:'Incorrect username'})
            bcrypt.compare(password,user.password,function(err,res){
                    if(err) return done(err)
                    if(res) return done(null,user)
                    else return done(null,false,{message:'Incorrect password'})
                }
            )
        }
    )
}))


const IsLoggedIn=(req,res,next)=>{
    if(req.isAuthenticated()) return next()
    res.redirect('/dashboard')
}
const IsLoggedOut=(req,res,next)=>{
    if(!req.isAuthenticated()) return next()
    res.redirect('/')
}



//Routes
app.get('/dashboard',IsLoggedIn,(req,res)=>{
    res.render('dashboard',{title:'Login'})
})
app.get('/',IsLoggedOut,(req,res)=>{
    let Response={
        title:'Login',
        error:req.query.error
    }
    res.render('index',Response)
})
app.post('/',passport.authenticate('local',{
    successRedirect:'/dashboard',
    failureRedirect:'/?error=true',
}))

app.get('/logout',function (req,res,next){
    req.logout(function(err){
        if (err) { return next(err); }
        res.redirect('/');
    })
})
let count=0
app.get('/count',function (req,res,next){
    count++
    res.render('count',{title:'Count',count:count})
})


//Setup Admin User
app.get('/setup',async (req,res)=>{
    const exist=await User.findOne({username:'admin'})
    if(exist){
        console.log('User already exists')
        return res.redirect('/')
    }

    bcrypt.genSalt(10,function(err,salt){
        if (err) return next(err)
        bcrypt.hash("pass",salt,function(err,hash){
            const user=new User({
                username:'admin',
                password:hash
            })
            user.save();
            res.redirect('/')
        })
    })
})



app.listen(port,()=>{
    console.log("Server is running on 8080 port")
})