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
import { SuscripcionesComponent } from './components/suscripciones/suscripciones.component';
import { MisanunciosListComponent } from './components/misanuncios/misanuncios-list/misanuncios-list.component';
import { MisanunciosDetailComponent } from './components/misanuncios/misanuncios-detail/misanuncios-detail.component';
import { FavoritosListComponent } from './components/favoritos/favoritos-list/favoritos-list.component';
import { MascotasDetailComponent } from './components/mascotas/mascotas-detail/mascotas-detail.component';
import { DocumentacionListComponent } from './components/documentacion/documentacion-list/documentacion-list.component';
import { UsuariosListComponent } from './components/usuarios/usuarios-list/usuarios-list.component';
import { NoAuthGuard } from './guards/no-auth.guard'; 
import { AdminGuard } from './guards/admin.guard';
import { RegistrocriaderoComponent } from './components/registrocriadero/registrocriadero.component';
import { criadorGuard } from './guards/criador.guard';
import { noCriaderoGuard } from './guards/no-criadero.guard';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso.component';
import { PagoCanceladoComponent } from './components/pago-cancelado/pago-cancelado.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [NoAuthGuard] },
  { path: 'registrocriadero', component: RegistrocriaderoComponent, canActivate: [noCriaderoGuard] },
  { path: 'inicio', component: InicioComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'anuncios', component: AnunciosListComponent },
  { path: 'anuncios/:id', component: AnunciosDetailComponent },
  { path: 'mis-anuncios', component: MisanunciosListComponent, canActivate: [criadorGuard] },
  { path: 'mis-anuncios/:id', component: MisanunciosDetailComponent, canActivate: [criadorGuard] },
  { path: 'mascotas', component: MascotasListComponent, canActivate: [criadorGuard] },
  { path: 'mascotas/:id', component: MascotasDetailComponent, canActivate: [criadorGuard] },
  { path: 'publicar', component: AnunciosFormComponent, canActivate: [criadorGuard] },
  { path: 'favoritos', component: FavoritosListComponent },
  { path: 'suscripciones', component: SuscripcionesComponent, canActivate: [criadorGuard] },
  { path: 'documentaciones', component: DocumentacionListComponent, canActivate: [AdminGuard] },
  { path: 'usuarios', component: UsuariosListComponent, canActivate: [AdminGuard] },
  { path: 'pago-exitoso', component: PagoExitosoComponent },
  { path: 'pago-cancelado', component: PagoCanceladoComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }),
  ],
  exports: [RouterModule]
})
export class AppRoutes {}