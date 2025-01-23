import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-periodo',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './periodo.component.html',
  styleUrl: './periodo.component.scss'
})
export class PeriodoComponent implements OnInit {
  periodos: any[] = [];
  periodo: any = { id: 0, mes: '', state: true };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Periodo';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.getPeriodos();

  }

  getPeriodos(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (periodos) => {
        this.periodos = periodos.map(periodo => ({ ...periodo }));
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching periodos:', error);
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

    if (this.periodo.id === 0) {
      this.http.post(this.apiUrl, this.periodo).subscribe(() => {
        this.getPeriodos();
        this.closeModal();
        Swal.fire('Éxito', 'Periodo creado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al crear el periodo:', error);
        Swal.fire('Error', 'No se pudo crear el periodo.', 'error');
      });
    } else {
      this.http.put(this.apiUrl, this.periodo).subscribe(() => {
        this.getPeriodos();
        this.closeModal();
        Swal.fire('Éxito', 'periodo actualizado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al actualizar el periodo:', error);
        Swal.fire('Error', 'No se pudo actualizar el periodo.', 'error');
      });
    }
  }

  editPeriodos(periodo: any): void {
    this.periodo = { ...periodo };
    this.openModal();
    this.isEditing = true;
  }

  deletePeriodos(id: number): void {
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
            this.periodos = this.periodos.filter(periodo => periodo.id !== id);
            Swal.fire('¡Eliminado!', 'El periodo ha sido eliminado.', 'success');
          },
          (error) => {
            console.error('Error eliminando periodo:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el periodo.', 'error');
          }
        );
      }
    });
  }

  resetForm(): void {
    this.periodo = { id: 0, mes: '', state: true };
  }
}
