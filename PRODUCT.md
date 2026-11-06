# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personal de escuelas de Córdoba que trabaja con la Libreta Digital SGE:

- Comunidad docente de nivel secundario (carga de calificaciones, casos especiales, edición y cierre). Alcance decidido: solo nivel secundario.
- Preceptores/as (asistencia diaria, justificaciones, monitoreo de trayectorias).
- Equipos directivos (tablero de control, gestión de accesos, actas y períodos).

Hipótesis a validar, no confirmada: se consulta en momentos cortos de trabajo (entre clases, en sala de profes) y probablemente desde el celular. No hay datos de dispositivos ni conectividad.

## Product Purpose

Portal de capacitación que acompaña el uso de la Libreta Digital SGE: rutas de aprendizaje por rol, microguías, instructivos en PDF, podcasts, video, simuladores con datos ficticios y preguntas frecuentes. Es material orientativo, no el sistema real. Éxito: que cada persona encuentre rápido la tarea que necesita y practique sin riesgo antes de usar el SGE real.

Contexto del proyecto: trabajo de cátedra de la electiva de Comunicación Multimedial (2026). Lo evalúan docentes de la facultad; no se publica como sitio oficial.

## Positioning

Una sola entrada para tres roles escolares que combina formatos de aprendizaje (leer, escuchar, mirar, practicar en un simulador local) con herramientas de accesibilidad integradas (tamaño de texto y narración en voz alta). Ninguno de los materiales oficiales, por separado, ofrece esa mezcla ni la práctica con datos ficticios.

## Operating Context

- Documentación base: tres PDF instructivos (`public/`) sobre registrar calificaciones, finalizar IPE y gestionar asistencias.
- Medios propios: cuatro podcasts (.m4a) y un video (.mp4) sobre registrar calificaciones en nivel superior; el video queda fuera del recorrido porque el alcance es solo nivel secundario.
- Cada perfil cierra con una evaluación final (aprobación: 90 % y sin conceptos críticos en rojo) que muestra resultados por concepto y refuerza lo más flojo.
- El progreso, el cuaderno de calificaciones y la asistencia de práctica se guardan solo en el navegador (localStorage); el portal no inicia sesión ni toca datos reales del SGE.

## Capabilities and Constraints

- Sitio estático: HTML, CSS y JavaScript sin framework ni build (`index.html`, `styles.css`, `app.js`). Decisión confirmada; mantenerlo así.
- Rutas por rol con módulos, marcado de avance, simulador y área de práctica (cuaderno de notas, asistencia, panel de gestión).
- Búsqueda interna, centro de recursos con vista previa y descarga de PDF, secciones de podcasts y videos, FAQ.
- Terminología local que debe respetarse: Libreta Digital SGE, IPE, DAA, Materias Previas, espacio curricular, preceptor/a, trayectoria.
- Idioma: español rioplatense (voseo: "elegí", "buscá", "explorá").
- Todo dato de práctica es ficticio y así debe señalarse; el portal aclara que no reemplaza procedimientos institucionales vigentes.
- Sin decidir: dónde se aloja, si los episodios y el video tendrán descripción o transcripción, y los textos finales de los episodios (hoy son genéricos).

## Brand Commitments

- El portal es un acompañamiento independiente: no es el SGE ni un sitio oficial. Sí aloja los manuales oficiales (licencia CC BY-NC-SA 4.0) siempre con atribución a la Dirección de Sistemas y Modernización, Gobierno de Córdoba. No usar logos, escudos ni identidad del Gobierno de Córdoba como propios.
- Lenguaje no sexista con sustantivos colectivos: "comunidad docente", "equipo directivo", "personal de preceptoría", "estudiantes".
- Nombre en uso: "SGE · Libreta Digital — Portal de capacitación".

## Evidence on Hand

- Presente: 3 PDF instructivos, 4 podcasts, 1 video, contenido de módulos y FAQ en `app.js`.
- Ausente (no inventar): testimonios, cifras de uso, capturas del SGE real, logos oficiales, nombres de autoría o institución, fechas de vigencia. Los números del panel directivo (384 estudiantes, 92 %, etc.) y los alumnos son ficticios.

## Product Principles

1. Claridad antes que decoración: la persona viene a resolver una tarea concreta del SGE y debe llegar rápido.
2. Aprender sin riesgo: la práctica es siempre con datos ficticios, y eso se dice con honestidad en cada punto de contacto.
3. Honestidad institucional: orientar, no reemplazar; ante dudas, derivar al referente SGE o a los canales oficiales.
4. Un mismo contenido, varias vías de acceso: texto, audio, video y lectura en voz alta son equivalentes, no extras.
5. Funciona en cualquier equipo y conexión de una escuela: ligero, estático y sin dependencias.

## Accessibility & Inclusion

Requisito fuerte confirmado: el portal debe ser accesible para docentes, preceptores y directivos con distintos niveles de comodidad digital y necesidades de accesibilidad. Ya existen controles de tamaño de texto (80 %–150 %), narración con voz del navegador, enlace de salto al contenido y regiones `aria-live`. Cualquier cambio debe mantenerlos y apuntar al menos a WCAG 2.1 AA (contraste, foco visible, navegación por teclado, lectores de pantalla, reducción de movimiento). Nivel exacto no fijado por el usuario.
