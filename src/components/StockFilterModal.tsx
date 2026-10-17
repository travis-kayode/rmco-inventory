
import { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
} from 'react-native';

export type StockFilters = {
    condition: string | null;
    size: string | null;
    location: string | null;
};

type StockFilterModalProps = {
    visible: boolean;
    filters: StockFilters;
    sizes: string[];
    locations: string[];
    onApply: (filters: StockFilters) => void;
    onClose: () => void;
};

export default function StockFilterModal({
    visible,
    filters,
    sizes,
    locations,
    onApply,
    onClose,
}: StockFilterModalProps) {
    const [draft, setDraft] = useState<StockFilters>(filters);

    useEffect(() => {
        if (visible) {
            setDraft(filters);
        }
    }, [visible, filters]);

    const updateFilter = (
        key: keyof StockFilters,
        value: string | null
    ) => {
        setDraft((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const renderOptions = (
        title: string,
        key: keyof StockFilters,
        options: string[]
    ) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>

            <View style={styles.options}>
                {['All', ...options].map((option) => {
                    const value = option === 'All' ? null : option;
                    const selected = draft[key] === value;

                    return (
                        <Pressable
                            key={option}
                            style={[
                                styles.option,
                                selected && styles.selectedOption,
                            ]}
                            onPress={() => updateFilter(key, value)}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    selected && styles.selectedText,
                                ]}
                            >
                                {option}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable
                    style={styles.backdrop}
                    onPress={onClose}
                />

                <View style={styles.panel}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Filter inventory
                        </Text>

                        <Pressable
                            onPress={() =>
                                setDraft({
                                    condition: null,
                                    size: null,
                                    location: null,
                                })
                            }
                        >
                            <Text style={styles.clearText}>
                                Clear all
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        {renderOptions(
                            'Condition',
                            'condition',
                            ['DS', 'Used']
                        )}

                        {renderOptions('Size', 'size', sizes)}

                        {renderOptions(
                            'Storage location',
                            'location',
                            locations
                        )}
                    </ScrollView>

                    <Pressable
                        style={styles.applyButton}
                        onPress={() => onApply(draft)}
                    >
                        <Text style={styles.applyText}>
                            Apply filters
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    panel: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    clearText: {
        fontSize: 14,
        color: '#555',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    option: {
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    selectedOption: {
        backgroundColor: '#111',
        borderColor: '#111',
    },
    optionText: {
        fontSize: 14,
        color: '#111',
    },
    selectedText: {
        color: '#fff',
    },
    applyButton: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    applyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
