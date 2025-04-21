import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, collectionData, docData } from '@angular/fire/firestore';
import { Suscripcion } from '../models/Suscripcion.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionesService {
  private coleccion;

  constructor(private firestore: Firestore) {
    this.coleccion = collection(this.firestore, 'suscripciones');
  }

  crearSuscripcion(suscripcion: Suscripcion): Promise<string> {
    return addDoc(this.coleccion, suscripcion).then(docRef => docRef.id);
  }

  actualizarSuscripcion(id: string, data: Partial<Suscripcion>): Promise<void> {
    const ref = doc(this.firestore, 'suscripciones', id);
    return updateDoc(ref, data);
  }

  obtenerSuscripcion(id: string): Observable<Suscripcion> {
    const ref = doc(this.firestore, 'suscripciones', id);
    return docData(ref, { idField: 'id' }) as Observable<Suscripcion>;
  }

}
