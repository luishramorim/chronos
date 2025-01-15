import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { onAuthStateChanged } from 'firebase/auth';

import { useCustomFonts } from '../config/fonts';
import { auth } from '../config/FirebaseConfig';
import { theme } from '../components/Theme';

import Index from '../app/index';
import LoginScreen from './loginScreen';
import ProfileScreen from './profileScreen';
import RegisterScreen from './registerScreen';
import RecoveryScreen from './recoveryScreen';
import VerifyEmail from './verifyEmail';
import CreateEvent from '../components/ui/CreateEvent';
import TaskView from '../components/ui/TaskView';

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
      options={{ title: 'Novo Evento', headerShown: false }}
    />
    <AppStack.Screen
      name="TaskView"
      component={TaskView}
      options={{ title: 'Visualizar Tarefa', headerShown: false }}
    />
    <AppStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Perfil', headerShown: false }}
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
      options={{ title: 'Recuperar Senha', headerShown: false }}
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
      options={{ title: 'Verifique seu E-mail', headerShown: false }}
    />
  </AuthStack.Navigator>
);

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();
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

  return (
    <PaperProvider theme={theme}>
      {Platform.OS === 'web' && (
        <style type="text/css">{`
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url('/fonts/MaterialCommunityIcons.ttf') format('truetype');
          }
        `}</style>
      )}
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
    </PaperProvider>
  );
}