import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    NgSelectModule,
    MultiSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss'
})
export class RoleComponent implements OnInit {
  roles: any[] = [];
  role: any = { id: 0, name: '', description: '', views: [], selected: false, state: true };
  views: any[] = [];
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  searchTerm: string = '';
  displayedColumns: string[] = ['name', 'description', 'viewString', 'state', 'actions'];
  dataSource = new MatTableDataSource<any>(this.roles);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private apiUrl = 'http://localhost:5062/api/Role';
  private apiUrlViews = 'http://localhost:5062/api/View';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {
    this.getRoles();
    this.getViews();
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

  getRoles(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (roles) => {
        this.roles = roles.map(role => ({ ...role, selected: false,   views: role.views || [] }));
        this.dataSource.data = this.roles;  
        if (this.paginator) {
          this.paginator.pageIndex = 0; 
          this.dataSource.paginator = this.paginator;
        }
        this.processRoles();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener roles:', error);
      }
    );
  }

  getViews(): void {
    this.http.get<any[]>(this.apiUrlViews).subscribe(
      (views) => {
        this.views = views;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener vistas:', error);
      }
    );
  }

  processRoles(): void {
    this.roles.forEach(role => {
      role.viewString = role.views.map((view: any) => view.textoMostrar).join(', ');
    });
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
    const roleToSave = {
      ...this.role,
      views: this.role.views.map((view: any) => ({
        id: view.id,
        textoMostrar: view.textoMostrar
      }))
    };

    if (this.role.id === 0) {
      this.http.post(this.apiUrl, roleToSave).subscribe(
        (newRole) => {
          this.roles.push({ ...newRole, selected: false });
          this.getRoles();
          this.closeModal();
          Swal.fire('Éxito', '¡Rol creado exitosamente!', 'success');
        },
        (error) => {
          console.error('Error al crear rol:', error);
          Swal.fire('Error', error.error.message || 'Hubo un problema al crear el rol.', 'error');
        }
      );
    } else {
      this.http.put(this.apiUrl, roleToSave).subscribe(() => {
        this.getRoles();
        this.closeModal();
        Swal.fire('Éxito', '¡Rol actualizado correctamente!', 'success');
      },
        (error) => {
          console.error('Error al actualizar rol:', error);
          Swal.fire('Error', error.error.message || 'Hubo un problema al actualizar el rol.', 'error');
        }
      );
    }
  }

  editRoles(role: any): void {
    this.role = { ...role, views: role.views.map((view: any) => ({ id: view.id, textoMostrar: view.textoMostrar })) };
    const selectedViewIds = this.role.views.map((view: any) => view.id);
    this.role.views = this.views.filter((view: any) => selectedViewIds.includes(view.id));
    this.isEditing = true;
    this.openModal();
  }

  deleteRoles(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrá revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Sí, elimínelo!',
      cancelButtonText: '¡No, cancele!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(
          () => {
            this.roles = this.roles.filter(role => role.id !== id);
            //this.filterRoles();
            Swal.fire('Eliminado', 'Su rol ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error al eliminar rol:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el rol.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.role = { id: 0, name: '', description: '', views: [], state: true };
  }
}
