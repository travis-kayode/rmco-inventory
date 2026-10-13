import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';

import StockScreen from './src/screens/StockScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import LoginScreen from './src/screens/LoginScreen';
import AddInventoryItemScreen from './src/screens/AddInventoryItemScreen'

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorised, setIsAuthorised] = useState(false);



  useEffect(() => {
    let active = true;

    const checkAccess = async (currentSession: Session | null) => {
      setLoading(true);
      setIsAuthorised(false);

      if (!currentSession) {
        if (active) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const { data: isMember, error } =
        await supabase.rpc('is_business_member');

      if (!active) return;

      if (error || !isMember) {
        await supabase.auth.signOut();
        if (!active) return;

        setSession(null);
        setIsAuthorised(false);
      } else {
        setSession(currentSession);
        setIsAuthorised(true);
      }

      setLoading(false);
    };

    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (active) {
        await checkAccess(session);
      }
    };

    restoreSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        // Defer Supabase calls outside the auth callback.
        setTimeout(() => {
          if (active) {
            void checkAccess(session);
          }
        }, 0);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session && isAuthorised ? (
          <>
            <Stack.Screen name="Stock" component={StockScreen} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen
              name="AddInventoryItem"
              component={AddInventoryItemScreen}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}

      </Stack.Navigator>

      <StatusBar style="auto" />
    </NavigationContainer>
  );
}