import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-forgot-your-password',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgbTypeaheadModule,
    HttpClientModule,
    MatTooltipModule
  ],
  templateUrl: './forgot-your-password.component.html',
  styleUrl: './forgot-your-password.component.scss'
})
export class ForgotYourPasswordComponent {
  currentStep: number = 1;
  email: string = '';
  verificationCode: string = '';
  timeLeft: number = 30; // Tiempo de espera para reenviar el código
  timer: any;
  showModal: boolean = true;
  isLoading: boolean = false;
  verificationCodeParts: string[] = ["", "", "", ""];
  isCodeComplete: boolean = false;
  user: any = { id: 0, username: '', password: '', photo: '', personId: 0, state: true };
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  private apiUrl = 'http://localhost:5062/password';
  private apiUrlUser = 'http://localhost:5062/api/User';

  constructor(private cdr: ChangeDetectorRef, private router: Router, private http: HttpClient) { }

  loadUser(): void {
    const storedData = JSON.parse(sessionStorage.getItem('activationData') || '{}');
    const userId = storedData.id

    if (userId) {
      this.http.get(`${this.apiUrlUser}/${userId}`).subscribe(
        (response: any) => {
          this.user.id = response.id
          this.user.username = response.username
          this.user.personId = response.personId
          this.user.password = response.password
          this.currentStep++;
        },
        (error) => {
          console.error('Error al cargar el usuario:', error);
          Swal.fire('Error', 'No se pudo cargar el usuario. Por favor, intenta de nuevo.', 'error');
        }
      );
    } else {
      Swal.fire('Error', 'No se encontró el ID del usuario en la sesión.', 'error');
    }
  }

  //metodo para actualizar el user
  updatedUser(): void {
    const updatedData = {
      id: this.user.id,
      username: this.user.username,
      password: this.newPassword,
      photoBase64: this.user.photoBase64,
      personId: this.user.personId,
      roles: [{ id: 1 }]
    };

    this.http.put(`${this.apiUrlUser}`, updatedData).subscribe(
      (response: any) => {
        Swal.fire('¡Éxito!', 'Contraseña cambiada con éxito.', 'success');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error al actualizar el usuario:', error);
        Swal.fire('Error', error.error.message ||  'No se pudo actualizar la contraseña. Por favor, intenta de nuevo.', 'error');
      }
    );
  }

  moveToNext(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (/\d/.test(input.value)) {
      this.verificationCodeParts[index] = input.value;
      if (index < 3) {
        const nextInput = document.getElementById(`code-${index + 2}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else {
      input.value = "";
    }
    this.verificationCode = this.verificationCodeParts.join("");
    this.isCodeComplete = this.verificationCodeParts.every((part) => part.length === 1);
  }

  // Método para enviar el código de activación
  sendActivationCode(): void {
    if (!this.validateEmail()) {
      Swal.fire('Error', 'Por favor, ingrese un correo electrónico válido.', 'error');
      return; // No continuar si el correo no es válido
    }

    Swal.fire({
      title: 'Enviando código...',
      text: 'Por favor espera unos segundos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const payload = { email: this.email };
    this.http.post(`${this.apiUrl}`, payload).subscribe(
      (response: any) => {
        sessionStorage.setItem('activationData', JSON.stringify(response.data.result));
        Swal.fire('¡Código Enviado!', 'Revisa tu correo para el código de verificación.', 'success');
        this.currentStep = 2;
      },
      (error) => {
        Swal.fire('Error', 'No se pudo enviar el código. Por favor, intenta de nuevo.', 'error');
      }
    );
  }

  // Método para pasar al siguiente paso
  async nextStep(): Promise<void> {

    if (this.currentStep === 1) {
      await this.sendActivationCode();
      return;
    }

    if (this.currentStep === 2 && !this.validateCode()) {
      Swal.fire('Error', 'Por favor, ingrese el código de verificación correctamente.', 'error');
      return;
    }

    if (this.currentStep === 2) {
      if (!this.validateCode()) {
        Swal.fire('Error', 'Por favor, ingrese el código de verificación correctamente.', 'error');
        return;
      }

      const storedData = JSON.parse(sessionStorage.getItem('activationData') || '{}');
      if (this.verificationCode === storedData.code) {
        // El código es correcto
        Swal.fire('¡Código Verificado!', 'El código es correcto. Proceda al siguiente paso.', 'success');
        await this.loadUser()
      } else {
        Swal.fire('Error', 'El código de verificación es incorrecto. Por favor, inténtelo de nuevo.', 'error');
      }
      return;
    }

    if (this.currentStep === 3) {
      Swal.fire('Error', 'Las contraseñas no coinciden o están vacías.', 'error');
      return;
    }

    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      this.submitPassword();
    }
  }

  // Método para regresar al paso anterior
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  passwordError: string | null = null;
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

isPasswordsMatching(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

// Validación de las contraseñas
validatePasswords(): boolean {
  return !!this.newPassword && !!this.confirmPassword && this.newPassword === this.confirmPassword;
}

// Enviar la nueva contraseña (solo validación por ahora)
submitPassword(): void {
  if (this.validatePasswords()) {
    this.updatedUser();
  } else {
    Swal.fire('Error', 'Las contraseñas no coinciden o están vacías.', 'error');
  }
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Validación del correo electrónico
  validateEmail(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email);
  }

  // Validación del código de verificación
  validateCode(): boolean {
    return this.verificationCode.length === 4;
  }

  // Temporizador de 30 segundos
  startTimer(): void {
    this.timeLeft = 30;
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft === 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  // Confirmar salir y perder datos
  confirmExit(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si sales, perderás los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#44E32A',
      cancelButtonColor: '#ff0000',
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

  // Confirmar al ir atrás en el segundo paso
  confirmExitToStep1(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás el código ingresado si retrocedes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regresar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#44E32A',
      cancelButtonColor: '#ff0000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true; // Activar spinner
        sessionStorage.removeItem('activationData');

        setTimeout(() => {
          this.currentStep = 1;
          this.isLoading = false; 
        }, 1000);
      }
    });
  }
  
  // Confirmar al ir atrás en el tercer paso
  confirmExitToStep2(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás las contraseñas ingresadas si retrocedes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regresar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#44E32A',
      cancelButtonColor: '#ff0000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true; 

        setTimeout(() => {
          this.currentStep = 1;
          this.isLoading = false; 
        }, 1000);
      }
    });
  }
}
