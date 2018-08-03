var bcrypt=require("bcrypt-nodejs");
var mongoose = require("mongoose");

var SALT_FACTOR = 10;

var weaponSchema = mongoose.Schema({
    description:{type:String,required:true},
    force:{type:Number,require:true},
    category:{type:String,required:true},
    ammo:{type:Boolean,require:true}    
});

var Weapon = mongoose.model("Weapon",weaponSchema);
module.exports = Weapon;