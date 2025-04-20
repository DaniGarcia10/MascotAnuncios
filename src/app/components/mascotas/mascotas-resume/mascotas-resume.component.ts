import { Component, Input, OnInit } from '@angular/core';
import { Mascota } from '../../../models/Mascota.model';
import { MascotasService } from '../../../services/mascotas.service';

@Component({
  selector: 'app-mascotas-resume',
  templateUrl: './mascotas-resume.component.html',
  styleUrls: ['./mascotas-resume.component.css']
})
export class MascotasResumeComponent implements OnInit {
  @Input() mascota!: Mascota;
  padresImagenes: { [key: string]: string } = {}; // Almacena las imágenes del padre y la madre

  constructor(private mascotasService: MascotasService) {}

  ngOnInit(): void {
    // Cargar la imagen del padre
    if (this.mascota.id_padre) {
      this.mascotasService.getMascotaById(this.mascota.id_padre).then(padre => {
        if (padre?.imagenes?.length) {
          this.padresImagenes['padre'] = padre.imagenes[0]; // Usar la primera imagen
        }
      });
    }

    // Cargar la imagen de la madre
    if (this.mascota.id_madre) {
      this.mascotasService.getMascotaById(this.mascota.id_madre).then(madre => {
        if (madre?.imagenes?.length) {
          this.padresImagenes['madre'] = madre.imagenes[0]; // Usar la primera imagen
        }
      });
    }
  }
}
