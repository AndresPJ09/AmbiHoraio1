import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación

  // Verifica si el token está presente en el localStorage
  if (authService.isAuthenticated()) {
    // Verifica si el menú también está presente
    const menu = localStorage.getItem("menu");

    if (menu) {
      // Si el menú está presente, permite el acceso
      return true;
    } else {
      // Si el menú no está presente, redirige al login
      window.location.href = '/login';
      return false;
    }
  } else {
    // Si no está autenticado, redirige al login
    window.location.href = '/login'; 
    return false;
  }
};
