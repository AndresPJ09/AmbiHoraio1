import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
declare var bootstrap: any;
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-person',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss'
})
export class PersonComponent implements OnInit {
  persons: any[] = [];
  person: any = { id: 0, name: '', last_name: '', email: '', identification: '', state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['name', 'last_name', 'email', 'identification', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.persons);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/Person';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getPersons();
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

  getPersons(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (persons) => {
        this.persons = persons;
        this.dataSource.data = this.persons;  
        if (this.paginator) {
          this.paginator.pageIndex = 0; 
          this.dataSource.paginator = this.paginator;
        }
      },
      (error) => {
        console.error('Error fetching persons:', error);
      }
    );
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
  }

  onSubmit(form: NgForm): void {
    const personToSave = { ...this.person };
    if (this.person.id === 0) {
      this.http.post<any>(this.apiUrl, personToSave).subscribe(
        (newPerson) => {
          this.getPersons();
          this.closeModal(); 
          Swal.fire('Éxito', '¡Persona creada exitosamente!', 'success');
        },
        (error) => {
          console.error('Error creando persona:', error);
          Swal.fire('Error', error.error.message || 'Ocurrió un error al crear la persona.', 'error');
        }
      );
    } else {
      this.http.put(this.apiUrl, personToSave).subscribe(
        () => {
          this.getPersons();
          this.closeModal()
          Swal.fire('Éxito', '¡Persona actualizada exitosamente!', 'success');
        },
        (error) => {
          console.error('Error actualizando persona:', error);
          Swal.fire('Error', error.error.message || 'Ocurrió un error al actualizar la persona.', 'error');
        }
      );
    }
  }

  editPersons(person: any): void {
    this.person = { ...person };
    this.isEditing = true;
    this.openModal();
  }

  deletePersons(id: number): void {
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
          this.getPersons();
          Swal.fire('¡Eliminado!', 'Tu archivo ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.person = { id: 0, name: '', last_name: '', email: '', identification: '', state: true };
  }
}