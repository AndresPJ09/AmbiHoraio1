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
  selector: 'app-consolidado-ambiente',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgSelectModule, MatInputModule, MatAutocompleteModule, NgbTypeaheadModule],
  templateUrl: './consolidado-ambiente.component.html',
  styleUrl: './consolidado-ambiente.component.scss'
})
export class ConsolidadoAmbienteComponent implements OnInit {
  consoAmbiente: any[] = [];
  users: any[] = [];
  programas: any[] = [];
  niveles: any[] = [];
  fichas: any[] = [];
  horario: any[] = [];
  competencias: any[] = [];
  consolidadoAmbiente: any = { id: 0, GestorId: 0, observaciones: '', state: true };
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
    this.getConsoAmbientes();
    this.getUsers();
  }

  getConsoAmbientes(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (consoAmbiente) => {
        this.consoAmbiente = consoAmbiente;
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
      if (this.consolidadoAmbiente.id === 0) {
        this.http.post(this.apiUrl, this.consolidadoAmbiente).subscribe(() => {
          this.getConsoAmbientes();
          this.closeModal();
          Swal.fire('Éxito', 'Consolidado de horario creada exitosamente.', 'success');
        },
          (error) => {
            console.error('Error al actualizar consolidado de horario:', error);
            Swal.fire('Error', error.message, 'error');
          });
      } else {
        this.http.put(this.apiUrl, this.consolidadoAmbiente).subscribe(() => {
          this.getConsoAmbientes();
          this.closeModal();
          Swal.fire('Éxito', 'Consolidado de horario actualizada exitosamente.', 'success');
        },
          (error) => {
            console.error('Error al actualizar consolidado de horario:', error);
            Swal.fire('Error', error.message, 'error');
          });
      }
    }
  
    editConsoAmbiente(consolidadoAmbiente: any): void {
      this.consolidadoAmbiente = {...consolidadoAmbiente };
      this.isEditing = true;
      this.openModal();
    }
  
    deleteConsoAmbiente(id: number): void {
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
            this.getConsoAmbientes();
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

