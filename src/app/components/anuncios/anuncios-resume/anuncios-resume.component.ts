import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';

@Component({
  selector: 'app-anuncios-resume',
  imports: [CommonModule],
  templateUrl: './anuncios-resume.component.html',
  styleUrl: './anuncios-resume.component.css'
})
export class AnunciosResumeComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(private anunciosService: AnunciosService) {}

  ngOnInit(): void {
    this.anunciosService.getAnuncios().subscribe(data => {
      this.anuncios = data;
    });
  }
}
