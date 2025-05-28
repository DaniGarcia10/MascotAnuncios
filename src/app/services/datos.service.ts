import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  constructor() {}

  // Provincias con caché
  async obtenerProvincias(forceReload = false): Promise<string[]> {
    const clave = 'provincias';

    if (!forceReload) {
      const cache = localStorage.getItem(clave);
      if (cache) return JSON.parse(cache);
    }

    try {
      const snapshot = await getDoc(doc(db, 'datos', 'provincias'));
      const data = snapshot.data();
      console.log('Datos Firestore:', data); // <-- Añade esto
      const lista = data?.["lista"] || [];

      localStorage.setItem(clave, JSON.stringify(lista));
      return lista;
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      return [];
    }
  }

  // Razas con caché
  async obtenerRazas(tipo: 'perro' | 'gato', forceReload = false): Promise<string[]> {
    const clave = `razas_${tipo}`;

    if (!forceReload) {
      const cache = localStorage.getItem(clave);
      if (cache) return JSON.parse(cache);
    }

    try {
      const snapshot = await getDoc(doc(db, 'datos', 'razas'));
      const data = snapshot.data();
      const lista = data?.[tipo] || [];

      localStorage.setItem(clave, JSON.stringify(lista));
      return lista;
    } catch (error) {
      console.error(`Error al obtener razas de ${tipo}:`, error);
      return [];
    }
  }

  limpiarCache(): void {
    localStorage.removeItem('provincias');
    localStorage.removeItem('razas_perro');
    localStorage.removeItem('razas_gato');
    console.log('Caché local limpiada');
  }
}
