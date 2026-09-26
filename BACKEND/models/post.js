import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    likes : [{type : mongoose.Schema.Types.ObjectId , ref : 'User'}],
    comments : [{
        user : {type : mongoose.Schema.Types.ObjectId, ref : 'User', required: true },
        text : {type : String , required : true , maxlength : 500},
        createdAt : {type : Date , default : Date.now}
    }],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    imageUrl : {
        type : String,
        required : true
    },
    caption : {
        type : String,
    },
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ],
    comments : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'User',
            },
            text : {
                type : String , 
                required : true,
            },
            createdAt : {
                type : Date,
                default : Date.now(),
            },
        },
    ],
} , {
    timestamps:true
});
export default mongoose.model('Post' , postSchema);