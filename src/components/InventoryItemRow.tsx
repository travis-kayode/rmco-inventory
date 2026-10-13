import { StyleSheet, Text, View, Pressable } from 'react-native';

type InventoryItemRowProps = {
    size: string;
    condition: string;
    location: string;
    cost: number;
    asking_price: number | null;
    expanded: boolean;
    onPress: () => void;
    date_added: string;
};

export default function InventoryItemRow({
    size,
    condition,
    location,
    cost,
    asking_price,
    expanded,
    onPress,
    date_added,

}: InventoryItemRowProps) {
    return (
        <View style={styles.container}>

            <Pressable onPress={onPress}>
                <Text>{size} · {condition}</Text>
                <Text>Location: {location}</Text>
                <Text>Cost: £{cost}</Text>
                <Text>{expanded ? '▲' : '▼'}</Text>
            </Pressable>

            {expanded && (
                <View style={styles.actionsContainer}>
                    <Text>Date added: {date_added}</Text>

                    <View style={styles.actionsRow}>
                        <Pressable style={styles.actionButton}>
                            <Text>Edit Item</Text>
                        </Pressable>

                        <Pressable style={styles.actionButton}>
                            <Text>Sell Item</Text>
                        </Pressable>
                    </View>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
    },

    actionsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
    },

    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },

    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#eeeeee',
        alignItems: 'center',
    },
});
