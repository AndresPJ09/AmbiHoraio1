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

  private personApiUrl = 'http://localhost:5062/api/Person';
  private userApiUrl = 'http://localhost:5062/api/User';

  private personId: number | null = null;

  constructor(private http: HttpClient,  private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    const storedPerson = sessionStorage.getItem('person');

    if (storedPerson) {
      this.person = JSON.parse(storedPerson);
    }
  }
  
   onSubmit(): void {
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
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Hubo un problema al crear la cuenta', 'error');
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
        this.router.navigate(['/login']);
        sessionStorage.clear();
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

  clearSessionData(): void {
    this.person = {
      name: '', last_name: '', email: '',  identification: ''
    };
    this.user = { username: '', password: '', roles: [] };
    this.termsAccepted = false;
    sessionStorage.removeItem('person');
    sessionStorage.removeItem('termsAccepted');
  }

}
