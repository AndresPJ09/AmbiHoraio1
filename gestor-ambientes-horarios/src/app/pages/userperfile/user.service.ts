// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private profileImageUrlSource = new BehaviorSubject<string | null>(null); // Elimina el valor por defecto de localStorage
  profileImageUrl$ = this.profileImageUrlSource.asObservable();

  updateProfileImage(newImageUrl: string) {
    this.profileImageUrlSource.next(newImageUrl); // Actualiza solo el BehaviorSubject sin usar localStorage
  }

}
