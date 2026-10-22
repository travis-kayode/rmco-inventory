
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useSaleBasket } from '../context/SaleBasketContext';
import { colors } from '../theme/colours';

type Props = {
  onPress: () => void;
};

export default function SaleBasketBar({ onPress }: Props) {
  const { items } = useSaleBasket();

  const total = items.reduce(
    (sum, item) => sum + item.salePrice,
    0
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.left}>
        <Ionicons
          name="basket-outline"
          size={22}
          color={colors.text}
        />

        <View>
          <Text style={styles.title}>
            Sale Basket · {items.length} item
            {items.length !== 1 ? 's' : ''}
          </Text>

          <Text style={styles.subtitle}>
            Tap to review sale
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.total}>
          £{total.toFixed(2)}
        </Text>

        <Ionicons
          name="chevron-up"
          size={20}
          color={colors.text}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  total: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
