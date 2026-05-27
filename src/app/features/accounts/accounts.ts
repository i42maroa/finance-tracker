import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import {
  mockHouseholdMembers,
  mockProfileFields,
  mockProfileMetrics,
  mockUserProfile,
} from '../../shared/mocks/profile.mock';
import { HouseholdMember, ProfileField, ProfileMetric } from '../../shared/models/profile.model';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  readonly user = mockUserProfile;
  readonly profileFields = mockProfileFields;
  readonly metrics = mockProfileMetrics;
  readonly members = mockHouseholdMembers;

  memberTrackBy(_: number, member: HouseholdMember): string {
    return member.name;
  }

  fieldTrackBy(_: number, field: ProfileField): string {
    return field.label;
  }

  metricTrackBy(_: number, metric: ProfileMetric): string {
    return metric.label;
  }
}
