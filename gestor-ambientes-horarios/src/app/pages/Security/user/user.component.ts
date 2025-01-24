import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    NgSelectModule,
    MultiSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    NgbTypeaheadModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  users: any[] = [];
  user: any = { id: 0, username: '', password: '', personId: 0, role: [], state: true };
  persons: any[] = [];
  roles: any[] = [];
  isModalOpen = false;
  filteredPersons: any[] = [];
  isDropdownOpen = false;
  isEditing = false;
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['username', 'personId', 'roleString', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.users);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/User';
  private personsUrl = 'http://localhost:5062/api/Person';
  private rolesUrl = 'http://localhost:5062/api/Role';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getUsers();
    this.getPersons();
    this.getRoles();
  }

  ngAfterViewInit() {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  // Método para aplicar el filtro
  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  getUsers(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (users) => {
        this.users = users;
        this.dataSource.data = this.users;  
        if (this.paginator) {
          this.paginator.pageIndex = 0; 
          this.dataSource.paginator = this.paginator;
          console.log(this.users)
        }
        this.processUsers();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  getRoles(): void {
    this.http.get<any[]>(this.rolesUrl).subscribe(
      (roles) => {
        this.roles = roles;
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }

  getPersons(): void {
    this.http.get<any[]>(this.personsUrl).subscribe(
      (persons) => {
        this.persons = persons;
        this.filteredPersons = persons;
      },
      (error) => {
        console.error('Error fetching persons:', error);
      }
    );
  }

  searchpersons(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredPersons = this.persons;
    } else {
      this.filteredPersons = this.persons.filter(person =>
        person.name.toLowerCase().includes(term)
      );
    }
  }

  onpersonSelect(event: any): void {
    const selectedperson = this.persons.find(person =>
      person.name === event.option.value
    );
    if (selectedperson) {
      this.user.personId = selectedperson.id;
      this.user.personName = selectedperson.name;
      this.filteredPersons = [];
    }
  }

  getPersonName(personId: number): string | undefined {
    const person = this.persons.find(p => p.id === personId);
    return person ? person.name : 'Desconocido';
  }

  processUsers(): void {
    this.users.forEach(user => {
      user.roleString = user.roles.map((role: any) => role.textoMostrar).join(', ');
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredPersons = [];
  }

  onSubmit(form: NgForm): void {
    if (!this.user.personId) {
      Swal.fire('Error', 'Debe seleccionar una persona válida.', 'error');
      return;
    }

    const userToSave = {
      ...this.user,
      roles: this.user.roles.map((role: any) => ({
        id: role.id,
        textoMostrar: role.textoMostrar
      }))
    };

    if (this.user.id === 0) {
      this.http.post(this.apiUrl, userToSave).subscribe(() => {
        this.getUsers();
        this.closeModal();
        Swal.fire('Éxito', 'Usuario creado exitosamente!', 'success');
      }, error => {
        console.error('Error al actualizar usuario:', error);
        Swal.fire('Error', error.error.message, 'error');
      });
    } else {
      this.http.put(this.apiUrl, userToSave).subscribe(() => {
        this.getUsers();
        this.closeModal();
        Swal.fire('Éxito', 'Usuario actualizado exitosamente!', 'success');
      }, error => {
        console.error('Error al actualizar usuario:', error);
        Swal.fire('Error', error.error.message, 'error');
      });
    }
  }

  editUsers(user: any): void {
    this.user = {
      ...user, roles: user.roles
        ? user.roles.map((role: any) => ({ id: role.id, textoMostrar: role.textoMostrar }))
        : []
    };

    const selectedperson = this.persons.find(per => per.id === this.user.personId);
    if (selectedperson) {
      this.user.personName = selectedperson.name;
    }
    const selectedRoleIds = this.user.roles.map((role: any) => role.id);
    this.user.roles = this.roles.filter((role: any) => selectedRoleIds.includes(role.id));
    this.isEditing = true;
    this.openModal();
  }

  deleteUsers(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, elimínalo!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getUsers();
          Swal.fire('¡Eliminado!', 'Tu archivo ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.user = { id: 0, username: '', password: '', personId: 0, roles: [], state: true };
    this.filteredPersons = [];
  }
}