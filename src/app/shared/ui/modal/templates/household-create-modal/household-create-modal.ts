import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HouseholdsService } from '../../../../../core/services/household/households.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { SnackbarService } from '../../../../../core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-household-create-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './household-create-modal.html',
  styleUrl: './household-create-modal.css',
})
export class HouseholdCreateModal {
  private readonly formBuilder = inject(FormBuilder);
  private readonly householdsService = inject(HouseholdsService);
  private readonly modalService = inject(ModalService);
  private readonly snackbarService = inject(SnackbarService);

  readonly createForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
  });

  isSaving = false;
  errorMessage = '';

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
}
