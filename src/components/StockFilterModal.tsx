
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colours';

export type StockFilters = {
  condition: string | null;
  size: string | null;
  location: string | null;
};

type Props = {
  visible: boolean;
  filters: StockFilters;
  sizes: string[];
  locations: string[];
  onApply: (filters: StockFilters) => void;
  onClose: () => void;
};

const emptyFilters: StockFilters = {
  condition: null,
  size: null,
  location: null,
};

export default function StockFilterModal({
  visible,
  filters,
  sizes,
  locations,
  onApply,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<StockFilters>(filters);

  useEffect(() => {
    if (visible) {
      setDraft({ ...filters });
    }
  }, [visible, filters]);

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
              onPress={() =>
                setDraft((previous) => ({
                  ...previous,
                  [key]: value,
                }))
              }
              style={[
                styles.chip,
                selected && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
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
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.panel}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Filter inventory</Text>

            <Pressable
              onPress={() => setDraft({ ...emptyFilters })}
            >
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderOptions('Condition', 'condition', [
              'DS',
              'Used',
            ])}

            {renderOptions('Size', 'size', sizes)}

            {renderOptions(
              'Storage location',
              'location',
              locations
            )}
          </ScrollView>

          <View style={styles.footer}>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  panel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  clearText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollArea: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 42,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.background,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
