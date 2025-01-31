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
  selector: 'app-ficha',
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
  templateUrl: './ficha.component.html',
  styleUrl: './ficha.component.scss'
})
export class FichaComponent implements OnInit {
  fichas: any[] = [];
  ficha: any = {
    id: 0,
    codigo: '',
    programaId: 0,
    proyectoId: 0,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: new Date().toISOString().slice(0, 10),
    fin_lectiva: new Date().toISOString().slice(0, 10),
    num_semanas: '',
    cupo: '',
    state: true
  };
  programas: any[] = [];
  proyectos: any[] = [];
  isModalOpen = false;
  filteredProgramas: any[] = [];
  filteredProyectos: any[] = [];
  filteredNumSemanas: any[] = [];
  isDropdownOpen = false;
  isEditing = false;
  numSemanasPorProyecto: { [proyectoId: number]: string[] } = {};
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['codigo', 'programaId', 'proyectoId', 'fecha_inicio', 'fecha_fin', 'fin_lectiva', 'num_semanas', 'cupo', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.fichas);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/Ficha';
  private usersUrl = 'http://localhost:5062/api/User';
  private programasUrl = 'http://localhost:5062/api/Programa';
  private ambientesUrl = 'http://localhost:5062/api/Ambiente';
  private proyectosUrl = 'http://localhost:5062/api/Proyecto';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getFichas();
    this.getProgramas();
    this.getProyectos();
    this.calculateWeeks();
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

  calculateWeeks(): void {
    const fechaInicio = new Date(this.ficha.fecha_inicio);
    const fechaFin = new Date(this.ficha.fecha_fin);

    // Calcular la diferencia en milisegundos
    const diffInMilliseconds = fechaFin.getTime() - fechaInicio.getTime();
    // Convertir a semanas
    const weeks = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
    // Asignar el número de semanas
    this.ficha.num_semanas = weeks > 0 ? weeks.toString() : '0';
  }

  // Llama esta función cada vez que se actualizan las fechas
  onDateChange(): void {
    this.calculateWeeks();
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
        this.dataSource.data = this.fichas;  
        if (this.paginator) {
          this.paginator.pageIndex = 0; 
          this.dataSource.paginator = this.paginator;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching actividades:', error);
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
    this.ficha = {
      ...ficha,
      fecha_inicio: new Date(ficha.fecha_inicio).toISOString().slice(0, 10),
      fecha_fin: new Date(ficha.fecha_fin).toISOString().slice(0, 10),
      fin_lectiva: new Date(ficha.fin_lectiva).toISOString().slice(0, 10)
    };
    const selectedprograma = this.programas.find(progr => progr.id === this.ficha.programaId);
    if (selectedprograma) {
      this.ficha.programaNombre = selectedprograma.nombre;
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
    this.ficha = {
      id: 0,
      codigo: '',
      programaId: 0,
      proyectoId: 0,
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_fin: new Date().toISOString().slice(0, 10),
      fin_lectiva: new Date().toISOString().slice(0, 10),
      num_semanas: '',
      cupo: '',
      state: true
    };
    this.filteredProyectos = [];
    this.filteredNumSemanas = [];
    this.filteredProgramas = [];
    this.calculateWeeks();
  }
}