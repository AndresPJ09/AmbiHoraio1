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
  selector: 'app-horario',
  standalone: true,
  imports: [
    HttpClientModule, 
    FormsModule, 
    CommonModule, 
    NgSelectModule, 
    MatInputModule, 
    MatAutocompleteModule, 
    NgbTypeaheadModule],
  templateUrl: './horario.component.html',
  styleUrl: './horario.component.scss'
})
export class HorarioComponent implements OnInit {
  users: any[] = [];
  instructores: any[] = [];
  fichas: any[] = [];
  ambientes: any[] = [];
  periodos: any[] = [];
  horarios: any[] = [];
  horario: any = { 
    id: 0, 
    codigo: '',
    userId: 0, 
    fichaId: 0, 
    ambienteId: 0, 
    periodoId: 0, 
    jornada_programa: '', 
    fecha_inicio: '', 
    hora_ingreso: new Date().toISOString().slice(0, 10), 
    hora_egreso: new Date().toISOString().slice(0, 10), 
    horas: '', 
    validacion: '',
    observaciones: '', 
    state: true };
  isModalOpen = false;
  filteredUsers: any[] = [];
  filteredInstructores: any[] = [];
  filteredFichas: any[] = [];
  filteredAmbientes: any[] = [];
  filteredPeriodos: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Horario';
  private periodosUrl = 'http://localhost:5062/api/Periodo';
  private ambientesUrl = 'http://localhost:5062/api/Ambiente';
  private instructoresUrl = 'http://localhost:5062/api/Instructor';
  private fichasUrl = 'http://localhost:5062/api/Ficha';
  private usersUrl = 'http://localhost:5062/api/User';


  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getHorarios();
    this.getFichas();
    this.getUsers();
    this.getAmbientes();
    this.getPeriodos();
  }

  getHorarios(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (horarios) => {
        console.log("fgfgfgfgfg", this.horarios)
        this.horarios = horarios.map(horario => ({
          ...horario,
          fecha_inicio: new Date(horario.fecha_inicio).toISOString().slice(0, 10),
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
        console.log("dfgdfghjjj", this.users)
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  getInstructores(): void {
    this.http.get<any[]>(this.instructoresUrl).subscribe(
      (instructores) => {
        this.instructores = instructores;
      },
      (error) => {
        console.error('Error fetching instructores:', error);
      }
    );
  }

  getAmbientes(): void {
    this.http.get<any[]>(this.ambientesUrl).subscribe(
      (ambientes) => {
        this.ambientes = ambientes;
      },
      (error) => {
        console.error('Error fetching ambientes:', error);
      }
    );
  }

  getPeriodos(): void {
    this.http.get<any[]>(this.periodosUrl).subscribe(
      (periodos) => {
        this.periodos = periodos;
      },
      (error) => {
        console.error('Error fetching periodos:', error);
      }
    );
  }

  getFichas(): void {
    this.http.get<any[]>(this.fichasUrl).subscribe(
      (fichas) => {
        this.fichas = fichas;
      },
      (error) => {
        console.error('Error fetching fichas:', error);
      }
    );
  }

  getUserName(userId: number): string {
    const user = this.users.find(use => use.id === userId);
    return user ? user.username : 'Desconocido';
  }

  getFichaName(fichaId: number): string {
    const ficha = this.fichas.find(fic => fic.id === fichaId);
    return ficha ? ficha.codigo : 'Desconocido';
  }

  getAmbienteName(ambienteId: number): string {
    const ambiente = this.ambientes.find(mod => mod.id === ambienteId);
    return ambiente ? ambiente.nombre : 'Desconocido';
  }

  getPeriodoName(periodoId: number): string {
    const periodo = this.periodos.find(mod => mod.id === periodoId);
    return periodo ? periodo.mes : 'Desconocido';
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredFichas = [];
  }

  onSubmit(form: NgForm): void {

    if (this.horario.id === 0) {
      this.http.post(this.apiUrl, this.horario).subscribe(() => {
        this.getHorarios();
        this.closeModal();
        Swal.fire('Éxito', 'Horario creada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar horario:', error);
          Swal.fire('Error', error.message, 'error');
        });
    } else {
      this.http.put(this.apiUrl, this.horario).subscribe(() => {
        this.getHorarios();
        this.closeModal();
        Swal.fire('Éxito', 'Horario actualizada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar horario:', error);
          Swal.fire('Error', error.message, 'error');
        });
    }
  }

  editHorario(horario: any): void {
    this.horario = {...horario};

    this.isEditing = true;
    this.openModal();
  }

  deleteHorario(id: number): void {
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
          this.getHorarios();
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
    this.horario = { 
      id: 0, 
      codigo: '', 
      userId: 0, 
      fichaId: 0, 
      ambienteId: 0, 
      periodoId: 0, 
      jornada_programa: '', 
      fecha_inicio: '', 
      hora_ingreso: new Date().toISOString().slice(0, 10), 
      hora_egreso: new Date().toISOString().slice(0, 10), 
      horas: '', 
      observaciones: '', 
      validacion: '',
      state: true };
    this.filteredFichas = [];
  }
}
