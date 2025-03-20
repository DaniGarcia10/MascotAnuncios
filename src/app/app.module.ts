import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, // Para autenticación
    AngularFirestoreModule // Para Firestore
  ],
  providers: [],
  // Removed bootstrap array as AppComponent is standalone
})
export class AppModule { }