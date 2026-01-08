import { auth,db } from "../firebaseConfig";
import{doc,setDoc,getDoc} from 'firebase/firestore';
import React,{useState} from 'react';
import{View,Text,StyleSheet,TouchableOpacity,
    TextInput,Alert,Platform} from 'react-native';
import{auth,db} from '../firebaseConfig';
import {PhoneAuthProdvider,signInWithCredential, GoogleAuthProvider,AppleAuthProvider} from 'firebase/auth';
const handlePostAuth=async(user,selectedLanguage,role='customer')=>{
    try{
        const userRef=doc(db,'users',user.uid);
        const userSnap=await getDoc(userRef);
        if(!userSnap.exists()){
            await setDoc(userRef,{
                uid: user.uid,
                phoneNumber:user.phoneNumber,
                language:selectedLanguage,//Saved from the Language Screen
                role:role,//'customer' or 'vendor'
                isOnline:false,
                createdAt:new Date(),
                homeLocation:null //This will be set later via the Map screen
            });
            console.log("New sign-up successfull!");
        } else{
            console.log("Existing user logged in.");
        }
    }
    catch(error){
        console.error("Firestore Sync Error:",error);
    }
}
const LoginScreen=({navigation})=>{
    const[phoneNumber,setPhoneNumber]=useState('');
    const[otp,setOtp]=useState('');
    const[verificationId,setVerificationId]=useState(null);
    const syncUserToFirestore=async(user)=>{
        try{
            const lang=await AsyncStorage.getItem('userLanguage')||'en';
            const userRef=doc(db,'users',user.uid);
            const userSnap=await getDoc(userRef);
        if (!userSnap.exists()){
            await setDoc(userRef,{
                uid:user.uid,
                email:user.email||"",
                phoneNumber:user.phoneNumber ||"",
                language:lang,
                role:role,
                createdAt:new Date(),
                homeLocation:null
            });
        }
        if(role==='vendor'){
            navigation.navigate('VendorDashboard');
        }else{
            navigation.navigate('UserScreen');//
        }
        }
        catch(error){
            console.error("Auth Error:",error);
        }
    };
}
