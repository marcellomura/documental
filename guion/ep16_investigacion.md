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
