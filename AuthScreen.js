import React, {useState} from 'react';
import{View,Text,Button,StyleSheet,ActivityIndicator,Alert,Platform} from 'react-native';
import CustomInput from '../components/CustomInput';
import {useAuth} from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import{TextInput, TouchableOpacity} from 'react-native-gesture-handler';
const AuthScreen=()=>{
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [isOTPMode,setIsOTPMode]=useState(false);
    const[phone,setPhone]=useState('');
    const[confirmationResult,setConfirmationResult]=useState(null);
    const[otp,setOtp]=useState('');
    const [isLoginMode,setIsLoginMode]=useState(true);
    const [isLoading,setIsLoading]=useState(false);
    const[role, setRole]=useState('customer');
    const {signUp,logIn,googleLogin,appleLogin,sendOTP,verifyOTP}=useAuth();
    const handleAuth=async()=>{
        console.log('screen loaded')
        setIsLoading(true);
        try{
            if(isOTPMode){
                if(!confirmationResult){
                    const confirmation=await sendOTP(phone);
                    setConfirmationResult(confirmation);
                    Alert.alert('OTP Sent','Please enter the OTP received.')
                } else{
                    await verifyOTP(confirmationResult,otp);
                }
            }
            else{
                            if (isLoginMode){
                await logIn(email,password);
            }
            else {
                await signUp(email,password,role);
                console.log('trying to sign up')
            }
            console.log('authorisation success')
            }
        }
        catch(error){
            Alert.alert("Authentication Error",error.message);
            console.log(error.code,error.message)
        }
        finally{
            setIsLoading(false);
        }
    }
    return(
        <View style={styles.container}>

            <Text
             style={styles.title}>
                {isOTPMode? 'Login with OTP': isLoginMode? "Welcome Back!":'Create Account'}
            </Text>
            {!isOTPMode &&(
                <>
                <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"/>
            <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}/>
                </>
            )}
            {isOTPMode &&(
                <>
                {!confirmationResult &&(
                    <TextInput
                    placeholder="Phone Number(+91...)"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={styles.input}
                    />
                )}
                {confirmationResult &&(
                    <TextInput
                    placeholder="Enter OTP"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    style={styles.input}
                    />
                )}
                </>
            )}
            {!isLoginMode && !isOTPMode &&(
                <View style={styles.roleContainer}>
                    
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={[styles.roleButton,role==='customer' && styles.activeRole]}
                            onPress={()=> setRole('customer')}>
                            <Text
                                style={role==='customer'? styles.activeText:
                                styles.roleText}>Customer
                            </Text>
                        </TouchableOpacity>
                                                <TouchableOpacity 
                            style={[styles.roleButton,role==='vendor' && styles.activeRole]}
                            onPress={()=> setRole('vendor')}>
                            <Text
                                style={role==='vendor'? styles.activeText:
                                styles.roleText}>Vendor
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {isLoading?(
                <ActivityIndicator size="large" color="#007AFF" style={styles.button}/>
            ):(
                <Button
                    title={
                        isOTPMode?confirmationResult?'Verify OTP':'Send OTP': isLoginMode?'Login':'Sign Up'}
                    onPress={handleAuth}
                    color="#007AFF"
                />
            )
        }
        <TouchableOpacity style={styles.googleButton} onPress={googleLogin}>
            <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
        {Platform.OS=='ios'&&(
            <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtomType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            style={{width:250,height:44,marginTop:10}}
            onPress={appleLogin}
            />
        )}
        {!isOTPMode &&(
                    <TouchableOpacity
        style={styles.switchButton}
        onPress={()=>setIsLoginMode(prev=>!prev)}
        disabled={isLoading}>
         <Text style={styles.switchText}>
            {isLoginMode
            ?"Need an account? Sign Up"
            :"Already have an account? Login"}
            </Text>   </TouchableOpacity>
        )}
        {!isOTPMode &&(
            <TouchableOpacity
            style={styles.switchButton}
            onPress={()=> setIsOTPMode(true)}
            >
                <Text style={styles.switchText}>Login with Phone OTP</Text>
            </TouchableOpacity>
        )}
        </View>
    )
}
export default AuthScreen;
const styles = StyleSheet.create({ 
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', }, title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', }, switchButton: { marginTop: 20, padding: 10, }, switchText: { color: '#007AFF', fontSize: 16, }, button: { marginVertical: 10, },
    roleContainer:{marginVertical:15},
    label:{
        fontSize:16,
        marginBottom:10,
        textAlign:'center'},
    buttonRow:{
        flexDirection:'row',
        justifyContent:'space-around'},
    roleButton:{
        padding:10,
        borderWidth:1,
        borderColor:'#ccc',
        borderRadius:8,
        width:'45%',
        alignItems:'center'},
    activeRole:{
        backgroundColor:'#007AFF',
        borderColor:'#007AFF'},
    roleText:{color:'#333'},
        activeText:{color:'#fff',
        fontWeight:'bold'},
    googleButton:{
        backgroundColor:'#DB4437',
        width:250,
        padding:12,
        borderRadius:30,
        alignItems:'center',
        marginTop:15
    },
    googleText:{color:'#fff',fontSize:16,fontWeight:'bold'}
 });
