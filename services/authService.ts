import { auth, firestore } from '../config/FirebaseConfig';

export const createAccountWithEmail = async (
  name: string,
  lastName: string,
  email: string,
  password: string
) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (user) {
      const userRef = firestore.collection('users').doc(user.uid);
      await userRef.set({
        name: name,
        lastName: lastName,
        email: email,
        timestamp: new Date(),
      });

      await verifyEmail(user);

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
    } else {
      throw new Error('Usuário não encontrado.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao criar conta: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao criar conta.');
    }
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
    } else {
      throw new Error('Usuário não encontrado.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao fazer login: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao fazer login.');
    }
  }
};

export const logout = async () => {
  try {
    await auth.signOut();
    return 'Logout realizado com sucesso!';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao fazer logout.');
    }
  }
};

export const verifyEmail = async (user: any) => {
  try {
    if (user) {
      await user.sendEmailVerification();
    }
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
  }
};

export const reverifyEmail = async (
  user: any,
  setEmailVerified: React.Dispatch<React.SetStateAction<boolean | null>>
) => {
  try {
    if (user) {
      await user.reload(); 
      if (!user.emailVerified) {
        await user.sendEmailVerification();
        console.log('Novo link de verificação enviado.');
      } else {
        setEmailVerified(true);
        console.log('O email já está verificado.');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar o email:', error);
  }
};

export const recoverPassword = async (email: string) => {
  try {
    if (email) {
      await auth.sendPasswordResetEmail(email);
      console.log('E-mail de recuperação enviado para:', email);
    } else {
      throw new Error('Por favor, forneça um email válido.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao enviar o e-mail de recuperação: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao enviar o e-mail de recuperação.');
    }
  }
};