import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';

function MapPage() {
    return <div>Map placeholder</div>;
}

export function ProtectedRoutes() {
    return (
        <AppLayout>
            <Routes>
                <Route path="/app/map" element={<MapPage />} />
                <Route path="/" element={<Navigate to="/app/map" />} />
            </Routes>
        </AppLayout>
    );
}