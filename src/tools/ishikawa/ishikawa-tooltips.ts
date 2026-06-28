export const ishikawaTooltips: Record<string, { label: string; tip: string }> = {
  effect: {
    label: "Efecto (problema)",
    tip: "El problema o efecto que se quiere analizar. Es la \"cabeza del pescado\". Debe ser claro y especifico para que todo el equipo lo entienda.",
  },
  category_manodeobra: {
    label: "Mano de obra",
    tip: "Personas involucradas en el proceso: operadores, personal, capacitacion, experiencia, fatiga, comunicacion.",
  },
  category_metodos: {
    label: "Metodos",
    tip: "Como se realiza el proceso: procedimientos, politicas, reglas, instrucciones de trabajo, estandares.",
  },
  category_maquinas: {
    label: "Maquinas",
    tip: "Equipos, herramientas, computadoras y tecnologia necesaria para realizar el trabajo.",
  },
  category_materiales: {
    label: "Materiales",
    tip: "Materias primas, insumos, partes, papel, etc. necesarios para producir el resultado final.",
  },
  category_mediciones: {
    label: "Mediciones",
    tip: "Datos generados del proceso usados para evaluar su calidad: calibracion, exactitud, metodos de medicion.",
  },
  category_entorno: {
    label: "Entorno",
    tip: "Condiciones en las que opera el proceso: ubicacion, temperatura, humedad, iluminacion, cultura organizacional.",
  },
  cause: {
    label: "Causa",
    tip: "Una posible causa que contribuye al efecto. Se agrupa dentro de una categoria (espina principal).",
  },
  cause_description: {
    label: "Descripcion",
    tip: "Detalles adicionales sobre esta causa. Ayuda a documentar hallazgos del analisis.",
  },
};
