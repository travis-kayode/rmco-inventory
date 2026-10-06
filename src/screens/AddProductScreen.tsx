import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Alert } from 'react-native';

export default function AddProductScreen() {

    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [colourway, setColourway] = useState('');

    const handleCreateProduct = () => {
        if (!brand.trim()|| !name.trim() || !colourway.trim()) {
            Alert.alert('Missing fields', 'Please fill in all the fields');
        }else {
            console.log('Product can be created')
        }

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Stock</Text>
            <Text style={styles.label}>Brand</Text>
            <TextInput
                style={styles.stockInput}
                placeholder="Brand"
                value={brand}
                onChangeText={setBrand}
            />
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.stockInput}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <Text style={styles.label}>Colourway</Text>
            <TextInput
                style={styles.stockInput}
                placeholder="Colourway"
                value={colourway}
                onChangeText={setColourway}
            />

            <Pressable style={styles.button}
                onPress={handleCreateProduct}
            >
                <Text style={styles.buttonText}>Create Product</Text>
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

    stockInput: {
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