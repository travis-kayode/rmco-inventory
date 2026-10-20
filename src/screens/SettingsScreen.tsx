
import { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../lib/supabase';
import { colors } from '../theme/colours';

export default function SettingsScreen() {
  const [email, setEmail] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? 'Unknown account');
    };

    void loadUser();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Arrange?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);

            const { error } = await supabase.auth.signOut();

            if (error) {
              Alert.alert('Sign out failed', error.message);
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ARRANGE</Text>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.sectionTitle}>ACCOUNT</Text>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.iconBox}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Signed in as</Text>
            <Text style={styles.rowValue}>{email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.iconBox}>
            <Ionicons
              name="storefront-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Business</Text>
            <Text style={styles.rowValue}>RM&CO</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>SESSION</Text>

      <Pressable
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={colors.danger}
        />

        <Text style={styles.signOutText}>Sign Out</Text>

        {signingOut && (
          <ActivityIndicator
            size="small"
            color={colors.danger}
          />
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Arrange</Text>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
  },

  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 28,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowContent: {
    flex: 1,
    gap: 4,
  },

  rowLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },

  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },

  signOutText: {
    flex: 1,
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },

  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 5,
  },

  footerTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  footerText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
