import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AnunciosListComponent } from './anuncios-list.component';
import { AnunciosService } from '../../../services/anuncios.service';
import { DatosService } from '../../../services/datos.service';
import { ActivatedRoute } from '@angular/router';

describe('AnunciosListComponent', () => {
  let component: AnunciosListComponent;
  let fixture: ComponentFixture<AnunciosListComponent>;
  let mockAnunciosService: any;
  let mockDatosService: any;
  let mockRoute: any;

  beforeEach(async () => {
    mockAnunciosService = {
      getAnuncios: jasmine.createSpy().and.returnValue(of([
        { precio: 100, ubicacion: 'Madrid', perro: true, raza: 'Labrador', destacado: true, fecha_publicacion: '2024-01-01' },
        { precio: 50, ubicacion: 'Barcelona', perro: false, raza: 'Siames', destacado: false, fecha_publicacion: '2023-01-01' }
      ]))
    };
    mockDatosService = {
      obtenerProvincias: jasmine.createSpy().and.resolveTo(['Madrid', 'Barcelona']),
      obtenerRazas: jasmine.createSpy().and.resolveTo(['Labrador', 'Siames'])
    };
    mockRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [AnunciosListComponent],
      providers: [
        { provide: AnunciosService, useValue: mockAnunciosService },
        { provide: DatosService, useValue: mockDatosService },
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnunciosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar anuncios y aplicar filtros', () => {
    component.filtros.tipoAnimal = null;
    component.cargarAnuncios();
    expect(mockAnunciosService.getAnuncios).toHaveBeenCalled();
  });

  it('debe actualizar la lista de razas', async () => {
    component.filtros.tipoAnimal = 'perro';
    await component.updateRazasList();
    expect(component.filteredRazas.length).toBeGreaterThan(0);
  });

  it('debe filtrar anuncios por ubicación', () => {
    component.anuncios = [
      { ubicacion: 'Madrid', precio: 100, perro: true, raza: 'Labrador', destacado: true },
      { ubicacion: 'Barcelona', precio: 50, perro: false, raza: 'Siames', destacado: false }
    ];
    component.filtros.ubicacion = 'Madrid';
    component.aplicarFiltros();
    expect(component.anunciosFiltrados.length).toBe(1);
    expect(component.anunciosFiltrados[0].ubicacion).toBe('Madrid');
  });

  it('debe ordenar anuncios por precio ascendente', () => {
    component.anuncios = [
      { precio: 200, destacado: false, fecha_publicacion: '2024-01-01' },
      { precio: 100, destacado: true, fecha_publicacion: '2023-01-01' }
    ];
    component.anunciosFiltrados = [...component.anuncios];
    component.ordenSeleccionado = 'precioAsc';
    component.ordenarAnuncios();
    expect(component.anunciosFiltrados[0].precio).toBe(100);
  });
});
