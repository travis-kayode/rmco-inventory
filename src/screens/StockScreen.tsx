import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import ProductRow from '../components/ProductRow';
import { products } from '../data/sampleProducts';
import { inventoryItems } from '../data/sampleInventory';

export default function StockScreen() {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchText) ||
      product.brand.toLowerCase().includes(searchText) ||
      product.colourway.toLowerCase().includes(searchText)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arrange</Text>
      <Text style={styles.heading}>Stock</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search inventory..."
        value={search}
        onChangeText={setSearch}
      />

      {filteredProducts.map((product) => {
        const productInventory = inventoryItems.filter(
          (item) => item.product_id === product.id
        );

        const sizes = productInventory.map((item) => item.size);
        const counts: Record<string, number> = {};
        for (const size of sizes) {
            if (size in counts) {
                counts[size] += 1;
            } 
            else {
                counts[size] = 1;
            }
        };

        const sizeDisplay = Object.entries(counts)
            .map(([size, count]) => `${size} ×${count}`)
            .join(' · ');
    
        return (
          <ProductRow
            key={product.id}
            name={product.name}
            brand={product.brand}
            colourway={product.colourway}
            stockCount={productInventory.length}
            sizes={sizeDisplay}
          />
        );
    })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 30,
  },

  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginTop: 20,
    fontSize: 16,
  },
});