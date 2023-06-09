import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
const CryptoJS = require('crypto-js');

const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
};

const localCrypt = localStorage.getItem('fireCrypt');
if (localCrypt !== null) {
    let decrypt = CryptoJS.AES.decrypt(localCrypt, window.location.hostname);
    decrypt = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    firebaseConfig.apiKey = decrypt.apiKey;
    firebaseConfig.authDomain = decrypt.authDomain;
    firebaseConfig.projectId = decrypt.projectId;
    firebaseConfig.storageBucket = decrypt.storageBucket;
    firebaseConfig.messagingSenderId = decrypt.messagingSenderId;
    firebaseConfig.appId = decrypt.appId;
    firebaseConfig.measurementId = decrypt.measurementId;
}
const localVapidKey = localStorage.getItem('fireVapidKey');
let key = "";
if (localVapidKey !== null) {
    key = CryptoJS.AES.decrypt(localVapidKey, window.location.hostname).toString(CryptoJS.enc.Utf8);
}
export const vapidKey = key;
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
auth.languageCode = localStorage.getItem('locale_lang');
export default app;
