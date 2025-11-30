import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

function HeaderLogo() {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                width: 32,
                height: 32,
                backgroundColor: '#000',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
            }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>U</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>Unit</Text>
        </View>
    );
}

function AvatarIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
    const { session } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            loadAvatar();
        }
    }, [session]);

    // Reload avatar when this tab becomes focused and poll for changes
    useEffect(() => {
        if (focused && session?.user) {
            loadAvatar();

            // Poll every 2 seconds while focused to catch avatar changes
            const interval = setInterval(() => {
                loadAvatar();
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [focused]);

    async function loadAvatar() {
        if (!session?.user) return;

        const { data } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', session.user.id)
            .single();

        if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
        } else {
            setAvatarUrl(null);
        }
    }

    return (
        <View style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#E5E7EB',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: focused ? 2 : 0,
            borderColor: color,
        }}>
            {avatarUrl ? (
                <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                />
            ) : (
                <Ionicons name="person" size={size * 0.6} color={focused ? color : '#9CA3AF'} />
            )}
        </View>
    );
}

export default function ClientLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerTitle: () => <HeaderLogo />,
                headerTitleAlign: 'center',
                tabBarActiveTintColor: '#000000',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    backgroundColor: '#f3f3f3',
                    height: 60 + (Platform.OS === 'android' ? 16 : 0) + insets.bottom,
                    paddingBottom: 8 + (Platform.OS === 'android' ? 16 : 0) + insets.bottom,
                    paddingTop: 8,
                    elevation: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Progetti',
                    tabBarLabel: 'Progetti',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="simulator"
                options={{
                    title: 'Simulatore',
                    tabBarLabel: 'Simulatore',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calculator-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Account',
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AvatarIcon color={color} size={size} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}
