import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p>Verificando sesión...</p>
    </div>
  `,
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {}
