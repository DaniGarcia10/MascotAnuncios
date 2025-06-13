import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Plantilla } from '../models/Plantilla.model';

@Injectable({
  providedIn: 'root'
})
export class PlantillasService {

  // Inyecto Firestore para poder acceder a la base de datos
  constructor(private firestore: Firestore) { }

  // Devuelvo todas las plantillas como un observable
  getPlantillas(): Observable<Plantilla[]> {
    const plantillasCollection = collection(this.firestore, 'plantillas');
    // Uso collectionData para obtener los datos y añado el id a cada plantilla
    return collectionData(plantillasCollection, { idField: 'id' }) as Observable<Plantilla[]>;
  }

  // Devuelvo las plantillas filtradas por el id del usuario
  getPlantillaByUsuario(id_usuario: string): Observable<Plantilla[]> {
    const plantillasCollection = collection(this.firestore, 'plantillas');
    // Filtro las plantillas por el id_usuario usando map
    const query = collectionData(plantillasCollection, { idField: 'id' })
      .pipe(
        map((plantillas) =>
          (plantillas as Plantilla[]).filter((p: Plantilla) => p.id_usuario === id_usuario)
        )
      );
    return query as Observable<Plantilla[]>;
  }

  // Obtengo una plantilla por su id, si no existe devuelvo undefined
  getPlantillaById(id: string): Promise<Plantilla | undefined> {
    const plantillaRef = doc(this.firestore, `plantillas/${id}`);
    return getDoc(plantillaRef).then(snap => {
      if (snap.exists()) {
        // Si existe, devuelvo el objeto con su id y datos
        return { id: snap.id, ...snap.data() } as Plantilla;
      }
      // Si no existe, devuelvo undefined
      return undefined;
    });
  }

  // Creo una nueva plantilla en la colección (sin el campo id)
  crearPlantilla(plantilla: Omit<Plantilla, 'id'>): Promise<any> {
    const plantillasCollection = collection(this.firestore, 'plantillas');
    // Uso addDoc para añadir la plantilla
    return addDoc(plantillasCollection, plantilla);
  }

  // Actualizo una plantilla existente por su id
  actualizarPlantilla(id: string, data: Partial<Plantilla>): Promise<void> {
    const plantillaRef = doc(this.firestore, `plantillas/${id}`);
    // Uso updateDoc para actualizar los datos de la plantilla
    return updateDoc(plantillaRef, data);
  }

  // Elimino una plantilla por su id
  eliminarPlantilla(id: string): Promise<void> {
    const plantillaRef = doc(this.firestore, `plantillas/${id}`);
    // Uso deleteDoc para eliminar la plantilla
    return deleteDoc(plantillaRef);
  }
}
