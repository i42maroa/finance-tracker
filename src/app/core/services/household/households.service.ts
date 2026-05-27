import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, delay, map, of, tap } from 'rxjs';

import { mockHouseholds } from '../../../shared/mocks/households.mock';
import { mockUserProfile } from '../../../shared/mocks/profile.mock';
import {
  Household,
  HouseholdDraft,
  HouseholdInviteDraft,
  HouseholdMember,
} from '../../../shared/models/household.model';
import { LoaderService } from '../loader/loader.service';

@Injectable({
  providedIn: 'root',
})
export class HouseholdsService {
  private readonly loaderService = inject(LoaderService);
  private readonly householdsSubject = new BehaviorSubject<Household[]>(mockHouseholds);
  private readonly selectedHouseholdIdSubject = new BehaviorSubject<string | null>(
    mockHouseholds[0]?.id ?? null,
  );

  readonly households$ = this.householdsSubject.asObservable();
  readonly selectedHouseholdId$ = this.selectedHouseholdIdSubject.asObservable();
  readonly selectedHousehold$ = combineLatest([this.households$, this.selectedHouseholdId$]).pipe(
    map(([households, selectedHouseholdId]) =>
      households.find((household) => household.id === selectedHouseholdId) ?? null,
    ),
  );

  selectHousehold(householdId: string): void {
    this.selectedHouseholdIdSubject.next(householdId);
  }

  getSelectedHousehold(): Household | null {
    const selectedHouseholdId = this.selectedHouseholdIdSubject.value;

    return (
      this.householdsSubject.value.find((household) => household.id === selectedHouseholdId) ?? null
    );
  }

  createHousehold(draft: HouseholdDraft): Observable<Household> {
    const household: Household = {
      id: this.createId(),
      name: draft.name.trim(),
      createdAt: this.today(),
      members: [
        {
          id: this.createId(),
          name: mockUserProfile.name,
          email: mockUserProfile.email,
          role: 'admin',
          status: 'active',
        },
      ],
    };

    return this.loaderService.track(of(household).pipe(
      delay(150),
      tap((createdHousehold) => {
        this.householdsSubject.next([createdHousehold, ...this.householdsSubject.value]);
        this.selectedHouseholdIdSubject.next(createdHousehold.id);
      }),
    ));
  }

  inviteMember(householdId: string, draft: HouseholdInviteDraft): Observable<HouseholdMember> {
    const member: HouseholdMember = {
      id: this.createId(),
      name: draft.email.trim(),
      email: draft.email.trim(),
      role: draft.role,
      status: 'pending',
    };

    return this.loaderService.track(of(member).pipe(
      delay(150),
      tap((invitedMember) => {
        const nextHouseholds = this.householdsSubject.value.map((household) =>
          household.id === householdId
            ? { ...household, members: [...household.members, invitedMember] }
            : household,
        );

        this.householdsSubject.next(nextHouseholds);
      }),
    ));
  }

  private createId(): string {
    return crypto.randomUUID();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
