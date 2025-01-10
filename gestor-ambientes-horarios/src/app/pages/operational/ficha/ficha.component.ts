import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ficha',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgSelectModule, MatInputModule, MatAutocompleteModule, NgbTypeaheadModule],
  templateUrl: './ficha.component.html',
  styleUrl: './ficha.component.scss'
})
export class FichaComponent implements OnInit {
  fichas: any[] = [];
  ficha: any = { 
    id: 0, codigo: '', 
    userId: 0, 
    programaId: 0, 
    ambienteId: 0, 
    proyectoId: 0, 
    fecha_inicio: new Date().toISOString().slice(0, 10), 
    fecha_fin: new Date().toISOString().slice(0, 10), 
    fin_lectiva: new Date().toISOString().slice(0, 10), 
    num_semanas: '', state: true };
  users: any[] = [];
  programas: any[] = [];
  isModalOpen = false;
  filteredUsers: any[] = [];
  filteredProgramas: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Ficha';
  private usersUrl = 'http://localhost:5062/api/User';
  private programasUrl = 'http://localhost:5062/api/Programa';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getFichas();
    this.getUsers();
    this.getProgramas();
  }

  getFichas(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (fichas) => {
        this.fichas = fichas.map(ficha => ({
          ...ficha,
          fecha_inicio_Ac: new Date(ficha.fecha_inicio).toISOString().slice(0, 10),
          fecha_fin_Ac: new Date(ficha.fecha_fin).toISOString().slice(0, 10),
          fin_lectiva: new Date(ficha.fin_lectiva).toISOString().slice(0, 10)
        }));
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching actividades:', error);
      }
    );
  }

  getUsers(): void {
    this.http.get<any[]>(this.usersUrl).subscribe(
      (users) => {
        this.users = users;
        this.filteredUsers = users;
      },
      (error) => {
        console.error('Error fetching usuarios:', error);
      }
    );
  }

  getUserNombre(userId: number): string {
    const user = this.users.find(use => use.id === userId);
    return user ? user.username : 'Desconocido';
  }

  getProgramas(): void {
    this.http.get<any[]>(this.programasUrl).subscribe(
      (programas) => {
        this.programas = programas;
        this.filteredProgramas = programas;
        
        console.log("dsds", this.programas);
      },
      (error) => {
        console.error('Error fetching programas:', error);
      }
    );
  }

  searchPrograma(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredProgramas = this.programas;
    } else {
      this.filteredProgramas = this.programas.filter(programa =>
        programa.nombre.toLowerCase().includes(term)
      );
    }
  }

  onProgramaSelect(event: any): void {
    const selectedprograma = this.programas.find(programa =>
      programa.nombre === event.option.value
    );
    if (selectedprograma) {
      this.ficha.programaId = selectedprograma.id;
      this.ficha.programaNombre = selectedprograma.nombre;
      this.filteredProgramas = [];
    }
  }

  getProgramaNombre(programaId: number): string {
    const programa = this.programas.find(progr => progr.id === programaId);
    return programa ? programa.nombre : 'Desconocido';
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredUsers = [];
  }

  onSubmit(form: NgForm): void {
    this.ficha.fecha_inicio = new Date(this.ficha.fecha_inicio).toISOString();
    this.ficha.fecha_fin = new Date(this.ficha.fecha_fin).toISOString();
    this.ficha.fin_lectiva = new Date(this.ficha.fin_lectiva).toISOString();
    if (this.ficha.id === 0) {
      this.http.post(this.apiUrl, this.ficha).subscribe(() => {
        this.getFichas();
        this.closeModal();
        Swal.fire('Éxito', 'Ficha creada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar ficha:', error);
          Swal.fire('Error', error.message, 'error');
        });
    } else {
      this.http.put(this.apiUrl, this.ficha).subscribe(() => {
        this.getFichas();
        this.closeModal();
        Swal.fire('Éxito', 'Ficha actualizada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar ficha:', error);
          Swal.fire('Error', error.message, 'error');
        });
    }
  }

  editFicha(ficha: any): void {
    this.ficha = {...ficha, 
      fecha_inicio: new Date(ficha.fecha_inicio).toISOString().slice(0, 10),
      fecha_fin: new Date(ficha.fecha_fin).toISOString().slice(0, 10),
      fin_lectiva: new Date(ficha.fin_lectiva).toISOString().slice(0, 10) };
      console.log("dsds", this.programas);
    const selectedprograma = this.programas.find(progr => progr.id === this.ficha.programaId);
    if (selectedprograma) {
      this.ficha.programaNombre = selectedprograma.nombre;
    }
    this.isEditing = true;
    this.openModal();
  }

  deleteFicha(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, elimínalo',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getFichas();
          Swal.fire(
            '¡Eliminado!',
            'La vista ha sido eliminada.',
            'success'
          );
        });
      }
    });
  }

  resetForm(): void {
    this.  ficha = { 
      id: 0, codigo: '', 
      userId: 0, 
      programaId: 0, 
      ambienteId: 0, 
      proyectoId: 0, 
      fecha_inicio: new Date().toISOString().slice(0, 10), 
      fecha_fin: new Date().toISOString().slice(0, 10), 
      fin_lectiva: new Date().toISOString().slice(0, 10), 
      num_semanas: '', state: true };
    this.filteredUsers = [];
  }
}