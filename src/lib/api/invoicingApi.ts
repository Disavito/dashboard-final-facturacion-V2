import axios from 'axios';
import { INVOICING_API_BASE_URL, INVOICING_API_AUTH_TOKEN } from '../constants';
import { BoletaPayload, Client, InvoicingCalendarItem, IssueResponse, IssueResponseSchema } from '../types/invoicing';
import { supabase } from '../supabaseClient';
// Eliminada la importación de SocioTitular (TS6133)

const invoicingApi = axios.create({
  baseURL: INVOICING_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Mantenemos el token para la emisión de boletas (issueBoleta)
    'Authorization': `Bearer ${INVOICING_API_AUTH_TOKEN}`,
  },
});

/**
 * Emite una Boleta de Venta Electrónica.
 * @param boletaData Los datos de la boleta a enviar.
 * @returns La respuesta de la API (incluyendo el número completo del documento y el ID interno).
 */
export const issueBoleta = async (boletaData: BoletaPayload): Promise<IssueResponse> => {
  try {
    const response = await invoicingApi.post('/boletas', boletaData);
    
    // Validar la respuesta con Zod (IssueResponseSchema importado)
    const validatedResponse = IssueResponseSchema.parse(response.data);
    return validatedResponse;

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error al emitir boleta:", error.response.data);
      // Intentar extraer un mensaje de error más específico si está disponible
      const apiMessage = error.response.data.message || JSON.stringify(error.response.data);
      throw new Error(`Error de la API de facturación: ${apiMessage}`);
    }
    // Si es un error de Zod (validación de esquema) o de red
    if (error instanceof Error) {
        throw new Error(`Error al procesar la respuesta o de red: ${error.message}`);
    }
    throw new Error('Error desconocido al emitir la boleta.');
  }
};

/**
 * Genera el PDF de una Boleta de Venta Electrónica.
 * @param boletaId El ID interno de la boleta.
 * @param format Formato del PDF (e.g., 'A4').
 */
export const generateBoletaPdf = async (boletaId: number, format: 'A4' | 'TICKET' = 'A4'): Promise<void> => {
  try {
    // POST /api/v1/boletas/{{boletaId}}/generate-pdf
    await invoicingApi.post(`/boletas/${boletaId}/generate-pdf`, { format });
    // Este endpoint generalmente devuelve un 200/202 indicando que la generación ha comenzado.
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error al generar PDF de boleta:", error.response.data);
      const apiMessage = error.response.data.message || JSON.stringify(error.response.data);
      throw new Error(`Error de la API al generar PDF: ${apiMessage}`);
    }
    throw new Error('Error desconocido al solicitar la generación del PDF.');
  }
};

/**
 * Descarga el PDF de una Boleta de Venta Electrónica.
 * @param boletaId El ID interno de la boleta.
 * @param serieCorrelativo La serie y correlativo para nombrar el archivo (e.g., B001-1234).
 * @param format Formato del PDF (e.g., 'A4').
 */
export const downloadBoletaPdf = async (boletaId: number, serieCorrelativo: string, format: 'A4' | 'TICKET' = 'A4'): Promise<void> => {
  try {
    // GET /api/v1/boletas/{{boletaId}}/download-pdf?format=A4
    const response = await invoicingApi.get(`/boletas/${boletaId}/download-pdf`, {
      params: { format },
      responseType: 'blob', // CRÍTICO: Para manejar la respuesta como archivo binario
    });

    // Crear un objeto URL y disparar la descarga en el navegador
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${serieCorrelativo}_${format}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Limpiar el objeto URL

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error al descargar PDF de boleta:", error.response.data);
      // Si responseType es 'blob', el error.response.data no es JSON, solo podemos reportar el estado.
      throw new Error(`Error de la API al descargar PDF. Código: ${error.response.status}`);
    }
    throw new Error('Error desconocido al descargar el PDF.');
  }
};


/**
 * Busca datos de un cliente por su número de documento (DNI) en la tabla socio_titulares de Supabase.
 * @param docNumber Número de documento del cliente (DNI).
 * @returns Datos del cliente mapeados a Client o null si no se encuentra.
 */
export const fetchClientByDocument = async (docNumber: string): Promise<Client | null> => {
  if (!docNumber || docNumber.length < 8) {
    return null;
  }
  
  try {
    // 1. Consultar la tabla socio_titulares por DNI
    const { data: socioData, error } = await supabase
      .from('socio_titulares')
      .select('*')
      .eq('dni', docNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error("Error al buscar socio en Supabase:", error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }

    if (!socioData) {
      return null; // Cliente no encontrado en la base de datos interna
    }

    // 2. Mapear los datos de SocioTitular a la estructura Client esperada por el formulario
    const clientData: Client = {
      tipo_documento: '1', // Asumimos DNI para socio_titulares
      numero_documento: socioData.dni,
      // Concatenar nombres y apellidos para la Razón Social
      razon_social: `${socioData.nombres} ${socioData.apellidoPaterno} ${socioData.apellidoMaterno}`,
      nombre_comercial: `${socioData.nombres} ${socioData.apellidoPaterno}`,
      // Priorizar dirección del DNI, si no, usar dirección de vivienda
      direccion: socioData.direccionDNI || socioData.direccionVivienda || '',
      ubigeo: socioData.ubigeo || '', 
      distrito: socioData.distritoDNI || socioData.distritoVivienda || '',
      provincia: socioData.provinciaDNI || socioData.provinciaVivienda || '',
      departamento: socioData.regionDNI || socioData.regionVivienda || '',
      telefono: socioData.celular || '',
      email: '', // Email no disponible en la tabla
    };

    return clientData;

  } catch (error) {
    console.error("Error general al buscar cliente en Supabase:", error);
    throw new Error('Error al buscar cliente en la base de datos interna.');
  }
};

/**
 * Simula la obtención de las últimas facturas/boletas para el calendario.
 */
export const fetchRecentInvoices = async (): Promise<InvoicingCalendarItem[]> => {
  // Simulación de latencia de red
  await new Promise(resolve => setTimeout(resolve, 500));

  // Datos simulados de facturación reciente
  return [
    { id: 101, type: 'Boleta', serie: 'B001-1234', clientName: 'Juan Pérez', amount: 150.00, date: '2025-07-28', status: 'Aceptado' },
    { id: 102, type: 'Factura', serie: 'F001-5678', clientName: 'Tech Solutions SAC', amount: 4500.50, date: '2025-07-27', status: 'Aceptado' },
    { id: 103, type: 'Nota Crédito', serie: 'NC01-0012', clientName: 'María Sánchez', amount: -50.00, date: '2025-07-27', status: 'Aceptado' },
    { id: 104, type: 'Boleta', serie: 'B001-1235', clientName: 'Cliente Anónimo', amount: 85.90, date: '2025-07-26', status: 'Pendiente' },
    { id: 105, type: 'Factura', serie: 'F001-5679', clientName: 'Global Corp S.A.', amount: 12000.00, date: '2025-07-25', status: 'Rechazado' },
    { id: 106, type: 'Boleta', serie: 'B001-1236', clientName: 'Pedro Gómez', amount: 25.00, date: '2025-07-25', status: 'Aceptado' },
  ];
};
