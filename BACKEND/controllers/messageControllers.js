import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export const sendMessage = async function (req, res) {
  try {
    const { text } = req.body;
    const { recipientId } = req.params;
    const sender = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Boş mesaj gönderilemez",
      });
    }

    // 1. DÜZELTME: Doğru alan adı ve { $all: [...] } syntax'ı
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, recipientId] },
    });

    // 2. DÜZELTME: Başındaki 'let' kaldırıldı
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender, recipientId],
      });
    }

    let newMessage = await Message.create({
      conversationId: conversation._id,
      sender,
      text,
    });

    conversation.lastMessage = {
      text,
      sender,
      seen: false,
    };
    await conversation.save();

    // 3. DÜZELTME: success: true olarak değiştirildi
    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (err) {
    // Hatayı konsola yazdırmak debug süreçlerinde çok işine yarar
    console.error("Mesaj gönderme hatası detayı:", err);
    return res.status(500).json({
      success: false,
      message: "Mesaj gönderimi esnasında hata",
    });
  }
};

export const getConversations = async function (req, res) {
  try {
    const user = req.user.id;
    const conversations = await Conversation.find({
      participants: user,
    })
      .populate("participants", "username")
      .sort({ updatedAt: -1 });
    return res.status(200).json({
      success: true,
      data: conversations,
      message: "sohbetler başarıyla çekildi",
    });
  } catch (err) {
    console.error("mesajları getirme hatası", err);
    return res.status(500).json({
      success: false,
      message: "Sohbetleri getirme hatası",
    });
  }
};

export const getMessages = async function (req, res) {
  try {
    const user = req.user.id;
    const {otherUser} = req.params;
    const conversation = await Conversation.findOne({
      participants: { $all: [user, otherUser] },
    });
    if (!conversation) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({createdAt : 1});

    return res.status(200).json({
        success : true,
        data : messages
    });
  } catch (err) {
    console.error("mesaj geçmişi çekilmesi esnasında hata : " , err);
    return res.status(500).json({
        success : false,
        message : "mesaj geçmişi çekilmesi esnasında hata"
    });
  }
};
