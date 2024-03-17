import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    fullname : {
        type: String,
        required : true
    },

    email : {
        type: String,
        required : true
    },

    password : {
        type: String,
        unique : true,
        required : true
    },

    status : {
        type: String,
        enum: ['active', 'deactive'],
        default : 'active',
        required : true
    },

    createdAt :{
        type : Number
    },

    updatedAt :{
        type : Number
    }
},
{
    timestamps :{
        currentTime: () => Math.floor(Date.now() / 1000)
    }
})

export default mongoose.model('User', Schema)