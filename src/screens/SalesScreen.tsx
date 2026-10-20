
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../lib/supabase';
import type { SalesHistoryItem } from '../types/inventory';
import { fetchSalesHistory } from '../services/salesHistory';
import { colors } from '../theme/colours';

export default function SalesScreen() {
  const [sales, setSales] = useState<SalesHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const history = await fetchSalesHistory();
      setSales(history);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setErrorMessage('Unable to load sales. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void fetchSales();
    }, [])
  );

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.salePrice,
    0
  );

  const totalCost = sales.reduce(
    (total, sale) => total + sale.cost,
    0
  );

  const totalProfit = totalRevenue - totalCost;

  const formatMoney = (amount: number) =>
    `£${amount.toFixed(2)}`;

  const formatDate = (date: string) => {
    if (!date) return '';

    const [year, month, day] = date.split('-');

    return `${day}/${month}/${year}`;
  };

  const renderSummary = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          RM&CO PERFORMANCE
        </Text>
        <Text style={styles.title}>
          Sales History
        </Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryLabel}>
            TOTAL PROFIT
          </Text>

          <Ionicons
            name="trending-up-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <Text
          style={[
            styles.summaryValue,
            totalProfit < 0 && { color: colors.danger },
          ]}
        >
          {formatMoney(totalProfit)}
        </Text>

        <View style={styles.divider} />

        <View style={styles.summaryBottom}>
          <View style={styles.summaryStat}>
            <Text style={styles.statLabel}>
              Revenue
            </Text>
            <Text style={styles.statValue}>
              {formatMoney(totalRevenue)}
            </Text>
          </View>

          <View style={styles.summaryStat}>
            <Text style={styles.statLabel}>
              Cost
            </Text>
            <Text style={styles.statValue}>
              {formatMoney(totalCost)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          RECENT SALES
        </Text>

        <Text style={styles.saleCount}>
          {sales.length}{' '}
          {sales.length === 1 ? 'sale' : 'sales'}
        </Text>
      </View>
    </>
  );


  const renderSale = ({ item }: { item: SalesHistoryItem }) => {
    const profit = item.salePrice - item.cost;

    return (
      <View style={styles.saleCard}>
        <View style={styles.saleHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {item.brand} {item.name}
            </Text>

            <Text style={styles.details}>
              {[
                item.colourway,
                item.size,
                item.condition,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>

          <View style={styles.priceColumn}>
            <Text style={styles.salePrice}>
              {formatMoney(item.salePrice)}
            </Text>

            <Text
              style={[
                styles.profit,
                {
                  color:
                    profit >= 0
                      ? colors.primary
                      : colors.danger,
                },
              ]}
            >
              {profit >= 0 ? '+' : '-'}
              {formatMoney(Math.abs(profit))}
            </Text>
          </View>
        </View>

        <View style={styles.saleFooter}>
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={colors.textMuted}
            />

            <Text style={styles.dateText}>
              {formatDate(item.soldDate.slice(0, 10))}
            </Text>
          </View>

          <Text style={styles.costText}>
            Cost: {formatMoney(item.cost)}
          </Text>
        </View>
      </View>
    );
  };


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text style={styles.loadingText}>
          Loading sales...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="alert-circle-outline"
          size={32}
          color={colors.danger}
        />

        <Text style={styles.errorText}>
          {errorMessage}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={fetchSales}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={renderSale}
        ListHeaderComponent={renderSummary}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={36}
              color={colors.textMuted}
            />

            <Text style={styles.emptyTitle}>
              No sales recorded yet
            </Text>

            <Text style={styles.emptyText}>
              Sales will appear here once you sell
              an inventory item.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
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
  },

  summary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  summaryValue: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 10,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },

  summaryBottom: {
    flexDirection: 'row',
    gap: 20,
  },

  summaryStat: {
    flex: 1,
  },

  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },

  statValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  saleCount: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  saleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
  },

  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  details: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },

  priceColumn: {
    alignItems: 'flex-end',
    marginLeft: 4,
  },

  salePrice: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  profit: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },

  saleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dateText: {
    color: colors.textMuted,
    fontSize: 11,
  },

  costText: {
    color: colors.textMuted,
    fontSize: 11,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
    paddingHorizontal: 24,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 8,
  },

  retryText: {
    color: colors.background,
    fontWeight: '700',
  },
});
