import React, {createContext,useContext,useEffect,useState} from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPhoneNumber,
    RecaptchaVerifier, 
    signInWithCredential,
    PhoneAuthProvider,
    OAuthProvider
} from 'firebase/auth'; 
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import {auth,db} from '../firebaseConfig';
import { getDoc,setDoc,doc,getFirestore } from 'firebase/firestore';
const AuthContext=createContext(); //Create the Context
//Create a custom function to the use the Auth content
export function useAuth(){
    return useContext(AuthContext); 
}
//Creating the component to provide authentication
export function AuthProvider({children}){
    const [currentUser, setCurrentUser]=useState(null);
    const [isVendor, setIsVendor]=useState(false);
    const[loading, setLoading]=useState(true); 
    //Making the authorisation functions that link to firebase database
    const signUp=async(email,password,role='customer')=>{
        const res=await createUserWithEmailAndPassword(auth,email,password);
        const user=res.user;
        await setDoc (doc(db,'users',user.uid),
    {
        email:user.email,
        role:role,//'vendor' or 'customer'
        createdAt:new Date()
    })
    return res
    }
    const logIn=async(email,password)=>{
        const res=await signInWithEmailAndPassword(auth,email,password);
        const user= res.user;
        const docRef=doc(db,'users',user.uid);
        const docSnap=await getDoc(docRef);
        if (docSnap.exists()){
            setIsVendor(docSnap.data().role==='vendor');
        }
        return res
    }
    const logOut=()=>{return signOut(auth)}
    //Change the state of the component to unsubscribe
    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setIsVendor(docSnap.data().role === 'vendor');
                }
            }
            setCurrentUser(user);
        } catch (e) {
            console.error(e);
        } finally {
            // This MUST run to remove the white screen
            setLoading(false);
        }
    });
    return unsubscribe;
}, []);
    const googleLogin=async()=>{
        const[request,response,promptAsync]=Google.useAuthRequest({
            expoClientId:'YOUR_EXPO_CLIENT_ID',
        });
        const result=await promptAsync();
        if (result?.type==='success'){
            const credential=
            GoogleAuthProvider.credential(result.params.id_token);
            const userCredential=await signInWithCredential(auth,credential);
            const ref=doc(db,'users',userCredential.user.uid);
            const snap=await getDoc(ref);
            if(!snap.exists()){
                await setDoc(ref,{role:'customer',createdAt:new Date()});
            }
        }
    }
    const appleLogin=async()=>{
        if (Platform.OS!=='ios') return;
        const credential=await AppleAuthentication.signInAsync({
            requestedScopes:[
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            ],
        });
        const provider=new GoogleAuthProvider();
        await signInWithCredential(auth,provider.credential(credential.identityToken));
        //Save role if new user
        const ref=doc(db,'users',auth.currentUser.uid);
        const snap=await getDoc(ref);
        if(!snap.exists()){
            await setDoc(ref,{role:'customer',createdAt:new Date()});
        }
    }
    const sendOTP=async(phoneNumber)=>{
        try{
            //Configure invisible reCAPTCHA
            const verifier=new RecaptchaVerifier('recaptcha-container',{
                size:'invisible',
                callback:()=>{}
            },auth);
            const confirmation=await signInWithPhoneNumber(auth,phoneNumber,verifier);
            return confirmation; //confirmationResult for OTP code
        }catch(err){
            console.log(err);
            throw err;
        }
    };
    const verifyOTP=async(confirmationResult,code)=>{
        try{
            await confirmationResult.confirm(code);
        } catch(err){
            console.log(err);
            throw err;
        }
    };
    //Expose the value to the provider
    const value={
        currentUser,
        signUp,
        logIn,
        logOut,
        setIsVendor,
        //Check role(vendor or consumer)
        isVendor,
        googleLogin,
        appleLogin,
        sendOTP,
        verifyOTP
    }
    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}


