import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-nivel',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './nivel.component.html',
  styleUrl: './nivel.component.scss'
})
export class NivelComponent implements OnInit {
  niveles: any[] = [];
  nivel: any = { id: 0, codigo: '', nombre: '', duracion: '', state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['codigo', 'nombre', 'duracion', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.niveles);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/Nivel';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.getNiveles();

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

  getNiveles(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (niveles) => {
        this.niveles = niveles;
        this.dataSource.data = this.niveles;  
        if (this.paginator) {
          this.paginator.pageIndex = 0; 
          this.dataSource.paginator = this.paginator;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching niveles:', error);
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
    if (this.nivel.codigo.trim() === '' || this.nivel.nombre.trim() === '') {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    if (this.nivel.id === 0) {
      this.http.post(this.apiUrl, this.nivel).subscribe(() => {
        this.getNiveles();
        this.closeModal();
        Swal.fire('Éxito', 'Nivel creado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al crear el nivel:', error);
        Swal.fire('Error', 'No se pudo crear el nivel.', 'error');
      });
    } else {
      this.http.put(this.apiUrl, this.nivel).subscribe(() => {
        this.getNiveles();
        this.closeModal();
        Swal.fire('Éxito', 'nivel actualizado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al actualizar el nivel:', error);
        Swal.fire('Error', 'No se pudo actualizar el nivel.', 'error');
      });
    }
  }

  editNiveles(nivel: any): void {
    this.nivel = { ...nivel };
    this.openModal();
    this.isEditing = true;
  }

  deleteNiveles(id: number): void {
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
            this.niveles = this.niveles.filter(nivel => nivel.id !== id);
            Swal.fire('¡Eliminado!', 'El nivel ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error eliminando nivel:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el nivel.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.nivel = { id: 0, codigo: '', nombre: '', duracion: '', state: true };
  }
}

