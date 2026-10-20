
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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ProductRow from '../components/ProductRow';
import type { Product } from '../types/inventory';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colours';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

    const insets = useSafeAreaInsets();

    const activeFilterCount = Object.values(filters).filter(
        (value) => value !== null
    ).length;

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

            if (currentRequestId !== requestId.current) return;

            if (error) {
                console.log('Error fetching stock:', error.message);
                setErrorMessage('Unable to load stock. Please try again.');
                return;
            }

            const newProducts = (data ?? []) as StockProduct[];

            setProducts((previous) =>
                page === 0 ? newProducts : [...previous, ...newProducts]
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
        <View
            style={[
                styles.container,
                { paddingTop: insets.top + 12 },
            ]}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>RM&CO INVENTORY</Text>
                    <Text style={styles.heading}>Stock</Text>
                </View>

                <Pressable
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddProduct')}
                    accessibilityLabel="Add product"
                >
                    <Ionicons name="add" size={24} color={colors.background} />
                </Pressable>
            </View>

            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={colors.textMuted}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search inventory..."
                        placeholderTextColor={colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')}>
                            <Ionicons
                                name="close-circle"
                                size={19}
                                color={colors.textMuted}
                            />
                        </Pressable>
                    )}
                </View>

                <Pressable
                    style={[
                        styles.filtersButton,
                        activeFilterCount > 0 && styles.filtersButtonActive,
                    ]}
                    onPress={() => setFilterModalVisible(true)}
                    accessibilityLabel="Open stock filters"
                >
                    <Ionicons
                        name="options-outline"
                        size={21}
                        color={
                            activeFilterCount > 0
                                ? colors.primary
                                : colors.text
                        }
                    />
                    {activeFilterCount > 0 && (
                        <View style={styles.filterCount}>
                            <Text style={styles.filterCountText}>
                                {activeFilterCount}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AVAILABLE PRODUCTS</Text>
                {activeFilterCount > 0 && (
                    <Pressable
                        onPress={() =>
                            setFilters({
                                condition: null,
                                size: null,
                                location: null,
                            })
                        }
                    >
                        <Text style={styles.clearFilters}>Clear filters</Text>
                    </Pressable>
                )}
            </View>

            <FlatList
                data={products}
                keyExtractor={(product) => product.id.toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item: product }) => {
                    const sizeDisplay = Object.entries(product.sizes)
                        .map(([size, count]) => `${size} ×${count}`)
                        .join(' · ');

                    return (
                        <ProductRow
                            name={product.name}
                            brand={product.brand}
                            colourway={product.colourway}
                            stockCount={product.stock_count}
                            sizes={sizeDisplay}
                            onPress={() =>
                                navigation.navigate('ProductDetails', {
                                    productId: product.id,
                                })
                            }
                        />
                    );
                }}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator
                            size="large"
                            color={colors.primary}
                            style={styles.indicator}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="cube-outline"
                                size={36}
                                color={colors.textMuted}
                            />
                            <Text style={styles.emptyTitle}>
                                {errorMessage ? 'Something went wrong' : 'No products found'}
                            </Text>
                            <Text style={styles.emptyText}>
                                {errorMessage ??
                                    'Try another search or adjust your filters.'}
                            </Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                            style={styles.indicator}
                        />
                    ) : products.length > 0 && errorMessage ? (
                        <Text style={styles.emptyText}>{errorMessage}</Text>
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
        backgroundColor: colors.background,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    eyebrow: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.3,
        marginBottom: 5,
    },
    heading: {
        color: colors.text,
        fontSize: 30,
        fontWeight: '700',
    },
    addButton: {
        width: 46,
        height: 46,
        borderRadius: 13,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    searchContainer: {
        flex: 1,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 15,
        paddingVertical: 0,
    },
    filtersButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtersButtonActive: {
        borderColor: colors.primary,
    },
    filterCount: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.primary,
        borderRadius: 10,
        minWidth: 19,
        height: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterCountText: {
        color: colors.background,
        fontSize: 11,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    clearFilters: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 30,
        flexGrow: 1,
    },
    indicator: {
        marginVertical: 24,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 50,
        gap: 10,
    },
    emptyTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
        marginTop: 8,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
    },
});

