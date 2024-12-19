import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null && localStorage.getItem('menu') !== null;
  }

  // Método para obtener el token (opcional)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para obtener el menú (opcional)
  getMenu(): any | null {
    return JSON.parse(localStorage.getItem('menu') || 'null');
  }
}
