
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colours';

import type {
  RootStackParamList,
  MainTabParamList,
} from '../types/navigation';

import StockScreen from '../screens/StockScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import AddProductScreen from '../screens/AddProductScreen';
import AddInventoryItemScreen from '../screens/AddInventoryItemScreen';
import SalesScreen from '../screens/SalesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const StockStack = createNativeStackNavigator<RootStackParamList>();

function StockNavigator() {
  return (
    <StockStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <StockStack.Screen
        name="Stock"
        component={StockScreen}
        options={{ headerShown: false }}
      />

      <StockStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: 'Product Details' }}
      />

      <StockStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
      />

      <StockStack.Screen
        name="AddInventoryItem"
        component={AddInventoryItemScreen}
        options={{ title: 'Add Inventory Item' }}
      />
    </StockStack.Navigator>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderSubtitle}>
        Coming soon
      </Text>
    </View>
  );
}




export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'StockTab':
              iconName = focused ? 'cube' : 'cube-outline';
              break;

            case 'Sales':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;

            case 'Analytics':
              iconName = focused
                ? 'stats-chart'
                : 'stats-chart-outline';
              break;

            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;

            default:
              iconName = 'ellipse-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="StockTab"
        component={StockNavigator}
        options={{ title: 'Stock' }}
      />

      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          title: 'Sales',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },

  placeholderSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});
