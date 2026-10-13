import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Keyboard, InputAccessoryView, Platform } from 'react-native';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AddInventoryItem'
>;

export default function AddInventoryItemScreen({ route, navigation }: Props) {
  const { productId } = route.params;

  const [size, setSize] = useState('');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [condition, setCondition] = useState<'DS' | 'Used'>('DS');
  const dateAdded = new Date().toLocaleDateString('en-CA');

  const handleAddItem = async () => {
    const costNumber = Number(cost);

    // 1. Validate inputs
    if (!size.trim() || !location.trim() || !cost.trim()) {
      Alert.alert('Missing information', 'Please fill in all fields.');
      return;
    }

    if (!Number.isFinite(costNumber) || costNumber < 0) {
      Alert.alert('Invalid cost', 'Please enter a valid cost.');
      return;
    }

    // 2. Save to Supabase
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        product_id: productId,
        size: size.trim(),
        condition,
        location: location.trim(),
        cost: costNumber,
        date_added: dateAdded,
      })
      .select()
      .single();

    // 3. Handle errors
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    // 4. Confirm success
    console.log('Saved inventory item:', data);

    Alert.alert('Success', 'Inventory item added successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Item</Text>
      <Text style={styles.label}>Size</Text>
      <TextInput
        style={styles.stockInput}
        placeholder="Size"
        value={size}
        onChangeText={setSize}
      />

      <Text style={styles.label}>Condition</Text>

      <View style={styles.conditionContainer}>
        <Pressable
          style={[
            styles.conditionButton,
            condition === 'DS' && styles.selectedCondition,
          ]}
          onPress={() => setCondition('DS')}
        >
          <Text>DS</Text>
        </Pressable>

        <Pressable
          style={[
            styles.conditionButton,
            condition === 'Used' && styles.selectedCondition,
          ]}
          onPress={() => setCondition('Used')}
        >
          <Text>Used</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.stockInput}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Text style={styles.label}>Cost</Text>
      <TextInput
        style={styles.stockInput}
        placeholder="Cost in £"
        value={cost}
        onChangeText={setCost}
        keyboardType="decimal-pad"
        inputAccessoryViewID="priceKeyboard"
      />

      <Pressable style={styles.button}
        onPress={handleAddItem}
      >
        <Text style={styles.buttonText}>Add Item</Text>

        {Platform.OS === 'ios' && (
          <InputAccessoryView nativeID="priceKeyboard">
            <View style={styles.keyboardToolbar}>
              <Pressable onPress={() => Keyboard.dismiss()}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        )}
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

  conditionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },

  conditionButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 8,
    alignItems: 'center',
  },

  selectedCondition: {
    backgroundColor: '#d1d1d1',
    borderColor: '#111111',
  },
  keyboardToolbar: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    alignItems: 'flex-end',
  },

  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});