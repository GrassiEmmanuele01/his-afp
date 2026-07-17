import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { StaffManager } from './staff-manager';

export function usernameDisponibileValidator(staffManager: StaffManager): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(300).pipe(
      switchMap(() => staffManager.checkUsernameDisponibile(control.value)),
      map((disponibile) => (disponibile ? null : { usernameNonDisponibile: true })),
      catchError(() => of(null)),
    );
  };
}