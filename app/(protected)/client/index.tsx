import { Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function ClientDashboard() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Dashboard Cliente</Text>
                <Text style={{ fontSize: 16, color: '#666', marginBottom: 30 }}>Benvenuto nella tua area riservata.</Text>

                <TouchableOpacity
                    onPress={() => supabase.auth.signOut()}
                    style={{ backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Esci</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
