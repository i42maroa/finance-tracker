import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { HouseholdsService } from '../households/service/households.service';
import { mockProfileFields, mockProfileMetrics, mockUserProfile } from '../../shared/mocks/profile.mock';
import { Household } from '../../shared/models/household.model';
import { ProfileField, ProfileMetric } from '../../shared/models/profile.model';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  private readonly householdsService = inject(HouseholdsService);

  readonly user = mockUserProfile;
  readonly profileFields = mockProfileFields;
  readonly metrics = mockProfileMetrics;
  readonly households$ = this.householdsService.households$;

  householdTrackBy(_: number, household: Household): string {
    return household.id;
  }

  fieldTrackBy(_: number, field: ProfileField): string {
    return field.label;
  }

  metricTrackBy(_: number, metric: ProfileMetric): string {
    return metric.label;
  }

  userRoleLabel(household: Household): string {
    const userMember = household.members.find((member) => member.email === this.user.email);

    return userMember?.role === 'admin' ? 'Administrador' : 'Miembro';
  }
}
