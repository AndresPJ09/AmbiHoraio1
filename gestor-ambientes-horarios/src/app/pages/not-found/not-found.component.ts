import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="not-found-container">
    <h1>Error 404</h1>
    <p>La ruta que has ingresado no existe.</p>
    <a [routerLink]="['/dashboard/home']" class="btn btn-primary">Volver al inicio</a>
  </div>
`,
styles: [`
  .not-found-container {
    text-align: center;
    margin-top: 50px;
  }
  .not-found-container a {
    margin-top: 20px;
  }
`],
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

}
