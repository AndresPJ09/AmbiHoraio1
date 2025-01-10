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
  selector: 'app-proyecto',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgSelectModule, MatInputModule, MatAutocompleteModule, NgbTypeaheadModule],
  templateUrl: './proyecto.component.html',
  styleUrl: './proyecto.component.scss'
})
export class ProyectoComponent implements OnInit {
  proyectos: any[] = [];
  proyecto: any = { id: 0, nombre: '', jornada_tecnica: '', actividadId: 0, fase: '', state: true };
  actividades: any[] = [];
  isModalOpen = false;
  filteredActividades: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Proyecto';
  private actividadesUrl = 'http://localhost:5062/api/Actividad';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getProyectos();
    this.getActividades();
  }

  getProyectos(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (proyectos) => {
        this.proyectos = proyectos;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching proyectos:', error);
      }
    );
  }

  getActividades(): void {
    this.http.get<any[]>(this.actividadesUrl).subscribe(
      (actividades) => {
        this.actividades = actividades;
        this.filteredActividades = actividades;
        console.log(this.actividades);
      },
      (error) => {
        console.error('Error fetching actividades:', error);
      }
    );
  }

  searchactividades(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredActividades = this.actividades;
    } else {
      this.filteredActividades = this.actividades.filter(actividad =>
        actividad.actividad_proyecto.toLowerCase().includes(term)
      );
    }
  }

  onactividadSelect(event: any): void {
    const selectedactividad = this.actividades.find(actividad =>
      actividad.actividad_proyecto === event.option.value
    );
    if (selectedactividad) {
      this.proyecto.actividadId = selectedactividad.id;
      this.proyecto.actividadNombre = selectedactividad.actividad_proyecto;
      this.filteredActividades = [];
    }
  }

  getActividadNombre(actividadId: number): string {
    const actividad = this.actividades.find(acti => acti.id === actividadId);
    return actividad ? actividad.actividad_proyecto : 'Desconocido';
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredActividades = [];
  }

  onSubmit(form: NgForm): void {
    if (this.proyecto.id === 0) {
      this.http.post(this.apiUrl, this.proyecto).subscribe(() => {
        this.getProyectos();
        this.closeModal();
        Swal.fire('Éxito', 'Proyecto creada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar proyecto:', error);
          Swal.fire('Error', error.message, 'error');
        });
    } else {
      this.http.put(this.apiUrl, this.proyecto).subscribe(() => {
        this.getProyectos();
        this.closeModal();
        Swal.fire('Éxito', 'Proyecto actualizada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar proyecto:', error);
          Swal.fire('Error', error.message, 'error');
        });
    }
  }

  editProyecto(proyecto: any): void {
    this.proyecto = {...proyecto };
    const selectedactividad = this.actividades.find(acti => acti.id === this.proyecto.actividadId);
    if (selectedactividad) {
      this.proyecto.actividadNombre = selectedactividad.nombre;
    }
    this.isEditing = true;
    this.openModal();
  }

  deleteProyecto(id: number): void {
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
          this.getProyectos();
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
    this.proyecto = { id: 0, nombre: '', jornada_tecnica: '', actividadId: 0, fase: '', state: true };
    this.filteredActividades = [];
  }
}