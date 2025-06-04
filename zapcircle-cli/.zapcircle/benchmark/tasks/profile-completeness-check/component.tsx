import { useState } from "react";

export function ProfileStatus({ user }) {
  const [image, setImage] = useState(user.image || null);

  const isComplete = image && user.bio && user.email;

  return (
    <div>
      {image ? (
        <img src={image} alt="Profile" />
      ) : (
        <div className="placeholder">No Image</div>
      )}
      <div>{isComplete ? "✅ Profile Complete" : "⚠️ Profile Incomplete"}</div>
    </div>
  );
}
