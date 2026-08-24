import React from 'react';
import { useOutletContext } from 'react-router-dom';
import BasicDashboard from './basic/BasicDashboard';
import EntrepreneurDashboard from './entrepreneur/EntrepreneurDashboard';
import WholesaleDashboard from './wholesale/WholesaleDashboard';

const DashboardSelector = () => {
    // Consumimos la tienda y perfil cargados por SharedLayout
    const { store, userProfile } = useOutletContext() || {};

    // Detectamos el plan desde la tienda o el perfil (por defecto 'basico')
    const rawPlan = store?.plan || userProfile?.plan || store?.subscription_plan || 'basico';
    const plan = String(rawPlan).toLowerCase().trim();

    // Seleccionamos la vista según el nivel de suscripción
    switch (plan) {
        case 'entrepreneur':
        case 'emprendedor':
        case 'pro':
            return <EntrepreneurDashboard />;

        case 'wholesale':
        case 'mayorista':
        case 'enterprise':
            return <WholesaleDashboard />;

        case 'basic':
        case 'basico':
        default:
            return <BasicDashboard />;
    }
};

export default DashboardSelector;