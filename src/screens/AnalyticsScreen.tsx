
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';
import { colors } from '../theme/colours';

type AnalyticsSummary = {
    total_revenue: number;
    total_cost_of_sales: number;
    total_profit: number;
    items_sold: number;
    profit_margin: number;
    items_in_stock: number;
    stock_cost_value: number;
    potential_revenue: number;
    potential_profit: number;
    unpriced_items: number;
};

type MonthlyAnalytics = {
    month: string;
    revenue: number;
    cost: number;
    profit: number;
    items_sold: number;
};

const formatMoney = (value: number) =>
    `£${Number(value).toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

type MetricCardProps = {
    label: string;
    value: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    accent?: boolean;
};

function MetricCard({
    label,
    value,
    icon,
    accent = false,
}: MetricCardProps) {
    return (
        <View style={styles.metricCard}>
            <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>{label}</Text>

                <Ionicons
                    name={icon}
                    size={18}
                    color={colors.primary}
                />
            </View>

            <Text
                style={[
                    styles.metricValue,
                    accent && { color: colors.primary },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {value}
            </Text>
        </View>
    );
}

export default function AnalyticsScreen() {
    const insets = useSafeAreaInsets();

    const [summary, setSummary] =
        useState<AnalyticsSummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics[]>([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [monthlyLoading, setMonthlyLoading] = useState(true);
    const [monthlyError, setMonthlyError] = useState('');

    const fetchMonthlyAnalytics = useCallback(async () => {
        setMonthlyLoading(true);
        setMonthlyError('');

        const { data, error } = await supabase
            .rpc('get_monthly_analytics');

        if (error) {
            setMonthlyError(error.message);
            setMonthlyLoading(false);
            return;
        }

        const months = (data ?? []) as MonthlyAnalytics[];

        setMonthlyData(months);

        setSelectedMonth(previous =>
            previous && months.some(item => item.month === previous)
                ? previous
                : months[months.length - 1]?.month ?? ''
        );

        setMonthlyLoading(false);
    }, []);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setErrorMessage('');

        const { data, error } = await supabase
            .rpc('get_analytics_summary')
            .single();

        if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
        }

        setSummary(data as AnalyticsSummary);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            void fetchAnalytics();
            void fetchMonthlyAnalytics();
        }, [fetchAnalytics, fetchMonthlyAnalytics])
    );

    const selectedMonthData = monthlyData.find(
        item => item.month === selectedMonth
    );

    const recentMonths = monthlyData.slice(-6);

    const maxRevenue = Math.max(
        1,
        ...recentMonths.map(item => Number(item.revenue))
    );

    const formatMonth = (month: string) => {
        const [year, monthNumber] = month.split('-').map(Number);

        return new Date(year, monthNumber - 1, 1).toLocaleDateString(
            'en-GB',
            { month: 'short', year: 'numeric' }
        );
    };

    if (loading && !summary) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator
                    size="large"
                    color={colors.primary}
                />
                <Text style={styles.loadingText}>
                    Loading analytics...
                </Text>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <View style={styles.centered}>
                <Ionicons
                    name="alert-circle-outline"
                    size={38}
                    color={colors.danger}
                />

                <Text style={styles.errorTitle}>
                    Couldn't load analytics
                </Text>

                <Text style={styles.errorText}>
                    {errorMessage}
                </Text>

                <Pressable
                    style={styles.retryButton}
                    onPress={() => void fetchAnalytics()}
                >
                    <Text style={styles.retryText}>
                        Try Again
                    </Text>
                </Pressable>
            </View>
        );
    }

    if (!summary) return null;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 12 },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.eyebrow}>
                RM&CO PERFORMANCE
            </Text>

            <Text style={styles.title}>
                Analytics
            </Text>

            <Text style={styles.subtitle}>
                Your business at a glance
            </Text>

            {/* SALES PERFORMANCE */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    Sales performance
                </Text>
                <Text style={styles.sectionHint}>
                    All time
                </Text>
            </View>

            <View style={styles.metricGrid}>
                <MetricCard
                    label="REVENUE"
                    value={formatMoney(summary.total_revenue)}
                    icon="wallet-outline"
                />

                <MetricCard
                    label="REALIZED PROFIT"
                    value={formatMoney(summary.total_profit)}
                    icon="trending-up-outline"
                    accent
                />

                <MetricCard
                    label="ITEMS SOLD"
                    value={String(summary.items_sold)}
                    icon="bag-check-outline"
                />

                <MetricCard
                    label="PROFIT MARGIN"
                    value={`${Number(summary.profit_margin).toFixed(1)}%`}
                    icon="pie-chart-outline"
                />
            </View>

            <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>
                    Sales breakdown
                </Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                        Total revenue
                    </Text>
                    <Text style={styles.detailValue}>
                        {formatMoney(summary.total_revenue)}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                        Cost of sold items
                    </Text>
                    <Text style={styles.detailValue}>
                        {formatMoney(summary.total_cost_of_sales)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                        Realized profit
                    </Text>
                    <Text style={styles.profitValue}>
                        {formatMoney(summary.total_profit)}
                    </Text>
                </View>
            </View>

            {/* INVENTORY */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    Inventory overview
                </Text>
                <Text style={styles.sectionHint}>
                    Available stock
                </Text>
            </View>

            <View style={styles.metricGrid}>
                <MetricCard
                    label="IN STOCK"
                    value={`${summary.items_in_stock} items`}
                    icon="cube-outline"
                />

                <MetricCard
                    label="STOCK COST VALUE"
                    value={formatMoney(summary.stock_cost_value)}
                    icon="cash-outline"
                />

                <MetricCard
                    label="POTENTIAL REVENUE"
                    value={formatMoney(summary.potential_revenue)}
                    icon="pricetag-outline"
                />

                <MetricCard
                    label="POTENTIAL PROFIT"
                    value={formatMoney(summary.potential_profit)}
                    icon="stats-chart-outline"
                    accent
                />
            </View>

            {Number(summary.unpriced_items) > 0 && (
                <View style={styles.warningCard}>
                    <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={colors.warning}
                    />

                    <Text style={styles.warningText}>
                        {summary.unpriced_items} items don't have an
                        asking price. Potential revenue and profit
                        figures are incomplete.
                    </Text>
                </View>
            )}


            {/* MONTHLY PERFORMANCE */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    Monthly performance
                </Text>
                <Text style={styles.sectionHint}>
                    Last 12 months
                </Text>
            </View>

            {monthlyLoading ? (
                <ActivityIndicator
                    color={colors.primary}
                    style={{ marginVertical: 30 }}
                />
            ) : monthlyError ? (
                <View style={styles.detailCard}>
                    <Text style={styles.errorText}>
                        {monthlyError}
                    </Text>

                    <Pressable
                        style={styles.retryButton}
                        onPress={() => void fetchMonthlyAnalytics()}
                    >
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            ) : (
                <>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.monthSelector}
                    >
                        {monthlyData.slice().reverse().map(item => (
                            <Pressable
                                key={item.month}
                                onPress={() => setSelectedMonth(item.month)}
                                style={[
                                    styles.monthChip,
                                    selectedMonth === item.month &&
                                    styles.monthChipActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.monthChipText,
                                        selectedMonth === item.month &&
                                        styles.monthChipTextActive,
                                    ]}
                                >
                                    {formatMonth(item.month)}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {selectedMonthData && (
                        <View style={styles.detailCard}>
                            <Text style={styles.detailTitle}>
                                {formatMonth(selectedMonthData.month)}
                            </Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Revenue</Text>
                                <Text style={styles.detailValue}>
                                    {formatMoney(selectedMonthData.revenue)}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cost of sales</Text>
                                <Text style={styles.detailValue}>
                                    {formatMoney(selectedMonthData.cost)}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Items sold</Text>
                                <Text style={styles.detailValue}>
                                    {selectedMonthData.items_sold}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Profit</Text>
                                <Text
                                    style={[
                                        styles.profitValue,
                                        Number(selectedMonthData.profit) < 0 && {
                                            color: colors.danger,
                                        },
                                    ]}
                                >
                                    {formatMoney(selectedMonthData.profit)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* SIX-MONTH REVENUE CHART */}
                    <View style={styles.chartCard}>
                        <Text style={styles.detailTitle}>
                            Revenue trend
                        </Text>

                        <Text style={styles.chartSubtitle}>
                            Last 6 months
                        </Text>

                        <View style={styles.chart}>
                            {recentMonths.map(item => {
                                const revenue = Number(item.revenue);

                                const height =
                                    revenue > 0
                                        ? Math.max(5, (revenue / maxRevenue) * 140)
                                        : 3;

                                return (
                                    <View
                                        key={item.month}
                                        style={styles.chartColumn}
                                    >
                                        <View style={styles.barTrack}>
                                            <View
                                                style={[
                                                    styles.bar,
                                                    { height },
                                                ]}
                                            />
                                        </View>

                                        <Text style={styles.chartLabel}>
                                            {formatMonth(item.month).split(' ')[0]}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </>
            )}


            <Text style={styles.footerText}>
                Figures update from your recorded stock and sales.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    content: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    centered: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },

    loadingText: {
        color: colors.textSecondary,
        fontSize: 14,
    },

    errorTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
    },

    errorText: {
        color: colors.textSecondary,
        textAlign: 'center',
        fontSize: 13,
    },

    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 8,
    },

    retryText: {
        color: colors.background,
        fontWeight: '700',
    },

    eyebrow: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 6,
    },

    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: '700',
    },

    subtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 5,
        marginBottom: 28,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    sectionTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '700',
    },

    sectionHint: {
        color: colors.textMuted,
        fontSize: 12,
    },

    metricGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    metricCard: {
        width: '48.5%',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        minHeight: 105,
        justifyContent: 'space-between',
    },

    metricTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
    },

    metricLabel: {
        flex: 1,
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    metricValue: {
        color: colors.text,
        fontSize: 21,
        fontWeight: '800',
        marginTop: 15,
    },

    detailCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 28,
    },

    detailTitle: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 18,
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    detailLabel: {
        color: colors.textSecondary,
        fontSize: 13,
    },

    detailValue: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
    },

    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 14,
    },

    profitValue: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '700',
    },

    warningCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginTop: 2,
    },

    warningText: {
        flex: 1,
        color: colors.warning,
        fontSize: 12,
        lineHeight: 18,
    },

    footerText: {
        color: colors.textMuted,
        textAlign: 'center',
        fontSize: 11,
        marginTop: 22,
    },


    monthSelector: {
        marginBottom: 16,
    },

    monthChip: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 8,
    },

    monthChipActive: {
        backgroundColor: colors.primaryMuted,
        borderColor: colors.primary,
    },

    monthChipText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },

    monthChipTextActive: {
        color: colors.primary,
    },

    chartCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },

    chartSubtitle: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: -10,
        marginBottom: 20,
    },

    chart: {
        flexDirection: 'row',
        height: 180,
        justifyContent: 'space-around',
        alignItems: 'flex-end',
    },

    chartColumn: {
        flex: 1,
        alignItems: 'center',
    },

    barTrack: {
        height: 145,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    },

    bar: {
        width: '55%',
        maxWidth: 30,
        backgroundColor: colors.primary,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },

    chartLabel: {
        color: colors.textMuted,
        fontSize: 11,
        marginTop: 10,
    },

});
