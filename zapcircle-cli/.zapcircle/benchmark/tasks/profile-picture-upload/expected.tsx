import { useState } from "react";

export function ProfilePictureUpload() {
  const [image, setImage] = useState(null);

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} style={{ border: "2px dashed #ccc", padding: "1rem" }}>
      {image ? <img src={image} alt="Profile Preview" style={{ width: "100px" }} /> : "Upload your profile picture"}
    </div>
  );
}