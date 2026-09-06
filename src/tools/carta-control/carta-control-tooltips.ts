export const cartaControlTooltips: Record<string, { label: string; tip: string }> = {
  title: {
    label: "Titulo",
    tip: "Nombre descriptivo de la carta de control. Aparece en el encabezado y en la exportacion.",
  },
  unit: {
    label: "Unidad",
    tip: "Unidad de medida del eje Y (por ejemplo: mm, horas, %). Se muestra junto a los valores.",
  },
  view_display: {
    label: "Vista",
    tip: "Modo de visualizacion interactiva. Pasa el cursor o enfoca un punto para ver su etiqueta, valor y comentario.",
  },
  view_edit: {
    label: "Edicion",
    tip: "Modo de edicion. Modifica los puntos, agrega comentarios y ajusta los parametros de la carta.",
  },
  limits_upper: {
    label: "Limite de control superior (LCS)",
    tip: "Valor maximo del limite de control superior. Los puntos por encima de este valor se resaltan en rojo.",
  },
  limits_lower: {
    label: "Limite de control inferior (LCI)",
    tip: "Valor minimo del limite de control inferior. Los puntos por debajo de este valor se resaltan en rojo.",
  },
  center_line: {
    label: "Linea central",
    tip: "La linea central representa el promedio del proceso. En modo automatico se calcula como la media de los puntos.",
  },
  center_line_mode: {
    label: "Modo de linea central",
    tip: "Automatico: se calcula como el promedio de los puntos. Manual: defines el valor directamente.",
  },
  x_tick: {
    label: "Paso de etiquetas (eje X)",
    tip: "Cada cuantas etiquetas del eje X se muestra una. Usa 1 para mostrar todas.",
  },
  y_tick: {
    label: "Divisiones (eje Y)",
    tip: "Numero de divisiones del eje Y. Define la cantidad de lineas de la cuadricula.",
  },
  y_range: {
    label: "Rango del eje Y",
    tip: "Minimo y maximo manuales del eje Y. Deja vacio para calcularlo automaticamente a partir de los datos.",
  },
  point_label: {
    label: "Etiqueta",
    tip: "Texto opcional que identifica el punto en el eje X (por ejemplo: Lote 1, Turno A).",
  },
  point_value: {
    label: "Valor",
    tip: "Valor numerico de la medicion para este punto.",
  },
  point_comment: {
    label: "Comentario",
    tip: "Nota opcional asociada al punto. Solo se ve al enfocar el punto con el cursor o el teclado.",
  },
  import_csv: {
    label: "Importar CSV",
    tip: "Pega datos en formato CSV (una fila por punto) para cargar varios puntos de una vez.",
  },
};
