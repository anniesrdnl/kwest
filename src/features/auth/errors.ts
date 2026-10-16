import type { AuthError } from "@supabase/supabase-js";

/** Turn Supabase auth errors into short, friendly messages. */
export function authErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try logging in.";
    case "weak_password":
      return "That password is too weak. Try a longer one.";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox.";
    case "same_password":
      return "Choose a password different from your current one.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    case "signup_disabled":
      return "Sign-ups are closed right now.";
    case "session_not_found":
    case "session_expired":
      return "Your session expired. Please log in again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
