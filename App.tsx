import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './src/lib/supabase';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import { SaleBasketProvider } from './src/context/SaleBasketContext';



type AuthStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#10151D',
    card: '#1C2531',
    border: '#293545',
    text: '#F4F7FA',
    primary: '#20D69F',
  },
};

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
      <View
        style={{
          flex: 1,
          backgroundColor: '#10151D',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#20D69F"
        />
        <StatusBar style="light" />
      </View>
    );
  }


  return (
    <NavigationContainer theme={navigationTheme}>
      {session && isAuthorised ? (
        <SaleBasketProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
          </Stack.Navigator>
        </SaleBasketProvider>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}

      <StatusBar style="light" />
    </NavigationContainer>
  );
}
