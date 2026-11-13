# Ep16 · EL PUNTO DÉBIL: dossier de investigación

La Anomalía del Atlántico Sur (AAS): la zona donde el campo magnético de la Tierra es más débil. A la altura de los satélites deja pasar radiación; en la superficie, su mínimo cae hoy en el Chaco argentino.

## Qué calculamos nosotros (y cómo se verificó)

Todo sale del **IGRF-14**, el modelo internacional de referencia del campo magnético (IAGA, coeficientes publicados por NOAA/NCEI). Está implementado en `tools/igrf16.py` (armónicos esféricos hasta grado 13, sobre el elipsoide WGS84).

**Verificación:** contra las medias anuales medidas en el observatorio de Pilar (Córdoba), 1905–2024, del World Data Centre for Geomagnetism de Edimburgo. Diferencias de entre −80 y +11 nT sobre valores de 22.000 a 29.000 nT.

| Dato | Valor | Nota |
|---|---|---|
| Mínimo global en superficie, 2025 | 22.071 nT en 26,23° S, 60,02° O | Chaco, a 21 km de Pampa del Indio y a 171 km de Resistencia |
| Máximo global, 2025 | 66.943 nT | cerca de la Antártida; el mínimo es un tercio |
| Deriva del mínimo | 0,216° por año hacia el oeste (≈ 21 km/año) | NOAA (WMM) informa unos 20 km/año |
| Camino del mínimo | 1900: océano frente a Brasil (22° S, 37° O) · 1963: costa de Santa Catarina · 1994: Misiones · 2001: Paraguay · 2017: Formosa · 2023: Chaco · ~2034: Santiago del Estero | `data/ep16/minimo_camino.json` |
| Pilar, Córdoba (medido) | 28.819 nT en 1905 → 22.476 nT en 2024 | −22,0 % en 119 años |
| Zona con menos de 32.000 nT | 46,1 → 109,3 millones de km² (1900 → 2025) | 21 % de la superficie del planeta |
| Zona con menos de 26.000 nT | 3,9 → 39,4 millones de km² (1900 → 2025); 34,7 en 2014 | +4,7 M km² desde 2014: coincide con «casi media Europa» de la ESA |
| Dipolo | inclinado 9,2°; corrido 605 km del centro hacia 23° N, 135° E (Pacífico occidental); en 1900 eran 330 km | fórmulas del dipolo excéntrico |
| Momento dipolar | −7,6 % entre 1900 y 2025 | |
| Mayor caída desde 1900 | −34 % al sur de África (47° S, 9° E) | |

| Segundo mínimo local | aparece hacia 2006-2007 en 41° S, 1° O (24.858 nT en 2007 → 23.462 nT en 2025) | al sudoeste de África: «la anomalía se parte en dos» |
| Borde del cinturón interior | superficie de \|B\| = 20.486 nT (el mínimo de \|B\| a 200 km): baja a 200 km en 24,5° S, 59,5° O; sobre el ecuador del lado opuesto está a 1.531 km | partículas que rebotan con más campo tocan la atmósfera en la AAS |
| Hubble (simulación) | órbita circular de 28,47° y 525 km: 15,14 vueltas por día, 9 cruzan el contorno de 20.800 nT a esa altura | STScI informa de 7 a 9 |
| Borde del núcleo (r = 3.485 km) | parches con Br < 0 al sur de 10° S: 8,9 % (1900) → 12,7 % (1960) → 18,0 % (2025), truncando en grado 10 | sólo para comparar años; en pantalla van los mapas, no el porcentaje |
| Máximos | 66.952 nT en 59,5° S, 134,5° E (polo sur magnético); en el norte, 61.910 nT en 61,5° N, 101,5° E | |
| Campo a 400 km sobre la pasada real de la Estación (22/4/2012) | de 43.568 nT sobre Idaho a 19.354 nT sobre Paraguay y Brasil | el tablero de la apertura |

**Cuidados con el dato del Chaco**

- Es el mínimo del **campo principal** (el que nace en el núcleo) según el modelo. No incluye las anomalías locales de la corteza ni las variaciones diarias.
- La zona es casi plana: entre el punto mínimo y Resistencia hay 13 nT de diferencia. Todo el nordeste argentino y Paraguay comparten unos 22.100 nT.
- Por eso en pantalla va «Modelo IGRF-14 · campo principal» y el guion dice «el modelo que usan los científicos permite calcular».

## Hechos y de dónde salen

**Qué es y por qué existe**
- El campo nace en el núcleo externo, de hierro líquido, a unos 2.900 km de profundidad (geodínamo). La anomalía surge de la inclinación del eje magnético y del movimiento del metal en el núcleo. Fuente: NASA Goddard (2020).
- El cinturón interior de Van Allen empieza a unos 640 km de altura (400 millas); sobre la anomalía las partículas bajan hasta unos 200 km. Fuente: NASA (2020) y material educativo de NASA.
- Van Allen anunció el descubrimiento de los cinturones el 1/5/1958, con datos del Explorer 1 y el Explorer 3.

**Qué pasa arriba**
- Un protón energético puede provocar un «single event upset»; los operadores suelen apagar componentes no esenciales al cruzarla. Fuente: NASA (2020).
- GEDI (un lidar montado en la ISS) registra «blips» y se le reinician las placas de potencia una vez por mes, con un par de horas de datos perdidos. Fuente: NASA (2020), Bryan Blair.
- La ISS está bien protegida y los astronautas están a salvo adentro. Fuente: NASA (2020).
- Hubble: cruza la anomalía entre 7 y 9 órbitas seguidas por día (de unas 15, órbita de 96 minutos) y en cada cruce detiene las observaciones entre 20 y 25 minutos. Fuente: STScI, HST Primer (Orbital Constraints).
- Don Pettit: destellos «como hadas danzantes luminosas» al dormirse; las notebooks se cuelgan y se recuperan reiniciando; las cámaras pierden píxeles hasta parecer cubiertas de «nieve electrónica»; sobre la anomalía el flujo es de 10 a 100 veces mayor y los destellos pasan de uno o dos cada diez minutos a varios por minuto. Fuente: Universe Today (Nancy Atkinson), con citas de Pettit.

