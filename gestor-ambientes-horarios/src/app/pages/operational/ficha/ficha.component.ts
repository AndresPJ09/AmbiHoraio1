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
  ambientes: any[] = [];
  proyectos: any[] = [];
  isModalOpen = false;
  filteredUsers: any[] = [];
  filteredProgramas: any[] = [];
  filteredAmbientes: any[] = [];
  filteredProyectos: any[] = [];
  filteredNumSemanas: any[] = [];
  isDropdownOpen = false;
  isEditing = false;
  numSemanasPorProyecto: { [proyectoId: number]: string[] } = {};

  private apiUrl = 'http://localhost:5062/api/Ficha';
  private usersUrl = 'http://localhost:5062/api/User';
  private programasUrl = 'http://localhost:5062/api/Programa';
  private ambientesUrl = 'http://localhost:5062/api/Ambiente';
  private proyectosUrl = 'http://localhost:5062/api/Proyecto';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getFichas();
    this.getUsers();
    this.getProgramas();
    this.getAmbientes();
    this.getProyectos();
  }

  getFichas(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (fichas) => {
        this.fichas = fichas.map(ficha => ({
          ...ficha,
          fecha_inicio: new Date(ficha.fecha_inicio).toISOString().slice(0, 10),
          fecha_fin: new Date(ficha.fecha_fin).toISOString().slice(0, 10),
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

  getAmbientes(): void {
    this.http.get<any[]>(this.ambientesUrl).subscribe(
      (ambientes) => {
        this.ambientes = ambientes;
        this.filteredAmbientes = ambientes;
      },
      (error) => {
        console.error('Error fetching ambientes:', error);
      }
    );
  }

  getProyectos(): void {
    this.http.get<any[]>(this.proyectosUrl).subscribe(
      (proyectos) => {
        this.proyectos = proyectos;
        this.filteredProyectos = proyectos;
        console.log(this.proyectos);
      },
      (error) => {
        console.error('Error fetching proyectos:', error);
      }
    );
  }

  getProgramas(): void {
    this.http.get<any[]>(this.programasUrl).subscribe(
      (programas) => {
        this.programas = programas;
        this.filteredProgramas = programas;
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

  searchAmbiente(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredAmbientes = this.ambientes;
    } else {
      this.filteredAmbientes = this.ambientes.filter(ambiente =>
        ambiente.nombre.toLowerCase().includes(term)
      );
    }
  }

  searchProyecto(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredProyectos = this.proyectos;
    } else {
      this.filteredProyectos = this.proyectos.filter(proyecto =>
        proyecto.nombre.toLowerCase().includes(term)
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

  onAmbienteSelect(event: any): void {
    const selectedambiente = this.ambientes.find(ambiente =>
      ambiente.nombre === event.option.value
    );
    if (selectedambiente) {
      this.ficha.ambienteId = selectedambiente.id;
      this.ficha.ambienteNombre = selectedambiente.nombre;
      this.filteredAmbientes = [];
    }
  }

  onProyectoSelect(event: any): void {
    const selectedproyecto = this.proyectos.find(proyecto =>
      proyecto.nombre === event.option.value
    );
    if (selectedproyecto) {
      this.ficha.proyectoId = selectedproyecto.id;
      this.ficha.proyectoNombre = selectedproyecto.nombre;
      this.filteredProyectos = [];
    }
  }

  getProgramaNombre(programaId: number): string {
    const programa = this.programas.find(progr => progr.id === programaId);
    return programa ? programa.nombre : 'Desconocido';
  }

  getUserNombre(userId: number): string {
    const user = this.users.find(use => use.id === userId);
    return user ? user.username : 'Desconocido';
  }

  getAmbienteNombre(ambienteId: number): string {
    const ambiente = this.ambientes.find(ambi => ambi.id === ambienteId);
    return ambiente ? ambiente.nombre : 'Desconocido';
  }

  getProyectoNombre(proyectoId: number): string {
    const proyecto = this.proyectos.find(use => use.id === proyectoId);
    return proyecto ? proyecto.nombre : 'Desconocido';
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredUsers = [];
    this.filteredAmbientes = [];
    this.filteredProyectos = [];
    this.filteredProgramas = [];
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

    const selectedambiente = this.ambientes.find(progr => progr.id === this.ficha.ambienteId);
    if (selectedambiente) {
      this.ficha.ambienteNombre = selectedambiente.nombre;
    }

    const selectedproyecto = this.proyectos.find(progr => progr.id === this.ficha.proyectoId);
    if (selectedproyecto) {
      this.ficha.proyectoNombre = selectedproyecto.nombre;
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
    this.filteredAmbientes = [];
    this.filteredProyectos = [];
    this.filteredNumSemanas = [];
    this.filteredProgramas = [];
  }
}