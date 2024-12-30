import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  instructor: any = {
    id: 0,
    nombres: '',
    apellidos: '',
    foto: null,
    identificacion: '',
    vinculo: '',
    especialidad: '',
    correo: '',
    fecha_inicio: new Date().toISOString().slice(0, 10),
    periodo: '',
    hora_ingreso: '',
    hora_egreso: '',
    state: true
  };
  isModalOpen = false;
  isDropdownOpen = false;
  isEditing = false;
  selectedImage: string | null = null;
  isImageModalOpen: boolean = false;
  file: string | null = null;

  private apiUrl = 'http://localhost:5062/api/Instructor';
  @ViewChild('foto') fileInput!: ElementRef;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getInstructores();
  }


  formatTime(date: string): string {
    const time = new Date(date);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.selectedImage = base64String;
        // Enviar base64 como parte del objeto instructor
        this.instructor.foto = base64String.split(',')[1]; // Obtener solo la parte después de "data:image/jpeg;base64,"
      };
      reader.readAsDataURL(file);
    }
  }

  getInstructores(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (instructores) => {
        this.instructores = instructores.map(instructor => ({
          ...instructor,
          fecha_inicio: new Date(instructor.fecha_inicio).toISOString().slice(0, 10)
        }));
        this.cdr.detectChanges();
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
  }

  // Remove the selected image
  removeImage(): void {
    this.selectedImage = null;
    this.instructor.foto = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = ''; // Limpiar el input de archivo
    }
  }

  // Función para abrir el modal con la imagen seleccionada
  openImageModal(image: string): void {
    this.selectedImage = 'data:image/jpeg;base64,' + image;
    this.isImageModalOpen = true;
  }

  // Función para cerrar el modal
  closeImageModal(): void {
    this.isImageModalOpen = false;
    this.selectedImage = null;
  }

  onSubmit(form: NgForm): void {
    const fecha = this.instructor.fecha_inicio; // Fecha en formato 'yyyy-MM-dd'
    this.instructor.hora_ingreso = `${fecha}T${this.instructor.hora_ingreso}:00`;
    this.instructor.hora_egreso = `${fecha}T${this.instructor.hora_egreso}:00`;

    if (this.instructor.id === 0) {
      this.http.post(this.apiUrl, this.instructor).subscribe(() => {
        this.getInstructores();
        this.closeModal();
        Swal.fire('Éxito', 'Instructor creado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al crear el instructor:', error);
        Swal.fire('Error', 'No se pudo crear el instructor.', 'error');
      });
    } else {
      this.http.put(this.apiUrl, this.instructor).subscribe(() => {
        this.getInstructores();
        this.closeModal();
        Swal.fire('Éxito', 'Instructor actualizado exitosamente!', 'success');
      }, (error) => {
        console.error('Error al actualizar el instructor:', error);
        Swal.fire('Error', 'No se pudo actualizar el instructor.', 'error');
      });
    }
  }

  extractTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  editInstructores(instructor: any): void {
    this.instructor = {
      ...instructor,

      fecha_inicio: new Date(instructor.fecha_inicio).toISOString().slice(0, 10),
      hora_ingreso: new Date(instructor.hora_ingreso).toISOString().slice(11, 16),
      hora_egreso: new Date(instructor.hora_egreso).toISOString().slice(11, 16),
      foto: instructor.foto ? instructor.foto : null
    };

    // Asignar la imagen seleccionada para mostrar en la vista previa
    this.selectedImage = instructor.foto ? 'data:image/jpeg;base64,' + instructor.foto : null;


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
    this.instructor = { id: 0, nombres: '', apellidos: '', foto: '', identificacion: '', vinculo: '', especialidad: '', correo: '', fecha_inicio: new Date().toISOString().slice(0, 10), periodo: '', hora_ingreso: '', hora_egreso: '', state: true };
    this.selectedImage = null;
    this.removeImage();
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = ''; // Limpiar el input de archivo
    }
  }
}
