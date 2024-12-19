import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../userperfile/user.service';

@Component({
  selector: 'app-userperfile',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HttpClientModule, CommonModule, FormsModule, MatExpansionModule],
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
  password: string = '';
  user: any = { id: 0, username: '', password: '', personId: 0, photo: '', state: true };
  users: any[] = [];
  roles: any = [{ id: 0 }]
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isEditable: boolean = false;
  profileImageUrl: string | ArrayBuffer | null = null;
  showPassword: boolean = false;

  private personApiUrl = 'http://localhost:5062/api/Person';
  private updatePasswordUrl = 'http://localhost:5062/api/User';

  constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef, private userService: UserService) { }

  ngOnInit() {
    this.subscribeToProfileImage();
    this.getPersons();
    this.getUsers();
    this.loadUserData();
  }

  subscribeToProfileImage() {
    this.userService.profileImageUrl$.subscribe(imageUrl => {
      this.profileImageUrl = imageUrl;
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async loadUserData() {
    await this.loadUser();
    console.log(this.user);
    this.username = this.user.username;
    this.password = this.user.password;
    this.profileImageUrl = this.user.photo
  }


  async loadUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const storedData = localStorage.getItem('menu');
      const parsedData = storedData ? JSON.parse(storedData) : null;

      if (parsedData && parsedData.menu && parsedData.menu[0].userID) {
        const userId = parsedData.menu[0].userID;

        this.http.get(`${this.updatePasswordUrl}/${userId}`).subscribe(
          (response: any) => {
            this.user.id = response.id;
            this.user.username = response.username;
            this.user.personId = response.personId;
            this.user.password = response.password;
            this.user.photo = response.photo;
            this.roles = response.roles;

            localStorage.setItem('personId', response.personId.toString());
            localStorage.setItem('profileImageUrl', this.profileImageUrl as string); 

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

  getUsers(): void {
    this.http.get<any[]>(this.updatePasswordUrl).subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.profileImageUrl = result;
        this.userService.updateProfileImage(result);
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
      password: this.password,
      personId: this.user.personId,
      photo: this.user.photo, 
      roles: this.roles
    };

    const apiUrl = `${this.updatePasswordUrl}/`;
    this.http.put(apiUrl, updatedData).subscribe(
      (response: any) => {
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

  updatePerson() {
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
