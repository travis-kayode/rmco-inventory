
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RecordSaleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Sale</Text>
      <Text style={styles.subtitle}>
        Select inventory items to add to a sale.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
});
