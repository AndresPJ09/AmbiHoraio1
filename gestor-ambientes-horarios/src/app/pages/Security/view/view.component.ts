import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit {
  views: any[] = [];
  view: any = { id: 0, name: '', description: '', route: '', moduleId: 0, state: false };
  modules: any[] = [];  // Lista de módulos
  isModalOpen = false;
  filteredViews: any[] = [];
  filteredModules: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/View';
  private modulesUrl = 'http://localhost:5062/api/Module'; 

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getViews();
    this.getModules();  // Cargar los módulos al iniciar
  }

  getViews(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (views) => {
        this.views = views;
        //this.filterViews();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching views:', error);
      }
    );
  }
  
  getModules(): void {
    this.http.get<any[]>(this.modulesUrl).subscribe(
      (modules) => {
        this.modules = modules;
      },
      (error) => {
        console.error('Error fetching modulos:', error);
      }
    );
  }

  getModuleName(moduleId: number): string {
    const module = this.modules.find(mod => mod.id === moduleId);
    return module ? module.name : 'Desconocido';
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredModules = [];
  }

  onSubmit(form: NgForm): void {
    if (!this.view.moduloId) {
      Swal.fire('Error', 'Debe seleccionar un módulo válido.', 'error');
      return;
    }
  
    if (this.view.id === 0) {
      this.http.post(this.apiUrl, this.view).subscribe(() => {
        this.getViews();
        this.closeModal();
        Swal.fire('Éxito', 'Vista creada exitosamente.', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.view).subscribe(() => {
        this.getViews();
        this.closeModal();
        Swal.fire('Éxito', 'Vista actualizada exitosamente.', 'success');
      });
    }
  }
  
  editViews(view: any): void {
    this.view = { ...view };
    this.isEditing = true;
    this.openModal();
  }

  deleteViews(id: number): void {
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
          this.getViews();
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
    this.view = { id: 0, name: '', description: '', route: '', moduleId: 0, state: false };
    this.filteredModules = [];
  }
  
}
