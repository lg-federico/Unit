import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export default function ProfileScreen() {
    const { session, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Original values to track changes
    const [originalFirstName, setOriginalFirstName] = useState('');
    const [originalLastName, setOriginalLastName] = useState('');
    const [originalCompanyName, setOriginalCompanyName] = useState('');
    const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (session) getProfile();
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session!');

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`first_name, last_name, company_name, avatar_url`)
                .eq('id', session.user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setCompanyName(data.company_name || '');
                setAvatarUrl(data.avatar_url);

                // Store original values
                setOriginalFirstName(data.first_name || '');
                setOriginalLastName(data.last_name || '');
                setOriginalCompanyName(data.company_name || '');
                setOriginalAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Errore', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    // Check if any field has changed
    const hasChanges =
        firstName !== originalFirstName ||
        lastName !== originalLastName ||
        companyName !== originalCompanyName ||
        avatarUrl !== originalAvatarUrl;

    async function updateProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session!');

            const updates = {
                id: session.user.id,
                first_name: firstName,
                last_name: lastName,
                company_name: companyName,
                avatar_url: avatarUrl,
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }

            // Update original values after successful save
            setOriginalFirstName(firstName);
            setOriginalLastName(lastName);
            setOriginalCompanyName(companyName);
            setOriginalAvatarUrl(avatarUrl);

            Alert.alert('Successo', 'Profilo aggiornato correttamente!');
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Errore', error.message);
            }
        } finally {
            setLoading(false);
        }
    }


    async function handleAvatarUpload() {
        try {
            setUploading(true);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (result.canceled) return;

            const photo = result.assets[0];
            console.log('Photo selected:', photo.uri);

            const arrayBuffer = await fetch(photo.uri).then(res => res.arrayBuffer());
            const fileExt = photo.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
            const path = `${Date.now()}.${fileExt}`;

            console.log('Uploading to path:', path);
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(path, arrayBuffer, {
                    contentType: photo.mimeType ?? 'image/jpeg',
                });

            if (error) {
                console.error('Upload error:', error);
                throw error;
            }

            console.log('Upload successful, getting public URL');
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
            console.log('Public URL:', publicUrl);

            setAvatarUrl(publicUrl);

            // Auto-save the new avatar URL to the profile
            if (session?.user) {
                console.log('Saving avatar URL to profile for user:', session.user.id);
                const { error: updateError } = await supabase.from('profiles').upsert({
                    id: session.user.id,
                    avatar_url: publicUrl,
                });

                if (updateError) {
                    console.error('Profile update error:', updateError);
                    throw updateError;
                }
                console.log('Avatar URL saved successfully');
            }

        } catch (error) {
            if (error instanceof Error) {
                console.error('Avatar upload error:', error);
                Alert.alert('Errore', error.message);
            }
        } finally {
            setUploading(false);
        }
    }

    async function removeAvatar() {
        try {
            if (!session?.user) return;

            setAvatarUrl(null);

            const { error } = await supabase.from('profiles').update({
                avatar_url: null,
            }).eq('id', session.user.id);

            if (error) {
                console.error('Error removing avatar:', error);
                throw error;
            }

            console.log('Avatar removed successfully');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Remove avatar error:', error);
                Alert.alert('Errore', error.message);
            }
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Avatar Section */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <TouchableOpacity onPress={handleAvatarUpload} disabled={uploading}>
                        <View style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: '#E5E7EB',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            borderWidth: 4,
                            borderColor: '#fff',
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                            elevation: 5
                        }}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Ionicons name="person" size={60} color="#9CA3AF" />
                            )}

                            {uploading && (
                                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator color="#fff" />
                                </View>
                            )}
                        </View>
                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: '#000',
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 3,
                            borderColor: '#fff'
                        }}>
                            <Ionicons name="camera" size={18} color="#fff" />
                        </View>

                        {/* Remove Avatar Button */}
                        {avatarUrl && (
                            <TouchableOpacity
                                onPress={removeAvatar}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: '#EF4444',
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 3,
                                    borderColor: '#fff',
                                    shadowColor: '#000',
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 3
                                }}
                            >
                                <Ionicons name="close" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Form Section */}
                <View style={{ gap: 20 }}>
                    <View>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>Nome</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#fff' }}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Il tuo nome"
                        />
                    </View>
                    <View>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>Cognome</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#fff' }}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Il tuo cognome"
                        />
                    </View>
                    <View>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' }}>Azienda</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#fff' }}
                            value={companyName}
                            onChangeText={setCompanyName}
                            placeholder="Nome della tua azienda"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={updateProfile}
                        disabled={loading || !hasChanges}
                        style={{
                            backgroundColor: (!hasChanges || loading) ? '#9CA3AF' : '#000',
                            paddingVertical: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginTop: 12,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Salva Modifiche</Text>}
                    </TouchableOpacity>
                </View>

                {/* Logout Section */}
                <View style={{ marginTop: 48, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 32 }}>
                    <TouchableOpacity
                        onPress={signOut}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#EF4444',
                            backgroundColor: '#FEF2F2'
                        }}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>Esci dall'account</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
