import { View } from 'react-native';
import * as React from 'react';
import { Text, Button, Dialog, Portal, Paragraph, Appbar } from 'react-native-paper';
import { auth } from '@/config/FirebaseConfig';
import { verifyEmail, reverifyEmail } from '@/services/authService';
import styles from '@/components/Stylesheet';
import { logout } from '@/services/authService';

interface VerifyEmailScreenProps {
  navigation: any;
  setEmailVerified: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation, setEmailVerified }) => {
  const [emailVerified, setEmailVerifiedState] = React.useState<boolean | null>(null);
  const [isLoadingVerifyEmail, setIsLoadingVerifyEmail] = React.useState<boolean>(false);
  const [isLoadingReverifyEmail, setIsLoadingReverifyEmail] = React.useState<boolean>(false);
  const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const handleSignOut = async () => {
      setIsLoading(true);
      try {
        await logout();
        console.log('Usuário desconectado.');
      } catch (error) {
        console.error('Erro ao sair:', error);
      } finally {
        setIsLoading(false);
      }
    };

  React.useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmailVerifiedState(user.emailVerified);
    }
  }, []);

  const handleVerifyEmail = async () => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      setIsLoadingVerifyEmail(true);
      try {
        await verifyEmail(user);
        setDialogMessage('Link de verificação enviado com sucesso!');
        setDialogVisible(true);
      } catch (error) {
        setDialogMessage('Erro ao enviar o email de verificação.');
        setDialogVisible(true);
      } finally {
        setIsLoadingVerifyEmail(false);
      }
    }
  };

  const handleReverifyEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      setIsLoadingReverifyEmail(true);
      try {
        await reverifyEmail(user, setEmailVerified); 
        await user.reload();

        if (user.emailVerified) {
          setDialogMessage('Seu email já está verificado.');
          setEmailVerified(true);

          navigation.replace('Index');
        } else {
          setDialogMessage('Seu email ainda não foi verificado.');
          setEmailVerified(false);
        }
        setDialogVisible(true);
      } catch (error) {
        setDialogMessage('Erro ao verificar o email.');
        setDialogVisible(true);
      } finally {
        setIsLoadingReverifyEmail(false);
      }
    }
  };

  return (
    <>
      <Appbar.Header mode='small'>
        <Appbar.Content title="Verificação de Email" />
      </Appbar.Header>
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{ marginHorizontal: 20 }} variant="titleLarge">Antes de começarmos, precisamos verificar o seu email</Text>
        {emailVerified !== null && emailVerified ? (
          <Text variant="bodyLarge" style={{ marginHorizontal: 20 }}>Seu email já foi verificado.</Text>
        ) : (
          <>
            <Button
              style={[styles.button, { marginTop: 30 }]}
              mode="contained"
              onPress={handleVerifyEmail}
              loading={isLoadingVerifyEmail} 
              disabled={isLoadingVerifyEmail}
            >
              Enviar email de verificação
            </Button>

            <Button
              style={[styles.button, {marginVertical: 20}]}
              mode="elevated"
              onPress={handleReverifyEmail}
              loading={isLoadingReverifyEmail}
              disabled={isLoadingReverifyEmail}
            >
              Já verifiquei o meu email
            </Button>

            <Button onPress={handleSignOut}>Sair</Button>
          </>
        )}

        <Portal>
          <Dialog style={styles.dialog} visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>Verificação de Email</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{dialogMessage}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Fechar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </>
  );
};

export default VerifyEmailScreen;