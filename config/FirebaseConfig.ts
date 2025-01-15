
<<<<<<< HEAD:config/FirebaseConfig.ts
const firebaseConfig = {
    apiKey: "AIzaSyD4lBWYgqJzyBFNRlEx0juSzyx42H4F5-Q",
    authDomain: "chronos-portal.firebaseapp.com",
    projectId: "chronos-portal",
    storageBucket: "chronos-portal.firebasestorage.app",
    messagingSenderId: "70104199256",
    appId: "1:70104199256:web:89093eb5c95b1a0dc4da2d",
    measurementId: "G-P0FN00MEMR"
  };
  
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

export default { firebase, auth, firestore, storage };
=======
>>>>>>> 3b526b7251514619845bb26bda3ed40a8d933751:config/FirebaseConfig.tsx
