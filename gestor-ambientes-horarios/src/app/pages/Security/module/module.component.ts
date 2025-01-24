import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-module',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './module.component.html',
  styleUrl: './module.component.scss'
})
export class ModuleComponent implements OnInit {
  modules: any[] = [];
  module: any = { id: 0, name: '', description: '', position: null, state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['name', 'description', 'position', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.modules);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/Module';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getModules();
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

  getModules(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (modules) => {
        this.modules = modules;
        this.dataSource.data = this.modules; 
        if (this.paginator) {
          this.paginator.pageIndex = 0; // Restablece la página
          this.dataSource.paginator = this.paginator;
        }
      },
      (error) => {
        console.error('Error fetching módulos:', error);
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
    if (this.module.id === 0) {
      this.http.post<any>(this.apiUrl, this.module).subscribe(
        (newModule) => {
          this.getModules();
          this.closeModal();
          Swal.fire('Éxito', '¡Módulo creado exitosamente!', 'success');
        },
        (error) => {
          console.error('Error creando módulo:', error);
          Swal.fire('Error', error.error.message, 'error');
        }
      );
    } else {
      this.http.put(this.apiUrl, this.module).subscribe(
        () => {
          this.getModules();
          this.closeModal();
          Swal.fire('Éxito', '¡Módulo actualizado exitosamente!', 'success');
        },
        (error) => {
          console.error('Error actualizando módulo:', error);
          Swal.fire('Error', error.error.message, 'error');
        }
      );
    }
  }

  editModules(module: any): void {
    this.module = { ...module };
    this.openModal();
    this.isEditing = true;
  }

  deleteModules(id: number): void {
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
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
            this.getModules();
            Swal.fire('¡Eliminado!', 'El módulo ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error eliminando módulo:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el módulo.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.module = { id: 0, name: '', description: '', position: null, state: true };
  }
}
