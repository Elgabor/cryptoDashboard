import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/config.js";

export async function salvaPreferito(uid, crypto) {
    await setDoc(doc(db, "users", uid, "favorites", crypto.id), crypto);
  }
  
  export async function rimuoviPreferito(uid, cryptoId) {
    await deleteDoc(doc(db, "users", uid, "favorites", cryptoId));
  }
  
  export async function caricaPreferiti(uid) {
    try{
      const snap = await getDocs(collection(db, "users", uid, "favorites"));
      return snap.docs.map(doc => doc.data());
    }catch(e){
      console.error("Errore nel caricare i preferiti" + e);
      return []
    }
  }