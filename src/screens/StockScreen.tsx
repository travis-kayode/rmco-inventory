
import { useState, useCallback, useRef } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    FlatList,
    ActivityIndicator,
} from 'react-native';


import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ProductRow from '../components/ProductRow';
import type { Product } from '../types/inventory';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';

import StockFilterModal, {
    type StockFilters,
} from '../components/StockFilterModal';

type StockScreenProps = NativeStackScreenProps<
    RootStackParamList,
    'Stock'
>;

type StockProduct = Product & {
    stock_count: number;
    sizes: Record<string, number>;
};

const PAGE_SIZE = 20;

export default function StockScreen({
    navigation,
}: StockScreenProps) {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<StockProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const requestId = useRef(0);
    const loadingRef = useRef(false);
    const nextPageRef = useRef(0);
    const hasMoreRef = useRef(true);

    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [filters, setFilters] = useState<StockFilters>({
        condition: null,
        size: null,
        location: null,
    });

    const [availableSizes, setAvailableSizes] = useState<string[]>([]);
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);

    const fetchPage = async (
        searchText: string,
        page: number,
        currentRequestId: number
    ) => {
        if (loadingRef.current) return;

        loadingRef.current = true;

        if (page === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        setErrorMessage(null);

        try {
            const { data, error } = await supabase.rpc('search_stock', {
                search_term: searchText.trim(),
                page_size: PAGE_SIZE,
                page_offset: page * PAGE_SIZE,
                filter_size: filters.size,
                filter_condition: filters.condition,
                filter_location: filters.location,
            });

            // Ignore outdated requests.
            if (currentRequestId !== requestId.current) {
                return;
            }

            if (error) {
                console.log('Error fetching stock:', error.message);
                setErrorMessage('Unable to load stock. Please try again.');
                return;
            }

            const newProducts = (data ?? []) as StockProduct[];

            setProducts((previous) =>
                page === 0
                    ? newProducts
                    : [...previous, ...newProducts]
            );

            nextPageRef.current = page + 1;
            hasMoreRef.current = newProducts.length === PAGE_SIZE;
        } catch (error) {
            if (currentRequestId === requestId.current) {
                console.log('Unexpected stock error:', error);
                setErrorMessage('Unable to load stock. Please try again.');
            }
        } finally {
            if (currentRequestId === requestId.current) {
                loadingRef.current = false;
                setLoading(false);
                setLoadingMore(false);
            }
        }
    };

    const fetchFilterOptions = async () => {
        const { data, error } = await supabase.rpc(
            'get_stock_filter_options'
        );

        if (error) {
            console.log('Error fetching filter options:', error.message);
            return;
        }

        setAvailableSizes(data?.sizes ?? []);
        setAvailableLocations(data?.locations ?? []);
    };

    useFocusEffect(
        useCallback(() => {
            void fetchFilterOptions();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const currentRequestId = ++requestId.current;

            loadingRef.current = false;
            nextPageRef.current = 0;
            hasMoreRef.current = true;

            setProducts([]);
            setLoading(true);
            setLoadingMore(false);
            setErrorMessage(null);

            const timeout = setTimeout(() => {
                void fetchPage(search, 0, currentRequestId);
            }, 300);

            return () => {
                clearTimeout(timeout);
                requestId.current++;
            };
        }, [search, filters])
    );

    const loadMore = () => {
        if (
            loadingRef.current ||
            !hasMoreRef.current ||
            nextPageRef.current === 0 ||
            loading
        ) {
            return;
        }

        void fetchPage(
            search,
            nextPageRef.current,
            requestId.current
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Arrange</Text>

            <View style={styles.header}>
                <Text style={styles.heading}>Stock</Text>

                <Pressable
                    onPress={() => navigation.navigate('AddProduct')}
                >
                    <Text style={styles.addButton}>+</Text>
                </Pressable>
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Search inventory..."
                value={search}
                onChangeText={setSearch}
            />

            <Pressable
                style={styles.filtersButton}
                onPress={() => setFilterModalVisible(true)}
            >
                <Text style={styles.filtersButtonText}>
                    Filters
                    {Object.values(filters).some((value) => value !== null)
                        ? ' • Active'
                        : ''}
                </Text>
            </Pressable>

            <FlatList
                data={products}
                keyExtractor={(product) => product.id.toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item: product }) => {
                    const sizeDisplay = Object.entries(product.sizes)
                        .map(
                            ([size, count]) =>
                                `${size} ×${count}`
                        )
                        .join(' · ');

                    return (
                        <ProductRow
                            name={product.name}
                            brand={product.brand}
                            colourway={product.colourway}
                            stockCount={product.stock_count}
                            sizes={sizeDisplay}
                            onPress={() => {
                                navigation.navigate('ProductDetails', {
                                    productId: product.id,
                                });
                            }}
                        />
                    );
                }}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator
                            size="large"
                            style={styles.indicator}
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            {errorMessage ?? 'No products found.'}
                        </Text>
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator
                            size="small"
                            style={styles.indicator}
                        />
                    ) : products.length > 0 && errorMessage ? (
                        <Text style={styles.emptyText}>
                            {errorMessage}
                        </Text>
                    ) : null
                }
            />
            <StockFilterModal
                visible={filterModalVisible}
                filters={filters}
                sizes={availableSizes}
                locations={availableLocations}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setFilterModalVisible(false);
                }}
                onClose={() => setFilterModalVisible(false)}
            />
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

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
    },

    addButton: {
        fontSize: 32,
        fontWeight: '400',
    },

    listContent: {
        paddingTop: 16,
        paddingBottom: 30,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#777777',
        fontSize: 16,
    },

    indicator: {
        marginVertical: 24,
    },

    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 15,
    },

    filterButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d1d1',
    },

    filterButtonSelected: {
        backgroundColor: '#111111',
        borderColor: '#111111',
    },

    filterText: {
        color: '#111111',
        fontSize: 14,
    },

    filterTextSelected: {
        color: '#ffffff',
    },

    filtersButton: {
        alignSelf: 'flex-start',
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d1d1d1',
        borderRadius: 8,
    },

    filtersButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
});
