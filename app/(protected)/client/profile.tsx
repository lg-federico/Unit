import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export default function ProfileScreen() {
    const { signOut } = useAuth();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 32 }}>Il mio account</Text>

            <TouchableOpacity
                onPress={signOut}
                style={{
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    backgroundColor: '#EF4444',
                    borderRadius: 8
                }}
            >
                <Text style={{ color: 'white', fontWeight: '600' }}>Esci</Text>
            </TouchableOpacity>
        </View>
    );
}
