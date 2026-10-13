import { StyleSheet, Text, View, Pressable } from 'react-native';
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
  route, navigation,
}: ProductDetailsScreenProps) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [productInventory, setProductInventory] = useState<InventoryItem[]>([]);

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
      console.log('Error fetching items for product', error.message);
      return;
    }
    setProductInventory(data)

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
      <Text>{product?.brand} · {product?.colourway} </Text>


      {productInventory.map((item) => {
        return (
          <InventoryItemRow
            key={item.id}
            size={item.size}
            condition={item.condition}
            location={item.location}
            cost={item.cost}
            asking_price={item.asking_price}
          />
        );
      })}

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
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 30,
  },
});