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
  selector: 'app-view',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgSelectModule, MatInputModule, MatAutocompleteModule, NgbTypeaheadModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit {
  views: any[] = [];
  view: any = { id: 0, name: '', description: '', route: '', moduleId: 0, state: false };
  modules: any[] = []; 
  isModalOpen = false;
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
        this.filteredModules = modules; 
      },
      (error) => {
        console.error('Error fetching modules:', error);
      }
    );
  }

  searchmodules(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredModules = this.modules;
    } else {
      this.filteredModules = this.modules.filter(module => 
        module.name.toLowerCase().includes(term)
      );
    }
  }

  onmoduleSelect(event: any): void {
    const selectedmodule = this.modules.find(module => 
      module.name === event.option.value
    );
    if (selectedmodule) {
        this.view.moduleId = selectedmodule.id;
        this.view.moduleName = selectedmodule.name;
        this.filteredModules = [];
    }
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
    if (!this.view.moduleId) {
      Swal.fire('Error', 'Debe seleccionar un módulo válido.', 'error');
      return;
    }
  
    if (this.view.id === 0) {
      this.http.post(this.apiUrl, this.view).subscribe(() => {
        this.getViews();
        this.closeModal();
        Swal.fire('Éxito', 'Vista creada exitosamente.', 'success');
      },
      (error) => {
        console.error('Error al actualizar vista:', error);
        Swal.fire('Error', error.message, 'error');  
      });
    } else {
      this.http.put(this.apiUrl, this.view).subscribe(() => {
        this.getViews();  
        this.closeModal(); 
        Swal.fire('Éxito', 'Vista actualizada exitosamente.', 'success');
      },
      (error) => {
        console.error('Error al actualizar vista:', error);
        Swal.fire('Error', error.message, 'error');  
      });
    }
  }
  
  editViews(view: any): void {
    this.view = { ...view,};
    const selectedmodule = this.modules.find(mod => mod.id === this.view.moduleId);
     if (selectedmodule) {
        this.view.moduleName = selectedmodule.name; 
    }
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
