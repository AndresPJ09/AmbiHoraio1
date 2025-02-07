import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-periodo',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './periodo.component.html',
  styleUrl: './periodo.component.scss'
})
export class PeriodoComponent implements OnInit {
  periodos: any[] = [];
  periodo: any = { 
    id: 0, 
    nombre: '',  
    fecha_inicio: new Date().toISOString().slice(0, 10),  
    fecha_fin: new Date().toISOString().slice(0, 10),  
    ano: '', 
    state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['nombre', 'fecha_inicio', 'fecha_fin', 'ano', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.periodos);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/Periodo';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getPeriodos();
    this.setAnoFromFechaInicio();
  }

  onFechaInicioChange(): void {
    const year = new Date(this.periodo.fecha_inicio).getFullYear();
    this.periodo.ano = year.toString();
  }

  // Método que ejecuta al iniciar para poner el año basado en la fecha de inicio
  setAnoFromFechaInicio(): void {
    const year = new Date(this.periodo.fecha_inicio).getFullYear();
    this.periodo.ano = year.toString();
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


  getPeriodos(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (periodos) => {
        this.periodos = periodos.map(periodo => ({
          ...periodo,
          fecha_inicio: new Date(periodo.fecha_inicio).toISOString().slice(0, 10),
          fecha_fin: new Date(periodo.fecha_fin).toISOString().slice(0, 10)
        }));
        this.dataSource.data = this.periodos;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
          this.dataSource.paginator = this.paginator;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching periodos:', error);
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

    if (this.periodo.id === 0) {
      this.http.post(this.apiUrl, this.periodo).subscribe(() => {
        this.getPeriodos();
        this.closeModal();
        Swal.fire('Éxito', 'Periodo creado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al crear el periodo:', error);
        Swal.fire('No se pudo crear el periodo.', error.error.message, 'error');
      });
    } else {
      this.http.put(this.apiUrl, this.periodo).subscribe(() => {
        this.getPeriodos();
        this.closeModal();
        Swal.fire('Éxito', 'periodo actualizado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al actualizar el periodo:', error);
        Swal.fire('No se pudo actualizar el periodo.', error.error.message, 'error');
      });
    }
  }

  editPeriodos(periodo: any): void {
    this.periodo = { ...periodo,
      fecha_inicio: new Date(periodo.fecha_inicio).toISOString().slice(0, 10),
      fecha_fin: new Date(periodo.fecha_fin).toISOString().slice(0, 10)
     };
    this.openModal();
    this.isEditing = true;
  }

  deletePeriodos(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminarlo',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(
          () => {
            this.periodos = this.periodos.filter(periodo => periodo.id !== id);
            Swal.fire('¡Eliminado!', 'El periodo ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error eliminando periodo:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el periodo.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.periodo = { id: 0, nombre: '',  fecha_inicio: new Date().toISOString().slice(0, 10),  fecha_fin: new Date().toISOString().slice(0, 10),  ano: '', state: true };
  }
}
