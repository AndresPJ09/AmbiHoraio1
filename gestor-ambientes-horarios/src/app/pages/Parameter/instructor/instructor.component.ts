import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './instructor.component.html',
  styleUrl: './instructor.component.scss'
})
export class InstructorComponent implements OnInit {
  instructores: any[] = [];
  instructor: any = { id: 0, nombres: '', apellidos: '', foto: '', identificacion: '', vinculo: '', especialidad: '', correo: '', fecha_inicio: new Date().toISOString().slice(0, 10), periodo: '', hora_ingreso: '', hora_egreso: '', state: true };
  isModalOpen = false;
  filteredInstructores: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/Instructor';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getInstructores();
  }

  formatTime(date: string): string {
    const time = new Date(date);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }  

  getInstructores(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (instructores) => {
        this.instructores = instructores.map(instructor => ({
          ...instructor,
          fecha_inicio: new Date(instructor.fecha_inicio).toISOString().slice(0, 10),
          selected: false
        }));
      },
      (error) => {
        console.error('Error fetching instructores:', error);
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
    this.filteredInstructores = [];
  }

  onSubmit(form: NgForm): void {
    
    this.instructor.fecha_inicio = new Date(this.instructor.fecha_inicio).toISOString();

    if (this.instructor.id === 0) {
      this.http.post(this.apiUrl, this.instructor).subscribe(() => {
        this.getInstructores();
        this.closeModal();
        Swal.fire('Éxito', 'Instructor creada exitosamente!', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.instructor).subscribe(() => {
        this.getInstructores();
        this.closeModal();
        Swal.fire('Éxito', 'Instructor actualizada exitosamente!', 'success');
      });
    }
  }  

  editInstructores(instructor: any): void {
    this.instructor = { ...instructor, fecha_inicio: new Date(instructor.fecha_inicio).toISOString().slice(0, 10) };
    this.isEditing = true;
    this.openModal();
  }

  deleteInstructores(id: number): void {
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
          this.getInstructores();
          Swal.fire('¡Eliminado!', 'Tu archivo ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.instructor = {  id: 0, nombres: '', apellidos: '', foto: '', identificacion: '', vinculo: '', especialidad: '', correo: '', fecha_inicio: new Date().toISOString().slice(0, 10), periodo: '', hora_ingreso: '', hora_egreso: '', state: true };
    this.filteredInstructores = [];
  }
}
