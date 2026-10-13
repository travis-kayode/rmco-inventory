import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogIn = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Missing fields', 'Please enter your email and password.');
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });

        if (error) {
            Alert.alert('Login failed', error.message);
            return;
        }

        console.log('Logged in user:', data.user?.id);
        const { data: isMember, error: memberError } =
            await supabase.rpc('is_business_member');

        if (memberError) {
            Alert.alert('Error', 'Could not verify your access.');
            await supabase.auth.signOut();
            return;
        }

        if (!isMember) {
            Alert.alert('Access denied', 'You are not authorised to use Arrange.');
            await supabase.auth.signOut();
            return;
        }

        console.log('Access granted!');
    };


    return (

        <View style={styles.container}>
            <Text style={styles.title}>Log In</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.credInput}
                placeholder='johndoe@email.com'
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.credInput}
                placeholder='password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Pressable style={styles.button}
                onPress={handleLogIn}

            >
                <Text style={styles.buttonText}>Log In</Text>
            </Pressable>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: '600',
    },

    label: {
        fontSize: 15
    },

    credInput: {
        height: 48,
        borderWidth: 1,
        borderColor: '#d1d1d1',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginTop: 20,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#111111',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});