import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Plantilla } from '../models/Plantilla.model';

@Injectable({
  providedIn: 'root'
})
export class PlantillasService {

  constructor(private firestore: Firestore) { }

  getPlantillas(): Observable<Plantilla[]> {
    const plantillasCollection = collection(this.firestore, 'plantillas');
    return collectionData(plantillasCollection, { idField: 'id' }) as Observable<Plantilla[]>;
  }

  getPlantillaByUsuario(id_usuario: string): Observable<Plantilla[]> {
    const plantillasCollection = collection(this.firestore, 'plantillas');
    const query = collectionData(plantillasCollection, { idField: 'id' })
      .pipe(
        map((plantillas) =>
          (plantillas as Plantilla[]).filter((p: Plantilla) => p.id_usuario === id_usuario)
        )
      );
    return query as Observable<Plantilla[]>;
  }

  getPlantillaById(id: string): Promise<Plantilla | undefined> {
    const plantillaRef = doc(this.firestore, `plantillas/${id}`);
    return getDoc(plantillaRef).then(snap => {
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Plantilla;
      }
      return undefined;
    });
  }

  crearPlantilla(plantilla: Omit<Plantilla, 'id'>): Promise<any> {
    const plantillasCollection = collection(this.firestore, 'plantillas');
    return addDoc(plantillasCollection, plantilla);
  }

  actualizarPlantilla(id: string, data: Partial<Plantilla>): Promise<void> {
    const plantillaRef = doc(this.firestore, `plantillas/${id}`);
    return updateDoc(plantillaRef, data);
  }

  eliminarPlantilla(id: string): Promise<void> {
    const plantillaRef = doc(this.firestore, `plantillas/${id}`);
    return deleteDoc(plantillaRef);
  }
}
