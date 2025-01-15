import { View } from 'react-native'
import React from 'react'
import { Appbar, Button, Text } from 'react-native-paper'
import styles from '@/components/Stylesheet'
import { NavigationProp } from '@react-navigation/native';

import { logout } from '@/services/authService';

interface ProfileScreenProps {
  navigation: NavigationProp<any>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  
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

  return (
    <>
        <Appbar.Header mode='small'>
            <Appbar.BackAction onPress={() => navigation.goBack()}/>
            <Appbar.Content title="Perfil" />
        </Appbar.Header>
        <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
            <Button mode='contained' onPress={handleSignOut}>Sair</Button>
        </View>
    </>
  )
}

export default ProfileScreen
