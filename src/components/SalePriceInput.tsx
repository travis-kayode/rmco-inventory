
import { useState } from 'react';
import {
    TextInput,
    StyleSheet,
} from 'react-native';

import { colors } from '../theme/colours';

type Props = {
    price: number;
    onPriceChange: (price: number) => void;
};

export default function SalePriceInput({
    price,
    onPriceChange,
}: Props) {
    const [text, setText] = useState(price.toString());

    const handleChange = (value: string) => {
        if (!/^\d*\.?\d{0,2}$/.test(value)) return;

        setText(value);

        if (value === '' || value === '.') {
            onPriceChange(0);
            return;
        }

        const parsedPrice = Number(value);

        if (Number.isFinite(parsedPrice)) {
            onPriceChange(parsedPrice);
        }
    };

    const handleBlur = () => {
        // Restore the saved numeric price when editing ends.
        setText(price.toFixed(2));
    };

    return (
        <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleChange}
            onBlur={handleBlur}
            keyboardType="decimal-pad"
            selectTextOnFocus
        />
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        minWidth: 110,
    },
});
