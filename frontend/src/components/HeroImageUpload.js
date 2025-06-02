import React, { useState, useEffect } from "react";
import axios from "axios";

function HeroImageUpload() {
  const [heroImage, setHeroImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHeroImage();
  }, []);

  const fetchHeroImage = async () => {
    try {
      const res = await axios.get("/api/hero");
      setHeroImage(res.data);
    } catch (err) {
      console.error("Error fetching hero image:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!preview) return;

    const formData = new FormData();
    formData.append("image", preview);

    setUploading(true);
    try {
      await axios.post("/api/hero", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPreview(null);
      fetchHeroImage();
    } catch (err) {
      console.error("Error uploading hero image:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-5">
      <h4>Hero Image</h4>
      {heroImage?.imageUrl && (
        <div className="mb-3">
          <img
            src={heroImage.imageUrl}
            alt="Hero"
            style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "8px" }}
          />
        </div>
      )}
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          className="form-control mb-2"
          onChange={(e) => setPreview(e.target.files[0])}
        />
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Hero Image"}
        </button>
      </form>
    </div>
  );
}

export default HeroImageUpload;
