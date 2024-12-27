import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-competencia',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './competencia.component.html',
  styleUrl: './competencia.component.scss'
})
export class CompetenciaComponent implements OnInit {
  competencias: any[] = [];
  competencia: any = { id: 0, codigo: '', nombre: '', state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Competencia';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.getCompetencias();

  }

  getCompetencias(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (competencias) => {
        this.competencias = competencias.map(nivel => ({ ...nivel }));
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching competencias:', error);
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
    if (this.competencia.codigo.trim() === '' || this.competencia.nombre.trim() === '') {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    if (this.competencia.id === 0) {
      this.http.post(this.apiUrl, this.competencia).subscribe(() => {
        this.getCompetencias();
        this.closeModal();
        Swal.fire('Éxito', 'Competencia creado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al crear el competencia:', error);
        Swal.fire('Error', 'No se pudo crear el competencia.', 'error');
      });
    } else {
      this.http.put(this.apiUrl, this.competencia).subscribe(() => {
        this.getCompetencias();
        this.closeModal();
        Swal.fire('Éxito', 'competencia actualizado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al actualizar el competencia:', error);
        Swal.fire('Error', 'No se pudo actualizar el competencia.', 'error');
      });
    }
  }

  editCompetencias(competencia: any): void {
    this.competencia = { ...competencia };
    this.openModal();
    this.isEditing = true;
  }

  deleteCompetencias(id: number): void {
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
            this.competencias = this.competencias.filter(competencia => competencia.id !== id);
            Swal.fire('¡Eliminado!', 'El competencia ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error eliminando competencia:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el competencia.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.competencia = { id: 0, codigo: '', nombre: '', state: true };
  }
}


