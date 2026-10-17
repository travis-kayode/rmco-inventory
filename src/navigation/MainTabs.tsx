import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import type {
    RootStackParamList,
    MainTabParamList,
} from '../types/navigation';

import StockScreen from '../screens/StockScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import AddProductScreen from '../screens/AddProductScreen';
import AddInventoryItemScreen from '../screens/AddInventoryItemScreen';
import SalesScreen from '../screens/SalesScreen';


import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();
const StockStack = createNativeStackNavigator<RootStackParamList>();

function StockNavigator() {
    return (
        <StockStack.Navigator>
            <StockStack.Screen name="Stock" component={StockScreen} />
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

function AnalyticsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Analytics coming soon</Text>
        </View>
    );
}

function SettingsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Settings coming soon</Text>
        </View>
    );
}

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#111111',
                tabBarInactiveTintColor: '#888888',

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
                            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                            break;
                        case 'Settings':
                            iconName = focused ? 'settings' : 'settings-outline';
                            break;
                        default:
                            iconName = 'ellipse-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
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
                options={{ title: 'Sales', headerShown: true }}
            />
            <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{ headerShown: true }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: true }}
            />
        </Tab.Navigator>
    );
}