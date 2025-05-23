import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/Usuario.model';
import { Documentacion } from '../../../models/documentacion.model';

@Component({
  selector: 'app-documentacion-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentacion-resume.component.html',
  styleUrls: ['./documentacion-resume.component.css']
})
export class DocumentacionResumeComponent {
  @Input() usuario!: { usuario: Usuario; documentacion?: Documentacion };
}
