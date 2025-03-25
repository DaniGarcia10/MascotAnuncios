import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';
import { AnunciosResumeComponent } from '../anuncios-resume/anuncios-resume.component';

@Component({
  selector: 'app-anuncios-list',
  imports: [CommonModule, AnunciosResumeComponent],
  templateUrl: './anuncios-list.component.html',
  styleUrl: './anuncios-list.component.css'
})
export class AnunciosListComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(private anunciosService: AnunciosService) {}

  ngOnInit(): void {
    this.anunciosService.getAnuncios().subscribe(data => {
      this.anuncios = data;
    });
  }
}
