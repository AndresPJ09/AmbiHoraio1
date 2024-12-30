import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-programa',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, MatInputModule, MatAutocompleteModule, NgbTypeaheadModule],
  templateUrl: './programa.component.html',
  styleUrl: './programa.component.scss'
})
export class ProgramaComponent implements OnInit {
  programas: any[] = [];
  programa: any = { id: 0, nombre: '', nivelId: 0, state: true };
  niveles: any[] = [];
  roles: any[] = [];
  isModalOpen = false;
  filteredNiveles: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Programa';
  private nivelesUrl = 'http://localhost:5062/api/Nivel';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getProgramas();
    this.getNiveles();
  }

  getProgramas(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (programas) => {
        this.programas = programas;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching programas:', error);
      }
    );
  }

  getNiveles(): void {
    this.http.get<any[]>(this.nivelesUrl).subscribe(
      (niveles) => {
        this.niveles = niveles;
        this.filteredNiveles = niveles; 
      },
      (error) => {
        console.error('Error fetching niveles:', error);
      }
    );
  }

  searchNiveles(event: any): void {
    const term = event.target.value.toLowerCase();
    if (term) {
      this.filteredNiveles = this.niveles.filter(nivel => 
        nivel.nombre.toLowerCase().includes(term)
      );
    } else {
      this.filteredNiveles = this.niveles; // Mostrar todos los resultados si no hay término
    }
  }

  onNivelselect(event: any): void {
    const selectednivel = this.niveles.find(nivel => 
      nivel.nombre === event.option.value
    );
    if (selectednivel) {
        this.programa.nivelId = selectednivel.id;
        this.programa.nivelNombre = selectednivel.nombre;
        this.filteredNiveles = [];
    }
}

  getNivelNombre(nivelId: number): string | undefined {
    const nivel = this.niveles.find(nive => nive.id === nivelId);
    return nivel ? nivel.nombre : 'Desconocido';
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.isEditing = false;
    this.filteredNiveles = [];
  }

  onSubmit(form: NgForm): void {
    if (!this.programa.nivelId) {
      Swal.fire('Error', 'Debe seleccionar él nivel válida.', 'error');
      return;
    }
    

    if (this.programa.id === 0) {
      this.http.post(this.apiUrl, this.programa).subscribe(() => {
        this.getProgramas();
        this.closeModal();
        Swal.fire('Éxito', 'Programa creado exitosamente!', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.programa).subscribe(() => {
        this.getProgramas();
        this.closeModal();
        Swal.fire('Éxito', 'Programa actualizado exitosamente!', 'success');
      });
    }
  }

  editProgramas(programa: any): void {
    this.programa = { ...programa,};
    const selectednivel = this.niveles.find(per => per.id === this.programa.nivelId);
    if (selectednivel) {
        this.programa.nivelNombre = selectednivel.nombre; 
    }
    this.isEditing = true;
    this.openModal();
  }

  deleteProgramas(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, elimínalo!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getNiveles();
          Swal.fire('¡Eliminado!', 'Tu archivo ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.programa = { id: 0, nombre: '', nivelId: 0, state: true };
    this.filteredNiveles = [];
  }
}
