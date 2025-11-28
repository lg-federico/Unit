import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Stack } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Success', 'Please check your inbox for email verification!');
        setLoading(false);
    }

    return (
        <View className="flex-1 bg-gray-50 justify-center px-8">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="mb-10">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Benvenuto</Text>
                <Text className="text-gray-500">Gestisci il tuo budget con eleganza.</Text>
            </View>

            <View className="flex-row mb-8 bg-gray-200 rounded-lg p-1">
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-md ${isLogin ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setIsLogin(true)}
                >
                    <Text className={`text-center font-medium ${isLogin ? 'text-gray-900' : 'text-gray-500'}`}>Accedi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-md ${!isLogin ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setIsLogin(false)}
                >
                    <Text className={`text-center font-medium ${!isLogin ? 'text-gray-900' : 'text-gray-500'}`}>Registrati</Text>
                </TouchableOpacity>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Email</Text>
                    <TextInput
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                        placeholder="nome@esempio.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-1 font-medium">Password</Text>
                    <TextInput
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    className="bg-black rounded-lg py-4 mt-4"
                    onPress={isLogin ? signInWithEmail : signUpWithEmail}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">
                            {isLogin ? 'Accedi' : 'Registrati'}
                        </Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row items-center my-6">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-4 text-gray-500">oppure</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                <TouchableOpacity
                    className="bg-white border border-gray-300 rounded-lg py-4"
                    onPress={() => Alert.alert('Info', 'Google Login simulato')}
                >
                    <Text className="text-gray-700 text-center font-medium">Continua con Google</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
