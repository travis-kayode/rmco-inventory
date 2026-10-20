
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
import type { Sale } from '../types/inventory';
import { colors } from '../theme/colours';

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        sale_price,
        sold_date,
        inventory_items (
          id,
          size,
          condition,
          cost,
          products (
            brand,
            name,
            colourway
          )
        )
      `)
      .order('sold_date', { ascending: false })
      .returns<Sale[]>();

    if (error) {
      console.log('Error fetching sales:', error.message);
      setErrorMessage('Unable to load sales. Please try again.');
      setLoading(false);
      return;
    }

    setSales(data ?? []);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      void fetchSales();
    }, [])
  );

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.sale_price,
    0
  );

  const totalCost = sales.reduce(
    (total, sale) => total + sale.inventory_items.cost,
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

  const renderSale = ({ item }: { item: Sale }) => {
    const inventory = item.inventory_items;
    const product = inventory.products;
    const profit = item.sale_price - inventory.cost;

    return (
      <View style={styles.saleCard}>
        <View style={styles.saleHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {product.brand} {product.name}
            </Text>

            <Text style={styles.details}>
              {product.colourway} · {inventory.size} ·{' '}
              {inventory.condition}
            </Text>
          </View>

          <View style={styles.priceColumn}>
            <Text style={styles.salePrice}>
              {formatMoney(item.sale_price)}
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
              {formatDate(item.sold_date)}
            </Text>
          </View>

          <Text style={styles.costText}>
            Cost: {formatMoney(inventory.cost)}
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
        keyExtractor={(item) => item.id.toString()}
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
