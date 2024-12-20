import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MenuComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Lógica para evitar retroceder
    this.preventBackNavigation();
  }

  preventBackNavigation() {
    history.pushState(null, '', location.href); // Empuja el estado inicial
    window.addEventListener('popstate', () => {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']); // Redirige si no está logueado
      } else {
        history.pushState(null, '', location.href); // Evita retroceder
      }
    });
  }
}