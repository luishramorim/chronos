import { View } from 'react-native';
import * as React from 'react';

import { Appbar, Button, TextInput } from 'react-native-paper';
import styles from '@/components/Stylesheet';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const lastNameRef = React.useRef(null);
    const emailRef = React.useRef(null);
    const passwordRef = React.useRef(null);

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Nova conta" />
            </Appbar.Header>

            <View style={styles.container}>
                <TextInput
                    autoCorrect={false}
                    autoComplete="name"
                    mode="outlined"
                    label="Nome"
                    value={name}
                    onChangeText={text => setName(text)}
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
                    onChangeText={text => setLastName(text)}
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
                    onChangeText={text => setEmail(text)}
                    style={styles.textInput}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                />

                <TextInput
                    ref={passwordRef}
                    secureTextEntry
                    autoCorrect={false}
                    autoComplete="password"
                    mode="outlined"
                    label="Senha"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.textInput}
                    returnKeyType="done"
                    onSubmitEditing={() => console.log('Finalizing...')}
                />
                <Button style={styles.button} mode="contained" onPress={() => console.log('Creating...')}>
                    Nova conta
                </Button>
            </View>
        </>
    );
};

export default RegisterScreen;