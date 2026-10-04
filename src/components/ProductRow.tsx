import { Pressable, StyleSheet, Text } from 'react-native';

type ProductRowProps = {
    name: string;
    brand: string;
    colourway: string;
    stockCount: number;
    sizes: string;
    onPress: () => void;
};

export default function ProductRow({
    name,
    brand,
    colourway,
    stockCount,
    sizes,
    onPress,
}: ProductRowProps) {
    return (
        <Pressable
            style={styles.product}
            onPress={onPress}
        >
            <Text style={styles.productName}>{name}</Text>
            <Text>{brand} · {colourway}</Text>
            <Text>{stockCount} in stock</Text>
            <Text>{sizes}</Text>
        </Pressable>
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

