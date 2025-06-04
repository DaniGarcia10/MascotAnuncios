import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contenido-footer',
  templateUrl: './contenido-footer.component.html',
  styleUrls: ['./contenido-footer.component.css'],
  imports: [CommonModule]
})
export class ContenidoFooterComponent implements OnInit {
  seccion: string = 'criadores';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Escuchar cambios en el fragmento de la URL
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'criadores' || fragment === 'compra' || fragment === 'contacto') {
        this.seccion = fragment;
      } else {
        this.seccion = 'criadores';
      }
    });
  }
}
