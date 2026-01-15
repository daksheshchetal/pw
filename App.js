import * as TaskManager from'expo-task-manager';
import * as Location from 'expo-location';
import React from 'react';
import {View, ActivityIndicator, StyleSheet,Platform} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider,useAuth} from './context/AuthContext';
import  AuthScreen from './screens/AuthScreen';
import UserScreen from './screens/UserScreen';
import VendorScreen from './screens/VendorScreen';
const AppRouter = () => {
    const { currentUser, isVendor } = useAuth();
    const [isLangSelected, setIsLangSelected] = React.useState(null);

    React.useEffect(() => {
        const checkLang = async () => {
            const savedLang = await AsyncStorage.getItem('userLanguage');
            setIsLangSelected(!!savedLang);
        };
        checkLang();
    }, []);

    // 1. Prevent flickering or white screen while checking AsyncStorage
    if (isLangSelected === null) return <ActivityIndicator size="large" style={{flex:1}} />;

    // 2. IF NOT LOGGED IN: Use the Navigator to handle Welcome/Lang/Auth
    if (!currentUser) {
        return (
            <NavigationContainer>
                <AppNavigator languageSelected={isLangSelected} />
            </NavigationContainer>
        );
    }

    // 3. IF LOGGED IN: Show the app dashboards
    return isVendor ? <VendorScreen /> : <UserScreen />;
};   
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
