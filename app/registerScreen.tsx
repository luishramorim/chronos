import React, { useState } from 'react';
import { View } from 'react-native';
import { Appbar, Button, TextInput, Checkbox, Dialog, Portal, Paragraph } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { createAccountWithEmail } from '@/services/authService';
import styles from '@/components/Stylesheet';

type RegisterScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  const lastNameRef = React.useRef<any>(null);
  const emailRef = React.useRef<any>(null);
  const passwordRef = React.useRef<any>(null);
  const confirmPasswordRef = React.useRef<any>(null);

  const isFormValid =
    name &&
    lastName &&
    emailRegex.test(email) &&
    password &&
    confirmPassword === password &&
    termsAccepted;

    const handleRegister = async () => {
      setIsLoading(true);
      setErrorMessage(null);
    
      setTimeout(async () => {
        try {
          const user = await createAccountWithEmail(name, lastName, email, password);
          console.log('Conta criada com sucesso:', user);
        } catch (error: unknown) {
          if (error instanceof Error) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage('Erro desconhecido ao criar conta.');
          }
          setVisibleDialog(true);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Nova conta" />
      </Appbar.Header>

      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <TextInput
          autoCorrect={false}
          autoComplete="name"
          mode="outlined"
          label="Nome"
          value={name}
          onChangeText={setName}
          style={styles.textInput}
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
        />

        <TextInput
          ref={lastNameRef}
          autoCorrect={false}
          autoComplete="username"
          mode="outlined"
          label="Sobrenome"
          value={lastName}
          onChangeText={setLastName}
          style={styles.textInput}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <TextInput
          ref={emailRef}
          autoCorrect={false}
          autoComplete="email"
          autoCapitalize="none"
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.textInput}
          returnKeyType="next"
          keyboardType="email-address"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={!emailRegex.test(email) && email.length > 0}
        />

        <TextInput
          ref={passwordRef}
          secureTextEntry={!passwordVisible}
          autoCorrect={false}
          autoComplete="password"
          mode="outlined"
          label="Senha"
          value={password}
          onChangeText={setPassword}
          style={styles.textInput}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        />

        <TextInput
          ref={confirmPasswordRef}
          secureTextEntry={!passwordVisible}
          autoCorrect={false}
          autoComplete="password"
          mode="outlined"
          label="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.textInput}
          returnKeyType="done"
          error={confirmPassword !== password && confirmPassword.length > 0}
        />

        <View style={styles.checkbox}>
          <Checkbox.Android
            status={termsAccepted ? 'checked' : 'unchecked'}
            onPress={() => setTermsAccepted(!termsAccepted)}
          />
          <Button onPress={() => console.log('Abrir termos de uso')} uppercase={false}>
            Eu aceito os Termos de Uso
          </Button>
        </View>

        <Button
          style={styles.button}
          mode="contained"
          onPress={handleRegister}
          disabled={!isFormValid || isLoading}
          loading={isLoading}
        >
          Nova conta
        </Button>

        <Portal>
          <Dialog style={styles.dialog} visible={visibleDialog} onDismiss={() => setVisibleDialog(false)}>
            <Dialog.Title>Erro</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{errorMessage || 'Erro desconhecido ao criar conta.'}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisibleDialog(false)}>Fechar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </>
  );
};

export default RegisterScreen;