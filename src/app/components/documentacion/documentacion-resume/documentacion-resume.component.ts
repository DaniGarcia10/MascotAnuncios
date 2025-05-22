import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentacionService } from '../../../services/documentacion.service';
import { Usuario } from '../../../models/Usuario.model';

@Component({
  selector: 'app-documentacion-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentacion-resume.component.html',
  styleUrls: ['./documentacion-resume.component.css']
})
export class DocumentacionResumeComponent implements OnInit {
  usuarios: { usuario: Usuario, url: string }[] = [];
  loading = true;

  constructor(private documentacionService: DocumentacionService) {}

  async ngOnInit() {
    this.usuarios = await this.documentacionService.getUsuariosConDocumentos();
    this.loading = false;
  }
}
