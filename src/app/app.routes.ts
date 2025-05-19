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
import { MisanunciosListComponent } from './components/misanuncios/misanuncios-list/misanuncios-list.component';
import { MisanunciosDetailComponent } from './components/misanuncios/misanuncios-detail/misanuncios-detail.component';
import { FavoritosListComponent } from './components/favoritos/favoritos-list/favoritos-list.component';
import { MascotasDetailComponent } from './components/mascotas/mascotas-detail/mascotas-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'anuncios', component: AnunciosListComponent },
  { path: 'anuncios/:id', component: AnunciosDetailComponent },
  { path: 'mis-anuncios', component: MisanunciosListComponent },
  { path: 'mis-anuncios/:id', component: MisanunciosDetailComponent },
  { path: 'mascotas', component: MascotasListComponent },
  { path: 'mascotas/:id', component: MascotasDetailComponent },
  { path: 'publicar', component: AnunciosFormComponent },
  { path: 'favoritos', component: FavoritosListComponent },
  { path: 'suscripciones', component: SuscripcionesComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutes {}
