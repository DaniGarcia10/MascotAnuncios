import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { from, of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  getFavoritosIds(): Observable<string[]> {
    const uid = this.authService.getUsuarioId();
    if (!uid) return of([]);
    
    const docRef = doc(this.firestore, `favoritos/${uid}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        const data = snapshot.data();
        return data && Array.isArray(data['id_anuncio']) ? data['id_anuncio'] : [];
      })
    );
  }
}
