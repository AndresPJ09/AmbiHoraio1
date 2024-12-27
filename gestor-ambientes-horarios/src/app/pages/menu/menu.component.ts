import { Component, ElementRef, OnInit, ViewChildren, QueryList, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { UserService } from '../userperfile/user.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, HttpClientModule, BsDropdownModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  username: string = '';

  user: any = { id: 0, username: '', password: '', photo: '', personId: 0, state: true };
  users: any[] = [];
  person: any = { id: 0, name: '', last_name: '', email: '', identification: '', state: true };
  persons: any[] = [];
  roles: any = [{ id: 0 }]
  menu: any[] = [];
  unreadCount = 0;
  menuOpen = false;
  
  profileImageUrl: string | null = null;

  private updatePasswordUrl = 'http://localhost:5062/api/user';

  private activeAccordion: string | undefined;
  @ViewChildren('collapse') collapses!: QueryList<ElementRef>;


  constructor(private userService: UserService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadMenu();
    this.loadUserData();
    this.userService.profileImageUrl$.subscribe(imageUrl => {
      this.profileImageUrl = imageUrl;
    });
  }

  loadProfileImage() {
    this.profileImageUrl = localStorage.getItem('profileImageUrl');
  }

  async loadUserData() {
    await this.loadUser();
    this.username = this.user.username;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  async loadUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const storedData = localStorage.getItem('menu');
      const parsedData = storedData ? JSON.parse(storedData) : null;

      if (parsedData?.menu?.[0]?.userID) {
        const userId = parsedData.menu[0].userID;


        this.http.get(`${this.updatePasswordUrl}/${userId}`).subscribe(
          (response: any) => {
            this.user.id = response.id;
            this.user.username = response.username;
            localStorage.setItem('personId', response.personId.toString());

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



  loadMenu() {
    if (typeof localStorage !== 'undefined') {
      const storedMenu = localStorage.getItem("menu");
      if (storedMenu) {
        const parsedMenu = JSON.parse(storedMenu);
        this.menu = parsedMenu?.menu?.[0]?.listView || [];
      } else {
        this.menu = [];
      }
    } else {
      console.error('localStorage no está disponible.');
    }
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Seguro que quieres cerrar sesión!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,

      confirmButtonColor: '#5EB319',
      cancelButtonColor: '#ff0000',
    }).then((result) => {
      if (result.isConfirmed) {
        this.showLoadingSpinner();

        setTimeout(() => {
          localStorage.removeItem("menu");
          Swal.close(); // Cierra el popup de carga
          this.router.navigate(['/login']);

          Swal.fire({
            title: '¡Cerraste sesión!',
            text: '¡Vuelve pronto!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

        }, 2000);
      }
    });
  }

  showLoadingSpinner() {
    Swal.fire({
      title: 'Cerrando sesión...',
      text: 'Por favor, espera un momento.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  toggleAccordion(module: string) {
    const collapseElement = this.collapses.find(collapse => collapse.nativeElement.id === module + 'Collapse');
    if (collapseElement) {
      const isCollapsed = collapseElement.nativeElement.classList.contains('show');

      if (this.activeAccordion && this.activeAccordion !== module) {
        const previousCollapse = this.collapses.find(collapse => collapse.nativeElement.id === this.activeAccordion + 'Collapse');
        if (previousCollapse) {
          previousCollapse.nativeElement.classList.remove('show');
        }
      }

      if (isCollapsed) {
        collapseElement.nativeElement.classList.remove('show');
        this.activeAccordion = undefined;
      } else {
        collapseElement.nativeElement.classList.add('show');
        this.activeAccordion = module;
      }
    }
  }

  isAccordionOpen(module: string): boolean {
    return this.activeAccordion === module;
  }
}
