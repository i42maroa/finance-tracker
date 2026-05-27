export interface ProfileField {
  label: string;
  value: string;
}

export interface UserProfile {
  name: string;
  email: string;
  provider: string;
  initials: string;
  household: string;
  role: string;
  joinedAt: string;
}

export interface ProfileMetric {
  label: string;
  value: string;
  detail: string;
}

export interface HouseholdMember {
  name: string;
  role: string;
  status: string;
}
