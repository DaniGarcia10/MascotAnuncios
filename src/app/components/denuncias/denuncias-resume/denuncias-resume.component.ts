import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Denuncia } from '../../../models/Denuncia.model';

@Component({
  selector: 'app-denuncias-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './denuncias-resume.component.html',
  styleUrls: ['./denuncias-resume.component.css']
})
export class DenunciasResumeComponent {
  @Input() denuncia!: Denuncia;
}
