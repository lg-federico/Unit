import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import "../global.css";

const MainLayout = () => {
  const { session, loading, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // If not logged in and not in auth group (login page), redirect to login
      if (segments[0] !== 'login') {
        router.replace('/login');
      }
    } else if (session) {
      // If logged in, redirect based on role
      if (role === 'admin') {
        if (segments[0] !== 'admin') {
          router.replace('/admin');
        }
      } else if (role === 'client') {
        if (segments[0] !== 'client') {
          router.replace('/client');
        }
      }
    }
  }, [session, loading, role, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
