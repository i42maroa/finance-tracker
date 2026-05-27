import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { Household, HouseholdMember } from '../../shared/models/household.model';
import { BasicButton } from '../../shared/ui/buttons/basic-button/basic-button';
import { HouseholdsService } from '../../core/services/household/households.service';
import { ModalService } from '../../core/services/modal/modal.service';

@Component({
  selector: 'app-households',
  imports: [BasicButton, CommonModule],
  templateUrl: './households.html',
  styleUrl: './households.css',
})
export class Households {
  private readonly householdsService = inject(HouseholdsService);
  private readonly modalService = inject(ModalService);

  readonly households$ = this.householdsService.households$;
  readonly selectedHousehold$ = this.householdsService.selectedHousehold$;
  readonly summary$ = combineLatest([this.households$, this.selectedHousehold$]).pipe(
    map(([households, selectedHousehold]) => ({
      count: households.length,
      selectedName: selectedHousehold?.name ?? 'Sin household seleccionado',
    })),
  );

  openCreateModal(): void {
    this.modalService.open({ type: 'household-create' });
  }

  openInviteModal(): void {
    const selectedHousehold = this.householdsService.getSelectedHousehold();

    if (!selectedHousehold) {
      return;
    }

    this.modalService.open({
      type: 'household-invite',
      data: { householdId: selectedHousehold.id },
    });
  }

  selectHousehold(household: Household): void {
    this.householdsService.selectHousehold(household.id);
  }

  householdTrackBy(_: number, household: Household): string {
    return household.id;
  }

  memberTrackBy(_: number, member: HouseholdMember): string {
    return member.id;
  }

  roleLabel(role: HouseholdMember['role']): string {
    return role === 'admin' ? 'Administrador' : 'Miembro';
  }

  statusLabel(status: HouseholdMember['status']): string {
    return status === 'active' ? 'Activo' : 'Pendiente';
  }
}
