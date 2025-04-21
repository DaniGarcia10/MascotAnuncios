import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { AnunciosListComponent } from './components/anuncios/anuncios-list/anuncios-list.component';
import { AnunciosDetailComponent } from './components/anuncios/anuncios-detail/anuncios-detail.component';
import { MascotasListComponent } from './components/mascotas/mascotas-list/mascotas-list.component';
import { AnunciosFormComponent } from './components/anuncios/anuncios-form/anuncios-form.component';
import { SuscripcionesComponent } from './components/suscripciones/suscripciones/suscripciones.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'anuncios', component: AnunciosListComponent },
  { path: 'anuncio/:id', component: AnunciosDetailComponent },
  { path: 'mascotas', component: MascotasListComponent },
  { path: 'publicar', component: AnunciosFormComponent },
   { path: 'suscripciones', component: SuscripcionesComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutes {}