**Cómo cambia**
- Desde 2014 la anomalía creció un área de casi la mitad de Europa continental; desde 2020 el campo se debilita más rápido al sudoeste de África; el origen son parches de flujo invertido en el límite entre el núcleo y el manto. Fuente: ESA (13/10/2025), con Chris Finlay (DTU); estudio en *Physics of the Earth and Planetary Interiors*.
- El valle de mínima intensidad se partió en dos lóbulos. Fuente: NASA (2020).
- Una hipótesis vincula los parches con la gran provincia de baja velocidad de corte (LLSVP) debajo de África. Fuente: Tarduno et al. (2015), *Nature Communications*. Va como hipótesis.

**¿Se da vuelta el campo?**
- El campo global perdió cerca de un 10 % en unos 180 años. Hubo cientos de inversiones; la última completa fue hace unos 780.000 años.
- Nilsson et al. (2022, *PNAS*): un modelo de 9.000 años muestra anomalías parecidas que no terminaron en inversión; estiman que la AAS probablemente desaparezca en unos 300 años.

**En la superficie**
- «Actualmente, la AAS no genera impactos visibles en la vida diaria en la superficie.» Fuente: NASA (2020).

## Datos reales que se muestran

- **Protones medidos:** detector SEM-2 del satélite meteorológico MetOp-A (EUMETSAT, instrumento de NOAA), a unos 820–850 km de altura, marzo de 2014. Archivo de NOAA/NCEI.
- **Pilar:** medias anuales 1905–2024, World Data Centre for Geomagnetism (Edimburgo); el observatorio es del Servicio Meteorológico Nacional.
- **Campo, líneas, cinturón y núcleo:** IGRF-14 calculado acá.

## Material real del episodio

- **Fotos de la Estación Espacial** (Gateway to Astronaut Photography of Earth, NASA JSC): pasadas nocturnas del 22/4/2012 (ISS030-E-260394 a 260709, de Idaho al Atlántico Sur, cruza la AAS), 23/4/2012 (ISS030-E-271717 a 271798), 29/6/2012 (ISS031-E-169858 a 170189, de la Amazonia al Atlántico Sur, relámpagos) y el amanecer del 10/3/2012 (ISS030-E-140634 a 141048). Posición y hora de cada foto en los metadatos de la base. Las tomó la tripulación de las Expediciones 30 y 31 (Pettit estaba a bordo, pero no se le atribuye cada foto).
- **Don Pettit en la cúpula, 2012** (ISS031-E-112292, NASA). **Explorer 1** (NASA/JPL-Caltech y NASA MSFC, 1958). **Hubble eXtreme Deep Field** (NASA, ESA, Illingworth et al.).
- **Tierra**: Blue Marble Next Generation (noviembre) y Black Marble 2016 (NASA Earth Observatory); nubes del 1/11/2025 de VIIRS en Suomi NPP, NOAA-20 y NOAA-21 (NASA GIBS), la mediana de los tres borra el reflejo del sol; Sentinel-2 cloudless 2016 de EOX (CC BY 4.0) para bajar al monte chaqueño.
- **Marte**: Solar System Scope (CC BY 4.0). **Atardecer en el Chaco**: Er220, CC BY-SA 4.0 (del ep15).
- **Música y efectos**: compuestos por código (tools/synth16.py, tools/mix_ep16.py); los silbidos y el coro de la magnetósfera imitan la física real (frecuencia ∝ 1/t² en los whistlers).
- **Escala de polaridad** del fondo del mar: GTS2012 simplificada (esquema).

## Lo que quedó afuera

- El satélite japonés Hitomi (2016): su sensor de estrellas fallaba al cruzar la anomalía, pero la pérdida se debió a una cadena de errores de control. No va para no atribuirle la causa.
- La dosis exacta que recibe la tripulación de la ISS por la anomalía: no encontré una cifra sólida.
- Efectos en aves, internet o salud en tierra: no hay evidencia; varios medios lo exageraron.

## Fuentes

- NASA Goddard (17/8/2020): https://www.nasa.gov/missions/nasa-researchers-track-slowly-splitting-dent-in-earths-magnetic-field/
- ESA (13/10/2025): https://www.esa.int/Applications/Observing_the_Earth/FutureEO/Swarm/Swarm_reveals_growing_weak_spot_in_Earth_s_magnetic_field
- STScI, HST Primer, Orbital Constraints: https://hst-docs.stsci.edu/hsp/the-hubble-space-telescope-primer-for-cycle-34/hst-primer-orbital-constraints
- Universe Today, «Seeing Cosmic Rays in Space»: https://www.universetoday.com/articles/seeing-cosmic-rays-in-space
- Nilsson et al. (2022), PNAS: https://pmc.ncbi.nlm.nih.gov/articles/PMC9214526
- Tarduno et al. (2015), Nature Communications: https://pmc.ncbi.nlm.nih.gov/articles/PMC4525173
- IGRF-14, coeficientes: https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/igrf14coeffs.txt
- Medias anuales de observatorios (WDC Edimburgo): https://geomag.bgs.ac.uk/data_service/data/annual_means.shtml
- NOAA/NCEI, POES/MetOp SEM-2: https://www.ncei.noaa.gov/data/poes-metop-space-environment-monitor/access/l1b/v01r00/
