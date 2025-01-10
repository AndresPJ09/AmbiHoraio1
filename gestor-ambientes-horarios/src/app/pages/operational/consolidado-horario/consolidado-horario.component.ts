import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consolidado-horario',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './consolidado-horario.component.html',
  styleUrl: './consolidado-horario.component.scss'
})
export class ConsolidadoHorarioComponent implements OnInit {
  consoHorarios: any[] = [];
  users: any[] = [];
  programas: any[] = [];
  niveles: any[] = [];
  fichas: any[] = [];
  horarios: any[] = [];
  competencias: any[] = [];
  consolidadoHorario: any = { id: 0, GestorId: 0, observaciones: '', state: true };
  isModalOpen = false;
  filteredUsers: any[] = [];
  filteredPrograma: any[] = [];
  filteredNivel: any[] = [];
  filteredFicha: any[] = [];
  filteredHorario: any[] = [];
  filteredCompetencia: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/ConsolidadoHorario';
  private userUrl = 'http://localhost:5062/api/User';
  private programaUrl = 'http://localhost:5062/api/Pragrama';
  private nivelUrl = 'http://localhost:5062/api/Nivel';
  private fichaUrl = 'http://localhost:5062/api/Ficha';
  private horarioUrl = 'http://localhost:5062/api/Horario';
  private competenciaUrl = 'http://localhost:5062/api/Competencia';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getConsoHorarios();
    this.getUsers();
  }

  getConsoHorarios(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (consoHorarios) => {
        this.consoHorarios = consoHorarios;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al encontrar registros:', error);
      }
    );
  }

  getUsers(): void {
    this.http.get<any[]>(this.userUrl).subscribe(
      (users) => {
        this.users = users;
        this.filteredUsers = users;
        console.log(this.users);
      },
      (error) => {
        console.error('Error al encontrar registros:', error);
      }
    );
  }

    openModal(): void {
      this.isModalOpen = true;
    }
  
    closeModal(): void {
      this.isModalOpen = false;
      this.isEditing = false;
      this.filteredUsers = [];
      this.filteredPrograma = [];
      this.filteredNivel = [];
      this.filteredFicha = [];
      this.filteredHorario = [];
      this.filteredCompetencia = [];
    }
  
    onSubmit(form: NgForm): void {
      if (this.consolidadoHorario.id === 0) {
        this.http.post(this.apiUrl, this.consolidadoHorario).subscribe(() => {
          this.getConsoHorarios();
          this.closeModal();
          Swal.fire('Éxito', 'Consolidado de horario creada exitosamente.', 'success');
        },
          (error) => {
            console.error('Error al actualizar consolidado de horario:', error);
            Swal.fire('Error', error.message, 'error');
          });
      } else {
        this.http.put(this.apiUrl, this.consolidadoHorario).subscribe(() => {
          this.getConsoHorarios();
          this.closeModal();
          Swal.fire('Éxito', 'Consolidado de horario actualizada exitosamente.', 'success');
        },
          (error) => {
            console.error('Error al actualizar consolidado de horario:', error);
            Swal.fire('Error', error.message, 'error');
          });
      }
    }
  
    editConsoHorario(consolidadoHorario: any): void {
      this.consolidadoHorario = {...consolidadoHorario };
      this.isEditing = true;
      this.openModal();
    }
  
    deleteConsoHorario(id: number): void {
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
            this.getConsoHorarios();
            Swal.fire(
              '¡Eliminado!',
              'La vista ha sido eliminada.',
              'success'
            );
          });
        }
      });
    }
  

}
