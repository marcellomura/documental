# CUANDO VUELVAN LOS PECES

Ópera prima de Marcello Muratore. Melodrama trágico.

| Archivo | Qué es |
|---|---|
| `CUANDO_VUELVAN_LOS_PECES_guion.pdf` | Guion completo en formato de industria (A4, Courier 12), 137 páginas |
| `CUANDO_VUELVAN_LOS_PECES_dossier.pdf` | Investigación, biblia (personajes, estructura, siembras y cosechas), letras y nota de intención |
| `guion/*.fountain` | Texto fuente del guion, por actos (Fountain simplificado) |
| `tools/render_guion.py` | Convierte el guion a PDF |
| `tools/render_dossier.py` | Genera el dossier |

## Regenerar

```bash
pip install reportlab
python3 tools/render_guion.py $(ls guion/*.fountain | paste -sd,) CUANDO_VUELVAN_LOS_PECES_guion.pdf tools/titulo.json
python3 tools/render_dossier.py CUANDO_VUELVAN_LOS_PECES_dossier.pdf
```
