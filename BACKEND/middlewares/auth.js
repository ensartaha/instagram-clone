import jwt from 'jsonwebtoken';

const authMiddleware = function(req, res ,next){
    try{
        const firstToken = req.headers['authorization'];
        if(!firstToken || !firstToken.startsWith("Bearer ")){
            return res.status(401).json({
                success : false,
                message : "hata! token bulunamadı",
            });
        }
        const token = firstToken.split(' ')[1];
        const decodedToken = jwt.verify(token , process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    }catch(err){
        console.error('Token hatası' , err);
        return res.status(401).json({
            success : false, 
            message : 'geçersiz/süresi dolmuş token'
        });
    }
}

export default authMiddleware;


