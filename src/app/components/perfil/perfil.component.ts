import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/Usuario.model';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true, 
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  editMode: boolean = false;
  perfilForm: FormGroup; 

  constructor(private authService: AuthService) {
    this.perfilForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      apellidos: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
      vendedor: new FormControl(false),
      id_criadero: new FormControl('', [Validators.maxLength(50)])
    });
  }

  ngOnInit(): void {
    this.authService.getUserDataAuth().subscribe({
      next: (data) => {
        this.usuario = data.usuario;
        if (this.usuario) {
          this.perfilForm.patchValue(this.usuario);
        }
      },
      error: (err) => {
        console.error('Error al obtener los datos del usuario:', err);
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.perfilForm.valid) {
      console.log('Datos guardados:', this.perfilForm.value);
      // Aquí puedes agregar lógica para guardar los cambios en la base de datos
    }
  }
}
