import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nivel',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './nivel.component.html',
  styleUrl: './nivel.component.scss'
})
export class NivelComponent implements OnInit {
  niveles: any[] = [];
  nivel: any = { id: 0, codigo: '', nombre: '', duracion: '', state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Nivel';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.getNiveles();

  }

  getNiveles(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (niveles) => {
        this.niveles = niveles.map(nivel => ({ ...nivel }));
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching niveles:', error);
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
    if (this.nivel.codigo.trim() === '' || this.nivel.nombre.trim() === '') {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    if (this.nivel.id === 0) {
      this.http.post(this.apiUrl, this.nivel).subscribe(() => {
        this.getNiveles();
        this.closeModal();
        Swal.fire('Éxito', 'Nivel creado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al crear el nivel:', error);
        Swal.fire('Error', 'No se pudo crear el nivel.', 'error');
      });
    } else {
      this.http.put(this.apiUrl, this.nivel).subscribe(() => {
        this.getNiveles();
        this.closeModal();
        Swal.fire('Éxito', 'nivel actualizado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al actualizar el nivel:', error);
        Swal.fire('Error', 'No se pudo actualizar el nivel.', 'error');
      });
    }
  }

  editNiveles(nivel: any): void {
    this.nivel = { ...nivel };
    this.openModal();
    this.isEditing = true;
  }

  deleteNiveles(id: number): void {
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
            this.niveles = this.niveles.filter(nivel => nivel.id !== id);
            Swal.fire('¡Eliminado!', 'El nivel ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error eliminando nivel:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el nivel.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.nivel = { id: 0, codigo: '', nombre: '', duracion: '', state: true };
  }
}

