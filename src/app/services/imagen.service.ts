import { Injectable } from '@angular/core';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {

  constructor(private storage: Storage) { }

  async cargarImagenes(imagenPaths: string[]): Promise<string[]> {
    return Promise.all(
      imagenPaths.map(async (imagenPath: string) => {
        const imageRef = ref(this.storage, imagenPath);
        return getDownloadURL(imageRef);
      })
    );
  }
}
