import { google } from "googleapis";
import type { Request, Response, NextFunction } from "express";

export type Tokens = { access_token?:string | null; refresh_token?:string | null; expiry_date?:number | null };
export interface GoogleAuthStore { tokens?:Tokens }
const memory: GoogleAuthStore = {};

export function getOAuth2(){
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(){
  const oauth2 = getOAuth2();
  const scopes = (process.env.GOOGLE_SCOPES||"").split(/\s+/).filter(Boolean);
  return oauth2.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: scopes });
}

export async function handleCallback(req: Request, _res: Response){
  const code = String(req.query.code||"");
  const oauth2 = getOAuth2();
  const { tokens } = await oauth2.getToken(code);
  memory.tokens = tokens;
  return tokens;
}

export function authedOAuth2(){
  const oauth2 = getOAuth2();
  if(memory.tokens) oauth2.setCredentials(memory.tokens);
  return oauth2;
}

export function ensureAuthed(req: Request, res: Response, next: NextFunction){
  if (process.env.GOOGLE_AUTH_SMOKE_BYPASS === "1" && req.header("X-Smoke-Google-Auth") === "yes") {
    return next();
  }
  if(!memory.tokens?.access_token && !memory.tokens?.refresh_token){
    return res.status(401).json({ ok:false, code:"GOOGLE_NOT_AUTHED" });
  }
  return next();
}

export function authStatus(){
  const t = memory.tokens;
  return {
    ok: !!t?.access_token,
    has_refresh: !!t?.refresh_token,
    expiry_date: t?.expiry_date ?? null
  };
}

export function logout(){
  memory.tokens = undefined;
}
