import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import Swal from 'sweetalert2';
import { UserService } from '../userperfile/user.service';

@Component({
  selector: 'app-userperfile',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, MatExpansionModule],
  templateUrl: './userperfile.component.html',
  styleUrl: './userperfile.component.scss'
})
export class UserperfileComponent implements OnInit {
  persons: any[] = [];
  person: any = {
    id: 0,
    name: '',
    last_name: '',
    email: '',
    identification: '',
    state: true
  };
  username: string = '';
  user: any = { id: 0, username: '', password: '', personId: 0, photo: '', state: true };
  users: any[] = [];
  roles: any = [{ id: 0 }]
  password: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isEditable: boolean = false;
  profileImageUrl: string | ArrayBuffer | null = null;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isModalOpen = false;

  private personApiUrl = 'http://localhost:5062/api/Person';
  private updatePasswordUrl = 'http://localhost:5062/api/User';

  constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef, private userService: UserService) { }

  ngOnInit() {
    this.subscribeToProfileImage();
    this.getPersons();
    this.loadUserData();
  }

  resetForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  subscribeToProfileImage() {
    this.userService.profileImageUrl$.subscribe(imageUrl => {
      this.profileImageUrl = imageUrl;
    });
  }

  async loadUserData() {
    await this.loadUser();
    this.username = this.user.username;
  }


  async loadUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const storedData = localStorage.getItem('menu');
      const parsedData = storedData ? JSON.parse(storedData) : null;

      if (parsedData && parsedData.menu && parsedData.menu[0].userID) {
        const userId = parsedData.menu[0].userID;

        this.http.get(`${this.updatePasswordUrl}/${userId}`).subscribe(
          (response: any) => {
            console.log('User response:', response);
            this.user.id = response.id,
              this.user.username = response.username,
              this.user.password = response.password
            this.user.personId = response.personId,
              this.roles = response.roles;



            // Actualizamos la imagen de perfil
            if (response.photoBase64) {
              this.profileImageUrl = 'data:image/jpeg;base64,' + response.photoBase64;
            } else {
              // Imagen por defecto si no hay foto
              this.profileImageUrl = 'assets/person-circle.svg';
            }

            resolve();
          },
          (error) => {
            console.error('Error al cargar el usuario:', error);
            Swal.fire('Error', 'No se pudo cargar el usuario. Por favor, intenta de nuevo.', 'error');
            reject(error);
          }
        );
      } else {
        Swal.fire('Error', 'No se encontró el ID del usuario en la sesión.', 'error');
        reject('No se encontró el ID del usuario en la sesión.');
      }
    });
  }

  getPersons(): void {
    const personId = localStorage.getItem('personId');
    if (personId) {
      this.http.get<any>(`${this.personApiUrl}/${personId}`).subscribe(
        (person) => {
          this.person = {
            ...person,
          };
        },
        (error) => {
          console.error('Error fetching person:', error);
        }
      );
    } else {
      console.error('No personId found in localStorage.');
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (file.size > 5242880) { // 5MB in bytes
        Swal.fire('Error', 'La imagen no debe superar los 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.profileImageUrl = base64;
        this.user.photoBase64 = base64.split(',')[1];
        this.userService.updateProfileImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    this.updateUser();
  }

  saveChangess() {
    this.updatePerson();
  }


  updateUser() {
    const userData = JSON.parse(localStorage.getItem('menu') || '');

    const updatedData = {
      id: userData.menu[0].userID,
      username: this.username,
      photoBase64: this.user.photoBase64,
      personId: this.user.personId,
      roles: this.roles,
      state: true
    };

    console.log('Updated Data USER:', updatedData);
    const apiUrl = `${this.updatePasswordUrl}/`;
    this.http.put(apiUrl, updatedData).subscribe(
      (response: any) => {
        console.log('User updated successfully:', response);
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario actualizado correctamente.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al actualizar el usuario: ' + error.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    );
  }

  updatePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }
    const passwordData = {
      userId: this.user.id,
      currentPassword: this.currentPassword, // Enviamos la contraseña actual
      newPassword: this.newPassword,
      roles: this.roles,

    };
    console.log('Updated Data Pswword:', passwordData);

    this.http.patch(`${this.updatePasswordUrl}/ChangePassword`, passwordData).subscribe(
      (response: any) => {
        console.log('Password updated successfully:', response);
        this.closeModal();
        Swal.fire({
          title: 'Éxito',
          text: 'Contraseña actualizada correctamente.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        this.closeModal();
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al actualizar la contraseña: ' + error.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    );
  }

  updatePerson() {
    console.log('Updated Data Person:', this.person);
    const apiUrl = `${this.personApiUrl}/`;
    this.http.put(apiUrl, this.person).subscribe(
      (response: any) => {
        Swal.fire({
          title: 'Éxito',
          text: 'Datos de la persona actualizados correctamente.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al actualizar los datos de la persona: ' + error.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    );
  }

}
