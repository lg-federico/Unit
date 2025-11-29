import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedLayout() {
    const { session, loading, role } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!session) {
            // If not logged in, redirect to login
            router.replace('/login');
        } else {
            // Optional: Role based redirection if needed within protected routes
            // But usually we just let the user navigate.
            // If we want to enforce role separation strictly:
            if (role === 'admin' && segments[1] !== 'admin') {
                // router.replace('/(protected)/admin'); // Be careful with loops
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

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="client" />
            <Stack.Screen name="admin" />
        </Stack>
    );
}
