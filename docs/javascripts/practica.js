/* ==========================================================================
   practica.js — Zona de práctica (playground) con puntaje.

   - Comentes: afirmaciones Verdadero / Falso / Incierto con explicación tipo pauta.
   - Talleres numéricos: ejercicios del banco verificado en R
     (practica-banco.js, generado por tools/practica_banco.py).
   - Marcador: puntos, racha y nivel. Solo puntúa el PRIMER intento de cada
     pregunta. Se guarda en el navegador (localStorage), con try/catch.
   ========================================================================== */
(function () {
  "use strict";
  const KEY = "econometria-usm:practica-certamen1:v1";

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
    [600, "🧠 Maestro de Gauss-Markov"], [900, "🏆 Leyenda del certamen"]];

  /* ---------------------------- Estado y marcador ---------------------------- */
  const vacio = () => ({ pts: 0, resp: 0, ok: 0, racha: 0, mejor: 0, hechos: {} });
  let S = vacio();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(vacio(), JSON.parse(raw)); } catch (e) { /* sin almacenamiento: se juega igual */ }
  const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* nada */ } };
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const marcadores = [];

  function nivel(p) {
    let i = 0;
    while (i + 1 < NIVELES.length && p >= NIVELES[i + 1][0]) i++;
    return i;
  }
  function pintarMarcador(m, delta) {
    const i = nivel(S.pts), sig = NIVELES[i + 1];
    const pct = sig ? Math.round((100 * (S.pts - NIVELES[i][0])) / (sig[0] - NIVELES[i][0])) : 100;
    m.querySelector(".pr-pts").textContent = S.pts;
    m.querySelector(".pr-nivel").textContent = NIVELES[i][1];
    m.querySelector(".pr-bar > span").style.width = pct + "%";
    m.querySelector(".pr-sig").textContent = sig ? `${sig[0] - S.pts} pts para ${sig[1]}` : "¡Nivel máximo!";
    m.querySelector(".pr-acc").textContent = S.resp ? `${Math.round((100 * S.ok) / S.resp)}% (${S.ok}/${S.resp})` : "—";
    m.querySelector(".pr-racha").textContent = `${S.racha} · mejor ${S.mejor}`;
    if (delta) {
      const f = h("span", "pr-float " + (delta > 0 ? "is-up" : ""), (delta > 0 ? "+" : "") + delta);
      m.querySelector(".pr-ptsbox").append(f);
      setTimeout(() => f.remove(), 1200);
    }
  }
  function sumar(puntos, correcta) {
    S.resp++;
    if (correcta) { S.ok++; S.racha++; S.mejor = Math.max(S.mejor, S.racha); } else S.racha = 0;
    S.pts += puntos;
    guardar();
    marcadores.forEach((m) => pintarMarcador(m, puntos));
  }
  function montarMarcador(m) {
    m.innerHTML =
      '<div class="pr-ptsbox"><span class="pr-lbl">Puntos</span><strong class="pr-pts">0</strong></div>' +
      '<div class="pr-nivbox"><span class="pr-nivel"></span><div class="pr-bar"><span></span></div><span class="pr-sig"></span></div>' +
      '<div class="pr-mini"><span class="pr-lbl">Aciertos al primer intento</span><strong class="pr-acc"></strong></div>' +
      '<div class="pr-mini"><span class="pr-lbl">🔥 Racha</span><strong class="pr-racha"></strong></div>';
    const reset = h("button", "econ-btn econ-btn-ghost econ-btn-sm", "↺ Reiniciar puntaje");
    reset.type = "button";
    let armado = false;
    reset.addEventListener("click", () => {
      if (!armado) { armado = true; reset.textContent = "¿Seguro? Toca otra vez"; setTimeout(() => { armado = false; reset.textContent = "↺ Reiniciar puntaje"; }, 3000); return; }
      S = vacio(); guardar(); location.reload();
    });
    m.append(reset);
    marcadores.push(m);
    pintarMarcador(m);
  }

  /* ---------------------------- Comentes ---------------------------- */
  function barajar(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function montarComentes(z) {
    const chips = h("div", "pr-chips");
    const card = h("div", "pr-card");
    const nav = h("div", "pr-nav");
    z.append(chips, card, nav);
    let tema = "todos", lista = [], pos = 0;
    TEMAS.forEach(([k, lab]) => {
      const b = h("button", "pr-chip", lab);
      b.type = "button";
      b.addEventListener("click", () => { tema = k; chips.querySelectorAll(".pr-chip").forEach((x) => x.classList.toggle("is-on", x === b)); armar(); });
      if (k === tema) b.classList.add("is-on");
      chips.append(b);
    });
    const prev = h("button", "econ-btn econ-btn-ghost", "← Anterior");
    const next = h("button", "econ-btn", "Siguiente →");
    const mezclar = h("button", "econ-btn econ-btn-ghost", "🔀 Mezclar");
    [prev, mezclar, next].forEach((b) => { b.type = "button"; nav.append(b); });
    prev.addEventListener("click", () => { pos = Math.max(0, pos - 1); pintar(); });
    next.addEventListener("click", () => { pos = Math.min(lista.length - 1, pos + 1); pintar(); });
    mezclar.addEventListener("click", () => { lista = barajar(lista); pos = 0; pintar(); });

    function armar() {
      lista = COMENTES.map((c, i) => Object.assign({ id: "c" + i }, c)).filter((c) => tema === "todos" || c.tema === tema);
      pos = 0;
      pintar();
    }
    function pintar() {
      const c = lista[pos];
      const hecho = S.hechos[c.id];
      prev.disabled = pos === 0;
      next.disabled = pos === lista.length - 1;
      const etiqueta = (TEMAS.find((t) => t[0] === c.tema) || [0, ""])[1];
      card.innerHTML = `<div class="pr-meta"><span>Comente ${pos + 1} de ${lista.length}</span><span class="pr-tag">${etiqueta}</span>` +
        `${hecho ? `<span class="pr-tag ${hecho === "ok" ? "is-ok" : "is-bad"}">${hecho === "ok" ? "✓ acertado" : "✗ fallado"} · ya no suma puntos</span>` : '<span class="pr-tag is-gold">+10 pts</span>'}</div>` +
        `<p class="pr-stmt">“${c.txt}”</p>`;
      const ops = h("div", "pr-vfi");
      const exp = h("div", "pr-exp");
      exp.setAttribute("aria-live", "polite");
      ["V", "F", "I"].forEach((v) => {
        const b = h("button", "pr-vfi-btn", VERED[v]);
        b.type = "button";
        b.addEventListener("click", () => responder(c, v, ops, exp));
        ops.append(b);
      });
      card.append(ops, exp);
      card.classList.remove("is-in"); void card.offsetWidth; card.classList.add("is-in");
    }
    function responder(c, v, ops, exp) {
      const ok = v === c.v;
      ops.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
        if (b.textContent === VERED[c.v]) b.classList.add("is-right");
        else if (b.textContent === VERED[v]) b.classList.add("is-wrong");
      });
      let extra = "";
      if (!S.hechos[c.id]) {
        const bono = ok && S.racha >= 2 ? Math.min(10, 2 * S.racha) : 0;
        S.hechos[c.id] = ok ? "ok" : "bad";
        sumar(ok ? 10 + bono : 0, ok);
        extra = ok ? `+10 pts${bono ? ` · 🔥 bono de racha +${bono}` : ""}` : "0 pts · la racha vuelve a 0";
        const tag = card.querySelector(".pr-tag.is-gold");
        if (tag) { tag.className = "pr-tag " + (ok ? "is-ok" : "is-bad"); tag.textContent = ok ? "✓ acertado" : "✗ fallado"; }
      }
      exp.innerHTML = `<p class="pr-veredicto ${ok ? "is-ok" : "is-bad"}">${ok ? "✅ ¡Correcto!" : "❌ No."} La respuesta es <strong>${VERED[c.v]}</strong>.` +
        `${extra ? ` <span class="pr-mini-pts">${extra}</span>` : ""}</p>` +
        `<ul>${c.exp.map((x) => `<li>${x}</li>`).join("")}</ul>` +
        `<p class="pr-repaso">📖 Repasa: <a href="${c.repaso[0]}">${c.repaso[1]}</a></p>`;
    }
    armar();
  }

  /* ---------------------------- Talleres numéricos ---------------------------- */
  const num = (s) => {
    const t = String(s).trim().replace(/\s+/g, "").replace(",", ".").replace("−", "-");
    return t === "" || !/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(t) ? null : parseFloat(t);
  };
  const tol = (q) => Math.max(0.5 * 10 ** -(q.dec ?? 2) + 1e-9, 0.002 * Math.abs(q.ans));
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
    ic2: (e) => `<p>Se compara ${e.contexto}: X̄ = ${e.xb} (nₓ = ${e.nx}, σₓ = ${e.sx}) e Ȳ = ${e.yb} (nᵧ = ${e.ny}, σᵧ = ${e.sy}).</p>` +
      `<p>Construye el intervalo de confianza de <strong>${e.conf}%</strong> para μₓ − μᵧ (usa z = ${{ 90: "1.645", 95: "1.96", 99: "2.576" }[e.conf]}).</p>`,
  };

  function montarTaller(z) {
    const banco = (window.PRACTICA_BANCO || {})[z.dataset.banco] || [];
    if (!banco.length) { z.textContent = "No se pudo cargar el banco de ejercicios."; return; }
    const head = h("div", "pr-meta");
    const card = h("div", "pr-card pr-ej");
    const nav = h("div", "pr-nav");
    z.append(head, card, nav);
    const otro = h("button", "econ-btn econ-btn-gold", "🎲 Otro ejercicio");
    otro.type = "button";
    nav.append(otro);
    let orden = barajar(banco.map((_, i) => i)), pos = 0;
    otro.addEventListener("click", () => { pos = (pos + 1) % orden.length; pintar(); });

    function pintar() {
      const e = banco[orden[pos]];
      const hecho = S.hechos[e.id];
      const total = e.preguntas.reduce((s, q) => s + q.pts, 0);
      head.innerHTML = `<span>Ejercicio ${pos + 1} de ${banco.length}</span>` +
        (hecho ? `<span class="pr-tag">ya resuelto: ${hecho} pts · ya no suma</span>` : `<span class="pr-tag is-gold">hasta ${total + 5} pts</span>`);
      card.innerHTML = ENUNCIADO[e.tipo](e);
      const form = h("div", "pr-form");
      const campos = e.preguntas.map((q) => {
        const box = h("div", "pr-campo");
        const lab = h("label", "", q.lab);
        let inp;
        if (q.opciones) {
          inp = h("select");
          inp.innerHTML = `<option value="">— elige —</option>` + q.opciones.map((o) => `<option>${o}</option>`).join("");
        } else {
          inp = h("input");
          Object.assign(inp, { type: "text", inputMode: "decimal", autocomplete: "off", placeholder: q.dec === 4 ? "0,0000" : q.dec === 3 ? "0,000" : "número" });
        }
        inp.setAttribute("aria-label", q.lab);
        const marca = h("span", "pr-marca");
        lab.append(inp);
        box.append(lab, marca);
        form.append(box);
        return { q, inp, marca, box };
      });
      card.append(form);
      const acciones = h("div", "pr-nav");
      const comprobar = h("button", "econ-btn", "✔ Comprobar");
      const ver = h("button", "econ-btn econ-btn-ghost", "📖 Ver solución paso a paso");
      [comprobar, ver].forEach((b) => { b.type = "button"; acciones.append(b); });
      const res = h("div", "pr-exp");
      res.setAttribute("aria-live", "polite");
      card.append(acciones, res);
      let intentado = !!hecho;

      comprobar.addEventListener("click", () => {
        let pts = 0, buenos = 0, vacios = 0;
        campos.forEach(({ q, inp, marca, box }) => {
          let ok;
          if (q.opciones) { if (!inp.value) vacios++; ok = inp.value === q.ans; } else {
            const v = num(inp.value);
            if (v === null) vacios++;
            ok = v !== null && Math.abs(v - q.ans) <= tol(q);
          }
          box.classList.toggle("is-ok", ok);
          box.classList.toggle("is-bad", !ok);
          marca.textContent = ok ? "✓" : "✗";
          if (ok) { buenos++; pts += q.pts; }
        });
        if (vacios === campos.length) { res.innerHTML = '<p class="pr-veredicto is-bad">Completa al menos un campo antes de comprobar.</p>'; campos.forEach((c) => c.box.classList.remove("is-ok", "is-bad")); return; }
        const todo = buenos === campos.length;
        let msg;
        if (!intentado) {
          intentado = true;
          const bono = todo ? 5 : 0;
          S.hechos[e.id] = pts + bono;
          sumar(pts + bono, todo);
          msg = `Primer intento: <strong>${buenos} de ${campos.length}</strong> correctos · +${pts + bono} pts${bono ? " (incluye +5 por ejercicio perfecto 🎉)" : ""}.`;
          head.querySelector(".pr-tag").textContent = `ya resuelto: ${pts + bono} pts · ya no suma`;
          head.querySelector(".pr-tag").classList.remove("is-gold");
        } else {
          msg = `${buenos} de ${campos.length} correctos. Los reintentos no suman puntos, pero sirven para practicar.`;
        }
        res.innerHTML = `<p class="pr-veredicto ${todo ? "is-ok" : "is-bad"}">${todo ? "✅ ¡Todo correcto!" : "Revisa los campos marcados con ✗."} ${msg}</p>` +
          (todo ? "" : '<p class="pr-nota">Se acepta coma o punto decimal y un pequeño margen de redondeo. Si te trabas, abre la solución paso a paso.</p>');
      });
      ver.addEventListener("click", () => {
        if (!intentado) {
          intentado = true;
          S.hechos[e.id] = 0;
          sumar(0, false);
          head.querySelector(".pr-tag").textContent = "solución vista · ya no suma";
          head.querySelector(".pr-tag").classList.remove("is-gold");
        }
        res.innerHTML = `<div class="pr-sol"><p class="pr-sol-t">📖 Solución paso a paso</p><ol>${e.solucion.map((s) => `<li>${s}</li>`).join("")}</ol>` +
          `<p class="pr-nota">Respuestas: ${e.preguntas.map((q) => `${q.lab} = <strong>${typeof q.ans === "number" ? f(+q.ans.toFixed(q.dec ?? 2)) : q.ans}</strong>`).join(" · ")}</p></div>`;
      });
      card.classList.remove("is-in"); void card.offsetWidth; card.classList.add("is-in");
    }
    pintar();
  }

  function montar() {
    document.querySelectorAll(".pr-marcador:not([data-ok])").forEach((m) => { m.dataset.ok = 1; montarMarcador(m); });
    document.querySelectorAll(".pr-zona[data-zona='comentes']:not([data-ok])").forEach((z) => { z.dataset.ok = 1; montarComentes(z); });
    document.querySelectorAll(".pr-zona[data-banco]:not([data-ok])").forEach((z) => { z.dataset.ok = 1; montarTaller(z); });
  }
  if (typeof document$ !== "undefined") document$.subscribe(() => { marcadores.length = 0; montar(); });
  else document.addEventListener("DOMContentLoaded", montar);
})();
