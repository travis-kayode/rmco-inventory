import { StyleSheet, Text, View } from 'react-native';
import { products } from '../data/sampleProducts';
import { inventoryItems } from '../data/sampleInventory';
import InventoryItemRow from '../components/InventoryItemRow';

export default function ProductDetailsScreen({ route }: any) {
  const { productId } = route.params;

  const product = products.find(
    (product) => product.id === productId
  );

  const productInventory = inventoryItems.filter(
    (item) => item.product_id === productId
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
});