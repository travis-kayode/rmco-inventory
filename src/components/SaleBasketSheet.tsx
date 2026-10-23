
import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Crypto from 'expo-crypto';

import { useSaleBasket } from '../context/SaleBasketContext';
import { colors } from '../theme/colours';
import SalePriceInput from './SalePriceInput';

import {
  savePendingCheckout,
  clearPendingCheckout,
} from '../services/checkoutStorage';

import { checkoutSale } from '../services/saleTransactions';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SaleBasketSheet({
  visible,
  onClose,
}: Props) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const checkoutAttempt = useRef<{
    key: string;
    basketSignature: string;
  } | null>(null);

  const {
    items,
    removeItem,
    updatePrice,
    finishSuccessfulCheckout,
    pendingCheckout,
    setPendingCheckout,
    checkoutRecoveryLoading,
    checkoutRecoveryError,
  } = useSaleBasket();

  const total = items.reduce(
    (sum, item) => sum + item.salePrice,
    0
  );

  const totalCost = items.reduce(
    (sum, item) => sum + item.cost,
    0
  );

  const handleCheckout = async () => {
    if (isCheckingOut || checkoutRecoveryLoading) return;

    if (checkoutRecoveryError) {
      Alert.alert(
        'Checkout unavailable',
        checkoutRecoveryError
      );
      return;
    }

    if (pendingCheckout) {
      Alert.alert(
        'Pending checkout',
        'A previous checkout needs to be resolved before starting another sale.'
      );
      return;
    }

    if (items.length === 0) return;

    const checkoutItems = items.map((item) => ({
      inventoryItemId: item.inventoryItemId,
      salePrice: item.salePrice,
    }));

    const basketSignature = JSON.stringify(
      [...checkoutItems].sort(
        (a, b) => a.inventoryItemId - b.inventoryItemId
      )
    );

    if (
      checkoutAttempt.current &&
      checkoutAttempt.current.basketSignature !== basketSignature
    ) {
      Alert.alert(
        'Checkout needs checking',
        'The basket has changed since the previous checkout attempt. Check Sales History before starting another sale.'
      );
      return;
    }

    if (!checkoutAttempt.current) {
      checkoutAttempt.current = {
        key: Crypto.randomUUID(),
        basketSignature,
      };
    }

    const checkout = {
      key: checkoutAttempt.current.key,
      items: checkoutItems,
    };

    setIsCheckingOut(true);

    try {
      // Save the exact attempt before sending it to Supabase.
      await savePendingCheckout(checkout);

      // Lock basket editing while the outcome is unresolved.
      setPendingCheckout(checkout);


      const transactionId = await checkoutSale(
        checkout.key,
        checkout.items
      );



      // Keep the pending checkout recoverable until basket cleanup succeeds.
      await finishSuccessfulCheckout();
      await clearPendingCheckout();
      setPendingCheckout(null);
      checkoutAttempt.current = null;

      Alert.alert(
        'Sale completed',
        `Transaction #${transactionId} was recorded successfully.`
      );

      onClose();
    } catch (error) {
      Alert.alert(
        'Checkout needs attention',
        error instanceof Error
          ? error.message
          : 'Unable to confirm checkout. Check Sales History.'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleResumeCheckout = async () => {
    if (
      isCheckingOut ||
      checkoutRecoveryLoading ||
      checkoutRecoveryError ||
      !pendingCheckout
    ) {
      return;
    }

    setIsCheckingOut(true);

    try {
      // Retry the exact original checkout.
      const transactionId = await checkoutSale(
        pendingCheckout.key,
        pendingCheckout.items
      );



      // Keep the original checkout key until all local cleanup succeeds.
      await finishSuccessfulCheckout();
      await clearPendingCheckout();
      setPendingCheckout(null);
      checkoutAttempt.current = null;

      Alert.alert(
        'Sale completed',
        `Transaction #${transactionId} was confirmed successfully.`
      );

      onClose();
    } catch (error) {
      Alert.alert(
        'Checkout still unresolved',
        error instanceof Error
          ? error.message
          : 'Unable to confirm the sale. Please try again.'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const checkoutDisabled =
    isCheckingOut ||
    checkoutRecoveryLoading ||
    checkoutRecoveryError !== null ||
    pendingCheckout !== null ||
    items.length === 0;

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
                    <Text style={styles.priceLabel}>
                      Selling price (£)
                    </Text>

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

            {pendingCheckout !== null && (
              <View style={styles.recoveryContainer}>
                <Text style={styles.recoveryTitle}>
                  Previous checkout needs attention
                </Text>

                <Text style={styles.recoveryDescription}>
                  A previous sale may have been completed.
                  Resume it to confirm the result without
                  recording a duplicate transaction.
                </Text>

                <Pressable
                  style={[
                    styles.completeButton,
                    isCheckingOut && styles.disabledButton,
                  ]}
                  onPress={handleResumeCheckout}
                  disabled={isCheckingOut}
                >
                  <Text style={styles.completeButtonText}>
                    {isCheckingOut
                      ? 'Checking previous sale...'
                      : 'Resume Checkout'}
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable
              style={[
                styles.completeButton,
                checkoutDisabled && styles.disabledButton,
              ]}
              onPress={handleCheckout}
              disabled={checkoutDisabled}
            >
              <Text style={styles.completeButtonText}>
                {isCheckingOut
                  ? 'Completing sale...'
                  : 'Complete Sale'}
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
  priceContainer: {
    marginTop: 12,
    gap: 6,
  },
  priceLabel: {
    color: colors.textMuted,
    fontSize: 12,
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
  disabledButton: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: '#10151D',
    fontSize: 16,
    fontWeight: '700',
  },


  recoveryContainer: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    gap: 8,
  },

  recoveryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  recoveryDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
