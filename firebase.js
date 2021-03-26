import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDihKlSMEkqUcn4dS27X24MCIOCjG8JXZs",
  authDomain: "whatsapp2-41961.firebaseapp.com",
  projectId: "whatsapp2-41961",
  storageBucket: "whatsapp2-41961.appspot.com",
  messagingSenderId: "690301756197",
  appId: "1:690301756197:web:d08385d05d9360ef4470cc",
};

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const db = app.firestore();
const auth = app.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
