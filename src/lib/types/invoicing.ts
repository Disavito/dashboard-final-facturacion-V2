import * as z from 'zod';

// --- Zod Schemas ---

export const ClientSchema = z.object({
  tipo_documento: z.string().min(1, "Tipo de documento requerido"),
  numero_documento: z.string().min(8, "Número de documento inválido"),
  razon_social: z.string().min(3, "Razón social requerida"),
  nombre_comercial: z.string().optional(),
  direccion: z.string().min(5, "Dirección requerida"),
  ubigeo: z.string().length(6, "Ubigeo inválido").optional().or(z.literal('')),
  distrito: z.string().optional(),
  provincia: z.string().optional(),
  departamento: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
});

export const DetalleSchema = z.object({
  codigo: z.string().min(1, "Código requerido"),
  descripcion: z.string().min(3, "Descripción requerida"),
  unidad: z.string().min(1, "Unidad requerida (e.g., NIU, ZZ)"),
  cantidad: z.number().min(1, "Cantidad debe ser al menos 1"),
  mto_valor_unitario: z.number().min(0.01, "Valor unitario requerido"),
  porcentaje_igv: z.number().min(0).max(18),
  tip_afe_igv: z.string().min(1, "Tipo de afectación IGV requerido"),
  codigo_producto_sunat: z.string().min(1, "Código SUNAT requerido"),
});

export const BoletaPayloadSchema = z.object({
  company_id: z.number(),
  branch_id: z.number(),
  serie: z.string().min(1, "Serie requerida"),
  fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  moneda: z.enum(['PEN', 'USD']),
  tipo_operacion: z.string(),
  metodo_envio: z.string(),
  forma_pago_tipo: z.enum(['Contado', 'Credito']),
  client: ClientSchema,
  detalles: z.array(DetalleSchema).min(1, "Debe haber al menos un detalle"),
  usuario_creacion: z.string().min(1, "Usuario de creación requerido"),
});

export const InvoicingCalendarItemSchema = z.object({
  id: z.number(),
  type: z.enum(['Boleta', 'Factura', 'Nota Crédito']),
  serie: z.string(),
  clientName: z.string(),
  amount: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['Aceptado', 'Pendiente', 'Rechazado']),
});

// --- Nuevo: Esquema de Respuesta Exitosa de la API de Emisión ---
export const IssueResponseDataSchema = z.object({
  id: z.number(),
  serie: z.string(),
  correlativo: z.string(),
  numero_completo: z.string(), // CRÍTICO: B001-000026
  tipo_documento: z.string(),
  fecha_emision: z.string(),
  mto_imp_venta: z.string().or(z.number()).transform(val => Number(val)), // Total de la venta
  // Opcional: incluir otros campos si se necesitan en el frontend
});

export const IssueResponseSchema = z.object({
  success: z.boolean(),
  data: IssueResponseDataSchema,
  message: z.string().optional(),
});


// --- TypeScript Types ---

export type Client = z.infer<typeof ClientSchema>;
export type Detalle = z.infer<typeof DetalleSchema>;
export type BoletaPayload = z.infer<typeof BoletaPayloadSchema>;
export type InvoicingCalendarItem = z.infer<typeof InvoicingCalendarItemSchema>;
export type IssueResponseData = z.infer<typeof IssueResponseDataSchema>;
export type IssueResponse = z.infer<typeof IssueResponseSchema>;

// Form Type (includes optional fields for initial state)
export type BoletaFormValues = Omit<BoletaPayload, 'company_id' | 'branch_id' | 'fecha_emision' | 'usuario_creacion'> & {
  fecha_emision: string;
  usuario_creacion: string;
};
