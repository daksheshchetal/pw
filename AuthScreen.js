import React, {useState} from 'react';
import{View,Text,Button,StyleSheet,ActivityIndicator,Alert} from 'react-native';
import CustomInput from '../components/CustomInput';
import {useAuth} from '../context/AuthContext';
import{TouchableOpacity} from 'react-native-gesture-handler';
const AuthScreen=()=>{
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [isLoginMode,setIsLoginMode]=useState(true);
    const [isLoading,setIsLoading]=useState(false);
    const[role, setRole]=useState('customer');
    const {signUp,logIn}=useAuth();
    const handleAuth=async()=>{
        console.log('screen loaded')
        setIsLoading(true);
        try{
            if (isLoginMode){
                await logIn(email,password);
            }
            else {
                await signUp(email,password,role);
                console.log('trying to sign up')
            }
            console.log('authorisation success')
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
                {isLoginMode? "Welcome Back!":'Create Account'}
            </Text>
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
            {!isLoginMode && (
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
                    title={isLoginMode?'Login':'Sign Up'}
                    onPress={handleAuth}
                    color="#007AFF"
                />
            )
        }
        <TouchableOpacity
        style={styles.switchButton}
        onPress={()=>setIsLoginMode(prev=>!prev)}
        disabled={isLoading}>
         <Text style={styles.switchText}>
            {isLoginMode
            ?"Need an account? Sign Up"
            :"Already have an account? Login"}
            </Text>   </TouchableOpacity>
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
        fontWeight:'bold'}
 });