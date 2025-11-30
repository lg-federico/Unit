import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

// Types
type ServiceItem = {
    id: string;
    name: string;
    credits: number;
};

type SimulationItem = ServiceItem & {
    localId: string; // Unique ID for the list (to allow duplicates if needed)
    cost: number;
};

export default function SimulatorScreen() {
    // 1. Configuration State
    const [budget, setBudget] = useState<string>('60000');
    const [months, setMonths] = useState<string>('12');

    // 2. Calculated Metrics State
    const [discountPercent, setDiscountPercent] = useState(0);
    const [creditPrice, setCreditPrice] = useState(100);
    const [monthlyInstallment, setMonthlyInstallment] = useState(0);

    // 3. Data & Simulation State
    const [catalog, setCatalog] = useState<ServiceItem[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [simulationList, setSimulationList] = useState<SimulationItem[]>([]);
    const [isSelectorVisible, setIsSelectorVisible] = useState(false);

    // --- Logic ---

    // Load Catalog
    useEffect(() => {
        fetchCatalog();
    }, []);

    async function fetchCatalog() {
        setLoadingCatalog(true);
        const { data, error } = await supabase
            .from('service_catalog')
            .select('*')
            .order('name');

        if (error) {
            Alert.alert('Errore', 'Impossibile caricare il catalogo servizi.');
            console.error(error);
        } else if (data) {
            setCatalog(data);
        }
        setLoadingCatalog(false);
    }

    // Reactive Calculations
    useEffect(() => {
        const budgetVal = parseFloat(budget) || 0;
        const monthsVal = parseFloat(months) || 1;

        // Discount Logic: (Budget / 120.000) * 0.40. Max 40%.
        let calculatedDiscount = (budgetVal / 120000) * 0.40;
        if (calculatedDiscount > 0.40) calculatedDiscount = 0.40;
        if (calculatedDiscount < 0) calculatedDiscount = 0;

        setDiscountPercent(calculatedDiscount);

        // Price Logic: 100 * (1 - Discount)
        const newPrice = 100 * (1 - calculatedDiscount);
        setCreditPrice(newPrice);

        // Installment Logic
        setMonthlyInstallment(budgetVal / monthsVal);

    }, [budget, months]);

    // Update list costs when credit price changes
    useEffect(() => {
        setSimulationList(prevList => prevList.map(item => ({
            ...item,
            cost: item.credits * creditPrice
        })));
    }, [creditPrice]);


    // Handlers
    const addToSimulation = (service: ServiceItem) => {
        const newItem: SimulationItem = {
            ...service,
            localId: Math.random().toString(36).substr(2, 9),
            cost: service.credits * creditPrice
        };
        setSimulationList([...simulationList, newItem]);
        setIsSelectorVisible(false);
    };

    const removeFromSimulation = (localId: string) => {
        setSimulationList(simulationList.filter(item => item.localId !== localId));
    };

    // Totals
    const totalSimulationCost = simulationList.reduce((acc, item) => acc + item.cost, 0);
    const budgetVal = parseFloat(budget) || 0;
    const isOverBudget = totalSimulationCost > budgetVal;
    const budgetUsagePercent = budgetVal > 0 ? (totalSimulationCost / budgetVal) * 100 : 0;


    // --- Render Components ---

    const Card = ({ children, title }: { children: React.ReactNode, title: string }) => (
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#111827' }}>{title}</Text>
            {children}
        </View>
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

            {/* 1. Configuration */}
            <Card title="Configurazione">
                <View style={{ gap: 16 }}>
                    <View>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Budget Allocato (€)</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' }}
                            keyboardType="numeric"
                            value={budget}
                            onChangeText={setBudget}
                        />
                    </View>
                    <View>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Mesi di Progettualità</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' }}
                            keyboardType="numeric"
                            value={months}
                            onChangeText={setMonths}
                        />
                    </View>
                </View>
            </Card>

            {/* 2. KPI */}
            <Card title="Metriche">
                {/* Row 1: Discount */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#10B981' }}>{(discountPercent * 100).toFixed(1)}%</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Sconto Applicato</Text>
                </View>

                {/* Row 2: Credit Price & Total Credits */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 16 }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3B82F6' }}>{formatCurrency(creditPrice)}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>Prezzo Credito</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{Math.floor(parseFloat(budget) / creditPrice) || 0}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>Totale Crediti</Text>
                    </View>
                </View>

                {/* Row 3: Savings */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 16 }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>{formatCurrency(100 - creditPrice)}</Text>
                        <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center' }}>Risp. / Credito</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>
                            {formatCurrency((Math.floor(parseFloat(budget) / creditPrice) || 0) * (100 - creditPrice))}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center' }}>Risp. Totale</Text>
                    </View>
                </View>

                {/* Row 4: Monthly Installment */}
                <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>Rata Mensile Stimata</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{formatCurrency(monthlyInstallment)}</Text>
                </View>
            </Card>

            {/* 3. Simulation */}
            <Card title="Simulatore Preventivo">
                <TouchableOpacity
                    onPress={() => setIsSelectorVisible(true)}
                    style={{
                        backgroundColor: '#000',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginBottom: 24
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Aggiungi Servizio</Text>
                </TouchableOpacity>

                {simulationList.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#9CA3AF', marginBottom: 24 }}>Nessun servizio aggiunto.</Text>
                ) : (
                    <View style={{ gap: 12, marginBottom: 24 }}>
                        {simulationList.map((item) => (
                            <View key={item.localId} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: '600', color: '#111827' }}>{item.name}</Text>
                                    <Text style={{ fontSize: 12, color: '#6B7280' }}>{item.credits} Crediti</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                                    <Text style={{ fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' }}>
                                        {formatCurrency(item.credits * 100)}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', color: '#111827' }}>{formatCurrency(item.cost)}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeFromSimulation(item.localId)}>
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Totals */}
                <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: '#6B7280' }}>Totale Simulato</Text>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' }}>
                                {formatCurrency(simulationList.reduce((acc, item) => acc + (item.credits * 100), 0))}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: isOverBudget ? '#EF4444' : '#111827' }}>
                                {formatCurrency(totalSimulationCost)}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{
                            height: '100%',
                            width: `${Math.min(budgetUsagePercent, 100)}%`,
                            backgroundColor: isOverBudget ? '#EF4444' : '#10B981'
                        }} />
                    </View>
                    <Text style={{ fontSize: 12, color: isOverBudget ? '#EF4444' : '#6B7280', marginTop: 4, textAlign: 'right' }}>
                        {isOverBudget ? `Fuori budget di ${formatCurrency(totalSimulationCost - budgetVal)}` : `Rimangono ${formatCurrency(budgetVal - totalSimulationCost)}`}
                    </Text>

                    {/* Disclaimer */}
                    <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 16, textAlign: 'center', fontStyle: 'italic' }}>
                        I valori indicati sono puramente esemplificativi; il costo effettivo verrà pattuito all'avvio dell'attività.
                    </Text>
                </View>
            </Card>

            {/* Service Selector Modal */}
            <Modal visible={isSelectorVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={{ flex: 1, padding: 24, paddingTop: 48 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Seleziona Servizio</Text>
                        <TouchableOpacity onPress={() => setIsSelectorVisible(false)}>
                            <Ionicons name="close" size={28} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {loadingCatalog ? (
                        <ActivityIndicator size="large" />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {catalog.map((service) => (
                                <TouchableOpacity
                                    key={service.id}
                                    style={{
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#E5E7EB',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }}
                                    onPress={() => addToSimulation(service)}
                                >
                                    <Text style={{ fontSize: 16, fontWeight: '500' }}>{service.name}</Text>
                                    <Text style={{ color: '#6B7280' }}>{service.credits} Crediti</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </Modal>

        </ScrollView>
    );
}
