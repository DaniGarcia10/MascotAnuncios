import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnunciosService } from '../../../services/anuncios.service';
import { Anuncio } from '../../../models/Anuncio.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-anuncios-detail',
  imports: [CommonModule],
  templateUrl: './anuncios-detail.component.html',
  styleUrls: ['./anuncios-detail.component.css']
})
export class AnunciosDetailComponent implements OnInit {
  anuncio?: Anuncio;

  constructor(
    private route: ActivatedRoute,
    private anunciosService: AnunciosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.anunciosService.getAnuncios().subscribe(anuncios => {
        this.anuncio = anuncios.find(a => a.id === id);
      });
    }
  }
}
