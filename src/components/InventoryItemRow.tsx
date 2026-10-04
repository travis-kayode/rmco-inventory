import { StyleSheet, Text, View } from 'react-native';

type InventoryItemRowProps = {
    size: string,
    condition: string,
    location: string,
    cost: number,
    asking_price: number,
};

export default function InventoryItemRow({
    size,
    condition,
    location,
    cost,
    asking_price,

}: InventoryItemRowProps) {
    return (
        <View style={styles.container}>
            <Text>{size} · {condition}</Text>
            <Text>Location: {location}</Text>
            <Text>Cost: £{cost} · Asking: £{asking_price}</Text>
        </View>

    );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
});
