import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

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
    NgbTypeaheadModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
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
    fecha_hora_ingreso: new Date().toISOString().slice(0, 16),
    fecha_hora_egreso:  new Date().toISOString().slice(0, 16),
    horas: '',
    validacion: '',
    observaciones: '',
    state: true
  };
  isModalOpen = false;
  filteredUsers: any[] = [];
  filteredInstructores: any[] = [];
  filteredFichas: any[] = [];
  filteredAmbientes: any[] = [];
  filteredPeriodos: any[] = [];
  isDropdownOpen = false;
  isEditing = false;
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['nombres', 'apellidos', 'foto', 'identificacion', 'vinculo', 'especialidad', 'correo', 'fecha_inicio', 'hora_ingreso', 'hora_egreso', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.instructores);
  loggedInUser!: any; // Usuario autenticado

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

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
    this.getInstructores();
    
  }

  formatearFechaHora(fechaHora: string): string {
    const fecha = new Date(fechaHora);
  
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.error('Fecha inválida:', fechaHora);
      return ''; // Retornar una cadena vacía si la fecha no es válida
    }
  
    // Formatear la fecha en el formato YYYY-MM-DD
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
  
    // Formatear la hora en formato HH:mm AM/PM
    let horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12; // La hora 0 se convierte en 12 AM
  
    return `${año}-${mes}-${dia} - ${horas}:${minutos} ${ampm}`;
  }

  getHorarios(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (horarios) => {
        this.horarios = horarios.map(horario => ({
          ...horario,
         fecha_hora_ingreso: this.formatearFechaHora(horario.fecha_hora_ingreso),
        fecha_hora_egreso: this.formatearFechaHora(horario.fecha_hora_egreso)
        }));
               console.log("gggfg",this.horarios)
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

  searchusers(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(term)
      );
    }
  }

  onuserSelect(event: any): void {
    const selecteduser = this.users.find(user =>
      user.username === event.option.value
    );
    if (selecteduser) {
      this.horario.userId = selecteduser.id;
      this.horario.userName = selecteduser.username;
      this.filteredUsers = [];
    }
  }

  getInstructores(): void {
    this.http.get<any[]>(this.instructoresUrl).subscribe(
      (instructores) => {
        this.instructores = instructores;
        this.filteredInstructores = instructores;
        console.log("instructore", this.instructores)
      },
      (error) => {
        console.error('Error fetching instructores:', error);
      }
    );
  }

  searchinstructores(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredInstructores = this.instructores;
    } else {
      this.filteredInstructores = this.instructores.filter(instructor =>
        instructor.nombres.toLowerCase().includes(term)||  
        instructor.apellidos.toLowerCase().includes(term)
      );
    }
  }

  oninstructorSelect(event: any): void {
    const selectedinstructor = this.instructores.find(instructor =>
      instructor.nombres === event.option.value
    );
    if (selectedinstructor) {
      this.horario.instructorId = selectedinstructor.id;
      this.horario.instructorName  = `${selectedinstructor.nombres} ${selectedinstructor.apellidos}`;
      this.filteredInstructores = [];
    }
  }

  getAmbientes(): void {
    this.http.get<any[]>(this.ambientesUrl).subscribe(
      (ambientes) => {
        this.ambientes = ambientes;
        this.filteredAmbientes = ambientes;
        console.log("ambiente", this.ambientes)
      },
      (error) => {
        console.error('Error fetching ambientes:', error);
      }
    );
  }

  searchambientes(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredAmbientes = this.ambientes;
    } else {
      this.filteredAmbientes = this.ambientes.filter(ambiente =>
        ambiente.codigo.toLowerCase().includes(term) ||  
        ambiente.nombre.toLowerCase().includes(term)
      );
    }
  }

  onambienteSelect(event: any): void {
    const selectedambiente = this.ambientes.find(ambiente =>
      ambiente.codigo === event.option.value
    );
    if (selectedambiente) {
      this.horario.ambienteId = selectedambiente.id;
      this.horario.ambienteName = `${selectedambiente.codigo} - ${selectedambiente.nombre}`;
      this.filteredAmbientes = [];
    }
  }

  getPeriodos(): void {
    this.http.get<any[]>(this.periodosUrl).subscribe(
      (periodos) => {
        this.periodos = periodos;
        this.filteredPeriodos = periodos;
      },
      (error) => {
        console.error('Error fetching periodos:', error);
      }
    );
  }

  searchperiodos(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredPeriodos = this.periodos;
    } else {
      this.filteredPeriodos = this.periodos.filter(periodo =>
        periodo.nombre.toLowerCase().includes(term) 
      );
    }
  }

  onperiodoSelect(event: any): void {
    const selectedperiodo = this.periodos.find(periodo =>
      periodo.nombre === event.option.value
    );
    if (selectedperiodo) {
      this.horario.periodoId = selectedperiodo.id;
      this.horario.periodoName = selectedperiodo.nombre;
      this.filteredPeriodos = [];
    }
  }

  getFichas(): void {
    this.http.get<any[]>(this.fichasUrl).subscribe(
      (fichas) => {
        this.fichas = fichas;
        this.filteredFichas = fichas;
      },
      (error) => {
        console.error('Error fetching fichas:', error);
      }
    );
  }

  searchfichas(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredFichas = this.fichas;
    } else {
      this.filteredFichas = this.fichas.filter(ficha =>
        ficha.codigo.toLowerCase().includes(term)
      );
    }
  }

  onfichaSelect(event: any): void {
    const selectedficha = this.fichas.find(ficha =>
      ficha.codigo === event.option.value
    );
    if (selectedficha) {
      this.horario.fichaId = selectedficha.id;
      this.horario.fichaName = selectedficha.codigo;
      this.filteredFichas = [];
    }
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
    const ambiente = this.ambientes.find(ambi => ambi.id === ambienteId);
    return ambiente ? `${ambiente.codigo} - ${ambiente.nombre}` : 'Desconocido';
  }

  getPeriodoName(periodoId: number): string {
    const periodo = this.periodos.find(perio => perio.id === periodoId);
    return periodo ? periodo.nombre : 'Desconocido';
  }

  getInstructorName(periodoId: number): string {
    const instructor = this.instructores.find(instru => instru.id === periodoId);
    return instructor ? `${instructor.nombres} ${instructor.apellidos}` : 'Desconocido';
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
    const fecha = this.horario.fecha_inicio;
    this.horario.hora_ingreso = `${fecha}T${this.horario.hora_ingreso}:00`;
    this.horario.hora_egreso = `${fecha}T${this.horario.hora_egreso}:00`;
    if (this.horario.id === 0) {
      this.http.post(this.apiUrl, this.horario).subscribe(() => {
        this.getHorarios();
        this.closeModal();
        Swal.fire('Éxito', 'Horario creada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar horario:', error);
          Swal.fire('Error', error.error.message, 'error');
        });
    } else {
      this.http.put(this.apiUrl, this.horario).subscribe(() => {
        this.getHorarios();
        this.closeModal();
        Swal.fire('Éxito', 'Horario actualizada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar horario:', error);
          Swal.fire('Error', error.error.message, 'error');
        });
    }
  }

  editHorario(horario: any): void {
    this.horario = {
      ...horario,
      fecha_hora_ingreso: this.formatearFechaHora(horario.fecha_hora_ingreso),
      fecha_hora_egreso: this.formatearFechaHora(horario.fecha_hora_egreso)
    };
    const selecteduser = this.users.find(use => use.id === this.horario.userId);
    if (selecteduser) {
      this.horario.userName = selecteduser.username;
    }
    const selectedambiente = this.ambientes.find(ambi => ambi.id === this.horario.ambienteId);
    if (selectedambiente) {
      this.horario.ambienteName = `${selectedambiente.codigo} - ${selectedambiente.nombre}`;
    }
    
    const selectedperiodo = this.periodos.find(peri => peri.id === this.horario.periodoId);
    if (selectedperiodo) {
      this.horario.periodoName = selectedperiodo.nombre;
    }

    const selectedficha = this.fichas.find(fic => fic.id === this.horario.fichaId);
    if (selectedficha) {
      this.horario.fichaName = selectedficha.codigo;
    }

    const selectedinstructor = this.instructores.find(instru => instru.id === this.horario.instructorId);
    if (selectedinstructor) {
      this.horario.instructorName =  `${selectedinstructor.nombres} - ${selectedinstructor.apellidos}`;
    }
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
      fecha_hora_ingreso: new Date().toISOString().slice(0, 16),
      fecha_hora_egreso:  new Date().toISOString().slice(0, 16),
      horas: '',
      observaciones: '',
      validacion: '',
      state: true
    };
    this.filteredUsers = [];
    this.filteredInstructores = [];
    this.filteredFichas = [];
    this.filteredAmbientes = [];
    this.filteredPeriodos = [];
  }
}
