import type { User } from "@/types";

export const DISCOVER_PROFILE_FALLBACK = {
  _id: "unknown",
  nickname: "社区邻居",
  avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  preferred_language: "zh",
  role_flags: ["user"],
  status: "active"
} satisfies User;

export const DISCOVER_PROFILES: Record<string, User> = {
  user_001: {
    _id: "user_001",
    openid: "openid_001",
    unionid: "unionid_001",
    nickname: "Jerry",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    phone: "13800000000",
    preferred_language: "zh",
    role_flags: ["user", "community_admin", "system_admin"],
    status: "active"
  },
  user_002: {
    _id: "user_002",
    openid: "openid_002",
    unionid: "unionid_002",
    nickname: "Emma",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    phone: "13900000000",
    preferred_language: "en",
    role_flags: ["user", "organizer"],
    status: "active"
  }
};

export const getDiscoverProfile = (userId?: string | null) =>
  (userId && DISCOVER_PROFILES[userId]) || DISCOVER_PROFILE_FALLBACK;
