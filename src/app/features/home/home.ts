import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface MonthLink {
  label: string;
  month: string;
  isCurrent: boolean;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly firstSelectableYear = 2025;
  private readonly today = new Date();
  readonly currentYear = this.today.getFullYear();
  readonly currentMonth = this.formatMonthValue(this.currentYear, this.today.getMonth());
  readonly availableYears = this.buildAvailableYears();
  selectedYear = this.currentYear;

  get months(): MonthLink[] {
    return this.buildMonths(this.selectedYear);
  }

  monthTrackBy(_: number, month: MonthLink): string {
    return month.month;
  }

  private buildAvailableYears(): number[] {
    const startYear = Math.min(this.firstSelectableYear, this.currentYear);

    return Array.from(
      { length: this.currentYear - startYear + 1 },
      (_, yearOffset) => startYear + yearOffset,
    );
  }

  private buildMonths(year: number): MonthLink[] {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const month = this.formatMonthValue(year, monthIndex);

      return {
        label: this.formatMonthLabel(year, monthIndex),
        month,
        isCurrent: year === this.currentYear && month === this.currentMonth,
      };
    });
  }

  private formatMonthValue(year: number, monthIndex: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  }

  private formatMonthLabel(year: number, monthIndex: number): string {
    const date = new Date(year, monthIndex, 1);
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);

    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
