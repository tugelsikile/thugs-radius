import { initializeApp } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
import { getAuth } from "@firebase/auth";

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

const app = null;
const fbAuth = null;
const fbAnalytic = null;
const localCrypt = localStorage.getItem('fireCrypt');
if (localCrypt !== null) {
    let decrypt = CryptoJS.AES.decrypt(localCrypt, window.location.hostname);
    decrypt = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    if (decrypt.apiKey.length > 5 &&
        decrypt.authDomain.length > 5 &&
        decrypt.projectId.length > 5 &&
        decrypt.storageBucket.length > 5 &&
        decrypt.messagingSenderId.length > 5 &&
        decrypt.appId.length > 5 &&
        decrypt.measurementId.length > 5
    ) {
        firebaseConfig.apiKey = decrypt.apiKey;
        firebaseConfig.authDomain = decrypt.authDomain;
        firebaseConfig.projectId = decrypt.projectId;
        firebaseConfig.storageBucket = decrypt.storageBucket;
        firebaseConfig.messagingSenderId = decrypt.messagingSenderId;
        firebaseConfig.appId = decrypt.appId;
        firebaseConfig.measurementId = decrypt.measurementId;

        const app = initializeApp(firebaseConfig);
        const fbAnalytic = getAnalytics(app);
        const fbAuth = getAuth(app);
        fbAuth.languageCode = localStorage.getItem('locale_lang');
    }
}
export const analytic = fbAnalytic;
export const auth = fbAuth;
export default app;

