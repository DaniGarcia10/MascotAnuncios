import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class LoginComponent {
  formLogin: FormGroup;

  constructor(private usuarioService: UsuarioService) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  onSubmit(): void {
    const { email, password } = this.formLogin.value;
    this.usuarioService.login(email, password).then((response: any) => {
      console.log('Login exitoso:', response);
    }).catch((error: any) => {
      console.error('Error en el login:', error.message);
    });
  }
}
