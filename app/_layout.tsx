import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { onAuthStateChanged } from 'firebase/auth';

import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CreateEvent from '@/components/ui/CreateEvent';
import TaskView from '@/components/ui/TaskView';

import { auth } from '@/config/FirebaseConfig';
import Index from '@/app/index';
import LoginScreen from './loginScreen';
import RegisterScreen from './registerScreen';
import RecoveryScreen from './recoveryScreen';
import VerifyEmail from './verifyEmail';
import { theme } from '@/components/Theme';
import { Platform } from 'react-native';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

type EmailNotVerifiedStackProps = {
  setEmailVerified: React.Dispatch<React.SetStateAction<boolean | null>>;
};

const AuthenticatedStack = () => (
  <AppStack.Navigator>
    <AppStack.Screen
      name="Index"
      component={Index}
      options={{ title: 'Página Inicial', headerShown: false }}
    />
    <AppStack.Screen
      name="CreateEvent"
      component={CreateEvent}
      options={{ title: 'Novo evento', headerShown: false }}
    />
    <AppStack.Screen
      name="TaskView"
      component={TaskView}
      options={{ title: 'Visualizar tarefa', headerShown: false }}
    />
  </AppStack.Navigator>
);

const UnauthenticatedStack = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Login', headerShown: false }}
    />

    <AuthStack.Screen
      name="Recovery"
      component={RecoveryScreen}
      options={{ title: 'Recuperar senha', headerShown: false }}
    />

    <AuthStack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Registrar-se', headerShown: false }}
    />
  </AuthStack.Navigator>
);

const EmailNotVerifiedStack: React.FC<EmailNotVerifiedStackProps> = ({ setEmailVerified }) => (
  <AuthStack.Navigator>
    <AuthStack.Screen
      name="VerifyEmail"
      component={() => <VerifyEmail setEmailVerified={setEmailVerified} />}
      options={{ title: 'Verifique seu email', headerShown: false }}
    />
  </AuthStack.Navigator>
);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    MaterialCommunityIcons: require('../assets/fonts/MaterialCommunityIcons.ttf'), 
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setEmailVerified(user.emailVerified);
      } else {
        setIsAuthenticated(false);
        setEmailVerified(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <React.Fragment>
      {Platform.OS === 'web' ? (
          <style type="text/css">{`
            @font-face {
              font-family: 'MaterialCommunityIcons';
              src: url('/fonts/MaterialCommunityIcons.ttf') format('truetype');
            }
          `}</style>
        ) : null}
        {isAuthenticated ? (
          emailVerified ? (
            <AuthenticatedStack />
          ) : (
            <EmailNotVerifiedStack setEmailVerified={setEmailVerified} />
          )
        ) : (
          <UnauthenticatedStack />
        )}
      <StatusBar style="light" />
      </React.Fragment>
    </PaperProvider>
  );
}