import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";
const MAX_CAPTION_LENGTH = 2200;
const MAX_IMAGE_SIZE_MB = 5;

function Home() {
  const [currentUserId , setCurrentUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  // Hangi postun yorum kutusunun açık olduğunu tutar (Örn: activeCommentPostId === post._id)
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  // Her post için yazılan yorum inputunun içeriğini tutar
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();
  const postsWithLikes = posts.map((post) => {
    return {
      ...post, // Postun mevcut tüm bilgileri (caption, imageUrl vb.) aynen kalsın
      isLiked: post.likes?.includes(currentUserId) // Yeni isLiked özelliğini hesapla
    };
  });
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const veriler = await response.json();

        if (veriler.success) {
          setPosts(veriler.data);
        } else {
          setError(veriler.message);
        }
      } catch (err) {
        setError("Sunucuya bağlanılamadı.");
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  // Seçilen resim değiştikçe önizleme URL'sini oluşturup eskisini temizler
  useEffect(() => {
    if (!image) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  function getInstagramTime(dateString) {
    if (!dateString) return "";

    const now = new Date();
    const past = new Date(dateString);
    // İki tarih arasındaki farkı milisaniye cinsinden bulup saniyeye çeviriyoruz
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return "Şimdi"; // 1 dakikadan azsa
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}d`; // Örn: "27 d" (Dakika)
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}s`; // Örn: "2 s" (Saat)
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}g`; // Örn: "3 g" (Gün)
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}h`; // Örn: "2 h" (Hafta)
    }

    // 4 haftadan (yaklaşık 1 aydan) daha eskiyse Instagram gibi hafta yerine ay/yıl veya hafta sayısı gösterebilirsin
    return `${diffInWeeks}h`;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Lütfen geçerli bir resim dosyası seçiniz.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Resim boyutu ${MAX_IMAGE_SIZE_MB}MB'den küçük olmalı.`);
      e.target.value = "";
      return;
    }

    setError("");
    setImage(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    document.getElementById("fileInput").value = "";
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!image) return alert("Lütfen bir resim seçiniz!");

    setUploading(true);
    setError("");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const veriler = await response.json();

      if (veriler.success) {
        setPosts([veriler.data, ...posts]);
        setImage(null);
        setCaption("");
        document.getElementById("fileInput").value = "";
        setShowCreateForm(false);
        setSuccessMessage("Post başarıyla paylaşıldı!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setError(veriler.message);
      }
    } catch (err) {
      setError("Veriler gönderilirken bi problem oluştu");
    } finally {
      setUploading(false);
    }
  };
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const veriler = await response.json();

      if (veriler.success) {
        // Mevcut post dizisini dön ve sadece beğenilen postun likes dizisini güncelle
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, likes: veriler.likes } : post,
          ),
        );
      }
    } catch (err) {
      console.error("Beğeni işlemi sırasında hata:", err);
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: commentText }),
        },
      );
      const veriler = await response.json();

      if (veriler.success) {
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? { ...post, comments: veriler.comments }
              : post,
          ),
        );
        setCommentText("");
        setActiveCommentPostId(null);
      }
    } catch (err) {
      console.error("Yorum hatası:", err);
    }
  };

  const captionNearLimit = caption.length > MAX_CAPTION_LENGTH - 100;

  return (
    <>
      {/* Üst Menü (Navbar) */}
      <nav className="navbar">
        <h1 className="brand">Instagram</h1>
        <div className="nav-icons">
          <span className="icon" title="Mesajlar">
            💬
          </span>
        </div>
      </nav>

      {/* Ana İçerik */}
      <div className="app-container">
        {/* İleride Eklenecek Story Alanı Placeholder'ı */}
        <div className="stories-container">
          <div className="story-circle">Sen</div>
          <div className="story-circle">Kullanıcı1</div>
          <div className="story-circle">Kullanıcı2</div>
          <div className="story-circle">Kullanıcı3</div>
          <div className="story-circle">Kullanıcı4</div>
        </div>

        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-banner">{successMessage}</p>}

        {/* --- GÖNDERİLER --- */}
        <div>
          {postsLoading && (
            <>
              <div className="skeleton-card">
                <div
                  className="skeleton-line"
                  style={{ width: "40%", height: "16px", marginBottom: "15px" }}
                />
                <div
                  className="skeleton-line"
                  style={{ width: "100%", height: "220px" }}
                />
              </div>
              <div className="skeleton-card">
                <div
                  className="skeleton-line"
                  style={{ width: "40%", height: "16px", marginBottom: "15px" }}
                />
                <div
                  className="skeleton-line"
                  style={{ width: "100%", height: "220px" }}
                />
              </div>
            </>
          )}

          {!postsLoading && posts.length === 0 && !error && (
            <div
              className="card"
              style={{ textAlign: "center", color: "#8e8e8e" }}
            >
              <p>Henüz hiç gönderi yok.</p>
            </div>
          )}

          {!postsLoading &&
            postsWithLikes.map((post) => (
              <div key={post._id} className="card">
                <div className="post-header">
                  <div className="post-avatar"></div>
                  {post.owner?.username}
                </div>

                {/* Resmi siyah arka planlı ve sabit oranlı konteynır içine alıyoruz */}
                <div className="post-image-container">
                  <img
                    src={post.imageUrl}
                    alt={post.caption ? post.caption : "Gönderi görseli"}
                    className="post-image"
                  />
                </div>

                {/* --- ETKİLEŞİM BUTONLARI (BEĞENİ & YORUM İKONLARI) --- */}
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    margin: "12px 0 8px 0",
                    fontSize: "22px",
                  }}
                >
                  {/* Beğeni Butonu */}
                  <span
                    onClick={() => handleLike(post._id)}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "transform 0.1s",
                    }}
                    title="Beğen"
                  >
                    {/* Eğer kullanıcı daha önce beğenmişse dolu kalp, beğenmemişse boş kalp gösterebilirsin */}
                    {post.isLiked > 0 ? "♥" : "♡"}
                  </span>

                  {/* Yorum Aç/Kapa Butonu */}
                  <span
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setActiveCommentPostId(post._id);
                      setCommentText("");
                    }}
                  >
                    💬
                  </span>
                </div>

                {/* --- BEĞENİ SAYISI --- */}
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  {post.likes?.length || 0} beğeni
                </div>

                {/* --- GÖNDERİ AÇIKLAMASI --- */}
                <div className="post-caption" style={{ marginTop: "0" }}>
                  <strong>{post.owner?.username}</strong> {post.caption}
                </div>

                {post.comments?.length > 0 && (
                  <div
                    onClick={() => setActiveCommentPostId(post._id)}
                    style={{
                      color: "#8e8e8e",
                      fontSize: "13px",
                      cursor: "pointer",
                      marginTop: "4px",
                    }}
                  >
                    {post.comments.length} yorumun tümünü gör
                  </div>
                )}

                {/* --- AÇILIR/KAPANIR YORUM EKLEME FORMU --- */}
              </div>
            ))}
        </div>

        {/* --- 8x - 1x ORANLI OVAL TETİKLEYİCİ BUTON --- */}
        <div
          className={`create-post-trigger ${showCreateForm ? "is-disabled" : ""}`}
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Yeni Gönderi Paylaş"
          role="button"
          tabIndex={0}
        >
          <div className="plus-icon"></div>
        </div>

        {/* --- YENİ POST OLUŞTURMA KUTUSU (Sadece Butona Basılınca Açılır) --- */}
        {showCreateForm && (
          <div className="card" style={{ border: "2px solid #000" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>Yeni Gönderi</h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="file-input"
                onChange={handleImageChange}
              />

              {imagePreviewUrl && (
                <div className="image-preview-container">
                  <button
                    type="button"
                    className="remove-preview-btn"
                    onClick={handleRemoveImage}
                    title="Resmi kaldır"
                  >
                    ✕
                  </button>
                  <img
                    src={imagePreviewUrl}
                    alt="Seçilen gönderi önizlemesi"
                    className="image-preview"
                  />
                </div>
              )}

              <input
                type="text"
                className="input-field"
                placeholder="Bir açıklama yaz..."
                value={caption}
                maxLength={MAX_CAPTION_LENGTH}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div
                className={`char-counter ${captionNearLimit ? "limit-near" : ""}`}
              >
                {caption.length}/{MAX_CAPTION_LENGTH}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={uploading}
              >
                {uploading ? "Yükleniyor..." : "Paylaş"}
              </button>
            </form>
          </div>
        )}
      </div>
      {/* --- ALTTAN AÇILAN YORUM PANELİ (BOTTOM SHEET / MODAL) --- */}
      {activeCommentPostId &&
        (() => {
          // Aktif olan postu diziden buluyoruz
          const activePost = posts.find((p) => p._id === activeCommentPostId);
          if (!activePost) return null;

          return (
            <div
              className="comment-modal-overlay"
              onClick={() => setActiveCommentPostId(null)}
            >
              {/* İçeriğe tıklanınca modalın kapanmasını engellemek için e.stopPropagation() */}
              <div
                className="comment-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Panel Başlığı */}
                <div className="comment-modal-header">
                  <span>Yorumlar</span>
                  <button
                    type="button"
                    onClick={() => setActiveCommentPostId(null)}
                    className="close-modal-btn"
                  >
                    ✕
                  </button>
                </div>

                {/* Yorum Listesi Alanı (Kaydırılabilir) */}
                <div className="comment-modal-body">
                  {activePost.comments?.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#888",
                        marginTop: "20px",
                      }}
                    >
                      Henüz yorum yok. İlk yorumu sen yap!
                    </p>
                  ) : (
                    activePost.comments.map((comment, index) => (
                      <div key={index} className="comment-item">
                        {/* Yorumu yazan kişi ve yorum metni üstte/yan yana */}
                        <div className="comment-main">
                          <strong>
                            {comment.user?.username || "Kullanıcı"}:{" "}
                          </strong>
                          <span>{comment.text}</span>
                        </div>

                        {/* Tarih hemen altta, daha küçük ve gri bir fontla gösterilir */}
                        <div className="comment-date">
                          {getInstagramTime(comment.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Yorum Gönderme Formu (Panelin En Altına Sabit) */}
                <form
                  className="comment-modal-footer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleComment(activePost._id);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Yorum ekle..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" disabled={!commentText.trim()}>
                    Paylaş
                  </button>
                </form>
              </div>
            </div>
          );
        })()}
    </>
  );
}

export default Home;
