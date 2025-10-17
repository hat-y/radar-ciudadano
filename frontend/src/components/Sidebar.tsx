import { NavLink } from 'react-router-dom';
import { Button, Group } from '@mantine/core';
import { IconHome, IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
import { useAuthService } from '../hooks/useAuthService';

export function Sidebar() {
    const { logout } = useAuthService();

    return (
        <div>
            <NavLink to="/app/map">
                {({ isActive }) => (
                    <Button
                        variant={isActive ? 'light' : 'subtle'}
                        leftSection={<IconHome size={16} />}
                        fullWidth
                    >
                        Mapa
                    </Button>
                )}
            </NavLink>
            <NavLink to="/app/profile">
                {({ isActive }) => (
                    <Button
                        variant={isActive ? 'light' : 'subtle'}
                        leftSection={<IconUser size={16} />}
                        fullWidth
                    >
                        Perfil
                    </Button>
                )}
            </NavLink>
            <NavLink to="/app/settings">
                {({ isActive }) => (
                    <Button
                        variant={isActive ? 'light' : 'subtle'}
                        leftSection={<IconSettings size={16} />}
                        fullWidth
                    >
                        Configuración
                    </Button>
                )}
            </NavLink>
            <Group grow style={{ marginTop: 'auto' }}>
                <Button
                    variant="subtle"
                    leftSection={<IconLogout size={16} />}
                    onClick={logout}
                    fullWidth
                >
                    Cerrar Sesión
                </Button>
            </Group>
        </div>
    );
}