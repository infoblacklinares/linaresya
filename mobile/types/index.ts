export type Negocio = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  categoria?: string;
  telefono?: string;
  whatsapp?: string;
  direccion: string;
  a_domicilio: boolean;
  verificado: boolean;
  activo: boolean;
  horario?: Record<string, string>;
};

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  emoji: string;
  orden: number;
};

export type Horario = {
  negocio_id: string;
  dia: "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";
  abre?: string;
  cierra?: string;
  cerrado: boolean;
};

export type Favorite = {
  usuario_id?: string;
  negocio_id: string;
};
