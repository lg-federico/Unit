import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    role: 'admin' | 'client' | null;
    loading: boolean;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'client' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('AuthContext: Initial session check', session ? 'Found' : 'Not found');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchRole(session.user.id);
            }
            setLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('AuthContext: Auth state change', _event, session ? 'Session exists' : 'No session');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchRole(session.user.id);
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchRole = async (userId: string) => {
        try {
            console.log('AuthContext: Fetching role for', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('AuthContext: Error fetching role:', error);
            } else {
                console.log('AuthContext: Role found:', data?.role);
                setRole(data?.role as 'admin' | 'client' | null);
            }
        } catch (e) {
            console.error('AuthContext: Exception fetching role:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, isAdmin: role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};
