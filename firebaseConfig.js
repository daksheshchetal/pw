import {initializeApp} from 'firebase/app';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import{getAuth,getReactNativePersistence,initializeAuth} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFirestore} from 'firebase/firestore';
const firebaseConfig={
  apiKey: "AIzaSyBFztjQcizQOA8H4i59F1vASx1s-mQ7IOc",
  authDomain: "paaswala7.firebaseapp.com",
  projectId: "paaswala7",
  storageBucket: "paaswala7.firebasestorage.app",
  messagingSenderId: "741920079969",
  appId: "1:741920079969:web:90771dc912ae3e1214aa20"
}
const app=initializeApp(firebaseConfig);
const auth=initializeAuth(app,{
  persisetence:getReactNativePersistence(ReactNativeAsyncStorage)
});
const db=getFirestore(app);
export {auth,db};