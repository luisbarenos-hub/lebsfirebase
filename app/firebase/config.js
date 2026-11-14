import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAAhnNmhwQQVzY6gtGEj-ph0yCY-vNmcm8",
  authDomain: "appapinosql.firebaseapp.com",
  projectId: "appapinosql",
  storageBucket: "appapinosql.firebasestorage.app",
  messagingSenderId: "269273176121",
  appId: "1:269273176121:web:193a3b78e3a0942b1695e8"
};

const app = initializeApp(firebaseConfig);

export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);