import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router'
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  private apiUrl = 'http://localhost:5062/login';

  constructor(private http: HttpClient, private router: Router) { }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm): void {
    const loginData = { username: this.username, password: this.password };

    this.http.post(this.apiUrl, loginData).subscribe(
      (response: any) => {
        if (response) {
          localStorage.setItem("menu", JSON.stringify(response));

          // Alerta de bienvenida
          Swal.fire({
            title: '¡Bienvenido a AmbiHorario!',
            html: ``,
            background: '#f4f6f9',
            timer: 2000, // Tiempo de la alerta
            timerProgressBar: true, // Barra de progreso del temporizador
            showConfirmButton: false, // Sin botón de confirmación
            didOpen: () => {
              const content = Swal.getHtmlContainer();
              if (content) {
                content.style.fontSize = '16px'; // Ajuste de tamaño de fuente
              }
            }
          }).then(() => {
            this.router.navigate(['/dashboard/home']).then(() => {
              window.history.replaceState({}, '', '/dashboard/home');
            });
          });

        } else {
          this.showCreateAccountAlert();
        }
      },
      (error) => {
        this.showCreateAccountAlert();
      }
    );
  }

  private showCreateAccountAlert() {
    Swal.fire({
      title: '<strong>¡Credenciales incorrectas!</strong>',
      html: `
        <p>No tienes una cuenta registrada. ¿Deseas <strong>crear una cuenta</strong> ahora?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-user-plus"></i> Crear cuenta',
      cancelButtonText: '<i class="fa fa-times-circle"></i> Cancelar',
      confirmButtonColor: '#5EB319',
      cancelButtonColor: '#ff0000',

      timer: 10000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      customClass: {
        confirmButton: 'custom-confirm-btn',
        cancelButton: 'custom-cancel-btn',
        popup: 'custom-popup',  // Personalización del cuadro de diálogo
        title: 'custom-title',  // Estilo personalizado para el título
        htmlContainer: 'custom-html'  // Estilo para el contenido HTML
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/creat-account']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  onForgotPassword() {
    this.isLoading = true;

    setTimeout(() => {
      this.router.navigate(['/forgot-your-password']);
      this.isLoading = false;
    }, 1000);
  }

  onCreateAccount() {
    this.isLoading = true;

    setTimeout(() => {
      this.router.navigate(['/creat-account']);
      this.isLoading = false
    }, 1000);
  }
}




