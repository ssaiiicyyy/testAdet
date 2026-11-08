"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import "./profile-card.css";

type ProfileCardProps = {
  name: string;
  title: string;
  handle: string;
  status: string;
  contactText: string;
  avatarUrl?: string | StaticImageData;
  iconUrl?: string;
  statusColor?: string;
  holo?: number;
  glare?: number;
  tiltStrength?: number;
  parallax?: number;
  radius?: number;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  intro?: boolean;
  showUserInfo?: boolean;
  theme?: "dark" | "light";
  onContactClick?: () => void;
  className?: string;
};

type ProfileCardStyle = CSSProperties & {
  "--pc-radius": string;
  "--pc-holo": number;
  "--pc-glare": number;
  "--pc-status": string;
  "--pc-rotate-x": string;
  "--pc-rotate-y": string;
  "--pc-pointer-x": string;
  "--pc-pointer-y": string;
  "--pc-shift-x": string;
  "--pc-shift-y": string;
};

export default function ProfileCard({
  name,
  title,
  handle,
  status,
  contactText,
  avatarUrl,
  iconUrl,
  statusColor = "#22c55e",
  holo = 0.8,
  glare = 0.5,
  tiltStrength = 12,
  parallax = 8,
  radius = 16,
  enableTilt = true,
  enableMobileTilt = false,
  intro = true,
  showUserInfo = true,
  theme = "dark",
  onContactClick,
  className = "",
}: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function updateTilt(event: PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (
      !card ||
      !enableTilt ||
      (event.pointerType === "touch" && !enableMobileTilt)
    ) {
      return;
    }

    const bounds = card.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    card.style.setProperty("--pc-rotate-x", `${-y * tiltStrength}deg`);
    card.style.setProperty("--pc-rotate-y", `${x * tiltStrength}deg`);
    card.style.setProperty("--pc-pointer-x", `${(x + 1) * 50}%`);
    card.style.setProperty("--pc-pointer-y", `${(y + 1) * 50}%`);
    card.style.setProperty("--pc-shift-x", `${x * parallax}px`);
    card.style.setProperty("--pc-shift-y", `${y * parallax}px`);
  }

  function resetTilt() {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--pc-rotate-x", "0deg");
    card.style.setProperty("--pc-rotate-y", "0deg");
    card.style.setProperty("--pc-pointer-x", "50%");
    card.style.setProperty("--pc-pointer-y", "50%");
    card.style.setProperty("--pc-shift-x", "0px");
    card.style.setProperty("--pc-shift-y", "0px");
  }

  const cardStyle: ProfileCardStyle = {
    "--pc-radius": `${Math.max(0, radius)}px`,
    "--pc-holo": Math.min(1, Math.max(0, holo)),
    "--pc-glare": Math.min(1, Math.max(0, glare)),
    "--pc-status": statusColor,
    "--pc-rotate-x": "0deg",
    "--pc-rotate-y": "0deg",
    "--pc-pointer-x": "50%",
    "--pc-pointer-y": "50%",
    "--pc-shift-x": "0px",
    "--pc-shift-y": "0px",
  };

  return (
    <div
      ref={cardRef}
      className={`profile-card${theme === "light" ? " profile-card--light" : ""}${intro ? " profile-card--intro" : ""} ${className}`}
      style={cardStyle}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
    >
      <div className="profile-card__body">
        <div className="profile-card__tile">
          {avatarUrl ? (
            <Image
              className="profile-card__photo"
              src={avatarUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 280px, 320px"
              priority
            />
          ) : (
            <div className="profile-card__initials" aria-hidden="true">
              SD
            </div>
          )}
          {iconUrl && (
            <Image
              className="profile-card__pattern"
              src={iconUrl}
              alt=""
              fill
              sizes="320px"
            />
          )}
          <div className="profile-card__scrim" />
          <div className="profile-card__info">
            <h2 className="profile-card__name">{name}</h2>
            <p className="profile-card__title">{title}</p>
          </div>
          <div className="profile-card__holo" />
          <div className="profile-card__glare" />
        </div>

        {showUserInfo && (
          <div className="profile-card__footer">
            <div className="profile-card__meta">
              <span className="profile-card__handle">@{handle}</span>
              <span className="profile-card__status">
                <span className="profile-card__status-dot" />
                {status}
              </span>
            </div>
            {onContactClick ? (
              <button
                type="button"
                className="profile-card__contact"
                onClick={onContactClick}
                aria-label={`${contactText} ${name}`}
              >
                <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.8} />
                {contactText}
              </button>
            ) : (
              <Link
                href="/contact"
                className="profile-card__contact"
                aria-label={`${contactText} ${name}`}
              >
                <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.8} />
                {contactText}
              </Link>
            )}
          </div>
        )}
        <div className="profile-card__rim" />
      </div>
    </div>
  );
}
