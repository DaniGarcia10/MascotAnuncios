export interface Mascota {
    id: string;
    nombre: string;
    perro: boolean;
    raza: string;
    color: string;
    sexo: 'Macho' | 'Hembra';
    descripcion: string;
    imagenes: string[];
  }