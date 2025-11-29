import { Text, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function AdminDashboard() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-2xl font-bold mb-4">Admin Dashboard</Text>
            <Text className="text-gray-600 mb-8">Welcome, Admin!</Text>
            <Text className="text-blue-500" onPress={() => supabase.auth.signOut()}>Sign Out</Text>
        </View>
    );
}
