import express from 'express'
import {engine} from 'express-handlebars'
import passport from 'passport'
import session from 'express-session'
import mongoose from 'mongoose'

const app=express();
const port=8080;

mongoose.connect('mongodb://localhost:27017',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
});

const User=mongoose.model('User',userSchema);

app.get('/',(req,res)=>{
    res.render('index',{title:'Home'})
})

app.get('/count',(req,res)=>{
    res.send('This your'+req.session.count+'visit');
});

app.engine('hbs',engine({extname:'hbs'}))
app.set('view engine','hbs')
app.use(express.static('public'))

app.listen(port,()=>{
    console.log("Server is running on 8080 port")
})