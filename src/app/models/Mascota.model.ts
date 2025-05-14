export interface Mascota {
    id: string;
    nombre: string;
    perro: boolean;
    raza: string;
    color: string;
    sexo: 'Macho' | 'Hembra';
    descripcion: string;
    imagenes: string[];
    id_padre: string | null;
    id_madre: string | null;
    id_usuario: string;
}