import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Anuncio } from '../models/Anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {

  constructor(private firestore: Firestore) { }

  getAnuncios(): Observable<Anuncio[]> {
    const anunciosCollection = collection(this.firestore, 'anuncios');
    console.log('Datos anuncio:', anunciosCollection);
    return collectionData(anunciosCollection, { idField: 'id' }) as Observable<Anuncio[]>;
  }
}
