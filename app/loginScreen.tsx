import { View } from 'react-native';
import * as React from 'react';

import { Button, Text, TextInput } from 'react-native-paper';

import styles from '@/components/Stylesheet';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const emailInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);

  return (
    <View style={styles.container}>
      <Text style={styles.textLogo} variant="displaySmall">Chronos</Text>

      <TextInput
        ref={emailInputRef}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={text => setEmail(text)}
        style={styles.textInput}
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()} 
      />

      <TextInput
        ref={passwordInputRef}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        mode="outlined"
        label="Senha"
        value={password}
        onChangeText={text => setPassword(text)}
        style={styles.textInput}
        returnKeyType="done" 
        onSubmitEditing={() => {
          console.log('Login iniciado');
        }}
      />

      <Button 
        style={styles.button} 
        mode="contained" 
        onPress={() => navigation.navigate('Index')}
      >
        Entrar
      </Button>

      <Button 
        style={styles.button} 
        mode="elevated" 
        onPress={() => navigation.navigate('Register')}
      >
        Nova conta
      </Button>

      <Button 
        style={styles.button} 
        mode="text" 
        onPress={() => console.log('Remember password..')}
      >
        Recuperar conta
      </Button>
    </View>
  );
};

export default LoginScreen;