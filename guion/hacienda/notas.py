from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import sys

FD = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("S", FD + "LiberationSerif-Regular.ttf"))
pdfmetrics.registerFont(TTFont("SB", FD + "LiberationSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SI", FD + "LiberationSerif-Italic.ttf"))
pdfmetrics.registerFont(TTFont("SBI", FD + "LiberationSerif-BoldItalic.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("S", normal="S", bold="SB", italic="SI", boldItalic="SBI")

body = ParagraphStyle("b", fontName="S", fontSize=10.5, leading=15, spaceAfter=7)
h1 = ParagraphStyle("h1", fontName="SB", fontSize=17, leading=22, spaceAfter=10)
h2 = ParagraphStyle("h2", fontName="SB", fontSize=12.5, leading=17, spaceBefore=10, spaceAfter=6)
it = ParagraphStyle("i", parent=body, fontName="SI")
bl = ParagraphStyle("bl", parent=body, leftIndent=14, bulletIndent=2)

S = []
def P(t, st=body): S.append(Paragraph(t, st))
def B(items):
    for t in items: S.append(Paragraph(t, bl, bulletText="•"))

P("HACIENDA — Cuaderno de investigación y notas de script doctor", h1)
P("Guion de Marcello Muratore · Primer borrador · Septiembre 2026", it)

P("1. Qué dicen los manuales, y qué tomé de cada uno", h2)
B([
 "<b>Aristóteles, <i>Poética</i>.</b> La tragedia funciona por <i>peripecia</i> (el giro que da vuelta la suerte) y <i>anagnórisis</i> (el reconocimiento). En HACIENDA las dos llegan juntas y tarde: el mensaje de voz de Farías. El error trágico (hamartía) de Rubén no es la maldad sino la esperanza de salvarse de una sola vez.",
 "<b>Lajos Egri, <i>El arte de la escritura dramática</i>.</b> Toda obra debe probar una premisa. La de esta: <i>cuando todos son dueños de alguien, nadie lo cuida</i>. Cada escena la pone a prueba.",
 "<b>Syd Field, <i>El libro del guion</i>.</b> Planteo, confrontación y resolución con puntos de giro. Aquí: el sobre de Farías y la servilleta de Cacho cierran el primer acto; el remate es el punto medio; la póliza abre el tercer acto.",
 "<b>Robert McKee, <i>El guion (Story)</i>.</b> El personaje se revela en las decisiones bajo presión, y cada escena tiene que cambiar un valor de positivo a negativo o al revés. Revisé escena por escena que algo cambie. McKee también insiste en la ironía dramática: el público sabe algo que el personaje no. La escena de José en el estacionamiento existe para eso: desde ahí, el espectador sabe que la salvación existe y mira impotente cómo nadie se entera.",
 "<b>John Truby, <i>Anatomía del guion</i>.</b> Pide un rival que quiera lo mismo que el héroe, y una red de personajes que sean variaciones del mismo problema. Maxi, Dante (el otro pibe «invertido») y Rubén (el pibe que ya se rompió) son tres versiones de la misma pregunta; Abril es la cuarta, la que queda abierta.",
 "<b>Blake Snyder, <i>¡Salva al gato!</i></b> y <b>Linda Seger, <i>Cómo convertir un buen guion en un guion excelente</i>.</b> Motivos que vuelven (setups y payoffs) y un personaje que el público quiere antes de verlo sufrir. Maxi cuenta cosas desde la primera escena; ese tic termina siendo la cuenta regresiva de su propia pierna.",
 "<b>Michel Chion, <i>Cómo se escribe un guion</i></b> y <b>Doc Comparato, <i>De la creación al guion</i>.</b> Escribir para la imagen y el sonido: el zumbido del farol, el golpe de la pelota, el «crac» que no se muestra y se oye en toda la cuadra.",
])

P("2. Qué tienen en común los guiones multipremiados", h2)
P("Repasé lo que comparten los ganadores de Óscar a película internacional y las óperas primas premiadas en Venecia, Cannes y San Sebastián. Sin copiar a ninguna, busqué que HACIENDA tenga lo mismo:")
B([
 "<b>Un mundo específico que se vuelve universal.</b> Las películas argentinas que viajaron (<i>La historia oficial</i>, <i>El secreto de sus ojos</i>, <i>La ciénaga</i>, <i>Relatos salvajes</i>, <i>Argentina, 1985</i>) son muy locales y se entienden en cualquier idioma. El conurbano, el fiado, el dólar y el fútbol de inferiores son eso.",
 "<b>Una idea que se cuenta en una línea y no se vio antes.</b> Un padre vende por porcentajes el futuro de su hijo futbolista a todo el barrio, y vende más del cien por ciento. No es un drama judicial ni un policial. Es una tragedia de familia con forma de feria de ganado.",
 "<b>Un dilema moral sin salida limpia.</b> Nadie es un monstruo, todos hacen la cuenta, y la cuenta siempre da lo mismo.",
 "<b>Una secuencia central que la gente recuerda</b> (el remate, con el canto de tribuna que se convierte en conteo) y <b>un final que se discute a la salida</b> (la pelota que no baja).",
 "<b>Una metáfora que no se dice nunca.</b> Hacienda es ganado y también es el Estado que cobra. Un país que vendió su futuro a más acreedores de los que puede pagar. La película nunca lo explica.",
])

P("3. Mapa de siembras y cosechas", h2)
B([
 "«La rodilla vale» (escena 1) → la rodilla es lo que se vende, se infiltra y se rompe.",
 "El conteo de Maxi → el remate («ciento treinta y cinco»), la inyección («contá hasta tres, como el abuelo»), el cordón, Abril contando en la calle, y el final.",
 "El 10 pintado en el cordón → el lugar exacto donde se rompe la pierna.",
 "«Eso, Rusito» del VHS → Rubén lo repite sin querer → Graciela lo desenmascara en el hospital.",
 "La lata de La Virginia («PARA QUE NO LIMPIE PISOS») → la carne del remate → el sobre de Farías guardado en el mismo lugar del cuerpo.",
 "Los aviones de la terraza (23, 24) → «Veinticinco», contado desde la puerta de chapa → «Maxi no lo cuenta».",
 "La birome de Yanina → los nombres en la piel → «NO SE VENDE» → «QUEDATE», partido en dos por la herida.",
 "El anexo que falta → el cien por ciento para la S.R.L.",
 "«No me pidas perdón después» → el padre pide perdón → el hijo lo consuela.",
 "El silbato de Ramírez → Maxi árbitro que ya no pita.",
 "La zamba de Nélida → la noche del cordón, mientras cuelga el teléfono que lo hubiera cambiado todo.",
])

P("4. Lecturas de prueba (simuladas) y lo que cambié", h2)
P("No hubo lectores reales: son lecturas que hice yo mismo, poniéndome en el lugar de cada perfil, para encontrar fallas antes de que las encuentren otros. Donde la nota era justa, reescribí.", it)
B([
 "<b>Productora con experiencia en coproducción (INCAA, Ibermedia, un socio europeo).</b> «La idea es vendible en una línea y el remate es el tráiler. Me preocupa la verosimilitud del seguro». Cambio: la póliza tiene cláusulas concretas (7.3 excluye lesiones recuperables; 4.1 exige un accidente), y eso vuelve lógico el plan de Maxi en vez de caprichoso.",
 "<b>Programador de festival (Venecia / San Sebastián).</b> «El final no puede ser solo castigo; tiene que dejar una pregunta». Cambio: el epílogo repite la primera escena con Abril. La luz en los ojos de Rubén vuelve, y Maxi le aprieta la mano y dice «No». La pelota queda en el aire. El ciclo no se cierra ni se rompe: queda en manos del público.",
 "<b>Guionista veterano.</b> «Graciela amenaza a Cacho con pruebas que no tiene». Cambio: ahora usa lo que sí tiene (el cuaderno verde, el video viral del remate y la memoria de Nélida).",
 "<b>Lectora de guion.</b> «Las placas con nombre de capítulo a mitad de película son un tic». Cambio: quedó una sola, «SEIS MESES DESPUÉS».",
 "<b>Público general (test de sala imaginado).</b> Momentos de mayor reacción previstos: la médica que pregunta «¿Quién es el padre?» y levantan la mano siete personas, el «ciento treinta y cinco», Nélida atendiendo el teléfono y el mensaje de voz escuchado cuatro veces. El riesgo es que la escena del cordón sea insoportable. Por eso el impacto nunca se muestra: se ve la cara de Abril y se oye el sonido.",
 "<b>Script doctor (yo).</b> Recorté una subtrama del celular en la planificación, diálogos repetidos de Farías y de Cacho, y un tic de conteo que se repetía de más en el consultorio.",
])

P("5. Notas para producción", h2)
B([
 "Maxi, Yanina, Abril y Dante son menores. Las escenas de intimidad entre Maxi y Yanina están escritas sin nada explícito y deben filmarse así. La amenaza de Cacho sobre Abril se sugiere y nunca se muestra. Hace falta acompañamiento profesional en el set para el elenco infantil y adolescente.",
 "La fractura se construye con sonido, reacción y un plano posterior. No hace falta mostrar el golpe.",
 "Locaciones: un barrio del conurbano sur, un club de ascenso, un hospital público, una oficina en Palermo y una breve del puerto de Oporto (se puede resolver en estudio o por intercambio con el coproductor portugués).",
 "Duración estimada: 128 páginas, unos 125 a 130 minutos. Si hace falta bajarla, se puede recortar primero en la escena de Ramírez y en el montaje del barrio que se da vuelta.",
])

SimpleDocTemplate(sys.argv[1], pagesize=letter, leftMargin=72, rightMargin=72, topMargin=72, bottomMargin=72,
                  title="Hacienda — notas", author="Marcello Muratore").build(S)
