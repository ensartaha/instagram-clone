import Post from '../models/post.js';

const createPost = async function(req,res){
    try{
        const { caption} = req.body;
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"Lütfen bir resim seçiniz"
            })
        }
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        const post = await Post.create({
        imageUrl : imageUrl,
        caption : caption,
        owner : req.user.id
    });
        await post.populate('owner', 'username');
    return res.status(201).json({
        success : true,
        message : "post başarıyla yüklendi",
        data : post
    })
    }catch(err){
        console.error(`Post yüklenirken bir hata oluştu ${err}`);
        return res.status(404).json({
            success : false,
            message : "post yüklenirken hata oluştu"
        })
    }

};
const getAllPosts = async function(req , res){
    try{
        const posts = await Post.find().populate('owner' , 'username')
        .populate('comments.user' , 'username');
        return res.status(200).json({
            success : true,
            message : "postlar başarı ile çekildi",
            data : posts
        });
    }catch(err){
        console.error(`postlar çekilirken hata : ${err}`);
        return res.status(404).json({
            success : false,
            message : "postlar çekilirken hata oluştu"
        });
    }
};
// Beğeni Ekle / Çıkar (Toggle Like)
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Gönderi bulunamadı." });
    }

    // Kullanıcı daha önce beğenmiş mi kontrol et
    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Beğenmişse listeden çıkar (Unlike)
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id.toString());
    } else {
      // Beğenmemişse listeye ekle (Like)
      post.likes.push(req.user.id);
    }

    await post.save();
    return res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Beğeni işlemi başarısız." });
  }
};

// Yorum Ekle
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Yorum metni boş olamaz." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Gönderi bulunamadı." });
    }

    const newComment = {
      user: req.user.id,
      text: text
    };

    post.comments.push(newComment);
    await post.save();

    // Yorum yapan kullanıcının adını da arayüzde gösterebilmek için populate edelim
    await post.populate('comments.user', 'username');

    return res.status(200).json({ success: true, comments: post.comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Yorum eklenemedi." });
  }
};
export default {createPost , getAllPosts};