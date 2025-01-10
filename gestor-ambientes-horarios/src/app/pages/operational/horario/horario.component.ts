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
  selector: 'app-horario',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgSelectModule, MatInputModule, MatAutocompleteModule, NgbTypeaheadModule],
  templateUrl: './horario.component.html',
  styleUrl: './horario.component.scss'
})
export class HorarioComponent implements OnInit {
  horarios: any[] = [];
  horario: any = { 
    id: 0, 
    codigo: '', 
    fichaId: 0, 
    jornada_programada: '', 
    validacion: '', 
    horas: '', 
    hora_ingreso: new Date().toISOString().slice(0, 10), 
    hora_egreso: new Date().toISOString().slice(0, 10), 
    observaciones: '', state: true };
  users: any[] = [];
  fichas: any[] = [];
  isModalOpen = false;
  filteredFichas: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Horario';
  private fichasUrl = 'http://localhost:5062/api/Ficha';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getHorarios();
    this.getFichas();
  }

  getHorarios(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (fichas) => {
        this.fichas = fichas.map(ficha => ({
          ...ficha,
          fecha_inicio_Ac: new Date(ficha.fecha_inicio).toISOString().slice(0, 10),
          fecha_fin_Ac: new Date(ficha.fecha_fin).toISOString().slice(0, 10),
          fin_lectiva: new Date(ficha.fin_lectiva).toISOString().slice(0, 10)
        }));
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching actividades:', error);
      }
    );
  }

  getFichas(): void {
    this.http.get<any[]>(this.fichasUrl).subscribe(
      (fichas) => {
        this.fichas = fichas;
        this.filteredFichas = fichas;
      },
      (error) => {
        console.error('Error fetching fichas:', error);
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
    this.filteredFichas = [];
  }

  onSubmit(form: NgForm): void {

    if (this.horario.id === 0) {
      this.http.post(this.apiUrl, this.horario).subscribe(() => {
        this.getHorarios();
        this.closeModal();
        Swal.fire('Éxito', 'Horario creada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar horario:', error);
          Swal.fire('Error', error.message, 'error');
        });
    } else {
      this.http.put(this.apiUrl, this.horario).subscribe(() => {
        this.getHorarios();
        this.closeModal();
        Swal.fire('Éxito', 'Horario actualizada exitosamente.', 'success');
      },
        (error) => {
          console.error('Error al actualizar horario:', error);
          Swal.fire('Error', error.message, 'error');
        });
    }
  }

  editHorario(horario: any): void {
    this.horario = {...horario};

    this.isEditing = true;
    this.openModal();
  }

  deleteHorario(id: number): void {
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
          this.getHorarios();
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
    this.horario = { 
      id: 0, 
    codigo: '', 
    fichaId: 0, 
    jornada_programada: '', 
    validacion: '', 
    horas: '', 
    hora_ingreso: new Date().toISOString().slice(0, 10), 
    hora_egreso: new Date().toISOString().slice(0, 10), 
    observaciones: '', state: true };
    this.filteredFichas = [];
  }
}
