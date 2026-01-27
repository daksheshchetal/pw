import * as TaskManager from'expo-task-manager';
import * as Location from 'expo-location';
import React from 'react';
import {View, ActivityIndicator, StyleSheet,Platform} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider,useAuth} from './context/AuthContext';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import  AuthScreen from './screens/AuthScreen';
import UserScreen from './screens/UserScreen';
import VendorScreen from './screens/VendorScreen';
const AppRouter=()=>{
    const {currentUser,isVendor}=useAuth();
    const [languageSelected, setLanguageSelected]=React.useState(false);
    const [checkingStorage,setCheckingStorage]=React.useState(true);
    React.useEffect(()=>{
        const checkLanguage=async()=>{
            const lang=await AsyncStorage.getItem('userLanguage');
                if(lang) setLanguageSelected(true);
                setCheckingStorage(false);
        };
        checkLanguage();
    },[

    ])
    if (checkingStorage) return <ActivityIndicator size='large'/>;
    if (!currentUser){
        return(
            <NavigationContainer>
                <AppNavigator
                    languageSelected={languageSelected}/>
            </NavigationContainer>
        );
    }
return isVendor?<VendorScreen/>:<UserScreen/>;
}   
if(Platform.OS!=='web'){
 TaskManager.defineTask('MOHALLA_ALERTS',({data:{eventType,region},error})=>{
    if(error) return;
    if(eventType==Location.GeofencingEventType.Enter){
        console.log("A vendor entered your Mohalla!");
        //Later:Add Push Notification trigger here
    }
 })};
export default function App(){
  return(
    <GestureHandlerRootView style={{flex:1}}>
     <AuthProvider>
     <AppRouter/>
     </AuthProvider>
     </GestureHandlerRootView>
     );
 }
const styles = StyleSheet.create({ 
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
    text: { fontSize: 20, fontWeight: 'bold' } });
