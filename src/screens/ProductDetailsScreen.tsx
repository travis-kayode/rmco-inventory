
import {
  StyleSheet, Text, View, Pressable, FlatList, Modal, TextInput,
  Keyboard, Alert,
} from 'react-native';
import InventoryItemRow from '../components/InventoryItemRow';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import type { Product, InventoryItem } from '../types/inventory';

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
    if (sellingItemId === null || savingSale) {
      return;
    }

    const price = Number(salePrice);

    if (!salePrice.trim() || !Number.isFinite(price) || price < 0) {
      Alert.alert('Invalid price', 'Please enter a valid selling price.');
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

    Alert.alert('Success', 'Sale recorded successfully!');
  };

  useFocusEffect(
    useCallback(() => {
      fetchProduct();
      fetchInventory();
    }, [productId])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product?.name}</Text>
      <Text style={styles.subtitle}>
        {product?.brand} · {product?.colourway}
      </Text>

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
                expandedItemId === item.id ? null : item.id
              );
            }}
            onSell={() => setSellingItemId(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No inventory items added yet.
          </Text>
        }
      />

      <Modal
        visible={sellingItemId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSellingItemId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sell Item</Text>

            <Text>Sale Price (£)</Text>
            <TextInput
              style={styles.saleInput}
              placeholder="Enter selling price"
              keyboardType="decimal-pad"
              value={salePrice}
              onChangeText={setSalePrice}
            />

            <Pressable
              style={styles.confirmButton}
              onPress={handleConfirmSale}
              disabled={savingSale}
            >
              <Text style={styles.confirmButtonText}>
                {savingSale ? 'Saving...' : 'Confirm Sale'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setSellingItemId(null);
                setSalePrice('');
                Keyboard.dismiss();
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddInventoryItem', { productId })
        }
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
  },

  subtitle: {
    fontSize: 15,
    color: '#666666',
    marginTop: 4,
  },

  listContent: {
    paddingTop: 20,
    paddingBottom: 110,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777777',
    fontSize: 16,
  },

  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 10,
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },

  saleInput: {
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
  },

  confirmButton: {
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
});
