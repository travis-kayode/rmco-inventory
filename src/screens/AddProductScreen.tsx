
import { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
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

import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colours';

type AddProductScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddProduct'
>;

export default function AddProductScreen({
  navigation,
}: AddProductScreenProps) {
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [colourway, setColourway] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateProduct = async () => {
    if (saving) return;

    if (!brand.trim() || !name.trim() || !colourway.trim()) {
      Alert.alert(
        'Missing fields',
        'Please fill in all fields.'
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('products')
      .insert({
        brand: brand.trim(),
        name: name.trim(),
        colourway: colourway.trim(),
      });

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      'Product created',
      'Product created successfully!',
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
              name="cube-outline"
              size={24}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>Add Product</Text>

          <Text style={styles.subtitle}>
            Create a product before adding individual
            inventory items.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>BRAND</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Nike"
              placeholderTextColor={colors.textMuted}
              value={brand}
              onChangeText={setBrand}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!saving}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PRODUCT NAME</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Air Max 95"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!saving}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>COLOURWAY</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Black / Grey"
              placeholderTextColor={colors.textMuted}
              value={colourway}
              onChangeText={setColourway}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!saving}
              returnKeyType="done"
              onSubmitEditing={handleCreateProduct}
            />
          </View>
        </View>

        {/* Save button */}
        <Pressable
          style={[
            styles.createButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleCreateProduct}
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
              <Text style={styles.createButtonText}>
                Create Product
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.helperText}>
          After creating the product, you can add sizes,
          conditions, locations and prices.
        </Text>
      </ScrollView>
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
    marginBottom: 32,
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  form: {
    gap: 22,
  },

  field: {
    gap: 9,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
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

  createButton: {
    backgroundColor: colors.primary,
    minHeight: 52,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 34,
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
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
});
