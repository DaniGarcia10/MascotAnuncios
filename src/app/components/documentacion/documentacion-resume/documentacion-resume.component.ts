import { Component, Input } from '@angular/core';
import { Usuario } from '../../../models/Usuario.model';
import { Documentacion } from '../../../models/documentacion.model';

@Component({
  selector: 'app-documentacion-resume',
  templateUrl: './documentacion-resume.component.html',
  styleUrls: ['./documentacion-resume.component.css']
})
export class DocumentacionResumeComponent {
  @Input() usuario!: { usuario: Usuario; documentacion?: Documentacion };
}
