
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import { supabase } from '../lib/supabase';
import { colors } from '../theme/colours';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogIn = async () => {
    if (loading) return;

    if (!email.trim() || !password) {
      Alert.alert(
        'Missing fields',
        'Please enter your email and password.'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Login failed', error.message);
        return;
      }

      const {
        data: isMember,
        error: memberError,
      } = await supabase.rpc('is_business_member');

      if (memberError) {
        Alert.alert(
          'Error',
          'Could not verify your access.'
        );
        await supabase.auth.signOut();
        return;
      }

      if (!isMember) {
        Alert.alert(
          'Access denied',
          'You are not authorised to use Arrange.'
        );
        await supabase.auth.signOut();
        return;
      }

      // App.tsx should detect the session change
      // and navigate to the main app automatically.
    } catch {
      Alert.alert(
        'Something went wrong',
        'Please try signing in again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <View style={styles.branding}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="cube-outline"
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={styles.logoText}>
            Arrange<Text style={styles.logoDot}>.</Text>
          </Text>

          <Text style={styles.tagline}>
            Inventory, organised.
          </Text>
        </View>

        {/* Sign in form */}
        <View style={styles.formHeader}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your inventory.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>

          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="username"
            editable={!loading}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleLogIn}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={21}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[
            styles.loginButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Text style={styles.loginButtonText}>
                Sign In
              </Text>
              <Ionicons
                name="arrow-forward"
                size={19}
                color={colors.background}
              />
            </>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Ionicons
            name="lock-closed-outline"
            size={13}
            color={colors.textMuted}
          />

          <Text style={styles.footerText}>
            Secure access to your inventory
          </Text>
        </View>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  branding: {
    alignItems: 'center',
    marginBottom: 55,
  },

  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  logoText: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },

  logoDot: {
    color: colors.primary,
  },

  tagline: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },

  formHeader: {
    marginBottom: 30,
  },

  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 7,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  field: {
    marginBottom: 22,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  input: {
    height: 54,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
  },

  passwordInput: {
    flex: 1,
    height: 54,
    paddingLeft: 16,
    color: colors.text,
    fontSize: 15,
  },

  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  loginButton: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 32,
  },

  footerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
