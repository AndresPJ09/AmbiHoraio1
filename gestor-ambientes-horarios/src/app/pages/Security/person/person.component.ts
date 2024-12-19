import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
declare var bootstrap: any;

@Component({
  selector: 'app-person',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss'
})
export class PersonComponent implements OnInit {
  persons: any[] = [];
  person: any = { id: 0, name: '', last_name: '', email: '', identification: '', state: true };
  isModalOpen = false;
  filteredPersons: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Person';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getPersons();
  }

  ngAfterViewInit() {
    // Inicializar tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
  }


  getPersons(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (persons) => {
        this.persons = persons;
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
    this.filteredPersons = [];
  }

  onSubmit(form: NgForm): void {
    const personToSave = { ...this.person };
  
    if (this.person.id === 0) {
      this.http.post(this.apiUrl, personToSave).subscribe(() => {
        this.getPersons();
        this.closeModal();
        Swal.fire('Éxito', 'Persona creada exitosamente!', 'success');
      });
    } else {
      this.http.put(this.apiUrl, personToSave).subscribe(() => {
        this.getPersons();
        this.closeModal();
        Swal.fire('Éxito', 'Persona actualizada exitosamente!', 'success');
      });
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
    this.person = {  id: 0, name: '', last_name: '', email: '', identification: '', state: true};
    this.filteredPersons = [];
  }
}