import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Usuario } from '../../models/Usuario.model';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service'; // Importar UsuarioService
import { Auth } from '@angular/fire/auth'; 

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

  constructor(private auth: Auth, private usuarioService: UsuarioService) { // Inyectar Auth y UsuarioService
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
    const user = this.auth.currentUser; // Obtener el usuario autenticado
    if (user) {
      this.usuarioService.getUsuarioById(user.uid).then((usuario) => {
        this.usuario = usuario;
        if (this.usuario) {
          console.log('Datos del usuario:', this.usuario);
          this.perfilForm.patchValue(this.usuario);
        }
      }).catch((err) => {
        console.error('Error al obtener los datos del usuario:', err);
      });
    } else {
      console.log('No hay usuario autenticado');
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.perfilForm.valid) {
      console.log('Datos guardados:', this.perfilForm.value);
      // Aquí puedes agregar lógica para guardar los cambios en la base de datos
    }
  }
}
