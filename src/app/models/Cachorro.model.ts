export interface Cachorro {
    id: string;
    id_anuncio: string;
    color: string;
    sexo: 'Macho' | 'Hembra';
    precio: number;
    disponible: boolean;
    imagenes: string[];
}
