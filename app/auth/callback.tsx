import { useURL } from 'expo-linking';
import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
    const { session, role, loading } = useAuth();
    const url = useURL();
    const router = useRouter();

    useEffect(() => {
        if (url) {
            const setSessionFromUrl = async () => {
                try {
                    // Supabase returns tokens in the hash: #access_token=...&refresh_token=...
                    // Sometimes it might be in query params depending on config, but usually hash for implicit flow.
                    const hashIndex = url.indexOf('#');
                    const queryIndex = url.indexOf('?');

                    let paramsString = '';
                    if (hashIndex !== -1) {
                        paramsString = url.substring(hashIndex + 1);
                    } else if (queryIndex !== -1) {
                        paramsString = url.substring(queryIndex + 1);
                    }

                    if (paramsString) {
                        const params = new URLSearchParams(paramsString);
                        const accessToken = params.get('access_token');
                        const refreshToken = params.get('refresh_token');

                        if (accessToken && refreshToken) {
                            const { error } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });
                            if (error) console.error('Error setting session in callback:', error);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing URL in callback:', e);
                }
            };

            if (!session) {
                setSessionFromUrl();
            }
        }
    }, [url, session]);

    // Wait for AuthContext to finish loading
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ marginTop: 20 }}>Finalizzando accesso...</Text>
            </View>
        );
    }

    // If logged in, redirect to appropriate dashboard
    if (session && role) {
        if (role === 'admin') {
            return <Redirect href="/(protected)/admin" />;
        }
        return <Redirect href="/(protected)/client" />;
    }

    // If not logged in (and not loading), we might still be processing the URL.
    // Let's give it a moment or show a generic loading state if URL is present but session not yet set.
    if (url && !session) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    // Fallback to login only if really nothing happened
    return <Redirect href="/login" />;
}
