import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  isLoggedIn(): boolean {
    const userData = localStorage.getItem('menu');
    return !!userData; // Devuelve true si el usuario está autenticado
  }

  logout(): void {
    localStorage.removeItem('menu');
    localStorage.removeItem('redirectUrl');
  }

  getRedirectUrl(): string {
    return localStorage.getItem('redirectUrl') || '/dashboard/home';
  }
}
