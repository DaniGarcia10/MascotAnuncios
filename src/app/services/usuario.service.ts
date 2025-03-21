import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Database, get,  objectVal,  DataSnapshot,  ref,  set,  child,  query,  orderByChild,  equalTo } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private COLLECTION_NAME = "usuarios";

  constructor(private database: Database) { }


}
