export type UserRole = "viewer" | "uploader" | "admin";

export interface PostItem {
  id: string;
  title: string | null;
  type: "file" | "text";
  content?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  created_at: string;
}

export interface AuthSession {
  role: UserRole;
  iat?: number;
  exp?: number;
}
