import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-creat-account',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './creat-account.component.html',
  styleUrls: ['./creat-account.component.scss']
})
export class CreatAccountComponent implements OnInit {

  person: any = {
    name: '',
    last_name: '',
    email: '',
    identification: '',
  };

  user: any = {
    username: '',
    password: '',
    roles: []
  };
  termsAccepted = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  passwordError: string | null = null;

  private personApiUrl = 'http://localhost:5062/api/Person';
  private userApiUrl = 'http://localhost:5062/api/User';

  private personId: number | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit(): void {
    const storedPerson = sessionStorage.getItem('person');
    this.clearSessionData();

    if (storedPerson) {
      this.person = JSON.parse(storedPerson);
    }
  }

  emailError: string | null = null;
  validateEmail(): void {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(this.person.email)) {
      this.emailError = 'El correo debe ser válido y terminar en @gmail.com';
    } else {
      this.emailError = null;
    }
  }

  onSubmit(): void {
    // Validar el nombre de usuario antes de enviar los datos
    if (!this.user.username) {
      Swal.fire('Error', 'El nombre de usuario no puede estar vacío.', 'error');
      return;
    }

    // Validar el correo electrónico
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(this.person.email)) {
      Swal.fire('Error', 'El correo debe ser válido y terminar en @gmail.com', 'error');
      return;
    }

    // Validar la contraseña antes de enviar los datos
    this.validatePassword(this.user.password);

    if (this.passwordError) {
      Swal.fire('Error', 'No se puede crear la cuenta. Verifique la contraseña.', 'error');
      return;
    }

    if (!this.termsAccepted) {
      Swal.fire('Advertencia', 'Debe aceptar los términos y condiciones.', 'warning');
      return;
    }

    this.person.identification = this.person.identification.toString();
    this.isLoading = true;
    this.http.post<any>(this.personApiUrl, this.person).subscribe({
      next: (response) => {
        this.personId = response.id;
        sessionStorage.clear();
        this.submitUserData();
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Hubo un problema al enviar los datos de la persona', 'error');

      }
    });
  }

  submitUserData(): void {
    if (this.personId === null) {
      this.isLoading = false;
      Swal.fire('Error', 'No se pudo obtener el ID de la persona.', 'error');
      return;
    }
    const userData = {
      username: this.user.username,
      password: this.user.password,
      roles: [{ id: 1 }],
      personId: this.personId
    };

    this.http.post(this.userApiUrl, userData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Éxito', 'Cuenta creada con éxito', 'success');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', error.error.message || 'Hubo un problema al crear la cuenta', 'error');
      }
    });
  }

  confirmExit(): void {
    Swal.fire({
      title: '<strong>¿Estás seguro?</strong>',
      html: `
        <p>Si sales, perderás todos los datos ingresados.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-check-circle"></i> Sí, salir',
      cancelButtonText: '<i class="fa fa-times-circle"></i> Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#5EB319',
      cancelButtonColor: '#ff0000',
      timer: 10000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate_animated animate_fadeInDown'
      },
      hideClass: {
        popup: 'animate_animated animate_fadeOutUp'
      },
      customClass: {
        confirmButton: 'custom-confirm-btn',
        cancelButton: 'custom-cancel-btn',
        popup: 'custom-popup',
        title: 'custom-title',
        htmlContainer: 'custom-html'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true; // Activar el spinner antes de redirigir

        setTimeout(() => {
          sessionStorage.clear();
          this.router.navigate(['/login']);
          this.isLoading = false; // Desactivar el spinner después de la redirección
        }, 1000);
      }
    });
  }

  //Función del spinner
  onLogin() {
    this.isLoading = true;

    setTimeout(() => {
      this.router.navigate(['/login']);
      this.isLoading = false;
    }, 1000);
  }

  redirectToTerms() {
    this.isLoading = true;

    setTimeout(() => {
      window.open('/terms', '_blank');
      this.isLoading = false;
    }, 1000);
  }

  validatePassword(password: string): void {
    const minLength = 8;
    const maxLength = 15;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password); // Verifica si hay al menos un número
    const hasMinLength = password.length >= minLength;
    const hasMaxLength = password.length <= maxLength;

    if (!hasMinLength) {
      this.passwordError = `La contraseña debe tener minimo ${minLength} caracteres.`;
    } else if (!hasMaxLength) {
      this.passwordError = `La contraseña no debe superar los ${maxLength} caracteres.`;
    } else if (!hasUppercase) {
      this.passwordError = 'La contraseña debe contener al menos 1 letra mayúscula.';
    } else if (!hasSpecialChar) {
      this.passwordError = 'La contraseña debe contener al menos 1 carácter especial.';
    } else if (!hasNumber) {
      this.passwordError = 'La contraseña debe contener al menos 1 número.';
    } else {
      this.passwordError = null;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  clearSessionData(): void {
    this.person = {
      name: '', last_name: '', email: '', identification: ''
    };
    this.user = { username: '', password: '', roles: [] };
    this.termsAccepted = false;
    sessionStorage.removeItem('person');
    sessionStorage.removeItem('termsAccepted');
  }

}
