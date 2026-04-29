import React, { useMemo, useState } from "react";
import styles from "./Avatar.module.css";
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: string;
}
function Avatar({ src, name, size }: AvatarProps) {
  const [isError, setIsError] = useState(false);
  const safeName = name || "U";
  const shortenName = safeName
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 2);

  const bgColor = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < safeName.length; i++) {
      sum += safeName.charCodeAt(i);
    }
    const hue = sum % 360;
    return `hsl(${hue}, 30%, 85%)`;
  }, [safeName]);

  if (!src || isError) {
    return (
      <div
        className={styles.avatarByName}
        style={{ background: bgColor, width: size }}
      >
        {shortenName}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="avatar"
      loading="lazy"
      className={styles.avatar}
      onError={() => setIsError(true)}
      style={{ width: size }}
    />
  );
}

export default Avatar;
