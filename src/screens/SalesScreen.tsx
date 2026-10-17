import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import type { Sale } from '../types/inventory';


export default function SalesScreen() {

    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchSales = async () => {
        setLoading(true);
        setErrorMessage(null);

        const { data, error } = await supabase
            .from('sales')
            .select(`
            id,
            sale_price,
            sold_date,
            inventory_items (
                id,
                size,
                condition,
                cost,
                products (
                    brand,
                    name,
                    colourway
                )
            )
        `)
            .order('sold_date', { ascending: false })
            .returns<Sale[]>();

        if (error) {
            console.log('Error fetching sales:', error.message);
            setErrorMessage('Unable to load sales. Please try again.');
            setLoading(false);
            return;
        }

        setSales(data ?? []);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            void fetchSales();
        }, [])
    );

    const totalRevenue = sales.reduce(
        (total, sale) => total + sale.sale_price,
        0
    );

    const totalCost = sales.reduce(
        (total, sale) => total + sale.inventory_items.cost,
        0
    );

    const totalProfit = totalRevenue - totalCost;

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Loading sales...</Text>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <View style={styles.centered}>
                <Text>{errorMessage}</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sales History</Text>

            <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Total Profit</Text>
                <Text style={styles.summaryValue}>
                    £{totalProfit.toFixed(2)}
                </Text>

                <Text>
                    Revenue: £{totalRevenue.toFixed(2)}
                </Text>
                <Text>
                    Cost: £{totalCost.toFixed(2)}
                </Text>
            </View>

            <FlatList
                data={sales}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const inventory = item.inventory_items;
                    const product = inventory.products;
                    const profit = item.sale_price - inventory.cost;

                    return (
                        <View style={styles.saleCard}>
                            <View style={styles.saleHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.productName}>
                                        {product.brand} {product.name}
                                    </Text>

                                    <Text style={styles.details}>
                                        {product.colourway} · {inventory.size} · {inventory.condition}
                                    </Text>

                                    <Text style={styles.details}>
                                        Sold: {item.sold_date}
                                    </Text>
                                </View>

                                <View style={styles.priceColumn}>
                                    <Text style={styles.salePrice}>
                                        £{item.sale_price.toFixed(2)}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.profit,
                                            { color: profit >= 0 ? '#15803d' : '#dc2626' },
                                        ]}
                                    >
                                        {profit >= 0 ? '+' : '-'}£{Math.abs(profit).toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.costText}>
                                Purchase cost: £{inventory.cost.toFixed(2)}
                            </Text>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No sales recorded yet.</Text>
                }
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
    },

    summary: {
        backgroundColor: '#f4f4f4',
        padding: 20,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
    },

    summaryLabel: {
        color: '#666666',
        fontSize: 14,
    },

    summaryValue: {
        fontSize: 30,
        fontWeight: '700',
        marginVertical: 8,
    },

    saleCard: {
        borderWidth: 1,
        borderColor: '#eeeeee',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },

    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    productName: {
        fontSize: 16,
        fontWeight: '600',
    },

    details: {
        color: '#777777',
        fontSize: 13,
        marginTop: 5,
    },

    priceColumn: {
        alignItems: 'flex-end',
        marginLeft: 12,
    },

    salePrice: {
        fontSize: 17,
        fontWeight: '600',
    },

    profit: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },

    costText: {
        fontSize: 12,
        color: '#777777',
        marginTop: 12,
    },

    emptyText: {
        textAlign: 'center',
        color: '#777777',
        marginTop: 30,
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        gap: 12,
    },
});