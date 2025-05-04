export interface Anuncio {
    id: string;
    raza: string | null;
    perro: boolean | null;
    titulo: string;
    descripcion: string;
    fecha_publicacion: Date;
    id_padre: string;
    id_madre: string;
    edad: string;
    id_usuario: string;
    activo: boolean;
    ubicacion: string | null;
    imagenes: string[];
    especificar_cachorros: boolean;
    precio: number | null;
    destacado: boolean;
  }