
import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import InventoryItemRow from '../components/InventoryItemRow';
import type { RootStackParamList } from '../types/navigation';
import type { Product, InventoryItem } from '../types/inventory';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colours';

type ProductDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductDetails'
>;

export default function ProductDetailsScreen({
  route,
  navigation,
}: ProductDetailsScreenProps) {
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [productInventory, setProductInventory] = useState<InventoryItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [sellingItemId, setSellingItemId] = useState<number | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [savingSale, setSavingSale] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.log('Error fetching product:', error.message);
      return;
    }

    setProduct(data);
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, sales(id)')
      .eq('product_id', productId);

    if (error) {
      console.log('Error fetching inventory:', error.message);
      return;
    }

    const availableItems = (data ?? []).filter(
      (item) => item.sales === null
    );

    setProductInventory(availableItems);
  };

  const handleConfirmSale = async () => {
    if (sellingItemId === null || savingSale) return;

    const price = Number(salePrice);

    if (!salePrice.trim() || !Number.isFinite(price) || price < 0) {
      Alert.alert(
        'Invalid price',
        'Please enter a valid selling price.'
      );
      return;
    }

    setSavingSale(true);

    const today = new Date();
    const soldDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    const { error } = await supabase
      .from('sales')
      .insert({
        inventory_item_id: sellingItemId,
        sale_price: price,
        sold_date: soldDate,
      });

    setSavingSale(false);

    if (error) {
      Alert.alert('Sale failed', error.message);
      return;
    }

    setSellingItemId(null);
    setSalePrice('');
    setExpandedItemId(null);

    await fetchInventory();

    Alert.alert(
      'Success',
      'Sale recorded successfully!'
    );
  };

  const closeSaleModal = () => {
    if (savingSale) return;

    setSellingItemId(null);
    setSalePrice('');
    Keyboard.dismiss();
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadData = async () => {
        setLoading(true);

        await Promise.all([
          fetchProduct(),
          fetchInventory(),
        ]);

        if (active) {
          setLoading(false);
        }
      };

      void loadData();

      return () => {
        active = false;
      };
    }, [productId])
  );

  return (
    <View style={styles.container}>
      {/* Product header */}
      <View style={styles.header}>
        <Text style={styles.brand}>
          {product?.brand?.toUpperCase()}
        </Text>

        <Text style={styles.title}>
          {product?.name ?? 'Product Details'}
        </Text>

        <Text style={styles.subtitle}>
          {product?.colourway}
        </Text>
      </View>

      {/* Inventory section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          AVAILABLE INVENTORY
        </Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {productInventory.length}{' '}
            {productInventory.length === 1
              ? 'ITEM'
              : 'ITEMS'}
          </Text>
        </View>
      </View>

      <FlatList
        data={productInventory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <InventoryItemRow
            size={item.size}
            condition={item.condition}
            location={item.location}
            cost={item.cost}
            date_added={item.date_added}
            expanded={expandedItemId === item.id}
            onPress={() => {
              setExpandedItemId(
                expandedItemId === item.id
                  ? null
                  : item.id
              );
            }}
            onSell={() => setSellingItemId(item.id)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loadingIndicator}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="cube-outline"
                size={36}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>
                No available inventory
              </Text>
              <Text style={styles.emptyText}>
                Tap the + button to add an item.
              </Text>
            </View>
          )
        }
      />

      {/* Sell item modal */}
      <Modal
        visible={sellingItemId !== null}
        transparent
        animationType="slide"
        onRequestClose={closeSaleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Sell Item
              </Text>

              <Pressable
                onPress={closeSaleModal}
                disabled={savingSale}
                accessibilityLabel="Close sale modal"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>
              SALE PRICE (£)
            </Text>

            <TextInput
              style={styles.saleInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={salePrice}
              onChangeText={setSalePrice}
              editable={!savingSale}
            />

            <Pressable
              style={[
                styles.confirmButton,
                savingSale && styles.disabledButton,
              ]}
              onPress={handleConfirmSale}
              disabled={savingSale}
            >
              {savingSale ? (
                <ActivityIndicator
                  color={colors.background}
                />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Confirm Sale
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={closeSaleModal}
              disabled={savingSale}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Floating add inventory button */}
      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddInventoryItem', {
            productId,
          })
        }
        accessibilityLabel="Add inventory item"
      >
        <Ionicons
          name="add"
          size={32}
          color={colors.background}
        />
      </Pressable>
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

  header: {
    marginBottom: 28,
  },

  brand: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  countBadge: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  countText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },

  listContent: {
    paddingBottom: 110,
    flexGrow: 1,
  },

  loadingIndicator: {
    marginTop: 40,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
    textAlign: 'center',
  },

  addButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 22,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },

  inputLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  saleInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    marginBottom: 20,
    color: colors.text,
    fontSize: 18,
  },

  confirmButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },

  disabledButton: {
    opacity: 0.6,
  },

  confirmButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },

  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
