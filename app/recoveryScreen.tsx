import { View } from 'react-native';
import * as React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { Appbar, Text, Button, TextInput, Dialog, Portal, Paragraph } from 'react-native-paper';
import { recoverPassword } from '@/services/authService';

import styles from '@/components/Stylesheet';

type RecoveryScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const RecoveryScreen: React.FC<RecoveryScreenProps> = ({ navigation }) => {
  const [email, setEmail] = React.useState<string>('');
  const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = React.useState<string>('');

  const handleRecovery = async () => {
    if (email) {
      try {
        await recoverPassword(email);
        setDialogMessage('E-mail de recuperação enviado com sucesso!');
        setDialogVisible(true);
      } catch (error) {
        setDialogMessage('Erro ao enviar o e-mail de recuperação.');
        setDialogVisible(true);
      }
    } else {
      setDialogMessage('Por favor, insira um email válido.');
      setDialogVisible(true);
    }
  };

  const handleDialogConfirm = () => {
    setDialogVisible(false);
    navigation.navigate('Login');
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Recuperar senha" />
      </Appbar.Header>
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{ marginHorizontal: 20, marginBottom: 20 }} variant='titleLarge'>
          Digite o email usado na criação da sua conta
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none"
          autoCorrect={false}
          mode='outlined'
          style={[styles.textInput, {marginBottom: 20}]}  
        />

        <Button
          mode="contained"
          onPress={handleRecovery}
          style={styles.button}
          disabled={!email} 
        >
          Recuperar Senha
        </Button>
      </View>

      <Portal>
        <Dialog style={styles.dialog} visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Recuperação de Senha</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDialogConfirm}>Confirmar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default RecoveryScreen;