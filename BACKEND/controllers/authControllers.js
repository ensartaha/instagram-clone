import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const register = async function (req, res) {
  try {
    const { username, password, email } = req.body;
    if(!username || !password || !email){
      return res.status(404).json({
        success : false,
        message : "Tüm alanların doldurulması zorunludur!"
      });
    }
    const existingEmailUser = await User.findOne({ email });
    const existingUsernameUser = await User.findOne({ username });
    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email başka birisi tarafından kullanılıyor. Lütfen başka bir şey deneyiniz...",
      });
    }
    if (existingUsernameUser) {
      return res.status(400).json({
        success: false,
        message:
          "Kullanıcı adı başka birisi tarafından kullanılıyor. Lütfen başka bir şey deneyiniz...",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
    });
    const token = jwt.sign(
      { id: createdUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );
    return res.status(201).json({
      success: true,
      token,
      data: createdUser,
    });
  } catch (err) {
    console.error(`kayıt sırasında hata oluştu : ${err}`);
    return res.status(500).json({
      success: false,
      message: "Sunucu kaynaklı bir hata oluştu lütfen tekrar deneyiniz...",
    });
  }
};

const login = async function (req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(404).json({
        success : false,
        message : "böyle bir kullanıcı bulunamadı"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password , user.password);
    if(!isPasswordCorrect){
        return res.status(401).json({
            success : false,
            message : "Şifre hatalı. Lütfen tekrar deneyiniz."
        });
    }
    const token = jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET,
        {expiresIn : "6h" }
    );

    return res.status(201).json({
        success : true,
        message: "Giriş başarılı!",
        data : user,
        token : token
    })

  } catch (err) {
    console.error(`Giriş sırasında hata : ${err}`);
    return res.status(500).json({
        success : false ,
        message : "sunucu kaynaklı bir hata oluştu"
    })
  }
};

export default { register, login };

