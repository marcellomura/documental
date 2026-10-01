#!/usr/bin/env python3
"""Genera el dossier de investigación y biblia de CUANDO VUELVAN LOS PECES."""
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

LIB = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("Serif", LIB + "LiberationSerif-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Serif-B", LIB + "LiberationSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Serif-I", LIB + "LiberationSerif-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Serif-BI", LIB + "LiberationSerif-BoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("Sans", LIB + "LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Sans-B", LIB + "LiberationSans-Bold.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("Serif", normal="Serif", bold="Serif-B", italic="Serif-I", boldItalic="Serif-BI")
registerFontFamily("Sans", normal="Sans", bold="Sans-B", italic="Sans", boldItalic="Sans-B")

INK = colors.HexColor("#1b1b1b")
RIVER = colors.HexColor("#1f3b4d")
RUST = colors.HexColor("#9a3b22")
PALE = colors.HexColor("#eef1f3")

S = {
    "body": ParagraphStyle("body", fontName="Serif", fontSize=10.8, leading=15.2, textColor=INK,
                           alignment=TA_JUSTIFY, spaceAfter=7),
    "bullet": ParagraphStyle("bullet", fontName="Serif", fontSize=10.8, leading=15, textColor=INK,
                             leftIndent=14, bulletIndent=2, spaceAfter=5, alignment=TA_LEFT),
    "arrow": ParagraphStyle("arrow", fontName="Serif-I", fontSize=10.4, leading=14.4, textColor=RIVER,
                            leftIndent=24, spaceAfter=8),
    "h1": ParagraphStyle("h1", fontName="Sans-B", fontSize=19, leading=23, textColor=RIVER,
                         spaceBefore=4, spaceAfter=12),
    "h2": ParagraphStyle("h2", fontName="Sans-B", fontSize=13, leading=17, textColor=RUST,
                         spaceBefore=12, spaceAfter=6),
    "h3": ParagraphStyle("h3", fontName="Sans-B", fontSize=11, leading=14, textColor=INK,
                         spaceBefore=8, spaceAfter=3),
    "quote": ParagraphStyle("quote", fontName="Serif-I", fontSize=12, leading=17, textColor=RIVER,
                            alignment=TA_CENTER, leftIndent=30, rightIndent=30, spaceBefore=8,
                            spaceAfter=12),
    "cell": ParagraphStyle("cell", fontName="Serif", fontSize=9.2, leading=12, textColor=INK),
    "cellb": ParagraphStyle("cellb", fontName="Sans-B", fontSize=9, leading=11.5, textColor=colors.white),
    "lyric": ParagraphStyle("lyric", fontName="Serif-I", fontSize=11, leading=15.5, textColor=INK,
                            leftIndent=40, spaceAfter=0),
    "small": ParagraphStyle("small", fontName="Serif", fontSize=9, leading=12, textColor=INK,
                            spaceAfter=3),
    "cover_t": ParagraphStyle("ct", fontName="Sans-B", fontSize=30, leading=36, textColor=RIVER,
                              alignment=TA_CENTER),
    "cover_s": ParagraphStyle("cs", fontName="Serif-I", fontSize=13, leading=18, textColor=INK,
                              alignment=TA_CENTER),
}


def P(t, st="body"):
    return Paragraph(t, S[st])


def B(t):
    return Paragraph(t, S["bullet"], bulletText="•")


def A(t):
    return Paragraph("→ " + t, S["arrow"])


def table(rows, widths, header=True):
    data = []
    for i, r in enumerate(rows):
        st = "cellb" if (header and i == 0) else "cell"
        data.append([Paragraph(c, S[st]) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b9c3ca")),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), RIVER)]
    for i in range(1 if header else 0, len(rows)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), PALE))
    t.setStyle(TableStyle(style))
    return t


def on_page(c, doc):
    if doc.page == 1:
        return
    c.saveState()
    c.setFont("Sans", 8)
    c.setFillColor(colors.HexColor("#6b7780"))
    c.drawString(2.2 * cm, 1.3 * cm, "CUANDO VUELVAN LOS PECES  ·  Dossier de investigación y biblia  ·  Marcello Muratore")
    c.drawRightString(A4[0] - 2.2 * cm, 1.3 * cm, str(doc.page))
    c.restoreState()


def build(out):
    doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=2.3 * cm, rightMargin=2.3 * cm,
                            topMargin=2.2 * cm, bottomMargin=2.2 * cm,
                            title="Cuando vuelvan los peces — Dossier",
                            author="Marcello Muratore")
    W = A4[0] - 4.6 * cm
    st = []

    # ---------------- PORTADA ----------------
    st += [Spacer(1, 6.5 * cm), P("CUANDO VUELVAN LOS PECES", "cover_t"), Spacer(1, 0.8 * cm),
           P("Dossier de investigación, biblia de la película y notas de escritura", "cover_s"),
           Spacer(1, 0.4 * cm), P("Ópera prima de Marcello Muratore", "cover_s"),
           Spacer(1, 5.5 * cm),
           P("«Los chistes de los muertos se vuelven promesas.»", "quote"),
           Spacer(1, 1.2 * cm), P("Buenos Aires, 2026", "cover_s"), PageBreak()]

    # ---------------- CÓMO LEER ----------------
    st += [P("Cómo leer este dossier", "h1"),
           P("Este documento acompaña al guion. Tiene tres partes. La <b>primera</b> es la investigación: qué dicen "
             "los manuales y los guionistas que importan sobre lo que tiene que tener un guion de primer nivel, qué "
             "hicieron las películas argentinas que ganaron, y qué Argentina real hay detrás de cada escena. La "
             "<b>segunda</b> es la biblia de la película: logline, premisa, personajes y arcos, estructura con "
             "números de página, y el sistema de siembras y cosechas que hace que el final pegue como pega. La "
             "<b>tercera</b> son notas de desarrollo: derechos, permisos, consultorías, una nota de intención "
             "para fondos y festivales, y los cortes posibles para una versión más corta."),
           P("Contiene <b>spoilers</b> del final. Si alguien va a leer el guion por primera vez, conviene que lo "
             "lea antes que esto."),
           Spacer(1, 6)]

    # ================= PARTE 1 =================
    st += [P("Parte 1 · Investigación", "h1"),
           P("1.1 Lo que no se negocia: síntesis de los manuales", "h2")]

    manual = [
        ("Aristóteles, <i>Poética</i>",
         "La tragedia se sostiene en la fábula. La <b>peripecia</b> es el giro que lleva de la dicha a la desgracia; "
         "la <b>anagnórisis</b>, el paso de la ignorancia al conocimiento, y es perfecta cuando coincide con la "
         "peripecia. La <b>hamartia</b> es el error de juicio de alguien que no es malo. La <b>catarsis</b> ocurre "
         "en el espectador, por compasión y terror.",
         "La hamartia de Nahuel es la llave: tira la copia al río, no se la deja a Miri y se la deja sacar la única "
         "noche en que no debía. Peripecia y anagnórisis coinciden en un solo sonido: el «clic» del candado vacío."),
        ("Lajos Egri, <i>The Art of Dramatic Writing</i>",
         "Una <b>premisa</b> clara (personaje, conflicto, desenlace), una <b>unidad de opuestos</b> que les impida "
         "transar y una <b>orquestación</b> de personajes que choquen por temperamento y por ideas.",
         "Premisa: <i>el amor que no suelta termina matando lo que quiere salvar.</i> La unidad de opuestos es "
         "literal: dos hermanos unidos por ocho metros de cadena. Orquestación: control (Nahuel), fuga (Rodrigo), "
         "fe (Miri), ley (Delfina), experiencia (Tati), poder real (el Gringo)."),
        ("Robert McKee, <i>Story</i>",
         "El <b>incidente incitador</b> rompe el equilibrio y plantea la pregunta central; el clímax la contesta. "
         "La <b>brecha</b> entre lo que el personaje espera y lo que obtiene. La <b>crisis</b> es un dilema verdadero "
         "entre dos bienes irreconciliables o dos males. El <b>clímax</b> es el cambio más extremo e irreversible.",
         "Incidente: la convulsión en el baño del Tropical (p. 12). Pregunta: ¿puede Nahuel salvar a su hermano? "
         "Crisis: soltarlo el día 23, cuando ya demostró que puede, o sostener el pacto de treinta días. Clímax: el "
         "incendio. La brecha es la película entera: lo salva, y lo pierde por haberlo salvado así."),
        ("John Truby, <i>The Anatomy of Story</i>",
         "Debilidad y necesidad (psicológica y moral), deseo, oponente, plan, batalla, <b>autorrevelación</b> y "
         "nuevo equilibrio. La revelación moral pega más fuerte cuanto más cerca del final llega.",
         "La verdad de Nahuel se la dice su hermano en el día 23 («No me querés curar. Me querés tener») y él la "
         "entiende recién arrodillado en las cenizas. El nuevo equilibrio queda suspendido, literalmente, en el medio "
         "del río."),
        ("Blake Snyder, <i>Save the Cat</i>",
         "Catalizador cerca del 10%, quiebre al segundo acto en el 20-25%, punto medio en el 50% (falsa victoria o "
         "falsa derrota), «todo está perdido» en el 75%, final.",
         "Aplicado con lógica de tragedia: el punto medio (la noche del transbordador) es a la vez falsa victoria "
         "(la cadena lo salvó) y la lección equivocada que lleva al final. Ver la estructura en la parte 2."),
        ("Doc Comparato, <i>De la creación al guion</i>",
         "Seis etapas: idea, conflicto, personajes, acción dramática, tiempo dramático y unidad dramática. El tiempo "
         "dramático es psicológico, no físico.",
         "El contador DÍA 0 … DÍA 30 convierte el tiempo en presión. Y la góndola, que tarda siempre cuatro minutos, "
         "convierte el tiempo físico en tortura en el cruce final."),
        ("Chéjov: plantar y pagar",
         "Todo lo que se muestra tiene que disparar. Si hay un arma en el primer acto, se usa en el tercero.",
         "Hay casi treinta siembras con su cosecha (tabla en la parte 2). Ninguna desgracia del final aparece "
         "de la nada: el cable, la garrafa, la llave, el metro que falta, el teléfono boca abajo."),
        ("Aaron Sorkin (MasterClass)",
         "<b>Intención y obstáculo</b>: sin eso no hay drama. El personaje se define por las tácticas que usa para "
         "vencer el obstáculo. El diálogo es música: ritmo, repetición, réplica.",
         "Cada escena tiene un motor: Miri quiere que Nahuel vaya a buscar a Rodrigo; Delfina quiere no involucrarse; "
         "el Gringo quiere el transbordador. La música está en las repeticiones que vuelven cambiadas: «Ya sé», "
         "«Treinta», «A las ocho, no a las ocho y cinco», «Una noche», «¿Hay peces? —Ni uno»."),
        ("Subtexto: mostrar, no contar",
         "Los personajes casi nunca dicen lo que sienten; lo hacen.",
         "Nahuel no dice «te quiero»: lava a su hermano con agua tibia. Don Ugo no dice «sé lo que estás haciendo»: "
         "regala una crema de caléndula «para la pata». Miri no perdona con palabras: pinta uñas."),
        ("Formato de industria",
         "Courier 12, encabezados INT./EXT. + lugar + DÍA/NOCHE, presente del indicativo, una página por minuto.",
         "El guion está en formato estándar (A4, márgenes de 1,5 y 1 pulgada, sangrías de diálogo y personaje "
         "de industria), con SOBREIMPRESOS para el contador de días."),
    ]
    for name, what, how in manual:
        st += [KeepTogether([P(name, "h3"), P(what), A(how)])]

    st += [P("1.2 Lo que hicieron las películas argentinas que ganaron", "h2")]
    films = [
        "<b><i>El secreto de sus ojos</i></b> (Campanella y Sacheri, Oscar 2010). Personajes con pasado, un amor que "
        "nunca se dice y un final moral que se vuelve imagen: un hombre que tiene preso a otro en su casa durante "
        "veinticinco años. <i>Cuando vuelvan los peces</i> discute con esa imagen: allá alguien encierra por odio, "
        "acá por amor. Y el espectador tiene que decidir si hay tanta diferencia.",
        "<b><i>Relatos salvajes</i></b> (Szifron). Personajes empujados a cruzar límites morales y físicos, una "
        "violencia que es consecuencia de las emociones y el humor negro como forma de catarsis.",
        "<b><i>Argentina, 1985</i></b> (Mitre y Llinás). El humor no le quita seriedad al drama: lo descomprime y "
        "lo vuelve humano. Acá cumplen esa función Tati, Doña Chela, el comisario con el choripán y el prefecto "
        "que pregunta por la molleja.",
        "<b>Nuevo Cine Argentino</b> (<i>Pizza, birra, faso</i>; <i>Mundo grúa</i>). El diálogo no siempre avanza "
        "la trama: construye personaje. La oralidad del margen, trabajada con los actores hasta que suena natural.",
        "<b>Los Javis</b> (<i>La llamada</i>, <i>Veneno</i>, <i>La Mesías</i>). Melodrama sin vergüenza mezclado con "
        "humor, fe popular, cultura pop y una relación de hermanos en el centro. La traducción argentina: Gilda, el "
        "Gauchito Gil, la cumbia, la fiesta de quince, la carioca, el velorio con parlante.",
        "<b>Finales que persiguen</b>. <i>La La Land</i>: el epílogo que deshace cada error y después te devuelve a "
        "la realidad. <i>Aftersun</i>: la memoria como un lugar imposible donde se intenta alcanzar a alguien que ya "
        "se fue. Nuestro montaje de «lo que hubiera sido» aprende de los dos: arranca exactamente en el plano del "
        "error («Soltame») y termina en una utopía imposible (el Riachuelo apto para baño).",
    ]
    st += [B(f) for f in films]

    st += [P("1.3 La Argentina que investigamos (y que está en la película)", "h2")]
    arg = [
        "<b>Ley Nacional de Salud Mental 26.657, art. 20.</b> La internación involuntaria es excepcional: exige "
        "«riesgo cierto e inminente para sí o para terceros», dictamen de dos profesionales de distintas disciplinas "
        "y control judicial. La película no ataca ni defiende la ley: muestra el agujero entre la ley y la vida, "
        "donde caen las familias.",
        "<b>Madres que encadenaron a sus hijos.</b> Hay casos documentados, como el de una madre de Tucumán que ató a "
        "su hijo de 14 años para que no consumiera paco: «Prefería que estuviera encadenado y no muerto en la calle». "
        "La cadena de Rodrigo no es una metáfora inventada.",
        "<b>El paco.</b> Residuo de cocaína, barato, nacido con la crisis de 2001, extendido entre jóvenes de barrios "
        "vulnerables. Rodrigo combina paco, cocaína, pastillas y alcohol diario: de ahí la abstinencia con convulsiones "
        "y el protocolo que improvisa Delfina (diazepam y tiamina).",
        "<b>Ludopatía adolescente</b> por apuestas online (Kids Online Argentina 2025; Observatorio Humanitario de la "
        "Cruz Roja). La investigamos y la descartamos como eje para no dispersar la historia. Puede aparecer como "
        "textura de rodaje: los pibes de la esquina apostando en el celular.",
        "<b>Decreto y ley Tajani (2025).</b> Restringió la ciudadanía italiana por descendencia. A los Bertoldi, "
        "bisnietos de italiano, les cerró la salida por Ezeiza. Para Rodrigo, que es Medina, esa salida nunca existió: "
        "la sangre decide quién puede irse.",
        "<b>El Riachuelo y el Transbordador Nicolás Avellaneda.</b> Inaugurado en 1914 para que miles de obreros "
        "cruzaran a los frigoríficos. Es uno de los pocos transbordadores que siguen en pie en el mundo y el único de "
        "América, restaurado y reabierto al público. En el medio del río muerto queda colgada una góndola que no llega "
        "a ningún lado: va y vuelve. Es el lugar de Nahuel.",
        "<b>Isla Maciel.</b> Conventillos obreros de madera y chapa de principios del siglo XX, frente a La Boca. Del "
        "otro lado del río la misma arquitectura se recicló en lofts para gente que paga en dólares. Delfina vive en "
        "una casa igual a la de Nahuel, pero con plata.",
        "<b>El Estado que no llega.</b> Ambulancias que esperan al patrullero para entrar, pasillos donde no cabe el "
        "camión de bomberos, hidrantes secos, colgados eléctricos. La tragedia no la provoca un villano: la provoca "
        "el invierno.",
    ]
    st += [B(a) for a in arg]
    st += [Spacer(1, 14)]

    # ================= PARTE 2 =================
    st += [P("Parte 2 · La película", "h1")]
    st += [table([
        ["Título", "<b>CUANDO VUELVAN LOS PECES</b>"],
        ["Género", "Melodrama trágico. Drama romántico y de hermanos."],
        ["Duración", "137 páginas de guion. Duración estimada entre 125 y 135 minutos: hay mucho diálogo breve, que en "
                     "pantalla corre más rápido que una página por minuto."],
        ["Época y lugar", "Un invierno del presente. Isla Maciel y Dock Sud (Avellaneda), La Boca y el Riachuelo."],
        ["Locaciones clave", "El Transbordador Nicolás Avellaneda y su góndola. Un conventillo de madera y chapa. Una "
                             "bailanta portuaria. La guardia del Hospital Argerich. Un salón de fiestas de quince."],
        ["Idioma", "Español rioplatense (más breves pasajes en inglés y portugués)."],
    ], [3.6 * cm, W - 3.6 * cm], header=False), Spacer(1, 10)]

    st += [P("Logline", "h2"),
           P("Cuando la ley no le permite internar a su hermano menor, un cantante de cumbia hundido en el paco, el "
             "hombre que maneja el viejo transbordador del Riachuelo lo encadena treinta días a la columna de su "
             "conventillo en Isla Maciel, mientras se enamora de la médica que debería denunciarlo.", "quote"),
           P("Premisa y pregunta moral", "h2"),
           P("<b>Premisa:</b> el amor que no suelta termina matando lo que quiere salvar."),
           P("<b>Pregunta que la película le deja al espectador:</b> ¿hasta dónde se puede quitarle la libertad a "
             "alguien por amor? Y cuando el Estado ya se fue, ¿de quién es la culpa? La película no contesta: hace que "
             "el espectador desee que la cadena funcione, le muestra que funciona, y después le cobra ese deseo."),
           ]

    st += [P("Sinopsis corta", "h2"),
           P("Nahuel (30) maneja la góndola del transbordador del Riachuelo y vive del otro lado, en Isla Maciel, con su "
             "hermana Miri (28) y su medio hermano Rodrigo (22), «el Potrito», un cantante de cumbia con un talento "
             "enorme y cinco años de paco encima. Después de una convulsión, del alta de la guardia, de los turnos para "
             "octubre y de una paliza de los pibes de la cuadra, Nahuel compra ocho metros de cadena «para un perro» y "
             "encadena a su hermano a la columna de hierro de la casa. Treinta días. Para sostenerlo, la familia cruza "
             "todos los límites: una médica que roba medicación y se enamora de él, un barrio que se acostumbra a ver a "
             "un chico encadenado y le lleva fideos, y Nahuel convertido en mula de un narco usando un monumento "
             "histórico nacional. Rodrigo se recupera, vuelve a cantar y pide que lo suelten. Nahuel dice que faltan "
             "siete días. La única noche que se permite dormir del otro lado del río, la casa se prende fuego. La llave "
             "está en la mesa de luz de Delfina, al lado de un teléfono boca abajo."),
           ]

    st += [P("Sinopsis por actos", "h2"),
           P("<b>Acto I (pp. 1-34).</b> La góndola cruza un río donde, según la guía, «no vive nada». Nahuel come una "
             "milanesa en la cabina. En casa, Miri le hace las uñas a Tati y le cuenta que un ministro italiano le cerró "
             "la ciudadanía. Le recuerda que su madre muerta pidió que tiraran sus cenizas al Riachuelo «cuando vuelvan "
             "los peces». La urna espera en un altar de Gilda, al lado de un cable que tira chispas. Nahuel va a "
             "buscar a Rodrigo a una bailanta: lo ve brillar delante de mil personas y lo encuentra convulsionando en un "
             "baño. El Gringo, amigo de la infancia y ahora el narco de la orilla, los lleva al Argerich. Ahí está "
             "Delfina, una residente agotada que, ley en mano, le da el alta a Rodrigo. El sistema falla en montaje. "
             "Rodrigo roba el anillo de su madre y la caja del almacén, y los pibes de la cuadra casi lo matan en la "
             "orilla. Tati cuenta que su abuela la encadenó veinte días «y acá estoy, linda y careta». Nahuel compra la "
             "cadena y tira la segunda llave al río."),
           P("<b>Acto II-A (pp. 35-62).</b> Lo encadenan durante el Superclásico: el gol de la Bombonera tapa los gritos. "
             "Vienen la abstinencia, la humillación y la ternura: Nahuel baña a su hermano, que se ensució encima. Una "
             "convulsión obliga a llamar a Delfina, que ve la cadena, describe el delito y se queda: deja diazepam, "
             "tiamina y la frase «yo no vine». El barrio normaliza la cadena (el comisario saluda por la ventana). El "
             "Gringo cobra la deuda: Nahuel cruzará mochilas en la góndola. El día 10 los hermanos pactan un número, "
             "treinta. Mientras Miri le pinta las uñas, Rodrigo confiesa su herida: en la videollamada desde la terapia "
             "intensiva, cuando su madre se moría de covid, él le dio la nuca."),
           P("<b>Punto medio (pp. 63-72).</b> En el aniversario de la madre, los hermanos la llevan, como todos los años, a "
             "«ver el río» desde la góndola. Esta vez Rodrigo va encadenado a la muñeca de Nahuel. Hay cumbia, baile y el "
             "primer momento en que Nahuel cierra los ojos, abrazado a Delfina. Rodrigo se tira por la baranda. La "
             "cadena lo sostiene colgado sobre el agua negra: toca el río con la zapatilla. «Está tibia, Nahu.» Delfina "
             "entiende que no es la droga, es depresión. Nahuel aprende la lección equivocada: la cadena salva."),
           P("<b>Acto II-B (pp. 73-99).</b> Delfina y Nahuel se acuestan en su loft, un conventillo igual al de él pero "
             "con plata. En el cumpleaños de Miri, el barrio entero festeja alrededor de un chico encadenado que canta "
             "«Corazón valiente». El padre llama desde España y dice «vénganse los dos». Una lancha de Prefectura obliga "
             "a Nahuel a tirar un kilo y medio al río, y resulta que solo querían saber si la parrilla abría de noche. "
             "La deuda se triplica. El Gringo ofrece saldarla si Rodrigo canta en los quince de su hija. Delfina es "
             "suspendida. En la fiesta, Rodrigo recibe la vela número quince, tiene una raya en la cara y la sopla como "
             "una vela de cumpleaños. Canta como nunca y recupera el anillo de su madre. Al amanecer pide que lo suelten. "
             "Nahuel dice que faltan siete días. «Vos no me querés curar. Me querés tener.» Rodrigo cierra el candado "
             "él mismo."),
           P("<b>Acto III (pp. 100-137).</b> Delfina le pide una noche. Miri también: «Andá». Rodrigo hace las paces con "
             "su hermano. En la puerta, Miri le pide la llave «por si»; Nahuel dice «a las ocho estoy acá». Montaje "
             "paralelo: en La Boca, Delfina le saca la llave del cuello y da vuelta el teléfono, «el mundo no se cae en "
             "una noche»; en la Isla, Rodrigo le devuelve el anillo a Miri, termina la canción, se la graba a Nahuel y "
             "le pide a Miri que apague la vela de Gilda. Miri la apaga. A las 04:10 el fuego no sale de la vela: sale "
             "del cable. Miri se quema las manos contra el candado. El Turco sierra una cadena que «no la corta ni un "
             "caballo». Rodrigo le pide que se lleve a su hermana y canta para que ella se vaya. El barrio arma una "
             "cadena humana con baldes de agua negra del río. Nahuel se despierta con 47 llamadas perdidas y cruza en la "
             "góndola, a su velocidad de siempre, viendo arder su casa. Llega tarde, se arrodilla en las cenizas y abre "
             "con la llave un candado vacío. Clic. Velorio: el narco paga todo, el padre no viene («éramos tres, papá»), "
             "y Nahuel no puede mirar a Delfina sin ver esa noche. Dos semanas después, en la góndola, escuchan el audio. "
             "El montaje de lo que hubiera sido termina con tres viejos nadando entre peces en un Riachuelo limpio. "
             "«¿Hay peces?» «Ni uno.» Y un pez salta."),
           ]

    st += [PageBreak(), P("Personajes y arcos", "h2")]
    st += [table([
        ["Personaje", "Quiere (deseo)", "Necesita", "Debilidad / herida", "Arco y revelación"],
        ["<b>NAHUEL BERTOLDI</b> (30). Opera la góndola del transbordador. Dejó Ingeniería Naval en tercer año.",
         "Que Rodrigo llegue limpio al día 30.",
         "Soltar. Aceptar que no puede salvar a nadie por la fuerza. Darse permiso para vivir.",
         "Control disfrazado de amor. Mártir. A los 7 años quedó como «el hombre de la casa» cuando el padre se fue a "
         "España; le prometió a su madre agonizante «cuidámelos».",
         "Del hombre que cruza a otros y nunca se baja, al que se permite una noche. La revelación llega tarde: "
         "«no lo quería curar, lo quería tener». Termina suspendido en el medio del río, con la mano en la palanca."],
        ["<b>RODRIGO MEDINA, «el Potrito»</b> (22). Cantante de cumbia y RKT. Medio hermano.",
         "Al principio, no sentir. Después, cantar, terminar la canción para su madre y ser libre.",
         "Hacer el duelo. Creer que merece vivir.",
         "«Los Medina no llegamos a los treinta.» El padre, el Chino, murió de sobredosis. Le dio la nuca a su madre "
         "moribunda.",
         "Del pibe que se quiere morir («por ahí sí») al que sopla la raya y le da la cara a su hermana en el fuego. "
         "Se encamina, y la película se lo lleva justo ahí."],
        ["<b>MIRI (MIRIAM) BERTOLDI</b> (28). Manicura, devota de Gilda.",
         "Irse a España con la ciudadanía italiana.",
         "Que la tomen en serio. Encontrar que su casa es acá.",
         "La escapatoria y la fe como anestesia. «Vos te ablandás», le dice su hermano.",
         "La que se iba a ir es la que se queda, y la que «se ablanda» se quema las manos contra el candado. «Éramos "
         "tres, papá.»"],
        ["<b>DELFINA ARANA</b> (29). Residente de toxicología del Argerich. Vive en un loft de La Boca.",
         "No involucrarse. Después, a Nahuel, y ayudar a Rodrigo «bien».",
         "Volver a actuar como persona y no como protocolo, sin perder su verdad (la libertad).",
         "Hizo todo según la ley con un chico de 19 que murió en las vías de Constitución a los dos días.",
         "De la ley a la transgresión: roba medicación, la suspenden, declara que supervisaba. «Hice todo bien y se "
         "murió. Hice todo mal y se murió.» Su regalo, una noche, es también la causa."],
        ["<b>TATI</b> (27). Mujer trans, amiga y compañera de Miri.",
         "Que la familia sobreviva.",
         "—",
         "Su abuela la encadenó veinte días; era la única de la familia que la llamaba Tatiana.",
         "El coro con experiencia: es su testimonio el que vuelve pensable la cadena. Ataja la urna en el aire."],
        ["<b>EL GRINGO</b> (31). Amigo de la infancia de Nahuel. Narco de la orilla.",
         "Cobrar. Que su hija tenga la fiesta.",
         "—",
         "Es el único poder que funciona en la Isla.",
         "Lleva a Rodrigo al hospital, paga el cajón y perdona la deuda. «Andate, antes de que te dé las gracias.»"],
        ["<b>EL TURCO, DOÑA CHELA, DON UGO, DON PASCUAL, EL COMISARIO BENÍTEZ</b>",
         "El barrio como coro griego.", "", "",
         "Chela cuenta los minutos («doce»). Don Ugo vende cadenas y regala caléndula. Don Pascual pregunta todos los "
         "años si había peces. Benítez saluda la cadena con dos dedos y después trae la citación."],
    ], [3.2 * cm, 2.6 * cm, 2.6 * cm, 3.3 * cm, W - 11.7 * cm])]

    st += [PageBreak(), P("Estructura (con páginas del guion)", "h2")]
    st += [table([
        ["Beat", "Página", "Qué pasa"],
        ["Imagen de apertura", "1-2", "Agua negra. «Nothing lives here.» La góndola. «For you? Yes. Because you come back.»"],
        ["Tema planteado", "6", "«Los chistes de los muertos se vuelven promesas.» «Nos puso nombres de muertos.»"],
        ["Incidente incitador", "12", "Rodrigo convulsiona en el baño del Tropical."],
        ["Debate", "13-31", "Guardia y alta («Si fuera un perro lo podrías internar»). Fracaso del sistema. Robo del anillo. Paliza. Tati y su abuela."],
        ["Quiebre al Acto II", "32-34", "Ferretería: «para un perro». La segunda llave cae al río."],
        ["Primer set piece", "35-40", "La captura durante el Superclásico. El gol tapa los gritos."],
        ["Juegos y diversión (oscuros)", "40-62", "Abstinencia, el baño, la convulsión, Delfina cruza la línea, el barrio normaliza, la primera mochila, el pacto de los 30 días, la nuca."],
        ["Punto medio", "63-72", "La noche del transbordador: baile, caída, la cadena lo sostiene. «Está tibia.» Falsa victoria y lección equivocada."],
        ["Los malos se acercan", "73-97", "Amor y loft; el cumpleaños con el chico encadenado; la Prefectura y la molleja; la deuda; la suspensión; la fiesta de quince; la raya soplada."],
        ["Crisis", "98-99", "«Soltame.» «Faltan siete.» «Me querés tener.» Rodrigo se encadena solo."],
        ["Quiebre al Acto III", "100-105", "«Una noche. El mundo no se cae en una noche.» «Dejame la llave.» «A las ocho estoy acá.»"],
        ["Todo está perdido", "112-118", "El incendio. «Andá, que te canto.» La cadena humana. «Doce.»"],
        ["Noche oscura", "119-127", "47 llamadas. El cruce más lento del mundo. El candado vacío: clic. Velorio. «Éramos tres.» «No te puedo mirar sin que sea esa noche.»"],
        ["Final", "128-137", "El audio. Montaje de lo que hubiera sido. «¿Hay peces?» «Ni uno.» El pez. Las cenizas. La llave al río. La góndola arranca: no se sabe hacia qué orilla."],
    ], [3.6 * cm, 1.6 * cm, W - 5.2 * cm])]

    st += [PageBreak(), P("Sistema de siembras y cosechas", "h2"),
           P("El final no le pega al espectador por sorpresa sino por inevitabilidad: cada elemento de la tragedia estuvo "
             "a la vista desde antes. Estas son las siembras principales y su cosecha.")]
    st += [table([
        ["Se planta", "Se cosecha"],
        ["«Nothing lives here» (la guía, p. 2).", "Un pez salta frente a la góndola cuando Nahuel acaba de decir «ni uno»."],
        ["La urna con strass y «cuando vuelvan los peces».", "Las cenizas de la madre y del hijo caen juntas al río después del pez: «Ahora sí»."],
        ["El cable colgado que tira chispas. «Mañana lo arreglo.» (x2)", "A las 04:10 el empalme se pone rojo detrás del altar."],
        ["«Se terminó la garrafa.» La estufa eléctrica en la zapatilla.", "El consumo que recalienta el cable."],
        ["La vela de Gilda (falsa alarma). «Me prendo fuego como Juana de Arco.»", "Miri la apaga: el espectador respira. El fuego sale de otro lado."],
        ["Dos llaves. Nahuel tira una al río. «Vos te ablandás.»", "Miri, la que «se ablanda», se quema las manos contra el candado. La segunda llave termina en el río, junto a la primera."],
        ["Tati: la abuela internada con la llave en el corpiño.", "Nahuel dormido del otro lado, con la llave en la mesa de luz."],
        ["«Me falta un metro» para la puerta (día 2).", "El bombero: «Estaba al lado de la puerta. A un metro»."],
        ["Don Ugo: «Esta no la corta ni un caballo».", "El Turco sierra y la sierra apenas marca el eslabón."],
        ["El gol del Superclásico tapa los gritos.", "En el incendio no hay gol: hay silencio y una canción que se apaga."],
        ["La cadena de hierro.", "La cadena humana de baldes con agua negra del río."],
        ["La góndola, «lo único lento de esta ciudad» (Delfina).", "El cruce de cuatro minutos viendo arder la casa."],
        ["«Una noche. El mundo no se cae en una noche.»", "Se cae."],
        ["El teléfono boca abajo, al lado de la llave.", "Vibra hasta tocar la llave, como un grillo."],
        ["La nuca: Rodrigo le dio la espalda a su madre moribunda.", "En el fuego no le da la nuca a Miri: le da la cara."],
        ["«Los Medina no llegamos a los treinta.»", "Rodrigo muere a los 22."],
        ["«Nos puso nombres de muertos.»", "Gilda (Miri) sobrevive; Rodrigo (el Potro) no."],
        ["El anillo robado (Acto I).", "Rodrigo lo recupera cantando y se lo devuelve a Miri la última noche."],
        ["La pipa de «cuarenta lucas».", "«Cuarenta lucas, como la pipa», después de soplarle la raya al Kevin."],
        ["Delfina y el chico de las vías: hizo todo bien.", "«Hice todo bien y se murió. Hice todo mal y se murió.»"],
        ["«Sos igual que papá: te encanta que te necesiten y después te vas.» «Todavía.»", "La única noche que se va."],
        ["«De la Isla no se sale» (el hit).", "No sale."],
        ["Rubén: «vénganse los dos».", "«Éramos tres, papá.»"],
        ["La canción sin final. «Tenés veinte días.»", "La termina la última noche: «Soltame, que no me voy»."],
        ["Don Pascual: «¿Había peces?» «Ni uno.»", "Se repite en el final, y esta vez el río contesta."],
        ["«Es el ruido más chico del mundo» (el clic del día 0).", "El mismo clic, en las cenizas."],
    ], [W * 0.46, W * 0.54])]

    st += [P("Las secuencias que sostienen la película", "h2")]
    seqs = [
        ("La captura (pp. 35-40)",
         "Un chico dormido, un repasador con un gallo alrededor del tobillo, un candado que hace el ruido más chico del "
         "mundo. Cuando Rodrigo grita pidiendo ayuda, sesenta mil personas gritan un gol del otro lado del río y la "
         "Isla entera lo festeja: el país está mirando otra cosa. Un minuto entero de gritos que nadie oye."),
        ("El punto medio: la noche del transbordador (pp. 63-72)",
         "Es la secuencia memorable del medio. Una procesión barrial con una urna brillante y dos hermanos encadenados. "
         "La góndola frenada en el medio del río, la luna reflejada por primera vez en el agua negra, una cumbia de "
         "Gilda y el primer baile de Nahuel y Delfina. En el único segundo en que Nahuel cierra los ojos, su hermano se "
         "tira. La cadena lo sostiene colgado sobre el río y él estira la pierna para tocar el agua. La belleza y el "
         "espanto en el mismo plano, y la lección equivocada que lleva al final."),
        ("La fiesta de quince (pp. 91-96)",
         "El kitsch como forma de amor: la escalera LED, el narco que llora bailando el vals, la vela número quince "
         "para el Potrito. En el baño, la raya sobre el mármol negro. Rodrigo la sopla «como una vela de cumpleaños». "
         "Es la celebración de la vida que la película le debe al espectador antes de quitarle todo."),
        ("El final (pp. 106-137)",
         "Montaje paralelo entre la noche más feliz de Nahuel y la última noche de Rodrigo. El espectador ve la vela y "
         "respira cuando Miri la apaga; el fuego sale del cable. El teléfono vibra hasta tocar la llave. «Andá, que te "
         "canto.» La cadena humana con agua del río muerto. El cruce de cuatro minutos: un hombre encerrado en una "
         "caja lenta viendo arder su casa con la llave en la mano. Esa es la bronca y la impotencia del espectador, "
         "hecha imagen. El clic en las cenizas. El audio. El montaje de lo que hubiera sido, que empieza en el plano "
         "exacto del error y termina en tres viejos nadando entre peces. «¿Hay peces?» «Ni uno.» Plop."),
    ]
    for t, d in seqs:
        st += [KeepTogether([P(t, "h3"), P(d)])]

    st += [P("Dónde la película roza los límites éticos", "h2")]
    eth = [
        "Hace que el espectador desee que la cadena funcione, y la cadena funciona: Rodrigo se limpia. Lo que lo mata "
        "no es la falta de amor, es su forma.",
        "Una médica que roba medicación y no denuncia un delito, y que es la persona más ética de la película.",
        "Un barrio que normaliza a un chico encadenado: le llevan fideos, el comisario saluda, el cumpleaños se arma "
        "alrededor de la cadena.",
        "El narco es la única institución que aparece cuando hace falta: auto, hospital, cajón, perdón de deuda.",
        "Un hermano decente convertido en mula, usando un monumento histórico nacional.",
        "El consentimiento: Rodrigo pacta los treinta días y el día 23 se encadena él mismo. ¿Eso lo vuelve libre?",
    ]
    st += [B(e) for e in eth]

    st += [P("Tono, imagen y sonido", "h2")]
    tone = [
        "<b>Tono:</b> melodrama sin pudor y humor de barrio en la misma escena. Ningún personaje es un monstruo: hasta "
        "el narco llora con el vals.",
        "<b>Imagen:</b> el agua negra que no refleja nada, hasta que refleja la luna en el punto medio y el cielo en el "
        "montaje de lo que hubiera sido. El hierro como personaje: la columna, el transbordador, la cadena, el candado.",
        "<b>Sonido:</b> el silencio espeso del río (no hay pájaros), el rugido de la Bombonera que llega por el agua, el "
        "zumbido de la estufa y del cable, el clic del candado como leitmotiv, y el audio de Rodrigo como última voz "
        "de la película.",
        "<b>Música:</b> dos canciones originales de Rodrigo, «Rescatate» (hit de bailanta) y «Cuando vuelvan los "
        "peces» (balada), más cumbias de Gilda como música de la fe popular (sujeto a derechos).",
        "<b>El montaje de lo que hubiera sido</b> tiene otra textura: cálida, dorada, de video casero, como los "
        "videos de Claudia en la pileta de lona.",
    ]
    st += [B(t) for t in tone]

    st += [PageBreak(), P("Las canciones de Rodrigo", "h2"), P("Rescatate (fragmento, el hit)", "h3")]
    for l in ["Me dicen rescatate (¡rescatate!),", "me dicen bajá un cambio (¡un cambio!),",
              "pero yo nací en la Isla…", "—¡Y de la Isla no se sale!"]:
        st.append(P(l, "lyric"))
    st += [Spacer(1, 10), P("Cuando vuelvan los peces (completa, el audio de las 02:47)", "h3")]
    song = [
        "Mi vieja decía que el río no estaba muerto,", "que estaba cansado de tanto llevar,",
        "que un día de golpe, sin que nadie lo vea,", "se iba a despertar.", "",
        "Y cuando vuelvan los peces", "nos metemos todos,", "aunque haga frío,", "aunque no sepamos nadar.",
        "Cuando vuelvan los peces,", "mamá, te prometo,", "te saco de la cajita", "y te dejo nadar.", "",
        "Yo me fui tan lejos sin cruzar el puente,", "me perdí en la Isla sin salir de acá,",
        "y cada vez que me caía, vieja,", "alguien me venía a buscar.", "",
        "Y a vos, hermano, que me tenés tan fuerte,", "que no dormís de miedo a que me vaya:",
        "soltame, que no me voy.", "Soltame, que ya estoy.", "Soltame, que no me voy…", "",
        "Y cuando vuelvan los peces", "nos metemos todos…",
    ]
    for l in song:
        st.append(P(l if l else "&nbsp;", "lyric"))

    # ================= PARTE 3 =================
    st += [PageBreak(), P("Parte 3 · Desarrollo y producción", "h1"),
           P("Nota de intención (borrador para fondos y festivales)", "h2"),
           P("<i>Este texto es un borrador para que el autor lo haga suyo.</i>", "small"),
           P("Crecí en un país donde las familias hacen lo que el Estado no hace, y donde eso a veces es amor y a veces es "
             "otra cosa. <i>Cuando vuelvan los peces</i> nace de una pregunta que no me deja tranquilo: ¿qué harías si la "
             "ley te dice que tu hermano tiene derecho a morirse? En la Argentina hay madres que encadenaron a sus hijos "
             "para salvarlos del paco. No quise juzgarlas ni absolverlas. Quise ponerme adentro de esa casa durante "
             "treinta días."),
           P("Elegí el Transbordador del Riachuelo porque es la imagen más exacta que encontré de mi generación: una "
             "máquina hermosa, de hierro, de hace cien años, que sigue funcionando y no lleva a ningún lado. Va y vuelve "
             "sobre un río que todos los gobiernos prometieron limpiar. Del otro lado está la ciudad que se recicla en "
             "lofts; de este lado, los mismos conventillos se prenden fuego. La película es una celebración de los "
             "hermanos, de la cumbia, de las santas populares y de un barrio que pasa baldes de agua negra de mano en "
             "mano aunque ya no haya nada que apagar. Y es también una tragedia: quiero que el espectador salga con bronca, "
             "con un nudo en la garganta y con la pregunta abierta. Y que no pueda olvidarse del ruido más chico del "
             "mundo: el clic de un candado."),
           ]

    st += [P("Para la próxima versión", "h2")]
    nxt = [
        "<b>Derechos musicales:</b> «No me arrepiento de este amor» y «Corazón valiente» (Gilda). Negociarlos o "
        "reemplazarlos por temas originales con la misma función (la fe popular, la madre).",
        "<b>Locaciones:</b> permisos para filmar en el Transbordador Nicolás Avellaneda con el organismo que lo "
        "administra, incluidos rodajes nocturnos con la góndola detenida en el medio del río. Evaluar un set de la "
        "cabina y la baranda para la caída del punto medio.",
        "<b>Consultorías:</b> toxicología y psiquiatría (protocolo de abstinencia: diazepam, tiamina, sertralina), "
        "Hogar de Cristo, bomberos voluntarios de Dock Sud y Avellaneda, y vecinos de Isla Maciel. Para la cadena humana "
        "conviene sumar vecinos reales, como hace el Nuevo Cine Argentino.",
        "<b>Lecturas en voz alta</b> con actores antes de cerrar diálogos: la naturalidad se termina de encontrar en "
        "la boca de los actores, como en <i>Pizza, birra, faso</i>.",
        "<b>Cortes posibles para una versión de unas 120 páginas</b>, si un fondo o productor lo pide: la sala de "
        "observación del Argerich (puede resolverse dentro del pasillo), el primer cruce con mochila (la Prefectura "
        "alcanza), la escena de Rodrigo pidiendo ir a la góndola (la procesión puede arrancar directamente), parte del "
        "cumpleaños de Miri, y la llegada de Nahuel al loft. Ninguno toca las siembras del final.",
    ]
    st += [B(n) for n in nxt]

    st += [P("Fuentes consultadas", "h2")]
    src = [
        "Robert McKee, principios de <i>Story</i>: shortform.com/blog/robert-mckee-story-structure · mordego.com/screenplay/the-inciting-incident-by-mckee",
        "John Truby, <i>The Anatomy of Story</i>: medium.com/@pirangy (22 Steps I) · beabrilliantwriter.com/anatomy-of-story-truby",
        "Lajos Egri, <i>The Art of Dramatic Writing</i>: neiloseman.com/the-art-of-dramatic-writing-by-lajos-egri",
        "Blake Snyder, <i>Save the Cat</i>: savethecat.com/get-started",
        "Doc Comparato, <i>De la creación al guion</i>: doccomparato.com/download/Creacion.pdf",
        "Aristóteles, <i>Poética</i> (peripecia, anagnórisis, hamartia, catarsis): suburbano.net/la-tragedia-segun-aristoteles",
        "Aaron Sorkin, MasterClass: nofilmschool.com/writing-tips-by-aaron-sorkin · scriptreader.ai/guides/sorkin-masterclass-screenwriting",
        "Plantar y pagar, subtexto: nofilmschool.com/100-dramatic-principles · screencraft.org/blog/everything-you-need-to-know-about-chekhovs-gun",
        "Formato de guion en español: tallerdeescritores.com/el-formato-del-guion-de-cine · scriptico.app/blog/formato-de-guion",
        "<i>El secreto de sus ojos</i>: bafc.buenosaires.gob.ar/hecho-en-caba/6/el-secreto-de-sus-ojos",
        "<i>Relatos salvajes</i>: otroscines.com/nota-8582 · es.wikipedia.org/wiki/Relatos_salvajes",
        "<i>Argentina, 1985</i>: lanacion.com.ar (crítica de estreno) · otroscines.com (entrevista a Mitre y Llinás)",
        "Nuevo Cine Argentino y <i>Pizza, birra, faso</i>: wp.nyu.edu/esferas (Pizza, birra, faso y el nuevo cine argentino)",
        "Los Javis: es.hollywoodreporter.com (de La Mesías a La bola negra) · anothermag.com (La Mesías)",
        "<i>La La Land</i>, epílogo: writesmartblog.com/2017/05/12/structure-breakdowns-la-la-land",
        "<i>Aftersun</i>, final: screenrant.com (Aftersun ending) · jakebishop.net/aftersun-explained-what-the-rave-really-means",
        "Ley 26.657, art. 20: iah.msal.gov.ar/doc/Documento224.pdf · silvinacotignola.com.ar/internacion-involuntaria-cuando-y-como-procede",
        "Madre que encadenó a su hijo por el paco: infobae.com/sociedad/2016/10/10 · lacapital.com.ar (Tucumán)",
        "Paco: vice.com/es/article/paco-la-droga-de-los-pobres-en-argentina",
        "Ludopatía adolescente: unicef.org/argentina/apuestas-online-salud-mental · elterritorio.com.ar (Cruz Roja, 2025)",
        "Ciudadanía italiana y decreto Tajani: lagaceta.com.ar/nota/1147522 · ellitoral.com (Tribunal Constitucional, 2026)",
        "Isla Maciel y el Transbordador: es.wikipedia.org/wiki/Isla_Maciel · es.wikipedia.org/wiki/Puente_Transbordador_Nicolás_Avellaneda",
    ]
    st += [P(s, "small") for s in src]

    doc.build(st, onFirstPage=on_page, onLaterPages=on_page)


if __name__ == "__main__":
    build(sys.argv[1])
    print("ok", sys.argv[1])
