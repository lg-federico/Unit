import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
