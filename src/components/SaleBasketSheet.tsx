
import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useSaleBasket } from '../context/SaleBasketContext';
import { colors } from '../theme/colours';
import SalePriceInput from './SalePriceInput';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SaleBasketSheet({
  visible,
  onClose,
}: Props) {
  const { items, removeItem, updatePrice } = useSaleBasket();

  const total = items.reduce(
    (sum, item) => sum + item.salePrice,
    0
  );

  const totalCost = items.reduce(
    (sum, item) => sum + item.cost,
    0
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Sale Basket ({items.length})
            </Text>

            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {items.map((item) => (
              <View
                key={item.inventoryItemId}
                style={styles.itemCard}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.brand} {item.name}
                  </Text>

                  <Text style={styles.itemSize}>
                    {item.size}
                  </Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Selling price (£)</Text>

                    <SalePriceInput
                      price={item.salePrice}
                      onPriceChange={(price) =>
                        updatePrice(item.inventoryItemId, price)
                      }
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() =>
                    removeItem(item.inventoryItemId)
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Revenue
              </Text>
              <Text style={styles.summaryValue}>
                £{total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Cost
              </Text>
              <Text style={styles.summaryValue}>
                £{totalCost.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Profit
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      total - totalCost >= 0
                        ? colors.primary
                        : colors.danger,
                  },
                ]}
              >
                £{(total - totalCost).toFixed(2)}
              </Text>
            </View>

            <Pressable
              style={styles.completeButton}
              onPress={() => {
                // Transaction completion comes later.
                console.log('Complete sale pressed');
              }}
            >
              <Text style={styles.completeButtonText}>
                Complete Sale
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  itemSize: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  itemPrice: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  summary: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    color: '#10151D',
    fontSize: 16,
    fontWeight: '700',
  },

  priceContainer: {
    marginTop: 12,
    gap: 6,
  },

  priceLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },

  priceInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 110,
  },
});
