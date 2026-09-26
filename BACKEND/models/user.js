import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        unique : [true , "seçtiğiniz kullanıcı adı bir başkası tarafından kullanılıyor"],
        required : [true , "Bu alan zorunludur"]
    },
    password : {
        type : String,
        required : [true , "bu alanı doldurmak zorunludur"],
        select : false    
    },
    email : {
        type : String,
        required : [true , "bu alanı doldurmak zorunludur"],
        unique : [true , "bu email bir başkası tarafından kullanılıyor."],
    },
} , {
    timestamps : true,
    collection : "kullanicilar",
    }
);

const User = mongoose.model("User", userSchema);

export default User;