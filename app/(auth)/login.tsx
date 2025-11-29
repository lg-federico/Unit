import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { session, role } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (session && role) {
            if (role === 'admin') {
                router.replace('/(protected)/admin');
            } else if (role === 'client') {
                router.replace('/(protected)/client');
            }
        }
    }, [session, role]);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert('Errore di Accesso', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        if (!firstName || !lastName || !companyName) {
            Alert.alert('Attenzione', 'Tutti i campi sono obbligatori.');
            return;
        }

        setLoading(true);
        // 1. Sign up the user in auth.users
        const { data: { session, user }, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    company_name: companyName,
                    // We can pass metadata here if we have a trigger that copies it to profiles
                }
            }
        });

        if (error) {
            Alert.alert('Errore di Registrazione', error.message);
            setLoading(false);
            return;
        }

        // Clear form fields on success
        if (user) {
            setFirstName('');
            setLastName('');
            setCompanyName('');
            // We keep email/password if we need to switch to login, but if auto-login happens we might clear them
            // or just let the redirect happen.
        }

        if (session) {
            // Auto-login successful (Email confirmation disabled)
            // The AuthContext will detect the session and redirect automatically.
            // We just clear everything.
            setEmail('');
            setPassword('');
            Alert.alert('Benvenuto', 'Account creato con successo!');
        } else if (user) {
            // Email confirmation required
            Alert.alert('Successo', 'Controlla la tua email per verificare l\'account!');
            setIsLogin(true); // Switch to login view
            setEmail(''); // Optional: clear or keep for convenience
            setPassword('');
        }

        setLoading(false);
    }

    async function signInWithGoogle() {
        setLoading(true);
        try {
            const redirectUrl = makeRedirectUri({
                path: '/auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                if (result.type === 'success' && result.url) {
                    // Handle the callback URL if needed
                }
            }
        } catch (error: any) {
            Alert.alert('Errore Google Login', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={['#ffffff', '#f3f4f6']}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                    <View style={{ paddingHorizontal: 32, paddingVertical: 48 }}>

                        {/* Header */}
                        <View style={{ alignItems: 'center', marginBottom: 48 }}>
                            <View style={{
                                width: 80,
                                height: 80,
                                backgroundColor: '#000',
                                borderRadius: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 24
                            }}>
                                <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>U</Text>
                            </View>
                            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#111827' }}>Unit</Text>
                            <Text style={{ color: '#6B7280', marginTop: 8, fontSize: 18 }}>Gestione aziendale evoluta</Text>
                        </View>

                        {/* Toggle */}
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: '#E5E7EB',
                            padding: 4,
                            borderRadius: 12,
                            marginBottom: 32
                        }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    backgroundColor: isLogin ? '#fff' : 'transparent'
                                }}
                                onPress={() => setIsLogin(true)}
                            >
                                <Text style={{
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: isLogin ? '#000' : '#6B7280'
                                }}>Accedi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    backgroundColor: !isLogin ? '#fff' : 'transparent'
                                }}
                                onPress={() => setIsLogin(false)}
                            >
                                <Text style={{
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: !isLogin ? '#000' : '#6B7280'
                                }}>Registrati</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={{ gap: 16 }}>

                            {!isLogin && (
                                <View style={{ gap: 16 }}>
                                    <View style={{ flexDirection: 'row', gap: 16 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 6, marginLeft: 4 }}>Nome</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff',
                                                    borderWidth: 1,
                                                    borderColor: '#E5E7EB',
                                                    borderRadius: 12,
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 14,
                                                    color: '#111827'
                                                }}
                                                placeholder="Mario"
                                                value={firstName}
                                                onChangeText={setFirstName}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 6, marginLeft: 4 }}>Cognome</Text>
                                            <TextInput
                                                style={{
                                                    backgroundColor: '#fff',
                                                    borderWidth: 1,
                                                    borderColor: '#E5E7EB',
                                                    borderRadius: 12,
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 14,
                                                    color: '#111827'
                                                }}
                                                placeholder="Rossi"
                                                value={lastName}
                                                onChangeText={setLastName}
                                            />
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 6, marginLeft: 4 }}>Azienda</Text>
                                        <TextInput
                                            style={{
                                                backgroundColor: '#fff',
                                                borderWidth: 1,
                                                borderColor: '#E5E7EB',
                                                borderRadius: 12,
                                                paddingHorizontal: 16,
                                                paddingVertical: 14,
                                                color: '#111827'
                                            }}
                                            placeholder="Nome Azienda S.r.l."
                                            value={companyName}
                                            onChangeText={setCompanyName}
                                        />
                                    </View>
                                </View>
                            )}

                            <View>
                                <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 6, marginLeft: 4 }}>Email</Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#fff',
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        color: '#111827'
                                    }}
                                    placeholder="nome@azienda.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View>
                                <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 6, marginLeft: 4 }}>Password</Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#fff',
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        color: '#111827'
                                    }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#000',
                                    borderRadius: 12,
                                    paddingVertical: 16,
                                    marginTop: 24,
                                    opacity: loading ? 0.7 : 1
                                }}
                                onPress={isLogin ? signInWithEmail : signUpWithEmail}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
                                        {isLogin ? 'Accedi' : 'Crea Account'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Social Login */}
                        <View style={{ marginTop: 32 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#D1D5DB' }} />
                                <Text style={{ marginHorizontal: 16, color: '#9CA3AF', fontWeight: '500' }}>oppure continua con</Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#D1D5DB' }} />
                            </View>

                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#fff',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 12,
                                    paddingVertical: 16
                                }}
                                onPress={signInWithGoogle}
                                disabled={loading}
                            >
                                <Text style={{ color: '#111827', fontWeight: '600', fontSize: 18, marginLeft: 8 }}>Google</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
