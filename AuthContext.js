import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    signInWithCredential,
    initializeAuth,
    getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { auth as authInstance, db } from '../firebaseConfig';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { Platform } from 'react-native';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isVendor, setIsVendor] = useState(false);
    const [loading, setLoading] = useState(true);

    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: '741920079969-shfcjka54slncmjhetb0m023b0fgn168.apps.googleusercontent.com',
        iosClientId: '741920079969-o56gu4c5cur60ctfcgp2cpb75ld2sgjp.apps.googleusercontent.com',
        androidClientId: "741920079969-h8dkjg7qsdf0mtgfcors4qrhf5v3i5no.apps.googleusercontent.com"
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setIsVendor(docSnap.data().role === 'vendor');
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signUp = async (email, password, role = 'customer') => {
        const res = await createUserWithEmailAndPassword(authInstance, email, password);
        await setDoc(doc(db, 'users', res.user.uid), {
            email: res.user.email,
            role: role,
            createdAt: new Date()
        });
        return res;
    };

    const logIn = async (email, password) => {
        const res = await signInWithEmailAndPassword(authInstance, email, password);
        return res;
    };

    const logOut = () => signOut(authInstance);

    const sendOTP = async (phoneNumber) => {
        try {
            // FIX: Pass 'authInstance' as the FIRST argument to resolve 'prototype of undefined'
            const verifier = new RecaptchaVerifier(authInstance, 'recaptcha-container', {
                size: 'invisible',
            });
            const confirmation = await signInWithPhoneNumber(authInstance, phoneNumber, verifier);
            return confirmation;
        } catch (err) {
            console.error("Send OTP Error:", err);
            throw err;
        }
    };

    const verifyOTP = async (confirmationResult, code) => {
        try {
            const result = await confirmationResult.confirm(code);
            return result;
        } catch (err) {
            console.error("Verify OTP Error:", err);
            throw err;
        }
    };

    const value = {
        currentUser,
        signUp,
        logIn,
        logOut,
        isVendor,
        googleLogin: promptAsync,
        sendOTP,
        verifyOTP
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
