import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput, Dialog, Portal, Paragraph } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from '@/components/Stylesheet';
import { loginWithEmail } from '@/services/authService';

type LoginScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [passwordHint, setPasswordHint] = useState(true);

  const emailInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordHint = () => {
    setPasswordHint(!passwordHint)
  }

  const isFormValid = isEmailValid(email) && password.length > 0;

  const handleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(async () => {
      try {
        const user = await loginWithEmail(email, password);
        console.log('Usuário logado:', user);
        setErrorMessage(null);
      } catch (error: unknown) {
        console.log('Erro de login:', error);

        let errorMsg: string;

        if (error instanceof Error) {
          if (error.message.includes('auth/invalid-credential')) {
            errorMsg = 'Credenciais fornecidas são inválidas. Verifique seu email e senha.';
          } else if (error.message.includes('auth/user-not-found')) {
            errorMsg = 'Usuário não encontrado. Verifique seu email.';
          } else if (error.message.includes('auth/wrong-password')) {
            errorMsg = 'Senha incorreta. Tente novamente.';
          } else {
            errorMsg = 'Erro desconhecido ao fazer login.';
          }
        } else {
          errorMsg = 'Erro desconhecido ao fazer login.';
        }

        setErrorMessage(errorMsg);
        setVisibleDialog(true);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
      <Text style={styles.textLogo} variant="displaySmall">
        Chronos
      </Text>

      <TextInput
        ref={emailInputRef}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        mode="flat"
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.textInput}
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        error={!isEmailValid(email) && email.length > 0}
      />

      <TextInput
        ref={passwordInputRef}
        secureTextEntry={passwordHint}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        mode="flat"
        label="Senha"
        value={password}
        onChangeText={setPassword}
        style={styles.textInput}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        right={<TextInput.Icon icon={passwordHint ? "eye-off" : "eye"} onPress={togglePasswordHint} />}
      />

      <Button
        style={styles.button}
        mode="contained"
        onPress={handleLogin}
        disabled={!isFormValid || isLoading}
        loading={isLoading}
      >
        {isLoading ? 'Entrando' : 'Entrar'}
      </Button>

      <Button
        style={styles.button}
        mode="elevated"
        onPress={() => navigation.navigate('Register')}
        disabled={isLoading}
      >
        Nova conta
      </Button>

      <Button
        style={styles.button}
        mode="text"
        onPress={() => navigation.navigate('Recovery')}
        disabled={isLoading}
      >
        Recuperar conta
      </Button>

      <Portal>
        <Dialog style={styles.dialog} visible={visibleDialog} onDismiss={() => setVisibleDialog(false)}>
          <Dialog.Title>Erro</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{errorMessage || 'Erro desconhecido ao fazer login.'}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisibleDialog(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default LoginScreen;