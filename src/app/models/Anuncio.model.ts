export interface Anuncio {
    id: string;
    raza: string;
    perro: boolean;
    titulo: string;
    descripcion: string;
    fecha_publicacion: Date;
    id_padre: string | null;
    id_madre: string | null;
    edad: string;
    id_usuario: string; 
    activo: boolean;
    ubicacion: string;
    imagenes: string[];
    cachorros: string[] | null;
    especificar_cachorros: boolean;
    precio: number | null;
    destacado: boolean;
}
