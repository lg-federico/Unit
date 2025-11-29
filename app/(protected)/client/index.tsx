import { Text, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function ClientDashboard() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-2xl font-bold mb-4">Client Dashboard</Text>
            <Text className="text-gray-600 mb-8">Welcome, Client!</Text>
            <Text className="text-blue-500" onPress={() => supabase.auth.signOut()}>Sign Out</Text>
        </View>
    );
}
