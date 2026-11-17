/* ==========================================================================
   practica.js — Práctica con puntaje, organizada por temas.

   - Temas: cuadrícula con el avance de cada tema (cada celda es una pregunta) y
     práctica enfocada: comentes V/F/I, talleres y problemas de desarrollo del tema.
   - Precertamen: preguntas mezcladas de todos los temas, con tiempo y pauta al final.
   - Mi avance: temas más débiles, actividad por semana e historial de precertámenes.
   - Solo puntúa el PRIMER intento de cada pregunta. Con cuentas (cuentas.js) el avance
     se guarda en el servidor; sin cuentas, en el navegador (localStorage, con try/catch).
   Los ejercicios vienen de bancos verificados en R (tools/practica_banco*.py).
   ========================================================================== */
(function () {
  "use strict";
  // Cada página de práctica declara su bloque en el marcador (data-bloque); cada bloque guarda su propio puntaje
  let BLOQUE = "1";
  let KEY = "econometria-usm:practica-bloque1:v1";

  /* ---------------------------- Comentes ---------------------------- */
  const C = (tema, txt, v, exp, repaso) => ({ tema, txt, v, exp, repaso });
  const R2 = "../clases/clase2/", R3 = "../clases/clase3/", R4 = "../clases/clase4/", R5 = "../clases/clase5/", A1 = "../ayudantias/ayudantia1/";
  const COMENTES = [
    C("simple", "En una regresión MCO con intercepto, los residuos suman cero aunque el modelo esté mal especificado.", "V",
      ["Σûᵢ = 0 es la condición de primer orden respecto de β̂₀: se cumple siempre que haya intercepto, por construcción.",
       "Es una propiedad algebraica de MCO, no una prueba de que el modelo sea correcto: un modelo con variables omitidas también tiene residuos que suman cero."],
      [R2, "Clase 2 · lámina 20 (propiedades aritméticas)"]),
    C("simple", "Si se estima una regresión sin intercepto, los residuos de MCO también suman cero.", "F",
      ["Sin β̂₀ desaparece la condición de primer orden Σûᵢ = 0; solo queda Σxᵢûᵢ = 0.",
       "Por eso, sin intercepto los residuos en general no suman cero y la descomposición SST = SSE + SSR deja de cumplirse."],
      [R2, "Clase 2 · láminas 14, 20 y 24"]),
    C("simple", "La recta de MCO pasa por el punto (x̄, ȳ) solo cuando el R² es alto.", "F",
      ["Con intercepto, la recta de MCO <strong>siempre</strong> pasa por (x̄, ȳ): de β̂₀ = ȳ − β̂₁x̄ se obtiene ȳ = β̂₀ + β̂₁x̄.",
       "No depende del R²: pasa por ese punto aunque el ajuste sea malo."],
      [R2, "Clase 2 · lámina 20, propiedad 4"]),
    C("simple", "β̂₁ de la regresión simple es igual a la covarianza muestral entre x e y dividida por la varianza muestral de x.", "V",
      ["β̂₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)². Si divides numerador y denominador por (n − 1), obtienes Cov(x, y)/Var(x).",
       "Por eso el signo de β̂₁ es el de la covarianza entre x e y."],
      [R2, "Clase 2 · lámina 14"]),
    C("simple", "Si el salario pasa de pesos a miles de pesos, el R² de la regresión se divide por 1 000.", "F",
      ["El R² es un cociente SSE/SST: al cambiar las unidades de y, SSE y SST cambian en la misma proporción.",
       "La bondad de ajuste no depende de las unidades de medida. Lo que cambia es la escala de los coeficientes."],
      [R2, "Clase 2 · lámina 26"]),
    C("simple", "Un R² de 0.12 indica que la pendiente estimada no puede interpretarse como un efecto causal.", "F",
      ["El R² mide qué parte de la variación de y explica x en la muestra; no dice nada sobre causalidad.",
       "Que β̂₁ sea causal depende de E[u | x] = 0. Un R² bajo es común con datos individuales y es compatible con una pendiente causal bien estimada."],
      [R2, "Clase 2 · lámina 25 y la galería de R²"]),
    C("simple", "Si todos los valores de y son iguales, MCO no se puede calcular.", "F",
      ["El denominador de β̂₁ es Σ(xᵢ − x̄)²: lo que impide calcular MCO es que <strong>x</strong> no varíe (supuesto RLS 3).",
       "Si y no varía, se obtiene β̂₁ = 0 y β̂₀ = ȳ. Lo que queda indefinido es el R², porque SST = 0."],
      [R2, "Clase 2 · láminas 14 y 29"]),
    C("simple", "Si se duplica el tamaño de la muestra (y lo demás no cambia), el error estándar de β̂₁ se reduce a la mitad.", "F",
      ["Var(β̂₁) = σ²/Σ(xᵢ − x̄)². Con el doble de datos parecidos, Σ(xᵢ − x̄)² se duplica y la <strong>varianza</strong> se reduce a la mitad.",
       "El error estándar es la raíz: se divide por √2 ≈ 1.41, es decir, baja a cerca de 71% de su valor. Para reducirlo a la mitad hacen falta cuatro veces más datos."],
      [R5, "Clase 5 · lámina 19; Clase 2 · lámina 34"]),
    C("simple", "Para que β̂₁ sea insesgado en la regresión simple se necesita que el error tenga varianza constante.", "F",
      ["El insesgamiento usa los supuestos RLS 1 a 4: linealidad, muestra aleatoria, variación en x y E[u | x] = 0.",
       "La homocedasticidad (RLS 5) se necesita para la fórmula de la varianza, no para el insesgamiento."],
      [R2, "Clase 2 · láminas 31 a 34"]),
    C("simple", "Si se reemplaza x por x − x̄ (se centra la variable), la pendiente β̂₁ no cambia.", "V",
      ["En β̂₁ = Σ(xᵢ − x̄)(yᵢ − ȳ)/Σ(xᵢ − x̄)², x aparece solo como desviación respecto de su media; restarle una constante no cambia esas desviaciones.",
       "Lo que cambia es el intercepto: con x centrada, β̂₀ = ȳ."],
      [R2, "Clase 2 · lámina 14"]),
    C("multi", "Si la matriz X es de 60 × 4, el modelo tiene 4 variables explicativas además del intercepto.", "F",
      ["X es de n × (k + 1): una fila por observación y una columna por parámetro, incluida la columna de unos.",
       "Con 4 columnas hay intercepto + 3 variables explicativas (k = 3)."],
      [R4, "Clase 4 · láminas 7 y 8"]),
    C("multi", "Si un regresor es exactamente el triple de otro (x₂ = 3x₁), no se puede calcular β̂ = (XᵀX)⁻¹Xᵀy.", "V",
      ["Hay una relación lineal exacta entre columnas de X: X no tiene rango completo y XᵀX no tiene inversa.",
       "Es la violación del supuesto 3 (condición de identificación). R entrega NA para uno de los coeficientes."],
      [R5, "Clase 5 · lámina 5"]),
    C("multi", "Si dos regresores están muy correlacionados, pero no perfectamente, los estimadores MCO quedan sesgados.", "F",
      ["El supuesto 3 solo prohíbe relaciones lineales <strong>exactas</strong>. Con correlación alta, MCO sigue siendo insesgado.",
       "El costo es la precisión: la varianza de los estimadores crece mucho, porque hay poca información para separar ambos efectos."],
      [R5, "Clase 5 · simulador de multicolinealidad"]),
    C("multi", "El R² ajustado nunca puede ser mayor que el R² del mismo modelo.", "V",
      ["R̄² = 1 − [(n − 1)/(n − k − 1)]·SSR/SST y, con n > k + 1, el factor (n − 1)/(n − k − 1) es mayor o igual a 1.",
       "Por eso la parte que se resta es al menos SSR/SST, y R̄² ≤ R². Son iguales solo si k = 0 (no hay variables explicativas) o si el ajuste es perfecto (SSR = 0, R² = 1)."],
      [R4, "Clase 4 · lámina 14"]),
    C("multi", "El R² ajustado siempre está entre 0 y 1.", "F",
      ["El R² sí está entre 0 y 1. El R² ajustado puede ser <strong>negativo</strong> cuando el modelo explica poco y tiene muchas variables respecto de n.",
       "Pasa porque la penalización (n − 1)/(n − k − 1) puede hacer que el término que se resta supere 1."],
      [R4, "Clase 4 · lámina 14 y la trampa del R²"]),
    C("multi", "Con 3 observaciones, un intercepto y 2 regresores (y X de rango completo), el R² es exactamente 1.", "V",
      ["Hay tantos parámetros como observaciones (n = k + 1): el plano pasa exactamente por los 3 puntos, así que SSR = 0 y R² = 1.",
       "Pero no sirve: los grados de libertad son n − k − 1 = 0, así que σ̂² y los errores estándar no se pueden calcular."],
      [R5, "Clase 5 · lámina 15"]),
    C("multi", "En y = β₀ + β₁x₁ + β₂x₂ + u, β̂₁ coincide siempre con la pendiente de la regresión simple de y sobre x₁.", "F",
      ["Solo coinciden si x₁ y x₂ no están correlacionadas en la muestra, o si β̂₂ = 0. En general, β̃₁ = β̂₁ + β̂₂δ̂₁.",
       "Es el ejemplo de la Clase 4: la educación pasa de 0.54 a 0.37 al agregar el IQ."],
      [R4, "Clase 4 · lámina 3"]),
    C("multi", "Los errores estándar de los β̂ se leen directamente en la diagonal de σ̂²(XᵀX)⁻¹.", "F",
      ["En la diagonal están las <strong>varianzas</strong> estimadas de cada β̂ⱼ.",
       "El error estándar es su raíz cuadrada: se(β̂ⱼ) = √[σ̂²·(XᵀX)⁻¹ⱼ₊₁,ⱼ₊₁]."],
      [R5, "Clase 5 · láminas 16 a 18"]),
    C("multi", "Fuera de la diagonal de σ̂²(XᵀX)⁻¹ están las covarianzas estimadas entre los estimadores.", "V",
      ["σ̂²(XᵀX)⁻¹ es la matriz de varianzas y covarianzas: varianzas en la diagonal y covarianzas fuera de ella.",
       "El elemento (j + 1, l + 1) es Ĉov(β̂ⱼ, β̂ₗ). Se usa, por ejemplo, para testear hipótesis sobre combinaciones de parámetros."],
      [R5, "Clase 5 · lámina 16"]),
    C("multi", "σ̂² = SSR/n es un estimador insesgado de σ² en la regresión múltiple.", "F",
      ["El estimador insesgado divide por los grados de libertad: σ̂² = SSR/(n − k − 1).",
       "Se descuentan k + 1 parámetros estimados; dividir por n subestima σ² en promedio."],
      [R5, "Clase 5 · lámina 15"]),
    C("multi", "Con n = 40 observaciones y k = 3 regresores (más el intercepto), los grados de libertad de σ̂² son 37.", "F",
      ["gl = n − k − 1 = 40 − 3 − 1 = 36.",
       "Error típico: olvidar que el intercepto también es un parámetro estimado."],
      [R5, "Clase 5 · lámina 15"]),
    C("supuestos", "Bajo los supuestos 1 a 4, MCO es insesgado aunque haya heterocedasticidad.", "V",
      ["La demostración de E(β̂ | X) = β usa solo y = Xβ + u, el rango completo de X y E(u | X) = 0.",
       "La heterocedasticidad afecta la varianza de β̂, no su valor esperado."],
      [R5, "Clase 5 · lámina 12 y el laboratorio de supuestos"]),
    C("supuestos", "Para comprobar el supuesto E[u | X] = 0, basta verificar que los residuos MCO no estén correlacionados con las x.", "F",
      ["Los residuos MCO son ortogonales a las x <strong>por construcción</strong>: Σxᵢûᵢ = 0 en cualquier muestra.",
       "Por eso no revelan si el error poblacional u está relacionado con X. Como dice la lámina 7, muy pocas veces se sabe con seguridad; hay que argumentarlo."],
      [R5, "Clase 5 · lámina 7; Clase 2 · lámina 20"]),
    C("supuestos", "Con heterocedasticidad, MCO deja de ser insesgado y también deja de ser el estimador lineal insesgado de menor varianza.", "F",
      ["La afirmación es falsa porque su primera parte lo es: con los supuestos 1 a 4, MCO sigue siendo insesgado aunque haya heterocedasticidad (la demostración de la lámina 12 no usa el supuesto 5).",
       "La segunda parte sí es cierta: el Teorema de Gauss-Markov exige también el supuesto 5. Con heterocedasticidad, MCO en general deja de ser el MELI, y la fórmula Var(β̂ | X) = σ²(XᵀX)⁻¹ deja de valer, así que los errores estándar habituales quedan mal calculados."],
      [R5, "Clase 5 · láminas 11 a 13"]),
    C("supuestos", "La normalidad del error es necesaria para que MCO sea insesgado.", "F",
      ["La normalidad no figura entre los cinco supuestos clásicos: el insesgamiento usa los supuestos 1 a 4.",
       "La normalidad se agrega después para conocer la distribución exacta de β̂ y hacer tests en muestras pequeñas."],
      [R5, "Clase 5 · láminas 2 y 12"]),
    C("supuestos", "Si los datos provienen solo de quienes responden voluntariamente un formulario online, se puede violar el supuesto de muestra aleatoria.", "V",
      ["El supuesto 2 pide que las observaciones sean una muestra aleatoria de la población.",
       "Quien responde voluntariamente suele ser distinto de quien no responde: es una muestra autoseleccionada."],
      [R5, "Clase 5 · lámina 4; Clase 1 · lámina 19 (muestreo no probabilístico)"]),
    C("supuestos", "El modelo y = β₀ + β₁x + β₂x² + u viola el supuesto de linealidad.", "F",
      ["El supuesto 1 exige linealidad en los <strong>parámetros</strong>, no en las variables.",
       "x² es simplemente otra columna de X; el modelo es lineal en β₀, β₁ y β₂."],
      [R5, "Clase 5 · lámina 3"]),
    C("causal", "Si la diferencia de promedios entre tratados y no tratados es cero, el tratamiento no tiene efecto.", "F",
      ["Diferencia observada = ATT + sesgo de selección.",
       "Un efecto positivo (ATT > 0) puede quedar oculto por un sesgo de selección negativo del mismo tamaño: por ejemplo, si se tratan los que están peor."],
      [R3, "Clase 3 · Parte 1, láminas 11 y 12"]),
    C("causal", "Con asignación aleatoria del tratamiento, la diferencia de promedios estima tanto el ATE como el ATT.", "V",
      ["Al sortear, E[Yᴺᵀ | T = 1] = E[Yᴺᵀ | T = 0]: el sesgo de selección es cero.",
       "Además, tratados y no tratados son iguales en promedio, así que el efecto en los tratados coincide con el de la población: β = ATE = ATT."],
      [R3, "Clase 3 · Parte 1, láminas 15 y 16"]),
    C("causal", "El sesgo de selección se calcula con los datos observados, restando los promedios de Y de tratados y no tratados.", "F",
      ["Esa resta es la <strong>diferencia observada</strong>, que mezcla el ATT con el sesgo.",
       "El sesgo de selección es E[Yᴺᵀ | T = 1] − E[Yᴺᵀ | T = 0], y E[Yᴺᵀ | T = 1] es un contrafactual: no se observa."],
      [R3, "Clase 3 · Parte 1, láminas 5, 6 y 11"]),
    C("causal", "Si los pacientes más graves son los que más acuden al hospital, comparar la salud de quienes van y no van subestima el beneficio del hospital.", "V",
      ["Sin hospital, quienes van estarían peor que quienes no van: E[Yᴺᵀ | T = 1] < E[Yᴺᵀ | T = 0] (si Y es salud). El sesgo es negativo.",
       "Diferencia = ATT + sesgo negativo: la comparación simple subestima el efecto, e incluso puede parecer que el hospital empeora la salud."],
      [R3, "Clase 3 · Parte 1, láminas 11 a 13 y el caso del hospital"]),
    C("causal", "Omitir una variable que afecta a y, pero que no está relacionada con x₁, sesga la estimación de β₁.", "F",
      ["β̃₁ = β₁ + β₂δ₁. Si la omitida no se relaciona con x₁, δ₁ = 0 y el sesgo es cero.",
       "Omitirla solo aumenta la varianza del error, lo que afecta la precisión, no el insesgamiento."],
      [R3, "Clase 3 · Parte 2, lámina 5"]),
    C("causal", "Si β₂ < 0 y δ₁ < 0, la regresión corta subestima el efecto de x₁.", "F",
      ["El sesgo es β₂δ₁: negativo por negativo da <strong>positivo</strong>.",
       "La regresión corta sobreestima el efecto: es el caso 2 de la tabla de signos."],
      [R3, "Clase 3 · Parte 2, lámina 6"]),
    C("causal", "Agregar como control una variable irrelevante (β = 0 en la población) que está correlacionada con x₁ sesga β̂₁.", "F",
      ["Incluir variables irrelevantes no afecta el insesgamiento.",
       "El costo es que aumenta la varianza de β̂₁: la variable compite con x₁ sin aportar información."],
      [R3, "Clase 3 · Parte 2, lámina 10"]),
    C("causal", "Agregar un control a la regresión reduce el sesgo del coeficiente de interés.", "I",
      ["Depende del control. Si es la variable omitida relevante y correlacionada con x₁, y es la única omitida, incluirla elimina el sesgo (lámina 7).",
       "Si el control es irrelevante, el sesgo no cambia y la varianza aumenta (lámina 10). Y si quedan otras variables omitidas, agregar una sola no garantiza que el sesgo baje: rara vez observamos todas (lámina 12)."],
      [R3, "Clase 3 · Parte 2, láminas 7, 10 y 12"]),
    C("causal", "Una correlación alta entre x e y, junto con un R² alto, permite interpretar β̂₁ como un efecto causal.", "F",
      ["Correlación no es causalidad: la relación puede deberse a un tercer factor (helados, tiburones y temperatura).",
       "La interpretación causal depende de E[u | x] = 0, que el R² no puede verificar."],
      [R3, "Clase 3 · Parte 1, lámina 1; Clase 1 · láminas 4 a 6"]),
    C("causal", "Comparar a las mismas personas antes y después de un programa entrega su contrafactual.", "F",
      ["El contrafactual es el resultado que <strong>esas mismas personas, en ese mismo momento</strong>, habrían tenido sin el programa.",
       "Entre antes y después cambian muchas otras cosas (la economía, la edad, la experiencia), así que el antes no es el contrafactual."],
      [R3, "Clase 3 · Parte 1, lámina 2"]),
    C("estadistica", "Con los mismos datos, un intervalo de confianza de 99% es más angosto que uno de 95%.", "F",
      ["Más confianza exige un z mayor (2.576 contra 1.96), así que el intervalo es <strong>más ancho</strong>.",
       "Hay un trade-off entre confianza y precisión."],
      [A1, "Ayudantía 1 · Parte 2, láminas 9 a 13"]),
    C("estadistica", "Para reducir a la mitad el margen de error de un IC para μ (con σ conocido), hay que cuadruplicar el tamaño muestral.", "V",
      ["El margen es z·σ/√n. Para dividirlo por 2, √n debe duplicarse, es decir, n debe multiplicarse por 4.",
       "Por eso ganar precisión es caro."],
      [A1, "Ayudantía 1 · Parte 2, lámina 14"]),
    C("estadistica", "Si el IC de 95% para μₓ − μᵧ es (−3; 12), hay evidencia al 5% de que las medias poblacionales son distintas.", "F",
      ["El intervalo <strong>contiene al cero</strong>: la diferencia μₓ − μᵧ = 0 es un valor plausible.",
       "Habría evidencia de diferencia solo si el intervalo completo estuviera sobre o bajo el cero."],
      [A1, "Ayudantía 1 · Parte 2, láminas 25 a 34"]),
    C("estadistica", "El Teorema Central del Límite garantiza que, con n grande, los datos de la muestra se distribuyen normal.", "F",
      ["El TCL habla de la distribución del <strong>promedio</strong> X̄, no de los datos: X̄ es aproximadamente N(μ, σ²/n).",
       "Los datos conservan la forma de la población, por ejemplo asimétrica."],
      [A1, "Ayudantía 1 · Parte 2, láminas 3 y 4"]),
    C("estadistica", "Una muestra de 100 000 personas siempre es más representativa que una de 1 000.", "F",
      ["La representatividad depende de <strong>cómo</strong> se elige la muestra, no de su tamaño.",
       "Una muestra aleatoria de 1 000 personas puede ser mejor que una enorme pero sesgada, como la del Literary Digest."],
      ["../clases/clase1/", "Clase 1 · láminas 12 a 19"]),
  ];
  const TEMAS = [
    ["todos", "Todos"], ["simple", "Regresión simple"], ["multi", "Múltiple y matrices"], ["supuestos", "Supuestos"],
    ["causal", "Causalidad y sesgo"], ["estadistica", "Estadística e IC"],
  ];
  const VERED = { V: "Verdadero", F: "Falso", I: "Incierto" };
  const NIVELES = [[0, "🐣 Recién llegado"], [60, "📏 Aprendiz de MCO"], [180, "🔍 Detective del sesgo"], [360, "📊 Analista de regresiones"],
    [600, "🧠 Maestro de Gauss-Markov"], [900, "🏆 Leyenda de la econometría"]];

  /* ---------------------------- Temario: cada tema agrupa sus comentes y sus talleres ---------------------------- */
  const TEMARIO = {
    "1": [
      { k: "estadistica", t: "Repaso de estadística", d: "Estadística descriptiva, intervalos de confianza y tamaño muestral", clase: "Clase 1 y Ayudantía 1", c: "estadistica", talleres: ["descriptiva", "ic", "tamano"] },
      { k: "simple", t: "Regresión simple y MCO", d: "Estimar, interpretar y descomponer la varianza con un regresor", clase: "Clase 2", c: "simple", talleres: ["simple", "resumen", "residuos", "unidades"] },
      { k: "causal", t: "Causalidad y sesgo", d: "Outcomes potenciales, sesgo de selección y variable omitida", clase: "Clase 3", c: "causal", talleres: ["causal", "ovb"] },
      { k: "multi", t: "Regresión múltiple y matrices", d: "MCO con matrices, (XᵀX)⁻¹ y comparación de modelos", clase: "Clase 4 y Ayudantía 4", c: "multi", talleres: ["matriz2", "multi", "comparar"] },
      { k: "supuestos", t: "Supuestos y propiedades de MCO", d: "Insesgamiento, varianza y teorema de Gauss-Markov", clase: "Clase 5", c: "supuestos", talleres: [] },
    ],
    "2": [
      { k: "interpretacion", t: "Interpretación de modelos", d: "Logaritmos, cuadráticas, interacciones y cambio de escala", clase: "Clase 6", c: "interpretacion", talleres: ["logs", "cuadratica", "interaccion", "reescala", "caso_interp"] },
      { k: "t", t: "Inferencia sobre un parámetro", d: "Test t, intervalos, valores-p y errores tipo I y II", clase: "Clase 7", c: "t", talleres: ["ttest", "pvalor", "errores"] },
      { k: "combinacion", t: "Combinaciones de parámetros", d: "Testear β₁ = β₂ y otras restricciones lineales", clase: "Clase 8", c: "combinacion", talleres: ["combinacion", "caso_comb"] },
      { k: "f", t: "Test F", d: "Restricciones de exclusión y significancia global", clase: "Clase 9", c: "f", talleres: ["ftest", "fglobal", "caso_f"] },
    ],
    "3": [
      { k: "asintotica", t: "Propiedades asintóticas", d: "Consistencia, sesgo asintótico y muestras grandes", clase: "Clase 10", c: "asintotica", talleres: ["ovb_asint", "asint"] },
      { k: "binarias", t: "Variables binarias", d: "Dummies, categoría base e interacciones", clase: "Clase 11", c: "binarias", talleres: ["dummies", "dumint"] },
      { k: "chowmpl", t: "Test de Chow y probabilidad lineal", d: "Comparar grupos y modelar variables dependientes binarias", clase: "Clase 11", c: "chowmpl", talleres: ["chow", "mpl", "caso_chow"] },
      { k: "hetero", t: "Heterocedasticidad", d: "Consecuencias, Breusch-Pagan, White y errores robustos", clase: "Clase 12", c: "hetero", talleres: ["bp", "robust", "caso_hetero"] },
      { k: "iv", t: "Variables instrumentales", d: "Endogeneidad, instrumentos válidos y MC2E", clase: "Clase 12", c: "iv", talleres: ["iv", "caso_iv"] },
    ],
  };

  /* ---------------------------- Estado ---------------------------- */
  // hechos: primer intento de cada pregunta (comentes: "ok"/"bad"; ejercicios: puntos obtenidos)
  // estado: "ok" | "bad" | "sol" (solución vista) para pintar las cuadrículas; ptsItem: puntos de cada pregunta
  const vacio = () => ({ pts: 0, resp: 0, ok: 0, racha: 0, mejor: 0, hechos: {}, estado: {}, ptsItem: {}, bonos: 0, sims: [], ses: [], filas: [] });
  let S = vacio();
  let CUENTA = null; // con cuentas activas: { id } del estudiante; el puntaje sale de sus datos guardados en el servidor
  function cargarEstado(bloque, cuenta, datos) {
    BLOQUE = bloque;
    CUENTA = cuenta || null;
    KEY = CUENTA ? `econometria-usm:practica-bloque${bloque}:${CUENTA.id}:v2` : `econometria-usm:practica-bloque${bloque}:v1`;
    S = vacio();
    if (datos) {
      (datos.filas || []).forEach((r) => {
        S.resp++;
        if (r.correcta) { S.ok++; S.racha++; S.mejor = Math.max(S.mejor, S.racha); } else S.racha = 0;
        S.pts += r.puntos;
        S.hechos[r.item] = r.tipo === "comente" ? (r.correcta ? "ok" : "bad") : r.puntos;
        S.estado[r.item] = r.tipo === "solucion" ? "sol" : r.correcta ? "ok" : "bad";
        S.ptsItem[r.item] = r.puntos;
        S.filas.push({ t: r.creado, ok: !!r.correcta, tipo: r.tipo, tema: r.tema });
      });
      S.sims = datos.simulacros || [];
      S.bonos = S.sims.reduce((s, x) => s + (x.puntos || 0), 0);
      S.pts += S.bonos;
      S.ses = datos.sesiones || [];
      return;
    }
    try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(vacio(), JSON.parse(raw)); } catch (e) { /* sin almacenamiento: se juega igual */ }
    Object.entries(S.hechos).forEach(([k, v]) => { if (!S.estado[k]) S.estado[k] = v === "ok" || v > 0 ? "ok" : "bad"; }); // datos locales antiguos
  }
  const DATOS = () => ({
    "2": [window.PRACTICA_COMENTES2, window.PRACTICA_TEMAS2, window.PRACTICA_BANCO2, window.PRACTICA_TALLERES2],
    "3": [window.PRACTICA_COMENTES3, window.PRACTICA_TEMAS3, window.PRACTICA_BANCO3, window.PRACTICA_TALLERES3],
  })[BLOQUE];
  const comentesDe = () => (DATOS() ? DATOS()[0] || [] : COMENTES);
  const temasDe = () => (DATOS() ? DATOS()[1] || TEMAS : TEMAS);
  const bancoDe = () => (DATOS() ? DATOS()[2] : window.PRACTICA_BANCO) || {};
  const talleresDe = () => (DATOS() ? DATOS()[3] || [] : TALLERES);
  const etiquetaTaller = (k) => (talleresDe().find((t) => t[0] === k) || [k, k])[1];
  const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* nada */ } };
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const boton = (cls, html, fn) => { const b = h("button", cls, html); b.type = "button"; if (fn) b.addEventListener("click", fn); return b; };

  // Avisos de cambio (para repintar marcador y cuadrículas); cada vista se suscribe con la señal de su AbortController
  const oyentes = new Set();
  const escuchar = (fn, signal) => { oyentes.add(fn); if (signal) signal.addEventListener("abort", () => oyentes.delete(fn)); };
  const avisar = (d) => oyentes.forEach((fn) => { try { fn(d || {}); } catch (e) { /* una vista caída no detiene las demás */ } });

  function sumar(puntos, correcta, info) {
    if (CUENTA && info && window.EconCuentas) window.EconCuentas.guardar({ bloque: +BLOQUE, tipo: info.tipo, item: info.item, tema: info.tema || null, correcta: !!correcta, puntos });
    S.resp++;
    if (correcta) { S.ok++; S.racha++; S.mejor = Math.max(S.mejor, S.racha); } else S.racha = 0;
    S.pts += puntos;
    if (info) {
      S.estado[info.item] = info.tipo === "solucion" ? "sol" : correcta ? "ok" : "bad";
      S.ptsItem[info.item] = puntos;
      S.filas.push({ t: new Date().toISOString(), ok: !!correcta, tipo: info.tipo, tema: info.tema });
    }
    guardar();
    avisar({ delta: puntos });
  }

  /* ---------------------------- Índice del bloque y cuadrículas ---------------------------- */
  function indice() {
    const comentes = comentesDe().map((c, i) => Object.assign({ id: "c" + i }, c));
    const banco = bancoDe();
    return (TEMARIO[BLOQUE] || []).map((t) => {
      const grupos = [{ k: "comentes", lab: "Comentes", items: comentes.filter((c) => c.tema === t.c).map((c) => c.id) }]
        .concat(t.talleres.filter((k) => banco[k]).map((k) => ({ k, lab: etiquetaTaller(k), items: banco[k].map((e) => e.id) })))
        .filter((g) => g.items.length);
      return Object.assign({}, t, { grupos, ids: grupos.flatMap((g) => g.items) });
    });
  }
  function resumenIds(ids) {
    let r = 0, ok = 0, bad = 0, pts = 0;
    ids.forEach((id) => { const e = S.estado[id]; if (!e) return; r++; if (e === "ok") ok++; else if (e === "bad") bad++; pts += S.ptsItem[id] || 0; });
    return { total: ids.length, r, ok, bad, pts, acc: ok + bad ? Math.round((100 * ok) / (ok + bad)) : null };
  }
  const ESTADO_TXT = { ok: "correcta", bad: "incorrecta", sol: "solución vista" };
  function celdas(t, grande) {
    const rs = resumenIds(t.ids);
    return `<div class="pr-celdas${grande ? " is-grande" : ""}" role="img" aria-label="${rs.r} de ${rs.total} preguntas respondidas, ${rs.ok} correctas">` +
      t.grupos.map((g) => {
        const rg = resumenIds(g.items);
        return `<span class="pr-celdas-g" title="${g.lab}: ${rg.r} de ${rg.total} respondidas">` +
          g.items.map((id) => `<i${S.estado[id] ? ` class="is-${S.estado[id]}"` : ""}></i>`).join("") + "</span>";
      }).join("") + "</div>";
  }
  const leyendaHTML = () => '<p class="pr-leyenda"><span><i></i>pendiente</span><span><i class="is-ok"></i>correcta</span>' +
    '<span><i class="is-bad"></i>incorrecta</span><span><i class="is-sol"></i>solución vista</span></p>';

  /* ---------------------------- Marcador ---------------------------- */
  function nivel(p) {
    let i = 0;
    while (i + 1 < NIVELES.length && p >= NIVELES[i + 1][0]) i++;
    return i;
  }
  const MARCADOR = '<div class="pr-strip-pts"><span class="pr-ptsbox"><strong class="pr-pts">0</strong></span><span class="pr-k">puntos</span></div>' +
    '<div class="pr-strip-nivel"><span class="pr-nivel"></span><div class="pr-bar"><span></span></div><span class="pr-sig"></span></div>' +
    '<div class="pr-strip-dato"><strong class="pr-acc"></strong><span class="pr-k">aciertos al primer intento</span></div>' +
    '<div class="pr-strip-dato"><strong class="pr-racha"></strong><span class="pr-k">racha de aciertos</span></div>';
  function pintarMarcador(m, delta) {
    const i = nivel(S.pts), sig = NIVELES[i + 1];
    const pct = sig ? Math.round((100 * (S.pts - NIVELES[i][0])) / (sig[0] - NIVELES[i][0])) : 100;
    m.querySelector(".pr-pts").textContent = S.pts;
    m.querySelector(".pr-nivel").textContent = NIVELES[i][1];
    m.querySelector(".pr-bar > span").style.width = pct + "%";
    m.querySelector(".pr-sig").textContent = sig ? `${sig[0] - S.pts} pts para ${sig[1]}` : "Nivel máximo";
    m.querySelector(".pr-acc").textContent = S.resp ? `${Math.round((100 * S.ok) / S.resp)}% (${S.ok}/${S.resp})` : "—";
    m.querySelector(".pr-racha").textContent = `${S.racha} (mejor ${S.mejor})`;
    if (delta) {
      const f = h("span", "pr-float " + (delta > 0 ? "is-up" : ""), (delta > 0 ? "+" : "") + delta);
      m.querySelector(".pr-ptsbox").append(f);
      setTimeout(() => f.remove(), 1200);
    }
  }

  /* ---------------------------- Comentes ---------------------------- */
  function barajar(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const escribiendo = (ev) => /^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName) || ev.target.isContentEditable || ev.metaKey || ev.ctrlKey || ev.altKey;

  // opts.tema: muestra solo los comentes de ese tema (sin filtros); opts.signal: limpia los atajos de teclado al cambiar de vista
  function montarComentes(z, opts = {}) {
    const fijo = opts.tema || null;
    const chips = h("div", "pr-chips");
    const card = h("div", "pr-card pr-comente");
    const nav = h("div", "pr-nav");
    if (!fijo) z.append(chips);
    z.append(card, nav);
    let tema = fijo || "todos", lista = [], pos = 0;
    if (!fijo) temasDe().forEach(([k, lab]) => {
      const b = boton("pr-chip" + (k === tema ? " is-on" : ""), lab, () => { tema = k; chips.querySelectorAll(".pr-chip").forEach((x) => x.classList.toggle("is-on", x === b)); armar(); });
      chips.append(b);
    });
    const prev = boton("econ-btn econ-btn-ghost", "Anterior", () => { pos = Math.max(0, pos - 1); pintar(); });
    const next = boton("econ-btn", "Siguiente", () => { pos = Math.min(lista.length - 1, pos + 1); pintar(); });
    const pendiente = boton("econ-btn econ-btn-ghost", "Próximo sin responder", () => {
      const j = lista.findIndex((c, i) => i > pos && !S.hechos[c.id]);
      const k = j >= 0 ? j : lista.findIndex((c) => !S.hechos[c.id]);
      if (k >= 0) { pos = k; pintar(); }
    });
    nav.append(prev, next, pendiente, h("span", "pr-atajos", "Atajos: <kbd>V</kbd> <kbd>F</kbd> <kbd>I</kbd> para responder, <kbd>←</kbd> <kbd>→</kbd> para moverte"));

    function armar() {
      lista = comentesDe().map((c, i) => Object.assign({ id: "c" + i }, c)).filter((c) => tema === "todos" || c.tema === tema);
      const i = lista.findIndex((c) => !S.hechos[c.id]);
      pos = i >= 0 ? i : 0;
      pintar();
    }
    function pintar() {
      const c = lista[pos];
      if (!c) { card.innerHTML = '<p class="pr-nota">No hay comentes en este tema.</p>'; return; }
      const hecho = S.hechos[c.id];
      prev.disabled = pos === 0;
      next.disabled = pos === lista.length - 1;
      pendiente.disabled = !lista.some((x) => !S.hechos[x.id]);
      card.innerHTML = `<div class="pr-meta"><span>Comente ${pos + 1} de ${lista.length}</span>` +
        (hecho ? `<span class="pr-tag ${hecho === "ok" ? "is-ok" : "is-bad"}">${hecho === "ok" ? "Acertado" : "Fallado"} en tu primer intento</span>` : '<span class="pr-tag is-gold">+10 pts</span>') + "</div>" +
        `<p class="pr-stmt">${c.txt}</p>`;
      const ops = h("div", "pr-vfi");
      const exp = h("div", "pr-exp");
      exp.setAttribute("aria-live", "polite");
      ["V", "F", "I"].forEach((v) => {
        const b = boton("pr-vfi-btn", `<kbd>${v}</kbd>${VERED[v]}`, () => responder(c, v, ops, exp));
        b.dataset.v = v;
        ops.append(b);
      });
      card.append(ops, exp);
      card.classList.remove("is-in"); void card.offsetWidth; card.classList.add("is-in");
    }
    function responder(c, v, ops, exp) {
      const ok = v === c.v;
      ops.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
        if (b.dataset.v === c.v) b.classList.add("is-right");
        else if (b.dataset.v === v) b.classList.add("is-wrong");
      });
      let extra = "";
      if (!S.hechos[c.id]) {
        const bono = ok && S.racha >= 2 ? Math.min(10, 2 * S.racha) : 0;
        S.hechos[c.id] = ok ? "ok" : "bad";
        sumar(ok ? 10 + bono : 0, ok, { tipo: "comente", item: c.id, tema: c.tema });
        extra = ok ? `+10 pts${bono ? `, más ${bono} por racha 🔥` : ""}` : "0 pts, la racha vuelve a 0";
        const tag = card.querySelector(".pr-tag.is-gold");
        if (tag) { tag.className = "pr-tag " + (ok ? "is-ok" : "is-bad"); tag.textContent = ok ? "Acertado en tu primer intento" : "Fallado en tu primer intento"; }
      }
      exp.innerHTML = `<p class="pr-veredicto ${ok ? "is-ok" : "is-bad"}">${ok ? "Correcto." : "No."} La respuesta es <strong>${VERED[c.v]}</strong>.` +
        `${extra ? ` <span class="pr-mini-pts">${extra}</span>` : ""}</p>` +
        `<ul>${c.exp.map((x) => `<li>${x}</li>`).join("")}</ul>` +
        `<p class="pr-repaso">Repasa en <a href="${c.repaso[0]}">${c.repaso[1]}</a></p>`;
      next.focus({ preventScroll: true });
    }
    // En la fase de captura de window, antes que los atajos de MkDocs Material (F y S abren el buscador)
    if (opts.signal) addEventListener("keydown", (ev) => {
      if (!z.isConnected || z.offsetParent === null || escribiendo(ev)) return;
      const k = ev.key.toLowerCase();
      let b = null;
      if (k.length === 1 && "vfi".includes(k)) b = card.querySelector(`.pr-vfi-btn[data-v="${k.toUpperCase()}"]`);
      else if (ev.key === "ArrowRight") b = next;
      else if (ev.key === "ArrowLeft") b = prev;
      if (!b) return;
      ev.preventDefault(); ev.stopImmediatePropagation();
      if (!b.disabled) b.click();
    }, { signal: opts.signal, capture: true });
    armar();
  }

  /* ---------------------------- Talleres numéricos ---------------------------- */
  const num = (s) => {
    const t = String(s).trim().replace(/\s+/g, "").replace(",", ".").replace("−", "-");
    return t === "" || !/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(t) ? null : parseFloat(t);
  };
  const tol = (q) => (q.exacto ? 1e-9 : Math.max(0.5 * 10 ** -(q.dec ?? 2) + 1e-9, 0.002 * Math.abs(q.ans)));
  const f = (v) => String(v).replace(/\.0$/, "");

  function tabla(cab, filas) {
    // Con clase propia: Material no envuelve ni re-estiliza tablas que ya tienen clase
    return `<div class="pr-tabla"><table class="pr-t"><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr>` +
      filas.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + "</table></div>";
  }
  function matriz(M, pre) {
    return `<span class="pr-mat-wrap">${pre}<span class="econ-mat"><table class="pr-m">${M.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</table></span></span>`;
  }

  const ENUNCIADO = {
    caso_interp: (e) => `<p class="pr-caso">🧩 Problema de desarrollo · Clases 6, 7 y 9</p>` +
      `<p>Con n = <strong>${e.n}</strong> observaciones se estimó (errores estándar entre paréntesis solo para β̂₁):</p>` +
      `<p class="pr-eq">${e.v_y}̂ = β̂₀ + <strong>${e.b1}</strong> ${e.v_x1} <span class="pr-se">(${e.se1})</span> + <strong>${e.b2}</strong> ${e.v_x2} ` +
      `<strong>${e.b3 < 0 ? "−" : "+"} ${Math.abs(e.b3)}</strong> ${e.v_x2}² ${e.b4 < 0 ? "−" : "+"} <strong>${Math.abs(e.b4)}</strong> ${e.v_d}</p>` +
      `<p>R² = ${e.r2}. ${e.v_d} es una variable binaria (1 = sí). Responde en orden: cada parte usa las anteriores.</p>` +
      `<p class="pr-nota">Valores críticos: t(${e.n - 5}) dos colas 5% = ${e.crit}; F(4, ${e.n - 5}) 5% = ${e.fcr}. Los porcentajes se escriben sin el signo % (por ejemplo, 8,5).</p>`,
    caso_comb: (e) => `<p class="pr-caso">🧩 Problema de desarrollo · Clase 8</p>` +
      (e.sub === "diff"
        ? `<p>En log(salario) = β₀ + β₁·<strong>años en educación técnica</strong> + β₂·<strong>años en universidad</strong> + β₃·exper + u se quiere saber si un año de educación técnica rinde lo mismo que uno de universidad.</p>`
        : `<p>En una función de producción log(producción) = β₀ + β₁·log(capital) + β₂·log(trabajo) + u se quiere testear <strong>rendimientos constantes a escala</strong>.</p>`) +
      `<p>β̂₁ = <strong>${e.b1}</strong>, β̂₂ = <strong>${e.b2}</strong>, Var(β̂₁) = ${e.v1}, Var(β̂₂) = ${e.v2}, Cov(β̂₁, β̂₂) = ${e.cov}; ${e.gl} grados de libertad.</p>` +
      `<p>H₀: <strong>${e.sub === "diff" ? "β₁ = β₂" : "β₁ + β₂ = 1"}</strong> contra H₁: ≠. Define θ de modo que H₀ sea θ = 0.</p>` +
      `<p class="pr-nota">Valor crítico de t con ${e.gl} gl (dos colas, 5%) = ${e.crit}. Puedes escribir números pequeños como 0,000123 o 1,23e-4.</p>`,
    caso_f: (e) => `<p class="pr-caso">🧩 Problema de desarrollo · Clase 9</p>` +
      `<p>Con n = <strong>${e.n}</strong> se estimó un modelo con k = <strong>${e.kk}</strong> variables explicativas (SSR_ur = <strong>${e.ssru}</strong>). ` +
      `Luego se excluyeron <strong>${e.j}</strong> de ellas (SSR_r = <strong>${e.ssrr}</strong>). La suma total de cuadrados de y es SST = ${e.sst}.</p>` +
      `<p class="pr-nota">F(${e.j}, ${e.n - e.kk - 1}): al 5% = ${e.c5}; al 1% = ${e.c1}.</p>`,
    ovb_asint: (e) => `<p>El modelo verdadero es <strong>${e.y}</strong> = β₀ + β₁·<strong>${e.x1}</strong> + β₂·<strong>${e.x2}</strong> + u, con β₁ = ${e.b1} y β₂ = ${e.b2}, ` +
      `pero ${e.x2} no se observa y se estima la regresión de ${e.y} solo sobre ${e.x1}.</p>` +
      `<p>En la población, Var(${e.x1}) = ${e.v1} y Cov(${e.x1}, ${e.x2}) = ${e.c12}.</p>`,
    asint: (e) => `<p>Con n = <strong>${e.n0}</strong> se estimó β̂ = <strong>${e.b}</strong> con se = <strong>${e.se0}</strong>, y no fue significativo.</p>` +
      `<p>Se repite el estudio con n = <strong>${e.n1}</strong> y se obtiene el mismo β̂. Usa la aproximación normal (n grande).</p>` +
      `<p class="pr-nota">Valor crítico normal, dos colas al ${Math.round(100 * e.alfa)}%: z = ${e.z}.</p>`,
    dummies: (e) => `<p>Se estimó, con <strong>${e.cats[0]}</strong> como categoría base de ${e.cat}:</p>` +
      `<p class="pr-eq">${e.y}̂ = ${e.b0} ${e.d.map((d, i) => `${d < 0 ? "−" : "+"} ${Math.abs(d)}·${e.cats[i + 1]}`).join(" ")} + ${e.bx}·${e.x}</p>` +
      `<p class="pr-nota">${e.cats.slice(1).join(", ")} son variables binarias (1 si pertenece a esa categoría).</p>`,
    dumint: (e) => `<p>Se estimó, con mujer = 1 para mujeres:</p>` +
      `<p class="pr-eq">log(salario)̂ = ${e.b0} ${e.d0 < 0 ? "−" : "+"} ${Math.abs(e.d0)}·mujer + ${e.b1}·educ ${e.d1 < 0 ? "−" : "+"} ${Math.abs(e.d1)}·mujer·educ</p>` +
      `<p class="pr-nota">Los porcentajes se escriben sin el signo % (por ejemplo, −4,2).</p>`,
    chow: (e) => `<p>Se quiere saber si un mismo modelo con <strong>k = ${e.kk}</strong> variables explicativas sirve para <strong>${e.g1}</strong> y <strong>${e.g2}</strong>.</p>` +
      tabla(["Regresión", "n", "SSR"], [[`Solo ${e.g1}`, e.n1, e.s1], [`Solo ${e.g2}`, e.n2, e.s2], ["Todos juntos", e.n1 + e.n2, e.sp]]) +
      `<p class="pr-nota">Valor crítico F(${e.kk + 1}, ${e.n1 + e.n2 - 2 * (e.kk + 1)}) al 5% = ${e.crit}.</p>`,
    mpl: (e) => `<p>Modelo de probabilidad lineal para <strong>${e.y}</strong> (1 = sí):</p>` +
      `<p class="pr-eq">P̂ = ${e.b0} + ${e.b1}·(${e.x1}) ${e.b2 < 0 ? "−" : "+"} ${Math.abs(e.b2)}·(${e.x2})</p>` +
      tabla(["", e.x1, e.x2], [["Persona A", e.a[0], e.a[1]], ["Persona B", e.bb[0], e.bb[1]]]),
    bp: (e) => `<p>Para detectar heterocedasticidad en un modelo con <strong>k = ${e.kk}</strong> variables y <strong>n = ${e.n}</strong>, se regresó û² sobre las ${e.kk} variables explicativas. ` +
      `El R² de esa regresión auxiliar es <strong>${e.r2}</strong>.</p>` +
      `<p class="pr-nota">Críticos al 5%: χ²(${e.kk}) = ${e.cl}; F(${e.kk}, ${e.n - e.kk - 1}) = ${e.cf}.</p>`,
    robust: (e) => `<p>En una muestra grande se estimó β̂ = <strong>${e.b}</strong>. El error estándar usual es <strong>${e.se}</strong> y el robusto a heterocedasticidad (White) es <strong>${e.ser}</strong>.</p>` +
      `<p class="pr-nota">Usa el valor crítico normal 1.96 (dos colas, 5%).</p>`,
    iv: (e) => e.sub === "cov"
      ? `<p>Se quiere estimar el efecto de <strong>${e.x}</strong> sobre <strong>${e.y}</strong>, usando <strong>${e.z}</strong> como instrumento. Con los datos (en desviaciones respecto de la media):</p>` +
        tabla(["S_xx", "S_xy", "S_zx", "S_zy"], [[e.sxx, e.sxy, e.szx, e.szy]])
      : `<p>Se quiere estimar el efecto de <strong>${e.x}</strong> sobre <strong>${e.y}</strong> con un instrumento binario z (1 = ${e.z} alto).</p>` +
        tabla(["Grupo", `media de ${e.x}`, `media de ${e.y}`], [["z = 1", e.x1, e.y1], ["z = 0", e.x0, e.y0]]),
    caso_hetero: (e) => `<p class="pr-caso">🧩 Problema de desarrollo · Clase 12</p>` +
      `<p>Un modelo con k = <strong>${e.kk}</strong> variables y n = <strong>${e.n}</strong> entrega para la variable de interés β̂ = <strong>${e.b}</strong>, ` +
      `con se usual = <strong>${e.se}</strong> y se robusto = <strong>${e.ser}</strong>. La regresión auxiliar de Breusch-Pagan (û² sobre las k variables) tiene R² = <strong>${e.r2}</strong>.</p>` +
      `<p class="pr-nota">Críticos al 5%: χ²(${e.kk}) = ${e.cl}; normal (dos colas) = 1.96.</p>`,
    caso_iv: (e) => `<p class="pr-caso">🧩 Problema de desarrollo · Clase 12</p>` +
      `<p>En la regresión simple de <strong>${e.y}</strong> sobre <strong>${e.x}</strong> (n grande), se instrumenta ${e.x} con <strong>${e.z}</strong>.</p>` +
      tabla(["SST_x", "σ̂²", "R² de x sobre z", "β̂ por VI", "β̂ por MCO"], [[e.sst, e.s2, e.r2xz, e.bv, e.bm]]) +
      `<p class="pr-nota">Usa σ̂² para ambos errores estándar y 1.96 como crítico (dos colas, 5%).</p>`,
    caso_chow: (e) => `<p class="pr-caso">🧩 Problema de desarrollo · Clase 11</p>` +
      `<p>Para y = β₀ + β₁·educ + β₂·exper + u (k = 2) se estimó por separado para dos grupos (D = 1 para el grupo 2) y para todos juntos:</p>` +
      tabla(["Regresión", "n", "SSR", "Intercepto", "Pendiente de educ"], [["Grupo 1 (D = 0)", e.n1, e.s1, e.a1, e.p1], ["Grupo 2 (D = 1)", e.n2, e.s2, e.a2, e.p2], ["Todos", e.n1 + e.n2, e.sp, "—", "—"]]) +
      `<p>Luego se plantea un único modelo con D y D·educ (y D·exper) que reproduce ambas regresiones.</p>` +
      `<p class="pr-nota">Valor crítico F(3, ${e.n1 + e.n2 - 6}) al 5% = ${e.crit}.</p>`,
    simple: (e) => `<p>Se quiere explicar <strong>${e.y_lab}</strong> con <strong>${e.x_lab}</strong> mediante y = β₀ + β₁x + u, con la muestra:</p>` +
      tabla(["", ...e.nombres], [["x", ...e.x], ["y", ...e.y]]) +
      "<p>Calcula a mano (con calculadora) las estimaciones MCO y la descomposición de la varianza.</p>",
    multi: (e) => `<p><strong>${e.titulo}.</strong> Se estima y = β₀ + β₁x₁ + β₂x₂ + u, donde ${e.y_lab}, ${e.x1_lab} y ${e.x2_lab}.</p>` +
      tabla(["Obs.", "x₁", "x₂", "y"], e.x1.map((v, i) => [i + 1, v, e.x2[i], e.y[i]])) +
      `<div class="pr-matline">Se sabe que ${matriz(e.adj, `(XᵀX)⁻¹ = (1/${e.d}) ·`)}</div>` +
      `<details class="pr-pista"><summary>💡 Pista: Xᵀy</summary><p>Xᵀy = (${e.Xty.join(", ")}): la suma de y, la de x₁·y y la de x₂·y.</p></details>`,
    causal: (e) => `<p>${e.contexto} Activamos el <strong>modo Dios</strong>: vemos los dos outcomes potenciales de ${e.nombres.length} personas, algo imposible en la vida real. ` +
      `Yᵢ = ${e.y_lab}; Tᵢ = 1 si recibió el ${e.trat}.</p>` +
      tabla(["", ...e.nombres], [["Tᵢ", ...e.T], ["Yᵢᴺᵀ", ...e.ynt], ["Yᵢᵀ", ...e.yt]]),
    ovb: (e) => `<p>Con datos de muchas observaciones, y = <strong>${e.y_lab}</strong>, x₁ = <strong>${e.x1_lab}</strong> y x₂ = <strong>${e.x2_lab}</strong>:</p>` +
      `<ul class="pr-eqs"><li><strong>Regresión corta:</strong> ${e.corta}</li><li><strong>Regresión larga:</strong> ${e.larga}</li>` +
      `<li><strong>Regresión auxiliar:</strong> ${e.aux}</li></ul>`,
    ic1: (e) => `<p>Con una muestra aleatoria de n = ${e.n} sobre ${e.contexto} se obtuvo x̄ = ${e.xbar}. Suponga σ = ${e.sigma} conocido.</p>` +
      `<p>Construye el intervalo de confianza de <strong>${e.conf}%</strong> para μ (usa z = ${{ 90: "1.645", 95: "1.96", 99: "2.576" }[e.conf]}).</p>`,
    resumen: (e) => `<p>Con una muestra de <strong>n = ${e.n}</strong> se quiere explicar <strong>${e.y_lab}</strong> con <strong>${e.x_lab}</strong> ` +
      "(y = β₀ + β₁x + u). No tienes los datos, solo estos resúmenes:</p>" +
      `<ul class="pr-eqs"><li>x̄ = ${e.xbar} &nbsp;·&nbsp; ȳ = ${f(e.ybar)}</li><li>Σ(xᵢ − x̄)² = ${e.Sxx} &nbsp;·&nbsp; Σ(xᵢ − x̄)(yᵢ − ȳ) = ${f(e.Sxy)}</li>` +
      `<li>SSR = Σûᵢ² = ${e.SSR}</li></ul>`,
    residuos: (e) => "<p>Alguien estimó por MCO (con intercepto) una regresión de y en x y anotó los residuos, pero se borraron dos. " +
      "<strong>Sin volver a estimar la recta</strong>, usa las propiedades de MCO para recuperarlos.</p>" +
      tabla(["", ...e.nombres], [["x", ...e.x], ["û", ...e.u.map((v) => (v === null ? "<strong>?</strong>" : v))]]),
    unidades: (e) => `<p>Se estimó <strong>${e.y_lab}</strong> (en ${e.y_u}) en función de <strong>${e.x_lab}</strong> (en ${e.x_u}):</p>` +
      `<p class="econ-po-eq">ŷ = ${f(e.b0)} ${e.b1 < 0 ? "−" : "+"} ${f(Math.abs(e.b1))}·x &nbsp;&nbsp; (R² = ${f(e.R2)})</p>` +
      `<p>Ahora ${e.var === "y" ? `y se mide en <strong>${e.txt}</strong>` : `x se mide en <strong>${e.txt}</strong>`}. ¿Cómo queda la regresión estimada?</p>`,
    matriz2: (e) => "<p>Regresión simple y = β₀ + β₁x + u escrita con matrices, y = Xβ + u. Con los datos:</p>" +
      tabla(["Obs.", ...e.x.map((_, i) => i + 1)], [["x", ...e.x], ["y", ...e.y]]) +
      "<p>Arma X (con su columna de unos), calcula XᵀX, su determinante y β̂ = (XᵀX)⁻¹Xᵀy.</p>",
    descriptiva: (e) => `<p>Se registraron ${e.datos.length} datos de ${e.contexto}:</p>` +
      `<p class="econ-po-eq">${e.datos.join(" · ")}</p><p>Calcula los estadísticos y mira qué le hace el valor atípico a la media.</p>`,
    tamano: (e) => ({
      media: `<p>Se quiere estimar una media poblacional con un error máximo de <strong>E = ${f(e.E)}</strong> y <strong>${e.conf}%</strong> de confianza. ` +
        `Estudios anteriores indican σ = ${e.sigma}. ¿Cuántas observaciones se necesitan?</p>`,
      prop_n: `<p>Se quiere estimar una proporción con un error máximo de <strong>E = ${f(e.E)}</strong> y <strong>${e.conf}%</strong> de confianza, ` +
        `usando p* = ${f(e.p)}${e.p === 0.5 ? " (no hay información previa)" : " de un estudio piloto"}. ¿Cuántas observaciones se necesitan?</p>`,
      prop_ic: `<p>En una encuesta aleatoria a <strong>${e.n}</strong> personas, <strong>${e.x}</strong> dicen usar la bicicleta para ir al trabajo. ` +
        `Construye el intervalo de confianza de <strong>${e.conf}%</strong> para la proporción poblacional.</p>`,
    })[e.sub] + `<p class="pr-nota">Usa z = ${{ 90: "1.645", 95: "1.96", 99: "2.576" }[e.conf]}. Los tamaños muestrales se redondean hacia arriba.</p>`,
    comparar: (e) => `<p>Con los mismos <strong>n = ${e.n}</strong> datos (SST = ${e.SST}) se estiman dos modelos para la misma y:</p>` +
      tabla(["Modelo", "Variables explicativas (k)", "SSR"], [["A", e.kA, e.SSRA], ["B", e.kB, e.SSRB]]) +
      "<p>B incluye todas las variables de A y otras más.</p>",
    logs: (e) => ({
      ln: `<p>Se estimó <strong>${e.y}</strong> = β̂₀ + <strong>${e.b}</strong>·(${e.x}) (modelo log-nivel).</p>`,
      ll: `<p>Se estimó <strong>${e.y}</strong> = β̂₀ + <strong>${e.b}</strong>·${e.x} (modelo log-log).</p>`,
      nl: `<p>Se estimó <strong>${e.y}</strong> = β̂₀ + <strong>${e.b}</strong>·${e.x} (modelo nivel-log).</p>`,
    })[e.sub],
    cuadratica: (e) => `<p>Se estimó ${e.y} = ${e.b0} + ${e.b1}·x ${e.b2 < 0 ? "−" : "+"} ${f(Math.abs(e.b2))}·x², donde x = ${e.x}.</p>`,
    interaccion: (e) => `<p>Se estimó y = β̂₀ + ${e.b1}·x ${e.b2 < 0 ? "−" : "+"} ${f(Math.abs(e.b2))}·z ${e.b3 < 0 ? "−" : "+"} ${f(Math.abs(e.b3))}·x·z, ` +
      `donde y = ${e.y}, x = ${e.x} y z = ${e.z}.</p>`,
    reescala: (e) => `<p>En una regresión simple se obtuvo β̂ = <strong>${e.b}</strong>, se(β̂) = <strong>${e.se}</strong> y R² = <strong>${e.R2}</strong>. ` +
      `Ahora ${e.txt}. ¿Cómo quedan los resultados?</p>`,
    ttest: (e) => `<p>Para el <strong>${e.ctx}</strong> se estimó β̂ = <strong>${e.b}</strong> con se = <strong>${e.se}</strong> (${e.gl} grados de libertad).</p>` +
      `<p>Testea H₀: β = ${e.a0} contra H₁: β ${e.colas === 2 ? "≠" : "&gt;"} ${e.a0} al <strong>${Math.round(100 * e.alfa)}%</strong>.</p>` +
      `<p class="pr-nota">Valores críticos de t con ${e.gl} gl: ${e.colas === 2 ? `dos colas al ${Math.round(100 * e.alfa)}% = ${e.crit}` :
        `una cola al ${Math.round(100 * e.alfa)}% = ${e.crit}; dos colas al ${Math.round(100 * e.alfa)}% = ${e.crit2} (para el intervalo)`}.</p>`,
    pvalor: (e) => `<p>En una regresión de salarios se obtuvieron estos valores-p (dos colas, H₀: βⱼ = 0):</p>` +
      tabla(["Variable", ...e.vs], [["valor-p", ...e.ps]]) +
      `<p>El coeficiente de <strong>${e.vs[e.i]}</strong> es <strong>${e.signo}</strong>. Usa α = ${Math.round(100 * e.alfa)}%.</p>`,
    combinacion: (e) => `<p>Se estimó β̂₁ = <strong>${e.b1}</strong> y β̂₂ = <strong>${e.b2}</strong>, con Var(β̂₁) = ${e.v1}, Var(β̂₂) = ${e.v2} ` +
      `y Cov(β̂₁, β̂₂) = ${e.cov} (${e.gl} gl).</p><p>Testea H₀: <strong>${e.hip}</strong> contra H₁: ≠ al 5%.</p>` +
      `<p class="pr-nota">Valor crítico de t con ${e.gl} gl (dos colas, 5%) = ${e.crit}.</p>`,
    ftest: (e) => `<p>Con n = <strong>${e.n}</strong> se estimó un modelo con <strong>k = ${e.kk}</strong> variables explicativas y se quiere testear que ` +
      `<strong>${e.j}</strong> de ellas tienen coeficiente cero.</p>` +
      (e.forma === "ssr" ? `<p>SSR del modelo restringido = ${e.ssrr}; SSR del no restringido = ${e.ssru}.</p>` :
        `<p>R² del modelo restringido = ${e.r2r}; R² del no restringido = ${e.r2u}.</p>`) +
      `<p class="pr-nota">Valor crítico F(${e.j}, ${e.n - e.kk - 1}) al 5% = ${e.crit}.</p>`,
    fglobal: (e) => `<p>Una regresión con <strong>k = ${e.kk}</strong> variables explicativas y <strong>n = ${e.n}</strong> tiene R² = <strong>${e.r2}</strong>.</p>` +
      `<p class="pr-nota">Valor crítico F(${e.kk}, ${e.n - e.kk - 1}) al 5% = ${e.crit}.</p>`,
    errores: (e) => ({
      tipo1: `<p>${e.m} investigadores testean, cada uno con su propia muestra, una hipótesis nula que en realidad es <strong>verdadera</strong>, con α = ${Math.round(100 * e.alfa)}%. ¿Cuántos esperas que la rechacen?</p>`,
      poder: `<p>La probabilidad de error tipo II de un test es <strong>${e.beta}</strong>.</p>`,
      compara: `<p>Dos investigadores usan los mismos datos (mismo n), uno con α = ${e.a1} y otro con α = ${e.a2}.</p>`,
    })[e.sub],
    ic2: (e) => `<p>Se compara ${e.contexto}: X̄ = ${e.xb} (nₓ = ${e.nx}, σₓ = ${e.sx}) e Ȳ = ${e.yb} (nᵧ = ${e.ny}, σᵧ = ${e.sy}).</p>` +
      `<p>Construye el intervalo de confianza de <strong>${e.conf}%</strong> para μₓ − μᵧ (usa z = ${{ 90: "1.645", 95: "1.96", 99: "2.576" }[e.conf]}).</p>`,
  };

  /* ---------------------------- Taller (ejercicios con corrección) ---------------------------- */
  function campoHTML(q) {
    return q.opciones ? `<select aria-label="${q.lab}"><option value="">Elige una opción</option>${q.opciones.map((o) => `<option>${o}</option>`).join("")}</select>`
      : `<input type="text" inputmode="decimal" autocomplete="off" aria-label="${q.lab}" placeholder="${q.dec === 4 ? "0,0000" : q.dec === 3 ? "0,000" : "número"}">`;
  }
  function formulario(e) {
    const form = h("div", "pr-form");
    const campos = e.preguntas.map((q) => {
      const box = h("div", "pr-campo");
      box.innerHTML = `<label>${q.lab}${campoHTML(q)}</label><span class="pr-marca"></span>`;
      form.append(box);
      return { q, inp: box.querySelector("input,select"), marca: box.querySelector(".pr-marca"), box };
    });
    return { form, campos };
  }
  const correcto = (q, val) => {
    if (q.opciones) return val === q.ans;
    const v = num(val ?? "");
    return v !== null && Math.abs(v - q.ans) <= tol(q);
  };
  const solucionHTML = (e) => `<div class="pr-sol"><p class="pr-sol-t">Solución paso a paso</p><ol>${e.solucion.map((s) => `<li>${s}</li>`).join("")}</ol>` +
    `<p class="pr-nota">Respuestas: ${e.preguntas.map((q) => `${q.lab} = <strong>${typeof q.ans === "number" ? f(+q.ans.toFixed(q.dec ?? 2)) : q.ans}</strong>`).join("; ")}</p></div>`;

  function montarTaller(z, clave) {
    const banco = bancoDe()[clave] || [];
    if (!banco.length) { z.textContent = "No se pudo cargar el banco de ejercicios."; return; }
    const head = h("div", "pr-meta");
    const card = h("div", "pr-card pr-ej");
    const nav = h("div", "pr-nav");
    z.append(head, card, nav);
    const mezcla = barajar(banco.map((_, i) => i));
    const orden = mezcla.filter((i) => S.hechos[banco[i].id] === undefined).concat(mezcla.filter((i) => S.hechos[banco[i].id] !== undefined));
    let pos = 0;
    nav.append(boton("econ-btn econ-btn-gold", "Otro ejercicio", () => { pos = (pos + 1) % orden.length; pintar(); }));

    function pintar() {
      const e = banco[orden[pos]];
      const hecho = S.hechos[e.id];
      const total = e.preguntas.reduce((s, q) => s + q.pts, 0);
      const pend = banco.filter((x) => S.hechos[x.id] === undefined).length;
      head.innerHTML = `<span>Ejercicio ${pos + 1} de ${banco.length}</span><span class="pr-tag">${pend} sin intentar</span>` +
        (hecho !== undefined ? `<span class="pr-tag">Ya intentado: ${hecho} pts, no vuelve a sumar</span>` : `<span class="pr-tag is-gold">Hasta ${total + 5} pts</span>`);
      card.innerHTML = ENUNCIADO[e.tipo](e);
      const { form, campos } = formulario(e);
      card.append(form);
      const acciones = h("div", "pr-nav");
      const res = h("div", "pr-exp");
      res.setAttribute("aria-live", "polite");
      let intentado = hecho !== undefined;
      const comprobar = boton("econ-btn", "Comprobar", () => {
        let pts = 0, buenos = 0, vacios = 0;
        campos.forEach(({ q, inp, marca, box }) => {
          if (!inp.value.trim()) vacios++;
          const ok = correcto(q, inp.value);
          box.classList.toggle("is-ok", ok);
          box.classList.toggle("is-bad", !ok);
          marca.textContent = ok ? "✓" : "✗";
          if (ok) { buenos++; pts += q.pts; }
        });
        if (vacios === campos.length) {
          res.innerHTML = '<p class="pr-veredicto is-bad">Completa al menos un campo antes de comprobar.</p>';
          campos.forEach((c) => { c.box.classList.remove("is-ok", "is-bad"); c.marca.textContent = ""; });
          return;
        }
        const todo = buenos === campos.length;
        let msg;
        if (!intentado) {
          intentado = true;
          const bono = todo ? 5 : 0;
          S.hechos[e.id] = pts + bono;
          sumar(pts + bono, todo, { tipo: "ejercicio", item: e.id, tema: clave });
          msg = `Primer intento: <strong>${buenos} de ${campos.length}</strong> correctos, +${pts + bono} pts${bono ? " (incluye 5 por ejercicio perfecto)" : ""}.`;
          head.querySelector(".pr-tag:last-child").textContent = `Ya intentado: ${pts + bono} pts, no vuelve a sumar`;
          head.querySelector(".pr-tag:last-child").classList.remove("is-gold");
        } else {
          msg = `${buenos} de ${campos.length} correctos. Los reintentos no suman puntos, pero sirven para practicar.`;
        }
        res.innerHTML = `<p class="pr-veredicto ${todo ? "is-ok" : "is-bad"}">${todo ? "Todo correcto." : "Revisa los campos marcados con ✗."} ${msg}</p>` +
          (todo ? "" : '<p class="pr-nota">Se acepta coma o punto decimal y un pequeño margen de redondeo. Si te trabas, abre la solución paso a paso.</p>');
      });
      const ver = boton("econ-btn econ-btn-ghost", "Ver solución paso a paso", () => {
        if (!intentado) {
          intentado = true;
          S.hechos[e.id] = 0;
          sumar(0, false, { tipo: "solucion", item: e.id, tema: clave });
          head.querySelector(".pr-tag:last-child").textContent = "Solución vista, ya no suma";
          head.querySelector(".pr-tag:last-child").classList.remove("is-gold");
        }
        res.innerHTML = solucionHTML(e);
      });
      acciones.append(comprobar, ver);
      card.append(acciones, res);
      campos.forEach(({ inp }) => inp.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); comprobar.click(); } }));
      card.classList.remove("is-in"); void card.offsetWidth; card.classList.add("is-in");
    }
    pintar();
  }

  /* Talleres del primer bloque (los de los bloques 2 y 3 vienen en practica2.js y practica3.js) */
  const TALLERES = [
    ["simple", "📈 Regresión simple con datos"], ["resumen", "🧾 Regresión desde resúmenes"], ["residuos", "🕵️ Detective de residuos"],
    ["matriz2", "🔢 MCO simple con matrices"], ["multi", "🧮 Regresión múltiple con matrices"], ["comparar", "⚖️ ¿Qué modelo prefieres?"],
    ["unidades", "📏 Cambio de unidades"], ["causal", "🌗 Outcomes potenciales"], ["ovb", "🧩 Variable omitida"],
    ["descriptiva", "📊 Estadística descriptiva"], ["ic", "🎯 Intervalos para medias"], ["tamano", "📐 Tamaño muestral y proporciones"],
  ];
  window.PRACTICA_META1 = { temas: TEMAS, talleres: TALLERES }; // etiquetas para el panel /admin
  window.PRACTICA_TEMARIO = TEMARIO;

  /* ---------------------------- Utilidades de fechas y números ---------------------------- */
  const fechaCorta = (s) => new Date(s).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  const fechaHora = (s) => new Date(s).toLocaleString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const notaRef = (logro) => Math.round(10 * (logro < 60 ? 1 + (3 * logro) / 60 : 4 + (3 * (logro - 60)) / 40)) / 10;
  const coma = (x) => String(x).replace(".", ",");
  const lunes = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };

  /* ---------------------------- Aplicación: Temas · Precertamen · Mi avance ---------------------------- */
  function montarApp(root) {
    const bloque = root.dataset.bloque || "1";
    root.innerHTML = "";
    const app = h("div", "pr-shell");
    app.innerHTML = '<p class="pr-nota">Cargando la práctica…</p>';
    root.append(app);
    const arrancar = (cuenta, datos) => { cargarEstado(bloque, cuenta, datos); construir(app); };
    if (window.EconCuentas && window.EconCuentas.activo) {
      app.innerHTML = "";
      window.EconCuentas.cuandoSesion(root, bloque, arrancar);
    } else arrancar(null, null);
  }

  let EXAMEN = null; // precertamen en curso
  function construir(app) {
    app.innerHTML = "";
    oyentes.clear();
    const strip = h("div", "pr-strip", MARCADOR);
    app.append(strip);
    pintarMarcador(strip);
    escuchar((d) => pintarMarcador(strip, d.delta));
    const aviso = h("p", "pr-tabs-aviso");
    aviso.setAttribute("role", "status");
    escuchar(() => { if (!EXAMEN || !EXAMEN.activo) aviso.textContent = ""; });
    const tabs = h("div", "pr-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Secciones de la práctica");
    const vista = h("div", "pr-vista");
    app.append(tabs, aviso, vista);
    const TABS = [["temas", "Temas"], ["pre", "Precertamen"], ["avance", "Mi avance"]];
    let ctl = null;
    const ir = (k, arg) => {
      if (EXAMEN && EXAMEN.activo && k !== "pre") { aviso.textContent = "Tienes un precertamen en curso: entrégalo antes de cambiar de sección."; return; }
      aviso.textContent = "";
      if (ctl) ctl.abort();
      ctl = new AbortController();
      const tab = k === "tema" ? "temas" : k;
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", b.dataset.k === tab));
      vista.innerHTML = "";
      ({ temas: vTemas, tema: vTema, pre: vPre, avance: vAvance })[k](vista, { ir, signal: ctl.signal, arg });
      vista.classList.remove("is-in"); void vista.offsetWidth; vista.classList.add("is-in");
      if (k !== "temas" && vista.getBoundingClientRect().top < 0) tabs.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    TABS.forEach(([k, lab]) => {
      const b = boton("", lab, () => ir(k));
      b.dataset.k = k;
      b.setAttribute("role", "tab");
      tabs.append(b);
    });
    ir("temas");
  }

  /* ---------- Temas: cuadrícula con el avance de cada tema ---------- */
  function vTemas(v, { ir }) {
    const idx = indice();
    const todos = resumenIds(idx.flatMap((t) => t.ids));
    v.append(h("div", "pr-cabecera", `<p class="pr-cab-t">Has respondido <strong>${todos.r} de ${todos.total}</strong> preguntas de este bloque. Cada celda es una pregunta.</p>` + leyendaHTML()));
    const grid = h("div", "pr-grid");
    idx.forEach((t) => {
      const rs = resumenIds(t.ids);
      const card = h("article", "pr-tema" + (rs.total && rs.r === rs.total ? " is-completo" : ""));
      card.innerHTML = `<p class="pr-tema-clase">${t.clase}</p><h3 class="pr-tema-t">${t.t}</h3><p class="pr-tema-d">${t.d}</p>` + celdas(t) +
        `<div class="pr-tema-pie"><span><strong>${rs.r}</strong> de ${rs.total}</span><span><strong>${rs.acc === null ? "—" : rs.acc + "%"}</strong> aciertos</span><span><strong>${rs.pts}</strong> pts</span></div>`;
      card.append(boton("econ-btn pr-tema-btn", rs.r === 0 ? "Empezar este tema" : rs.r === rs.total ? "Repasar" : "Continuar", () => ir("tema", t.k)));
      grid.append(card);
    });
    v.append(grid);
  }

  /* ---------- Un tema: comentes, talleres y desarrollo de ese tema ---------- */
  function vTema(v, { ir, signal, arg }) {
    const t = indice().find((x) => x.k === arg);
    if (!t) return vTemas(v, { ir });
    const volver = boton("pr-volver", "← Todos los temas", () => ir("temas"));
    const cab = h("header", "pr-tema-cab");
    const pintarCab = () => {
      const rs = resumenIds(t.ids);
      cab.innerHTML = `<p class="pr-tema-clase">${t.clase}</p><h3 class="pr-tema-t">${t.t}</h3><p class="pr-tema-d">${t.d}</p>` + celdas(t, true) +
        `<div class="pr-tema-pie"><span><strong>${rs.r}</strong> de ${rs.total} respondidas</span><span><strong>${rs.acc === null ? "—" : rs.acc + "%"}</strong> aciertos</span><span><strong>${rs.pts}</strong> pts en este tema</span></div>`;
    };
    pintarCab();
    const sub = h("div", "pr-subtabs");
    sub.setAttribute("role", "tablist");
    sub.setAttribute("aria-label", "Tipo de pregunta");
    const cont = h("div", "pr-sub");
    v.append(volver, cab, sub, cont);
    let actual = null, subCtl = null;
    const elegir = (g) => {
      actual = g.k;
      sub.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", b.dataset.k === g.k));
      if (subCtl) subCtl.abort();
      subCtl = new AbortController();
      signal.addEventListener("abort", () => subCtl.abort());
      cont.innerHTML = "";
      if (g.k === "comentes") montarComentes(cont, { tema: t.c, signal: subCtl.signal });
      else montarTaller(cont, g.k);
    };
    const pintarSub = () => {
      sub.innerHTML = "";
      t.grupos.forEach((g) => {
        const rg = resumenIds(g.items);
        const b = boton("", `<span>${g.k === "comentes" ? "💬 Comentes" : g.lab}</span><small>${rg.r}/${rg.total}</small>`, () => elegir(g));
        b.dataset.k = g.k;
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", g.k === actual);
        if (g.k.startsWith("caso_")) b.classList.add("is-desarrollo");
        sub.append(b);
      });
    };
    pintarSub();
    escuchar(() => { pintarCab(); pintarSub(); }, signal);
    elegir(t.grupos.find((g) => g.items.some((id) => !S.estado[id])) || t.grupos[0]);
  }

  /* ---------- Precertamen: preguntas mezcladas de todos los temas, con tiempo ---------- */
  const MODOS = [
    { k: "rapido", t: "Rápido", min: 15, c: 6, e: 2, d: 0 },
    { k: "estandar", t: "Estándar", min: 35, c: 10, e: 3, d: 1 },
    { k: "completo", t: "Completo", min: 60, c: 14, e: 5, d: 2 },
  ];
  const composicion = (m) => [`${m.c} comentes`, `${m.e} ejercicios`].concat(m.d ? [`${m.d} ${m.d === 1 ? "problema" : "problemas"} de desarrollo`] : [])
    .join(", ").replace(/, ([^,]*)$/, " y $1");
  const esDesarrollo = (k) => k.startsWith("caso_") || (BLOQUE === "1" && k === "multi");

  function armarExamen(modo) {
    const idx = indice();
    const comentes = [], ejercicios = [], desarrollos = [];
    idx.forEach((t) => t.grupos.forEach((g) => g.items.forEach((id) => {
      const it = { id, tema: t.k, grupo: g.k };
      (g.k === "comentes" ? comentes : esDesarrollo(g.k) ? desarrollos : ejercicios).push(it);
    })));
    // reparte entre temas por turnos y prefiere las preguntas que aún no ha intentado
    const elegir = (pool, n, ya) => {
      const porTema = {};
      barajar(pool).filter((x) => !ya.has(x.id)).forEach((x) => (porTema[x.tema] = porTema[x.tema] || []).push(x));
      Object.values(porTema).forEach((l) => l.sort((a, b) => (S.hechos[a.id] !== undefined) - (S.hechos[b.id] !== undefined)));
      const temas = barajar(Object.keys(porTema)), out = [];
      while (out.length < n && temas.some((k) => porTema[k].length)) temas.forEach((k) => { if (out.length < n && porTema[k].length) out.push(porTema[k].shift()); });
      out.forEach((x) => ya.add(x.id));
      return out;
    };
    const ya = new Set();
    const c = elegir(comentes, modo.c, ya), e = elegir(ejercicios, modo.e, ya);
    let d = elegir(desarrollos, modo.d, ya);
    if (d.length < modo.d) d = d.concat(elegir(ejercicios, modo.d - d.length, ya));
    return c.concat(e, d);
  }
  function buscar(it) {
    if (it.grupo === "comentes") { const i = +it.id.slice(1); return Object.assign({ id: it.id }, comentesDe()[i]); }
    return (bancoDe()[it.grupo] || []).find((e) => e.id === it.id);
  }

  function vPre(v, ctx) {
    if (EXAMEN && EXAMEN.activo) return correrExamen(v, ctx);
    if (EXAMEN && EXAMEN.resultado) return resultados(v, ctx);
    let modo = MODOS[1];
    const box = h("section", "pr-pre");
    box.innerHTML = `<div class="pr-pre-intro"><h3>Precertamen</h3>` +
      `<p>Un ensayo con tiempo: preguntas de todos los temas del bloque, como en una evaluación. No sabrás si aciertas hasta entregar; ` +
      `al final verás tu porcentaje de logro, una nota referencial y la pauta completa.</p></div>`;
    const modos = h("div", "pr-modos");
    modos.setAttribute("role", "radiogroup");
    modos.setAttribute("aria-label", "Duración del precertamen");
    MODOS.forEach((m) => {
      const b = boton("pr-modo", `<span class="pr-modo-t">${m.t}</span><span class="pr-modo-min">${m.min} min</span><span class="pr-modo-c">${composicion(m)}</span>`, () => {
        modo = m;
        modos.querySelectorAll(".pr-modo").forEach((x) => x.setAttribute("aria-checked", x === b));
      });
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", m === modo);
      modos.append(b);
    });
    const empezar = boton("econ-btn econ-btn-gold pr-pre-empezar", "Comenzar precertamen", () => {
      const preg = armarExamen(modo);
      if (!preg.length) return;
      EXAMEN = { activo: true, modo, preg, resp: {}, inicio: Date.now(), fin: Date.now() + modo.min * 60000, actual: 0 };
      addEventListener("beforeunload", noSalir);
      v.innerHTML = "";
      vPre(v, ctx);
    });
    const navEmpezar = h("div", "pr-nav");
    navEmpezar.append(empezar);
    box.append(modos, navEmpezar, h("p", "pr-nota",
      "Cómo suma a tu progreso: cada pregunta que respondes por primera vez suma igual que en la práctica; además, terminar suma 10 puntos y cada respuesta correcta suma 2 más."));
    v.append(box);
    if (S.sims.length) v.append(historial(S.sims));
  }
  function noSalir(ev) { if (EXAMEN && EXAMEN.activo) { ev.preventDefault(); ev.returnValue = ""; } }

  function historial(sims) {
    const nombre = Object.fromEntries(MODOS.map((m) => [m.k, m.t]));
    const w = h("section", "pr-hist");
    w.innerHTML = `<h4>Tus precertámenes</h4><div class="pr-tabla-wrap"><table><thead><tr><th>Fecha</th><th>Modalidad</th><th>Correctas</th><th>Logro</th><th>Nota ref.</th><th>Puntos</th></tr></thead><tbody>` +
      sims.slice(0, 20).map((s) => `<tr><td>${fechaHora(s.fin || s.inicio)}</td><td>${nombre[s.modo] || s.modo}</td><td>${s.correctas} de ${s.preguntas}</td>` +
        `<td>${coma(s.logro)}%</td><td>${coma(notaRef(+s.logro).toFixed(1))}</td><td>+${s.puntos}</td></tr>`).join("") + "</tbody></table></div>";
    return w;
  }

  function correrExamen(v, ctx) {
    const X = EXAMEN;
    v.innerHTML = "";
    const barra = h("div", "pr-pre-barra");
    barra.innerHTML = `<div class="pr-reloj" role="timer" aria-label="Tiempo restante"><strong class="pr-reloj-t">${mmss(X.fin - Date.now())}</strong><span class="pr-k">restantes</span></div>` +
      `<div class="pr-pre-nav" role="group" aria-label="Preguntas"></div>`;
    const entregar = boton("econ-btn econ-btn-gold pr-entregar", "Entregar");
    barra.append(entregar);
    const avisoSr = h("p", "pr-sr");
    avisoSr.setAttribute("aria-live", "polite");
    const panel = h("div", "pr-pre-panel");
    const pie = h("div", "pr-nav pr-pre-pie");
    const prev = boton("econ-btn econ-btn-ghost", "Anterior", () => mostrar(X.actual - 1));
    const next = boton("econ-btn", "Siguiente", () => mostrar(X.actual + 1));
    pie.append(prev, next);
    v.append(barra, avisoSr, panel, pie);
    const navG = barra.querySelector(".pr-pre-nav");
    const respondida = (it) => (it.grupo === "comentes" ? !!X.resp[it.id] : Object.values(X.resp[it.id] || {}).some((x) => String(x).trim()));

    const panes = X.preg.map((it, i) => {
      const q = buscar(it);
      const p = h("article", "pr-card pr-pre-preg");
      p.hidden = true;
      const tipo = it.grupo === "comentes" ? "Comente" : esDesarrollo(it.grupo) ? "Problema de desarrollo" : "Ejercicio";
      const tema = (TEMARIO[BLOQUE] || []).find((t) => t.k === it.tema);
      p.innerHTML = `<div class="pr-meta"><span>Pregunta ${i + 1} de ${X.preg.length}</span><span class="pr-tag">${tipo}</span><span class="pr-tag">${tema ? tema.t : ""}</span></div>`;
      if (it.grupo === "comentes") {
        p.insertAdjacentHTML("beforeend", `<p class="pr-stmt">${q.txt}</p>`);
        const ops = h("div", "pr-vfi");
        ["V", "F", "I"].forEach((val) => {
          const b = boton("pr-vfi-btn", `<kbd>${val}</kbd>${VERED[val]}`, () => {
            X.resp[it.id] = X.resp[it.id] === val ? undefined : val;
            ops.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.v === X.resp[it.id]));
            pintarNav();
          });
          b.dataset.v = val;
          b.setAttribute("aria-pressed", X.resp[it.id] === val);
          ops.append(b);
        });
        p.append(ops);
      } else {
        p.insertAdjacentHTML("beforeend", ENUNCIADO[q.tipo](q));
        const { form, campos } = formulario(q);
        X.resp[it.id] = X.resp[it.id] || {};
        campos.forEach(({ q: qq, inp }) => {
          if (X.resp[it.id][qq.k] !== undefined) inp.value = X.resp[it.id][qq.k];
          inp.addEventListener("input", () => { X.resp[it.id][qq.k] = inp.value; pintarNav(); });
          inp.addEventListener("change", () => { X.resp[it.id][qq.k] = inp.value; pintarNav(); });
        });
        p.append(form);
      }
      panel.append(p);
      return p;
    });
    function pintarNav() {
      navG.innerHTML = "";
      X.preg.forEach((it, i) => {
        const b = boton("pr-pre-celda" + (respondida(it) ? " is-resp" : "") + (i === X.actual ? " is-actual" : ""), String(i + 1), () => mostrar(i));
        b.setAttribute("aria-label", `Pregunta ${i + 1}${respondida(it) ? ", respondida" : ", sin responder"}`);
        if (i === X.actual) b.setAttribute("aria-current", "step");
        navG.append(b);
      });
    }
    function mostrar(i) {
      X.actual = Math.max(0, Math.min(X.preg.length - 1, i));
      panes.forEach((p, j) => (p.hidden = j !== X.actual));
      prev.disabled = X.actual === 0;
      next.disabled = X.actual === X.preg.length - 1;
      pintarNav();
    }
    mostrar(X.actual);

    let armado = false;
    entregar.addEventListener("click", () => {
      const faltan = X.preg.filter((it) => !respondida(it)).length;
      if (faltan && !armado) {
        armado = true;
        entregar.textContent = `${faltan} sin responder: toca otra vez para entregar`;
        setTimeout(() => { armado = false; entregar.textContent = "Entregar"; }, 4000);
        return;
      }
      terminar(v, ctx);
    });
    let avisado5 = false, avisado1 = false;
    const reloj = barra.querySelector(".pr-reloj-t");
    const tic = () => {
      if (!X.activo || !v.isConnected) return clearInterval(X.timer);
      const resta = X.fin - Date.now();
      reloj.textContent = mmss(resta);
      barra.classList.toggle("is-alerta", resta < 5 * 60000);
      if (!avisado5 && resta < 5 * 60000) { avisado5 = true; avisoSr.textContent = "Quedan 5 minutos."; }
      if (!avisado1 && resta < 60000) { avisado1 = true; avisoSr.textContent = "Queda 1 minuto."; }
      if (resta <= 0) { clearInterval(X.timer); terminar(v, ctx, true); }
    };
    clearInterval(X.timer);
    X.timer = setInterval(tic, 1000);
    if (ctx.signal) ctx.signal.addEventListener("abort", () => clearInterval(X.timer));
    if (ctx.signal) addEventListener("keydown", (ev) => {
      if (!v.isConnected || !X.activo || escribiendo(ev)) return;
      const it = X.preg[X.actual];
      const k = ev.key.toLowerCase();
      let b = null;
      if (it.grupo === "comentes" && k.length === 1 && "vfi".includes(k)) b = panes[X.actual].querySelector(`.pr-vfi-btn[data-v="${k.toUpperCase()}"]`);
      else if (ev.key === "ArrowRight") b = next;
      else if (ev.key === "ArrowLeft") b = prev;
      if (!b) return;
      ev.preventDefault(); ev.stopImmediatePropagation();
      if (!b.disabled) b.click();
    }, { signal: ctx.signal, capture: true });
  }

  function terminar(v, ctx, porTiempo) {
    const X = EXAMEN;
    if (!X || !X.activo) return;
    X.activo = false;
    clearInterval(X.timer);
    removeEventListener("beforeunload", noSalir);
    const items = X.preg.map((it) => {
      const q = buscar(it);
      if (it.grupo === "comentes") {
        const r = X.resp[it.id];
        const ok = r === q.v;
        return Object.assign({}, it, { q, r, ok, pts: ok ? 10 : 0, max: 10, respondida: !!r });
      }
      const r = X.resp[it.id] || {};
      let pts = 0, buenos = 0;
      const campos = q.preguntas.map((qq) => { const ok = correcto(qq, r[qq.k]); if (ok) { pts += qq.pts; buenos++; } return { q: qq, val: r[qq.k], ok }; });
      const todo = buenos === campos.length;
      if (todo) pts += 5;
      return Object.assign({}, it, { q, campos, ok: todo, buenos, pts, max: q.preguntas.reduce((s, qq) => s + qq.pts, 0) + 5,
        respondida: Object.values(r).some((x) => String(x ?? "").trim()) });
    });
    const max = items.reduce((s, x) => s + x.max, 0), got = items.reduce((s, x) => s + x.pts, 0);
    const logro = Math.round((1000 * got) / max) / 10;
    const correctas = items.filter((x) => x.ok).length;
    // Al progreso: cada pregunta respondida por primera vez suma como en la práctica, más el bono del precertamen
    let nuevos = 0;
    items.forEach((x) => {
      if (!x.respondida || S.hechos[x.id] !== undefined) return;
      nuevos += x.pts;
      if (x.grupo === "comentes") { S.hechos[x.id] = x.ok ? "ok" : "bad"; sumar(x.pts, x.ok, { tipo: "comente", item: x.id, tema: x.q.tema }); }
      else { S.hechos[x.id] = x.pts; sumar(x.pts, x.ok, { tipo: "ejercicio", item: x.id, tema: x.grupo }); }
    });
    const bono = Math.min(10 + 2 * correctas, 200);
    S.bonos += bono;
    S.pts += bono;
    const temas = {};
    items.forEach((x) => { const t = (temas[x.tema] = temas[x.tema] || [0, 0]); t[1]++; if (x.ok) t[0]++; });
    const usados = Math.min(Date.now(), X.fin) - X.inicio;
    const reg = { bloque: +BLOQUE, modo: X.modo.k, inicio: new Date(X.inicio).toISOString(), limite_min: X.modo.min, preguntas: items.length, correctas,
      logro, puntos: bono, detalle: { usados_seg: Math.round(usados / 1000), por_tiempo: !!porTiempo, items: items.map((x) => [x.id, x.ok ? 1 : 0]), temas } };
    S.sims.unshift(Object.assign({ fin: new Date().toISOString() }, reg));
    guardar();
    avisar({ delta: bono });
    X.resultado = { items, logro, correctas, bono, nuevos, usados, porTiempo, guardado: null };
    if (CUENTA && window.EconCuentas && window.EconCuentas.guardarSimulacro) {
      window.EconCuentas.guardarSimulacro(reg).then((ok) => {
        X.resultado.guardado = ok;
        const n = v.querySelector(".pr-res-guardado");
        if (n) n.textContent = ok ? "Resultado guardado en tu cuenta." : "No se pudo guardar el resultado en el servidor; los puntos de las preguntas sí quedaron registrados.";
      });
    }
    v.innerHTML = "";
    resultados(v, ctx);
  }

  function resultados(v, { ir }) {
    const R = EXAMEN.resultado;
    const nota = notaRef(R.logro);
    const res = h("section", "pr-res");
    res.innerHTML = `<div class="pr-res-cab"><div class="pr-res-logro"><strong>${coma(R.logro)}%</strong><span>de logro</span></div>` +
      `<dl class="pr-res-datos"><div><dt>Nota referencial</dt><dd>${coma(nota.toFixed(1))}</dd></div>` +
      `<div><dt>Correctas</dt><dd>${R.correctas} de ${R.items.length}</dd></div>` +
      `<div><dt>Tiempo usado</dt><dd>${mmss(R.usados)} de ${EXAMEN.modo.min}:00</dd></div>` +
      `<div><dt>Puntos sumados</dt><dd>+${R.bono + R.nuevos}</dd></div></dl></div>` +
      `<p class="pr-nota">${R.porTiempo ? "Se acabó el tiempo y el precertamen se entregó solo. " : ""}La nota referencial usa una escala de 1,0 a 7,0 con 60% de exigencia. ` +
      `Sumaste ${R.bono} puntos por terminar y por tus respuestas correctas${R.nuevos ? `, y ${R.nuevos} por preguntas que respondías por primera vez` : ""}. ` +
      `<span class="pr-res-guardado">${R.guardado === false ? "No se pudo guardar el resultado en el servidor." : ""}</span></p>`;
    // por tema
    const porTema = (TEMARIO[BLOQUE] || []).map((t) => {
      const xs = R.items.filter((x) => x.tema === t.k);
      return { t, n: xs.length, ok: xs.filter((x) => x.ok).length };
    }).filter((x) => x.n);
    res.insertAdjacentHTML("beforeend", `<h4>Por tema</h4><div class="pr-barras">` + porTema.map(({ t, n, ok }) =>
      `<div class="pr-barra-fila"><span class="pr-barra-lab">${t.t}</span><span class="pr-barra"><span style="width:${Math.round((100 * ok) / n)}%"></span></span><span class="pr-barra-val">${ok} de ${n}</span></div>`).join("") + "</div>");
    const peor = porTema.slice().sort((a, b) => a.ok / a.n - b.ok / b.n)[0];
    const acc = h("div", "pr-nav");
    if (peor && peor.ok < peor.n) acc.append(boton("econ-btn", `Practicar ${peor.t.t.toLowerCase()}`, () => { EXAMEN = null; ir("tema", peor.t.k); }));
    acc.append(boton("econ-btn econ-btn-ghost", "Nuevo precertamen", () => { EXAMEN = null; ir("pre"); }));
    res.append(acc);
    // pauta
    const pauta = h("section", "pr-pauta");
    pauta.innerHTML = "<h4>Pauta</h4>";
    R.items.forEach((x, i) => {
      const d = h("details", "pr-pauta-item " + (x.ok ? "is-ok" : x.respondida ? "is-bad" : "is-vacia"));
      const tipo = x.grupo === "comentes" ? "Comente" : esDesarrollo(x.grupo) ? "Problema de desarrollo" : "Ejercicio";
      const estado = x.ok ? "correcta" : !x.respondida ? "sin responder" : x.grupo === "comentes" ? "incorrecta" : `${x.buenos} de ${x.campos.length} partes correctas`;
      d.innerHTML = `<summary><span class="pr-pauta-n">${i + 1}</span><span>${tipo}</span><span class="pr-pauta-e">${estado}</span><span class="pr-pauta-p">${x.pts}/${x.max} pts</span></summary>`;
      const body = h("div", "pr-pauta-cuerpo");
      if (x.grupo === "comentes") {
        body.innerHTML = `<p class="pr-stmt">${x.q.txt}</p><p>Tu respuesta: <strong>${x.r ? VERED[x.r] : "sin responder"}</strong>. Respuesta correcta: <strong>${VERED[x.q.v]}</strong>.</p>` +
          `<ul>${x.q.exp.map((s) => `<li>${s}</li>`).join("")}</ul><p class="pr-repaso">Repasa en <a href="${x.q.repaso[0]}">${x.q.repaso[1]}</a></p>`;
      } else {
        body.innerHTML = ENUNCIADO[x.q.tipo](x.q) + `<div class="pr-tabla-wrap"><table><thead><tr><th>Parte</th><th>Tu respuesta</th><th>Correcta</th><th></th></tr></thead><tbody>` +
          x.campos.map((c) => `<tr><td>${c.q.lab}</td><td>${c.val && String(c.val).trim() ? c.val : "—"}</td><td>${typeof c.q.ans === "number" ? f(+c.q.ans.toFixed(c.q.dec ?? 2)) : c.q.ans}</td><td>${c.ok ? "✓" : "✗"}</td></tr>`).join("") +
          "</tbody></table></div>" + solucionHTML(x.q);
      }
      d.append(body);
      pauta.append(d);
    });
    v.append(res, pauta);
  }

  /* ---------- Mi avance ---------- */
  function vAvance(v, { ir }) {
    const idx = indice();
    const todos = resumenIds(idx.flatMap((t) => t.ids));
    const hace7 = Date.now() - 7 * 864e5;
    const min7 = S.ses.length ? Math.round(S.ses.filter((s) => new Date(s.inicio).getTime() > hace7).reduce((a, s) => a + (s.activo_seg || 0), 0) / 60) : null;
    const dias = new Set(S.filas.map((r) => new Date(r.t).toLocaleDateString("es-CL"))).size;
    v.append(h("dl", "pr-kpis",
      `<div><dt>Puntos del bloque</dt><dd>${S.pts}</dd></div>` +
      `<div><dt>Preguntas respondidas</dt><dd>${todos.r}<small> de ${todos.total}</small></dd></div>` +
      `<div><dt>Aciertos al primer intento</dt><dd>${S.resp ? Math.round((100 * S.ok) / S.resp) + "%" : "—"}</dd></div>` +
      `<div><dt>Días con práctica</dt><dd>${dias}</dd></div>` +
      `<div><dt>Minutos activos, últimos 7 días</dt><dd>${min7 === null ? "—" : min7}</dd></div>`));
    // temas a reforzar
    const filas = idx.map((t) => Object.assign({ t }, resumenIds(t.ids)));
    const conDatos = filas.filter((x) => x.ok + x.bad >= 3).sort((a, b) => a.acc - b.acc);
    const ref = h("section", "pr-avance-sec");
    ref.innerHTML = "<h4>Tus temas, del más débil al más fuerte</h4>" + (conDatos.length ? "" :
      '<p class="pr-nota">Responde al menos 3 preguntas de un tema para ver aquí tu desempeño en él.</p>');
    const lista = h("div", "pr-barras");
    conDatos.forEach((x) => {
      const fila = h("div", "pr-barra-fila", `<span class="pr-barra-lab">${x.t.t}<small>${x.r} de ${x.total} respondidas</small></span>` +
        `<span class="pr-barra${x.acc < 50 ? " is-baja" : ""}"><span style="width:${x.acc}%"></span></span><span class="pr-barra-val">${x.acc}%</span>`);
      fila.append(boton("econ-btn econ-btn-ghost econ-btn-sm", "Practicar", () => ir("tema", x.t.k)));
      lista.append(fila);
    });
    ref.append(lista);
    const sinEmpezar = filas.filter((x) => x.r === 0);
    if (sinEmpezar.length) ref.append(h("p", "pr-nota", `Aún sin empezar: ${sinEmpezar.map((x) => x.t.t).join(", ")}.`));
    v.append(ref);
    // actividad por semana (últimas 8)
    const semanas = [];
    const l0 = lunes(new Date());
    for (let i = 7; i >= 0; i--) { const d = new Date(l0); d.setDate(d.getDate() - 7 * i); semanas.push({ d, n: 0, ok: 0 }); }
    S.filas.forEach((r) => {
      const t = new Date(r.t).getTime();
      const s = semanas.find((w, i) => t >= w.d.getTime() && (i === semanas.length - 1 || t < semanas[i + 1].d.getTime()));
      if (s) { s.n++; if (r.ok) s.ok++; }
    });
    const maxN = Math.max(1, ...semanas.map((s) => s.n));
    const act = h("section", "pr-avance-sec");
    act.innerHTML = "<h4>Preguntas respondidas por semana</h4>" +
      `<div class="pr-semanas">${semanas.map((s) => `<div title="Semana del ${fechaCorta(s.d)}: ${s.n} respuestas, ${s.ok} correctas">` +
        `<em>${s.n || ""}</em><span style="height:${Math.round((100 * s.n) / maxN)}%"></span><small>${fechaCorta(s.d)}</small></div>`).join("")}</div>`;
    v.append(act);
    if (S.sims.length) v.append(historial(S.sims));
    else v.append(h("p", "pr-nota", "Todavía no has rendido un precertamen en este bloque."));
  }

  /* ---------------------------- Montaje ---------------------------- */
  function montar() {
    if (EXAMEN && EXAMEN.activo) { clearInterval(EXAMEN.timer); removeEventListener("beforeunload", noSalir); }
    EXAMEN = null;
    oyentes.clear();
    document.querySelectorAll(".pr-app:not([data-ok])").forEach((r) => { r.dataset.ok = 1; montarApp(r); });
  }
  if (typeof document$ !== "undefined") document$.subscribe(montar);
  else document.addEventListener("DOMContentLoaded", montar);
})();
