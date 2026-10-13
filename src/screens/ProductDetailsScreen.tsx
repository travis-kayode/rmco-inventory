
import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
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
      .select('*')
      .eq('product_id', productId);

    if (error) {
      console.log('Error fetching items for product:', error.message);
      return;
    }

    setProductInventory(data);
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
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No inventory items added yet.
          </Text>
        }
      />

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
});
