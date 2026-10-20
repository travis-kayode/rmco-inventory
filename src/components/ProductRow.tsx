
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colours';

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
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
            ]}
            onPress={onPress}
        >
            <View style={styles.topRow}>
                <View style={styles.productInfo}>
                    <Text style={styles.brand}>
                        {brand.toUpperCase()}
                    </Text>

                    <Text style={styles.productName}>
                        {name}
                    </Text>

                    <Text style={styles.colourway}>
                        {colourway}
                    </Text>
                </View>

                <View style={styles.stockBadge}>
                    <Text style={styles.stockNumber}>
                        {stockCount}
                    </Text>
                    <Text style={styles.stockLabel}>
                        UNITS
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bottomRow}>
                <Text
                    style={styles.sizes}
                    numberOfLines={2}
                >
                    {sizes || 'No available sizes'}
                </Text>

                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                />
            </View>
        </Pressable>
    );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
  },

  cardPressed: {
    opacity: 0.75,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  productInfo: {
    flex: 1,
  },

  brand: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  productName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },

  colourway: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  stockBadge: {
    minWidth: 56,
    backgroundColor: colors.primaryMuted,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignItems: 'center',
  },

  stockNumber: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '700',
  },

  stockLabel: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  divider: {
    height: 0,
    marginVertical: 5,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  sizes: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
