import { Household } from '../models/household.model';
import { mockUserProfile } from './profile.mock';

export const mockHouseholds: Household[] = [
  {
    id: 'hh-main',
    name: 'Hogar principal',
    createdAt: '2026-05-27',
    members: [
      {
        id: 'member-antonio-main',
        name: mockUserProfile.name,
        email: mockUserProfile.email,
        role: 'admin',
        status: 'active',
      },
      {
        id: 'member-partner-main',
        name: 'Pareja',
        email: 'pareja@example.com',
        role: 'member',
        status: 'pending',
      },
    ],
  },
  {
    id: 'hh-personal',
    name: 'Finanzas personales',
    createdAt: '2026-05-27',
    members: [
      {
        id: 'member-antonio-personal',
        name: mockUserProfile.name,
        email: mockUserProfile.email,
        role: 'admin',
        status: 'active',
      },
    ],
  },
];
