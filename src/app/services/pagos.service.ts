import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, docData, addDoc } from '@angular/fire/firestore';
import { Pago } from '../models/Pago.Model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private coleccion;

  constructor(private firestore: Firestore) {
    this.coleccion = collection(this.firestore, 'pagos');
  }

  // Crear o actualizar un pago usando el id_pago como nombre del documento
  async guardarPago(pago: Pago): Promise<void> {
    const ref = doc(this.coleccion, pago.id_pago);
    await setDoc(ref, {
      duracion: pago.duracion,
      id_usuario: pago.id_usuario,
      pagado: pago.pagado
    });
  }

  // Guardar pago dejando que Firestore genere el ID automáticamente
  guardarPagoAutoId(pago: Omit<Pago, 'id_pago'>) {
    return addDoc(this.coleccion, pago);
  }

  // Obtener un pago por id_pago
  obtenerPago(id_pago: string): Observable<Pago | undefined> {
    const ref = doc(this.coleccion, id_pago);
    return docData(ref, { idField: 'id_pago' }) as Observable<Pago>;
  }
}