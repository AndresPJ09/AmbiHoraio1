import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-ambiente',
  standalone: true,
  imports: [
    HttpClientModule, 
    FormsModule, 
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './ambiente.component.html',
  styleUrl: './ambiente.component.scss'
})
export class AmbienteComponent implements OnInit {
  ambientes: any[] = [];
  ambiente: any = { id: 0, codigo: '', nombre: '', capacidad: '', state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  isLoading: boolean = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['codigo', 'nombre', 'capacidad', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.ambientes);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/Ambiente';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.getAmbiente();
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

  getAmbiente(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (ambientes) => {
        this.ambientes = ambientes;
        this.dataSource.data = this.ambientes;  
        if (this.paginator) {
          this.paginator.pageIndex = 0; 
          this.dataSource.paginator = this.paginator;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching ambiente:', error);
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
    if (this.ambiente.id === 0) {
      this.http.post(this.apiUrl, this.ambiente).subscribe(() => {
        this.getAmbiente();
        this.closeModal();
        Swal.fire('Éxito', 'Ambiente creado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al crear el ambiente:', error);
        Swal.fire('Error', 'No se pudo crear el ambiente.', 'error');
      });
    } else {
      this.http.put(this.apiUrl, this.ambiente).subscribe(() => {
        this.getAmbiente();
        this.closeModal();
        Swal.fire('Éxito', 'ambiente actualizado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al actualizar el ambiente:', error);
        Swal.fire('Error', 'No se pudo actualizar el ambiente.', 'error');
      });
    }
  }

  editAmbientes(ambiente: any): void {
    this.ambiente = { ...ambiente };
    this.openModal();
    this.isEditing = true;
  }

  deleteAmbientes(id: number): void {
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
            this.ambiente = this.ambientes.filter(ambiente => ambiente.id !== id);
            Swal.fire('¡Eliminado!', 'El ambiente ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error eliminando ambiente:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el ambiente.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.ambiente = { id: 0, codigo: '', nombre: '', capacidad: '', state: true };
  }
}

