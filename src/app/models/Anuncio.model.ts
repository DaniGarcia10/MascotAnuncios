export interface Anuncio {
    id: string;
    raza: string;
    perro: boolean;
    titulo: string;
    descripcion: string;
    fecha_publicacion: string;
    id_padre: string | null;
    id_madre: string | null;
    edad: string;
    id_usuario: string; 
    activo: boolean;
    ubicacion: string;
    destacado: boolean;
    id_imagenes: string[];
    especificar_cachorros: boolean;
  }
  