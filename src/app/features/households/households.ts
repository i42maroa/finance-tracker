import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, map } from 'rxjs';

import {
  Household,
  HouseholdInviteDraft,
  HouseholdMember,
} from '../../shared/models/household.model';
import { Modal } from '../../shared/ui/modal/modal';
import { ModalService } from '../../shared/ui/modal/modal.service';
import { SnackbarService } from '../../shared/ui/snackbar/snackbar.service';
import { HouseholdsService } from './service/households.service';

type HouseholdModalMode = 'create' | 'invite';

@Component({
  selector: 'app-households',
  imports: [CommonModule, Modal, ReactiveFormsModule],
  templateUrl: './households.html',
  styleUrl: './households.css',
})
export class Households {
  private readonly formBuilder = inject(FormBuilder);
  private readonly householdsService = inject(HouseholdsService);
  private readonly modalService = inject(ModalService);
  private readonly snackbarService = inject(SnackbarService);

  readonly households$ = this.householdsService.households$;
  readonly selectedHousehold$ = this.householdsService.selectedHousehold$;
  readonly summary$ = combineLatest([this.households$, this.selectedHousehold$]).pipe(
    map(([households, selectedHousehold]) => ({
      count: households.length,
      selectedName: selectedHousehold?.name ?? 'Sin household seleccionado',
    })),
  );

  readonly createForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
  });
  readonly inviteForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    role: this.formBuilder.nonNullable.control<HouseholdInviteDraft['role']>('member', {
      validators: [Validators.required],
    }),
  });

  modalMode: HouseholdModalMode = 'create';
  isSaving = false;
  errorMessage = '';

  openCreateModal(): void {
    this.modalMode = 'create';
    this.errorMessage = '';
    this.createForm.reset({ name: '' });
    this.modalService.open();
  }

  openInviteModal(): void {
    this.modalMode = 'invite';
    this.errorMessage = '';
    this.inviteForm.reset({ email: '', role: 'member' });
    this.modalService.open();
  }

  selectHousehold(household: Household): void {
    this.householdsService.selectHousehold(household.id);
  }

  submitCreateHousehold(): void {
    if (this.createForm.invalid || this.isSaving) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.householdsService.createHousehold(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.modalService.close();
        this.snackbarService.success('Household creado correctamente.');
      },
      error: () => {
        this.errorMessage = 'No se pudo crear el household.';
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  submitInviteMember(): void {
    const selectedHousehold = this.householdsService.getSelectedHousehold();

    if (!selectedHousehold) {
      this.errorMessage = 'Selecciona un household antes de invitar.';
      return;
    }

    if (this.inviteForm.invalid || this.isSaving) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.householdsService
      .inviteMember(selectedHousehold.id, this.toInviteDraft())
      .subscribe({
        next: () => {
          this.modalService.close();
          this.snackbarService.success('Invitacion enviada correctamente.');
        },
        error: () => {
          this.errorMessage = 'No se pudo invitar al usuario.';
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        },
      });
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

  private toInviteDraft(): HouseholdInviteDraft {
    const rawInvite = this.inviteForm.getRawValue();

    return {
      email: rawInvite.email.trim(),
      role: rawInvite.role,
    };
  }
}
