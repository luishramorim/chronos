import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';

import Index from '@/app/index';
import LoginScreen from './loginScreen';
import RegisterScreen from './registerScreen';
import { theme } from '@/components/Theme';

const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 

            name="Index" 
            component={Index} 
            options={{ title: 'Página Inicial', headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Login', headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Registrar-se', headerShown: false }} 
          />
        </Stack.Navigator>
      <StatusBar style="light" />
    </PaperProvider>
  );
}