import { HouseholdMember, ProfileField, ProfileMetric, UserProfile } from '../models/profile.model';

export const mockUserProfile: UserProfile = {
  name: 'Antonio',
  email: 'antonio@example.com',
  provider: 'Google',
  initials: 'A',
  household: 'Hogar principal',
  role: 'Administrador',
  joinedAt: '2026-05-27',
};

export const mockProfileFields: ProfileField[] = [
  { label: 'Nombre visible', value: mockUserProfile.name },
  { label: 'Email', value: mockUserProfile.email },
  { label: 'Inicio de sesion', value: mockUserProfile.provider },
  { label: 'Moneda', value: 'EUR' },
];

export const mockProfileMetrics: ProfileMetric[] = [
  { label: 'Household', value: mockUserProfile.household, detail: 'Datos compartidos por miembros' },
  { label: 'Rol', value: mockUserProfile.role, detail: 'Permisos completos sobre el hogar' },
  { label: 'Privacidad', value: 'RLS', detail: 'Acceso limitado por pertenencia' },
];

export const mockHouseholdMembers: HouseholdMember[] = [
  { name: 'Antonio', role: 'Administrador', status: 'Activo' },
  { name: 'Pareja', role: 'Miembro', status: 'Pendiente' },
];
