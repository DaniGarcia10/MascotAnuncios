export class Usuario {
    constructor(
        public id: string,
        public nombre: string,
        public apellidos: string,
        public email: string,
        public telefono: string,
        public vendedor: boolean,
        public id_criadero: string,
        public foto_perfil: string,
    ) { }
    
    esVendedor(): boolean {
        return this.vendedor;
    }

}