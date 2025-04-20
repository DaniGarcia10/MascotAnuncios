import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Raza } from '../models/Razas.model';

@Injectable({
  providedIn: 'root'
})
export class RazasService {
  private razas: Raza = { perros: [], gatos: [] };

  constructor(private firestore: Firestore) {}

  async getRazas(): Promise<Raza> {
    if (this.razas.perros.length === 0 && this.razas.gatos.length === 0) {
      const collectionRef = collection(this.firestore, 'razas');
      const querySnapshot = await getDocs(collectionRef);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data() as { raza: string[] };
  
        if (doc.id === 'perros') {
          this.razas.perros = data.raza;
        } else if (doc.id === 'gatos') {
          this.razas.gatos = data.raza;
        }
      });
    }
  
    return this.razas;
  }
  
  

  getRazasByTipo(tipo: 'perros' | 'gatos'): string[] {
    return this.razas[tipo];
  }
}
