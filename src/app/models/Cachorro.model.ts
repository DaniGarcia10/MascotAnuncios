export interface Cachorro {
    id: string;
    color: string;
    sexo: 'Macho' | 'Hembra';
    precio: number;
    disponible: boolean;
    descripcion: string;
    imagenes: string[];
}
