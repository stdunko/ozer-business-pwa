import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getInitials } from "../utils/chat";

type PersonAvatarProps = {
  name?: string | null;
  photo?: string | null;
  userId?: number | null;
  className?: string;
};

const PersonAvatar = ({ name, photo, userId, className = "" }: PersonAvatarProps) => {
  const [remotePhoto, setRemotePhoto] = useState(photo || "");

  useEffect(() => {
    setRemotePhoto(photo || "");
  }, [photo]);

  useEffect(() => {
    if (photo || !userId) {
      return;
    }
    return onSnapshot(doc(db, "userProfiles", String(userId)), (snapshot) => {
      const next = snapshot.data()?.photo;
      if (typeof next === "string" && next) {
        setRemotePhoto(next);
      }
    });
  }, [photo, userId]);

  if (remotePhoto) {
    return <img className={`avatar ${className}`} src={remotePhoto} alt="" />;
  }

  return (
    <div className={`avatar avatar-initials ${className}`} aria-hidden>
      {getInitials(name)}
    </div>
  );
};

export default PersonAvatar;
