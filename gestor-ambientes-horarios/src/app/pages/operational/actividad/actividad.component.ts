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
  selector: 'app-actividad',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgSelectModule, MatInputModule, MatAutocompleteModule, NgbTypeaheadModule],
  templateUrl: './actividad.component.html',
  styleUrl: './actividad.component.scss'
})
export class ActividadComponent implements OnInit {
  actividades: any[] = [];
  actividad: any = { id: 0, actividad_proyecto: '', result_aprendizaje: '', fecha_inicio_Ac: new Date().toISOString().slice(0, 10), fecha_fin_Ac: new Date().toISOString().slice(0, 10), estado_RAP: '', num_semanas: '', competenciaId: 0, state: true };
  competencias: any[] = [];
  isModalOpen = false;
  filteredCompetencias: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Actividad';
  private competenciasUrl = 'http://localhost:5062/api/Competencia';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getActividades();
    this.getCompetencias();
  }

  getActividades(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (actividades) => {
        this.actividades = actividades.map(actividad => ({
          ...actividad,
          fecha_inicio_Ac: new Date(actividad.fecha_inicio_Ac).toISOString().slice(0, 10),
          fecha_fin_Ac: new Date(actividad.fecha_fin_Ac).toISOString().slice(0, 10)
        }));
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching actividades:', error);
      }
    );
  }

  getCompetencias(): void {
    this.http.get<any[]>(this.competenciasUrl).subscribe(
      (competencias) => {
        this.competencias = competencias;
        this.filteredCompetencias = competencias;
        console.log(this.competencias);
      },
      (error) => {
        console.error('Error fetching competencias:', error);
      }
    );
  }

  searchcompetencias(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredCompetencias = this.competencias;
    } else {
      this.filteredCompetencias = this.competencias.filter(competencia =>
        competencia.nombre.toLowerCase().includes(term)
      );
    }
  }

  oncompetenciaSelect(event: any): void {
    const selectedcompetencia = this.competencias.find(competencia =>
      competencia.nombre === event.option.value
    );
    if (selectedcompetencia) {
      this.actividad.competenciaId = selectedcompetencia.id;
      this.actividad.competenciaNombre = selectedcompetencia.nombre;
      this.filteredCompetencias = [];
    }
  }

  getCompetenciaNombre(competenciaId: number): string {
    const competencia = this.competencias.find(comp => comp.id === competenciaId);
    return competencia ? competencia.nombre : 'Desconocido';
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredCompetencias = [];
  }

  onSubmit(form: NgForm): void {
    this.actividad.fecha_inicio_Ac = new Date(this.actividad.fecha_inicio_Ac).toISOString();
    this.actividad.fecha_fin_Ac = new Date(this.actividad.fecha_fin_Ac).toISOString();
    if (this.actividad.id === 0) {
      this.http.post(this.apiUrl, this.actividad).subscribe(() => {
        this.getActividades();
        this.closeModal();
        Swal.fire('Éxito', 'Actividad creada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar vista:', error);
          Swal.fire('Error', error.message, 'error');
        });
    } else {
      this.http.put(this.apiUrl, this.actividad).subscribe(() => {
        this.getActividades();
        this.closeModal();
        Swal.fire('Éxito', 'Actividad actualizada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar Actividad:', error);
          Swal.fire('Error', error.message, 'error');
        });
    }
  }

  editActividades(actividad: any): void {
    this.actividad = {
      ...actividad, fecha_inicio_Ac: new Date(actividad.fecha_inicio_Ac).toISOString().slice(0, 10),
      fecha_fin_Ac: new Date(actividad.fecha_fin_Ac).toISOString().slice(0, 10)
    };
    const selectedcompetencia = this.competencias.find(comp => comp.id === this.actividad.competenciaId);
    if (selectedcompetencia) {
      this.actividad.competenciaNombre = selectedcompetencia.nombre;
    }
    this.isEditing = true;
    this.openModal();
  }

  deleteActividades(id: number): void {
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
          this.getActividades();
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
    this.actividad = { id: 0, actividad_proyecto: '', result_aprendizaje: '', fecha_inicio_Ac: new Date().toISOString().slice(0, 10), fecha_fin_Ac: new Date().toISOString().slice(0, 10), estado_RAP: '', num_semanas: '', competenciaId: 0, state: true };
    this.filteredCompetencias = [];
  }

}
