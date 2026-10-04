import { StyleSheet, Text, View } from 'react-native';

type ProductRowProps = {
  name: string;
  brand: string;
  colourway: string;
  stockCount: number;
  sizes: string;
};

export default function ProductRow({
  name,
  brand,
  colourway,
  stockCount,
  sizes,
}: ProductRowProps) {
  return (
    <View style={styles.product}>
      <Text style={styles.productName}>{name}</Text>
      <Text>{brand} · {colourway}</Text>
      <Text>{stockCount} in stock</Text>
      <Text>{sizes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  product: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  productName: {
    fontSize: 18,
    fontWeight: '600',
  },
});

