var express = require("express");
var Zombie = require("./models/zombie");
var Weapon = require("./models/weapon");

var passport = require("passport");
var acl = require("express-acl");

var router = express.Router();

acl.config({
    baseUrl:'/',
    defaultRole:'zombie',
    decodedObjectName:'zombie',
    roleSearchPath:'zombie.role'
    
});

router.use(acl.authorize);

router.use((req,res,next)=>{
    res.locals.currentZombie = req.zombie;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.isAuthenticated()){
        req.session.role = req.zombie.role;
    }
    console.log(req.zombie);
    next();
});

router.get("/",(req,res,next)=>{
    Zombie.find()
    .sort({createdAt: "descending"})
    .exec((err,zombies)=> {
        if(err){
            return next(err);
        }
        res.render("index",{zombies: zombies});
    });  
});

router.get("/signup",(req,res)=>{
    res.render("signup");
});

router.post("/signup",(req,res,next)=>{
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;
    Zombie.findOne({username:username},(err,zombie)=>{
        if(err){
            return next(err);
        }
        if(zombie){
            req.flash("error","El nombre de usuario ya lo ha tomado otro zombie");
            return res.redirect("/signup");
        }
        var newZombie = new Zombie({
            username:username,
            password:password,
            role: role
        });
        newZombie.save(next);
        return res.redirect("/");
    });

});
router.get("/zombies/:username",(req,res,next)=>{
    Zombie.findOne({username:req.params.username},(err,zombie)=>{
        if(err){
            return next(err);
        }
        if(!zombie){
            return next(404);
        }
        res.render("profile",{zombie:zombie});
    });
});

router.get("/re-weapons",(req,res)=>{
    res.render("re-weapons");
});

router.post("/re-weapons",(req,res,next)=>{
    var description = req.body.description;
    var force = req.body.force;
    var category = req.body.category;
    var ammo = req.body.ammo;

    var newWeapon = new Weapon({
        description: description,
        force: force,
        category: category,
        ammo: ammo
    }); 
    newWeapon.save(next);
    return res.redirect("/weapons");
    
});

router.get("/weapons",(req,res,next) =>{
    Weapon.find()
        .sort({ createdAt: "descending"})
        .exec((err,weapons) =>{
            if(err){
                return next(err);
            }
            res.render("weapons",{weapons: weapons});
        });
});

router.get("/login",(req,res)=>{
    res.render("login");
});

router.post("/login",passport.authenticate("login",{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash: true
}));
router.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});


router.get("/edit",ensureAuthenticated, (req,res)=>{
    res.render("edit");
});

router.post("/edit", ensureAuthenticated,(req,res,next)=>{
    req.zombie.displayName = req.body.displayName;
        req.zombie.bio = req.body.bio;
        req.zombie.save((err)=>{
            if(err){
                next(err);
                return;
            }
            req.flash("info","Profile updated");
            res.redirect("/edit");
        });
});




function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("info","You need to log in to see this section");
        res.redirect("/login");
    }
}

module.exports = router;