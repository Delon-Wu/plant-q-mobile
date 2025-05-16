import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { login } from '@/src/api/account';
import { AccessToken, RefreshToken } from '@/src/constant/localStorageKey';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // TODO: Implement login functionality
        // console.log('Login:', email, password);
        login(email, password).then((res) => {
            console.log('login res-->', res)
            if (res.data.code === 200) {
                localStorage.setItem(AccessToken, res.data.data.access);
                localStorage.setItem(RefreshToken, res.data.data.refresh);
                router.push('/');
            }
        });
    };

    const handleRegister = () => {
        router.push('/register');
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>登录</ThemedText>
            
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

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.button}
                >
                    登录
                </Button>
                
                <Button
                    mode="outlined"
                    onPress={handleRegister}
                    style={styles.button}
                >
                    注册
                </Button>
            </View>
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