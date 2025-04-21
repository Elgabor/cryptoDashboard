import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config.js";

export async function loginAnonymous() {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export function watchAuth(callback) {
  onAuthStateChanged(auth, callback);
}
