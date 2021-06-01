import firebase from 'firebase/app'
import 'firebase/storage'
import 'firebase/analytics'
require("@firebase/firestore")
  var firebaseConfig = {
    apiKey: "AIzaSyCTMV3hFM_Eif_T9Zn3QDE64CLxdtIkdDM",
    authDomain: "willy-app-488ea.firebaseapp.com",
    projectId: "willy-app-488ea",
    storageBucket: "willy-app-488ea.appspot.com",
    messagingSenderId: "510176270952",
    appId: "1:510176270952:web:e7747adbdef046d85ff9dd"
  };
  // Initialize Firebase
  const db=firebase.initializeApp(firebaseConfig);

  export default db.firestore();
