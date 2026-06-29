export const ctqTooltips: Record<string, { label: string; tip: string }> = {
  title: {
    label: "Titulo",
    tip: "Nombre del proyecto o analisis CTQ que describes.",
  },
  need: {
    label: "Necesidad",
    tip: "Necesidad critica del cliente definida en terminos generales. Es el punto de partida del arbol CTQ. Responde a la pregunta: que es importante para el cliente?",
  },
  driver: {
    label: "Impulsor",
    tip: "Punto de transicion entre la necesidad del cliente y los requisitos. Es mas detallado que la necesidad, pero no necesita ser medible. Ayuda a desglosar una necesidad en aspectos mas concretos.",
  },
  requirement: {
    label: "Requisito",
    tip: "El desglose mas detallado de las caracteristicas criticas para la calidad. Estos requisitos deben ser medibles y especificos para poder evaluar si se cumplen.",
  },
};
