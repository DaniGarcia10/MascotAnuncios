import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class RegistroComponent implements OnInit {

  formRegistro: FormGroup;

  constructor(private authService: AuthService) {
    this.formRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      apellidos: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(15)]),
      vendedor: new FormControl(false),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      criadero: new FormGroup({
        nombre: new FormControl('', [Validators.maxLength(50)]),
        nucleo_zoologico: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]+$'),
          Validators.minLength(12),
          Validators.maxLength(12)
        ])
      })
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    const usuario = this.formRegistro.value;
    console.log('Datos del usuario:', usuario);

    this.authService.registro(usuario.email, usuario.password).then((response: any) => {
      console.log('Registro exitoso:', response);
    }).catch((error: any) => {
      console.error('Error en el registro:', error);
    });
  }

  isVendedor(): boolean {
    return this.formRegistro.get('vendedor')?.value;
  }
}