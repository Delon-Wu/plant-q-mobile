import ThemedView from '@/components/ThemedView';
import { register } from '@/src/api/account';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function Resgister() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleRegister = () => {
        register({username, password, password2: password, phone, email}).then((res) => {
            console.log('res-->', res);
            router.push('/login');
        });
    };

    return (
        <ThemedView style={styles.container}>
            <TextInput
                label="用户名"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="邮箱"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
            />
            
            <TextInput
                label="密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
            />
            
            <TextInput
                label="联系电话"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                mode="outlined"
            />
            
            <ThemedView style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={styles.button}
                >
                    注册
                </Button>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        marginBottom: 15,
    },
    buttonContainer: {
        gap: 10,
    },
    button: {
        marginTop: 10,
    },
});