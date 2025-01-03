import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-module',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './module.component.html',
  styleUrl: './module.component.scss'
})
export class ModuleComponent implements OnInit {
  modules: any[] = [];
  module: any = { id: 0, name: '', description: '', position: null, state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  errorMessages: any = {};

  private apiUrl = 'http://localhost:5062/api/Module';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.getModules();

  }

  getModules(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (modules) => {
        this.modules = modules.map(module => ({ ...module}));
        this.cdr.detectChanges();
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
          this.modules.push({ ...newModule, selected: false });
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
          const index = this.modules.findIndex(m => m.id === this.module.id);
          if (index !== -1) {
            this.modules[index] = { ...this.module, selected: false };
          }
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
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(
          () => {
            this.modules = this.modules.filter(module => module.id !== id);
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
