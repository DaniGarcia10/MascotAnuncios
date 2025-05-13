import { Component, Input, OnInit } from '@angular/core';
import { Mascota } from '../../../models/Mascota.model';
import { MascotasService } from '../../../services/mascotas.service';
import { ImagenService } from '../../../services/imagen.service';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth'; // Importar el servicio de autenticación

@Component({
  selector: 'app-mascotas-resume',
  templateUrl: './mascotas-resume.component.html',
  imports: [CommonModule],
  styleUrls: ['./mascotas-resume.component.css']
})
export class MascotasResumeComponent implements OnInit {
  @Input() mascota!: Mascota;
  padresImagenes: { [key: string]: string } = {}; // Almacena las imágenes del padre y la madre

  constructor(
    private mascotasService: MascotasService,
    private imagenService: ImagenService,
    private auth: Auth // Inyectar el servicio de autenticación
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('Usuario no autenticado');
      return;
    }

    // Verifica si la mascota tiene imágenes y carga la primera imagen
    if (this.mascota.imagenes && this.mascota.imagenes.length > 0) {
      const imagenesConRuta = this.mascota.imagenes.map(img =>
        img.startsWith('http') ? img : `mascotas/${user.uid}/${img}`
      );
      this.imagenService.cargarImagenes([imagenesConRuta[0]]).then(urls => {
        console.log('URL de la mascota:', urls[0]); // Verifica la URL generada
        this.mascota.imagenes[0] = urls[0]; // Asigna la URL a la imagen de la mascota
      });
    }

    if (this.mascota.id_padre && this.mascota.id_padre.trim() !== '') {
      this.mascotasService.getMascotaById(this.mascota.id_padre).then(padre => {
        console.log('Padre:', padre); // Verifica los datos del padre
        if (padre?.imagenes?.length) {
          const imagenesConRuta = padre.imagenes.map(img =>
            img.startsWith('http') ? img : `mascotas/${user.uid}/${img}`
          );
          this.imagenService.cargarImagenes([imagenesConRuta[0]]).then(urls => {
            console.log('URL del padre:', urls[0]); // Verifica la URL generada
            this.padresImagenes['padre'] = urls[0];
          });
        }
      });
    }

    if (this.mascota.id_madre && this.mascota.id_madre.trim() !== '') {
      this.mascotasService.getMascotaById(this.mascota.id_madre).then(madre => {
        console.log('Madre:', madre); // Verifica los datos de la madre
        if (madre?.imagenes?.length) {
          const imagenesConRuta = madre.imagenes.map(img =>
            img.startsWith('http') ? img : `mascotas/${user.uid}/${img}`
          );
          this.imagenService.cargarImagenes([imagenesConRuta[0]]).then(urls => {
            console.log('URL de la madre:', urls[0]); // Verifica la URL generada
            this.padresImagenes['madre'] = urls[0];
          });
        }
      });
    }
  }
}
