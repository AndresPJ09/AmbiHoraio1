import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instructor-horario',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './instructor-horario.component.html',
  styleUrl: './instructor-horario.component.scss'
})
export class InstructorHorarioComponent implements OnInit {
  instruHorarios: any[] = [];
  instructorHorario: any = { 
    id: 0, codigo: '', 
    userId: 0, 
    programaId: 0, 
    ambienteId: 0, 
    proyectoId: 0, 
    fecha_inicio: new Date().toISOString().slice(0, 10), 
    fecha_fin: new Date().toISOString().slice(0, 10), 
    fin_lectiva: new Date().toISOString().slice(0, 10), 
    num_semanas: '', state: true };
  users: any[] = [];
  programas: any[] = [];
  isModalOpen = false;
  filteredUsers: any[] = [];
  filteredProgramas: any[] = [];
  isDropdownOpen = false;
  isEditing = false;

  private apiUrl = 'http://localhost:5062/api/InstructorHorario';
  private usersUrl = 'http://localhost:5062/api/User';
  private programasUrl = 'http://localhost:5062/api/Programa';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getInstruHorarios();
    this.getUsers();
  }

  getInstruHorarios(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (instruHorarios) => {
        this.instruHorarios = instruHorarios;
        this.cdr.detectChanges();
      },    
      (error) => {
        console.error('Error fetching horario de instructor:', error);
      }
    );
  }

  getUsers(): void {
    this.http.get<any[]>(this.usersUrl).subscribe(
      (users) => {
        this.users = users;
        this.filteredUsers = users;
      },    
      (error) => {
        console.error('Error fetching usuarios:', error);
      }
    );
  }

}
