export type HouseholdRole = 'admin' | 'member';

export type HouseholdMemberStatus = 'active' | 'pending';

export interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  role: HouseholdRole;
  status: HouseholdMemberStatus;
}

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  members: HouseholdMember[];
}

export interface HouseholdDraft {
  name: string;
}

export interface HouseholdInviteDraft {
  email: string;
  role: HouseholdRole;
}
