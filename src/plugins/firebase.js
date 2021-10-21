import firebase from 'firebase/app';
import 'firebase/firestore';

var firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };
 
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore().collection('oposiciones2021');
export {db}
//export default firebase.firestore();