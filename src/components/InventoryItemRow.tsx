
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colours';

type InventoryItemRowProps = {
  size: string;
  condition: string;
  location: string;
  cost: number;
  expanded: boolean;
  onPress: () => void;
  date_added: string;
  onSell: () => void;
};

export default function InventoryItemRow({
  size,
  condition,
  location,
  cost,
  expanded,
  onPress,
  date_added,
  onSell,
}: InventoryItemRowProps) {
  const isDeadstock = condition === 'DS';

  const formattedCost = Number(cost).toFixed(2);

  const formattedDate = date_added
    ? date_added.split('-').reverse().join('/')
    : 'Not available';

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.mainContent}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${size}, ${condition}, location ${location}`}
      >
        <View style={styles.topRow}>
          <View style={styles.sizeRow}>
            <Text style={styles.size}>{size}</Text>

            <View
              style={[
                styles.conditionBadge,
                !isDeadstock && styles.usedBadge,
              ]}
            >
              <Text
                style={[
                  styles.conditionText,
                  !isDeadstock && styles.usedText,
                ]}
              >
                {condition}
              </Text>
            </View>
          </View>

          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Ionicons
              name="location-outline"
              size={15}
              color={colors.textMuted}
            />
            <Text style={styles.detailText}>{location}</Text>
          </View>

          <Text style={styles.detailText}>
            Cost £{formattedCost}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Date added</Text>
            <Text style={styles.dateValue}>
              {formattedDate}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.editButton}
              disabled
              accessibilityLabel="Edit item, coming soon"
            >
              <Ionicons
                name="create-outline"
                size={17}
                color={colors.textMuted}
              />
              <Text style={styles.editButtonText}>
                Edit Item
              </Text>
            </Pressable>

            <Pressable
              style={styles.sellButton}
              onPress={onSell}
              accessibilityLabel="Sell item"
            >
              <Ionicons
                name="cash-outline"
                size={17}
                color={colors.background}
              />
              <Text style={styles.sellButtonText}>
                Add to Sale
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 9,
    overflow: 'hidden',
  },

  mainContent: {
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  size: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },

  conditionBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },

  conditionText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },

  usedBadge: {
    backgroundColor: '#3A2A1D',
  },

  usedText: {
    color: colors.warning,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 10,
  },

  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  detailText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  dateLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },

  dateValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.border,
    borderRadius: 9,
    paddingVertical: 12,
    opacity: 0.6,
  },

  editButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },

  sellButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingVertical: 12,
  },

  sellButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
});
