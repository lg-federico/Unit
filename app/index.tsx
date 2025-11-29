import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
    const { session, loading, role } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }

    if (role === 'admin') {
        return <Redirect href="/(protected)/admin" />;
    }

    if (role === 'client') {
        return <Redirect href="/(protected)/client" />;
    }

    // Fallback
    return <Redirect href="/(auth)/login" />;
}
