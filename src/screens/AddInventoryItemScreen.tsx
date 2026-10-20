
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colours';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AddInventoryItem'
>;

export default function AddInventoryItemScreen({
  route,
  navigation,
}: Props) {
  const { productId } = route.params;

  const [size, setSize] = useState('');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [condition, setCondition] = useState<'DS' | 'Used'>('DS');
  const [saving, setSaving] = useState(false);

  const handleAddItem = async () => {
    if (saving) return;

    const costNumber = Number(cost);

    if (!size.trim() || !location.trim() || !cost.trim()) {
      Alert.alert(
        'Missing information',
        'Please fill in all fields.'
      );
      return;
    }

    if (!Number.isFinite(costNumber) || costNumber < 0) {
      Alert.alert(
        'Invalid cost',
        'Please enter a valid cost.'
      );
      return;
    }

    setSaving(true);

    const today = new Date();
    const dateAdded = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    const { error } = await supabase
      .from('inventory_items')
      .insert({
        product_id: productId,
        size: size.trim(),
        condition,
        location: location.trim(),
        cost: costNumber,
        date_added: dateAdded,
      });

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      'Item added',
      'Inventory item added successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="add-circle-outline"
              size={26}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>
            Add Inventory Item
          </Text>

          <Text style={styles.subtitle}>
            Add an individual item to your available stock.
          </Text>
        </View>

        {/* Size */}
        <View style={styles.field}>
          <Text style={styles.label}>SIZE</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. UK10"
            placeholderTextColor={colors.textMuted}
            value={size}
            onChangeText={setSize}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!saving}
          />
        </View>

        {/* Condition */}
        <View style={styles.field}>
          <Text style={styles.label}>CONDITION</Text>

          <View style={styles.conditionContainer}>
            <Pressable
              style={[
                styles.conditionButton,
                condition === 'DS' && styles.selectedCondition,
              ]}
              onPress={() => setCondition('DS')}
              disabled={saving}
            >
              <Text
                style={[
                  styles.conditionText,
                  condition === 'DS' && styles.selectedConditionText,
                ]}
              >
                DS
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.conditionButton,
                condition === 'Used' && styles.selectedCondition,
              ]}
              onPress={() => setCondition('Used')}
              disabled={saving}
            >
              <Text
                style={[
                  styles.conditionText,
                  condition === 'Used' && styles.selectedConditionText,
                ]}
              >
                Used
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>STORAGE LOCATION</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. A01"
            placeholderTextColor={colors.textMuted}
            value={location}
            onChangeText={setLocation}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!saving}
          />
        </View>

        {/* Cost */}
        <View style={styles.field}>
          <Text style={styles.label}>COST (£)</Text>

          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
            inputAccessoryViewID="priceKeyboard"
            editable={!saving}
          />
        </View>

        {/* Save */}
        <Pressable
          style={[
            styles.addButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleAddItem}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={20}
                color={colors.background}
              />
              <Text style={styles.addButtonText}>
                Add Item
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.helperText}>
          This item will appear in available inventory
          until it is marked as sold.
        </Text>
      </ScrollView>

      {/* iOS numeric keyboard toolbar */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="priceKeyboard">
          <View style={styles.keyboardToolbar}>
            <Pressable onPress={() => Keyboard.dismiss()}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 30,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  field: {
    marginBottom: 23,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 9,
  },

  input: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    paddingHorizontal: 15,
    color: colors.text,
    fontSize: 15,
  },

  conditionContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  conditionButton: {
    flex: 1,
    height: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCondition: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },

  conditionText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },

  selectedConditionText: {
    color: colors.primary,
  },

  addButton: {
    backgroundColor: colors.primary,
    minHeight: 52,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  addButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },

  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },

  keyboardToolbar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },

  doneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
