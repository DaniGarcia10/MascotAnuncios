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
      nombre: new FormControl('', Validators.required),
      apellidos: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefono: new FormControl('', Validators.required),
      vendedor: new FormControl(false),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      criadero: new FormGroup({
        nombre: new FormControl(''),
        nucleo_zoologico: new FormControl('')
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