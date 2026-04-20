/**
 * ================================================================
 * SANTORINI — JAVASCRIPT PRINCIPAL
 * Diseñado con cumplimiento WCAG 2.2 Nivel AA
 *
 * Módulos:
 *  1. Navegación móvil (hamburguesa) accesible
 *  2. Header con scroll
 *  3. Transcripciones expandibles (acordeón accesible)
 *  4. Formulario de postal con validación accesible
 *  5. Contador de caracteres del textarea
 *  6. Smooth scroll para enlaces internos
 *  7. Animaciones de entrada con IntersectionObserver
 * ================================================================
 */

'use strict';

/* ================================================================
   MÓDULO 1: NAVEGACIÓN MÓVIL
   WCAG 2.2 — Criterio 4.1.2 (Nivel A): Nombre, Función, Valor
   El botón hamburguesa actualiza aria-expanded para comunicar
   el estado del menú a las tecnologías asistivas.
   ================================================================ */
(function initNavigation() {
  const toggle  = document.getElementById('nav-toggle');
  const nav     = document.getElementById('main-nav');
  const navLinks = nav.querySelectorAll('.nav-link');

  if (!toggle || !nav) return;

  /**
   * Abre o cierra el menú móvil de forma accesible.
   */
  function toggleMenu(open) {
    // Actualiza el estado ARIA del botón
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');

    // Muestra/oculta el menú
    nav.classList.toggle('is-open', open);
    nav.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  // Click en el botón hamburguesa
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggleMenu(!isOpen);
  });

  // Cerrar el menú al hacer click en un enlace de navegación
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  /*
   * WCAG 2.2 — Criterio 2.1.1 (Nivel A): Teclado
   * Cerrar el menú con la tecla Escape (comportamiento estándar
   * esperado por usuarios de teclado y lectores de pantalla).
   */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        toggleMenu(false);
        // Devolver el foco al botón que abrió el menú
        toggle.focus();
      }
    }
  });

  // Cerrar el menú al hacer click fuera de él
  document.addEventListener('click', (event) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen && !nav.contains(event.target) && !toggle.contains(event.target)) {
      toggleMenu(false);
    }
  });

  // Estado inicial: menú oculto para lectores de pantalla
  nav.setAttribute('aria-hidden', 'true');
})();


/* ================================================================
   MÓDULO 2: HEADER CON SCROLL
   Añade la clase .scrolled al header cuando el usuario desplaza
   la página, cambiando su fondo para mejorar la legibilidad.
   ================================================================ */
(function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Usar IntersectionObserver es más eficiente que un listener de scroll
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:80px;height:1px;width:1px;pointer-events:none;';
  document.body.prepend(sentinel);

  const observer = new IntersectionObserver(
    ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
    { threshold: 0 }
  );
  observer.observe(sentinel);
})();


/* ================================================================
   MÓDULO 3: TRANSCRIPCIONES EXPANDIBLES (ACORDEÓN ACCESIBLE)
   WCAG 2.2 — Criterio 4.1.2 (Nivel A): Nombre, Función, Valor
   Patrón de acordeón siguiendo el APG de W3C:
   https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
   ================================================================ */
(function initTranscripts() {
  const toggleButtons = document.querySelectorAll('.transcript__toggle');

  toggleButtons.forEach(button => {
    // Estado inicial
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
      const controlsId = button.getAttribute('aria-controls');
      const content    = document.getElementById(controlsId);
      if (!content) return;

      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const newState   = !isExpanded;

      // Actualizar el estado ARIA
      button.setAttribute('aria-expanded', String(newState));

      // Mostrar/ocultar el contenido con el atributo hidden
      // (más semántico que display:none puro — los lectores de
      //  pantalla también respetan el atributo hidden)
      content.hidden = !newState;
    });
  });
})();


/* ================================================================
   MÓDULO 4: CONTADOR DE CARACTERES (TEXTAREA)
   WCAG 2.2 — Criterio 4.1.3 (Nivel AA): Mensajes de Estado
   El contador tiene aria-live="polite" (definido en HTML) para que
   los lectores de pantalla anuncien el valor actualizado de forma
   no intrusiva mientras el usuario escribe.
   ================================================================ */
(function initCharCounter() {
  const textarea = document.getElementById('mensaje-postal');
  const counter  = document.getElementById('mensaje-contador');
  if (!textarea || !counter) return;

  const maxLength = parseInt(textarea.getAttribute('maxlength'), 10);

  function updateCounter() {
    const used      = textarea.value.length;
    const remaining = maxLength - used;

    // Actualizar texto (aria-live="polite" en el HTML lo anuncia)
    counter.textContent = `${used} / ${maxLength} caracteres`;

    // Indicación visual adicional cuando se acerca al límite
    counter.classList.toggle('at-limit', remaining <= 20);

    /*
     * WCAG 2.2 — Criterio 1.4.1 (Nivel A): Uso del Color
     * El límite NO se indica solo con el color rojo; también
     * el contador muestra un texto diferente y puede anunciarse.
     */
    if (remaining <= 0) {
      counter.textContent = `Límite alcanzado (${maxLength} / ${maxLength})`;
    }
  }

  textarea.addEventListener('input', updateCounter);
  // Inicializar
  updateCounter();
})();


/* ================================================================
   MÓDULO 5: FORMULARIO DE POSTAL — VALIDACIÓN ACCESIBLE
   WCAG 2.2 — Criterios:
   - 3.3.1 (Nivel A): Identificación de Errores
   - 3.3.2 (Nivel A): Etiquetas o Instrucciones
   - 3.3.3 (Nivel AA): Sugerencia ante Error
   - 4.1.2 (Nivel A): aria-invalid, aria-describedby
   ================================================================ */
(function initPostalForm() {
  const form    = document.getElementById('postal-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  /**
   * Muestra u oculta el mensaje de error de un campo,
   * actualizando también aria-invalid.
   *
   * @param {HTMLElement} input   - El campo con error
   * @param {string}      errorId - ID del elemento de error
   * @param {boolean}     show    - true para mostrar el error
   */
  function setError(input, errorId, show) {
    const errorEl = document.getElementById(errorId);
    if (!errorEl) return;

    if (show) {
      errorEl.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.hidden = true;
      input.removeAttribute('aria-invalid');
    }
  }

  /**
   * Valida un campo individual y muestra/oculta su error.
   * Retorna true si el campo es válido.
   */
  function validateField(input, errorId, validationFn) {
    const isValid = validationFn(input.value);
    setError(input, errorId, !isValid);
    return isValid;
  }

  /**
   * Valida que se haya seleccionado una imagen para la postal.
   * Retorna true si algún radio está marcado.
   */
  function validateImageSelection() {
    const radios   = form.querySelectorAll('input[name="imagen-postal"]');
    const errorEl  = document.getElementById('imagen-error');
    const fieldset = document.getElementById('imagen-fieldset');

    const anyChecked = Array.from(radios).some(r => r.checked);

    if (errorEl) {
      errorEl.hidden = anyChecked;
    }

    if (fieldset) {
      // Marcar el fieldset como inválido para lectores de pantalla
      if (!anyChecked) {
        fieldset.setAttribute('aria-invalid', 'true');
        fieldset.setAttribute('aria-describedby', 'imagen-error');
      } else {
        fieldset.removeAttribute('aria-invalid');
      }
    }

    return anyChecked;
  }

  /* --- Validación en tiempo real (al salir del campo) ---
   *
   * WCAG 2.2 — Criterio 3.3.1 (Nivel A): Validar en blur (no en
   * input) evita interrumpir al usuario mientras escribe.
   */
  const nombreInput  = document.getElementById('destinatario-nombre');
  const emailInput   = document.getElementById('destinatario-email');
  const mensajeInput = document.getElementById('mensaje-postal');
  const remitenteInput = document.getElementById('remitente-nombre');

  if (nombreInput) {
    nombreInput.addEventListener('blur', () => {
      validateField(nombreInput, 'nombre-error', v => v.trim().length >= 2);
    });
    // Limpiar error al volver a escribir
    nombreInput.addEventListener('input', () => {
      if (nombreInput.value.trim().length >= 2) setError(nombreInput, 'nombre-error', false);
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      validateField(emailInput, 'email-error', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    });
    emailInput.addEventListener('input', () => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        setError(emailInput, 'email-error', false);
      }
    });
  }

  if (mensajeInput) {
    mensajeInput.addEventListener('blur', () => {
      validateField(mensajeInput, 'mensaje-error', v => v.trim().length >= 5);
    });
    mensajeInput.addEventListener('input', () => {
      if (mensajeInput.value.trim().length >= 5) setError(mensajeInput, 'mensaje-error', false);
    });
  }

  if (remitenteInput) {
    remitenteInput.addEventListener('blur', () => {
      validateField(remitenteInput, 'remitente-error', v => v.trim().length >= 2);
    });
    remitenteInput.addEventListener('input', () => {
      if (remitenteInput.value.trim().length >= 2) setError(remitenteInput, 'remitente-error', false);
    });
  }

  /* --- Envío del formulario --- */
  form.addEventListener('submit', function(event) {
    // Siempre prevenir el envío nativo (demo)
    event.preventDefault();

    // Colectar errores
    const errors = [];

    const imageOk    = validateImageSelection();
    const nombreOk   = nombreInput  ? validateField(nombreInput,   'nombre-error',    v => v.trim().length >= 2) : true;
    const emailOk    = emailInput   ? validateField(emailInput,    'email-error',     v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) : true;
    const mensajeOk  = mensajeInput ? validateField(mensajeInput,  'mensaje-error',   v => v.trim().length >= 5) : true;
    const remitenteOk = remitenteInput ? validateField(remitenteInput, 'remitente-error', v => v.trim().length >= 2) : true;

    if (!imageOk)     errors.push('imagen-fieldset');
    if (!nombreOk)    errors.push(nombreInput.id);
    if (!emailOk)     errors.push(emailInput.id);
    if (!mensajeOk)   errors.push(mensajeInput.id);
    if (!remitenteOk) errors.push(remitenteInput.id);

    if (errors.length > 0) {
      /*
       * WCAG 2.2 — Criterio 2.4.3 (Nivel A): Orden del Foco
       * Si hay errores, mover el foco al primer campo inválido
       * para informar al usuario de teclado dónde está el problema.
       */
      const firstErrorEl = document.getElementById(errors[0]);
      if (firstErrorEl) {
        firstErrorEl.focus();
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    /*
     * Si la validación pasa: simular envío y mostrar mensaje de éxito.
     * WCAG 2.2 — Criterio 4.1.3 (Nivel AA): El mensaje de estado
     * tiene role="status" y aria-live="polite" en el HTML.
     */
    simulateFormSubmit();
  });

  /**
   * Simula el envío del formulario con un estado de carga
   * y muestra el mensaje de éxito accesible.
   */
  function simulateFormSubmit() {
    const submitBtn = document.getElementById('submit-postal');

    // Estado de carga del botón (accesible)
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Enviando postal…';

    // Simular latencia de red
    setTimeout(() => {
      // Ocultar el formulario y mostrar el éxito
      form.querySelectorAll('.fieldset, .form-submit').forEach(el => {
        el.style.display = 'none';
      });

      success.hidden = false;

      /*
       * WCAG 2.2 — Criterio 2.4.3 (Nivel A): Orden del Foco
       * Mover el foco al mensaje de éxito para que los usuarios
       * de teclado sepan que el proceso ha concluido.
       */
      success.setAttribute('tabindex', '-1');
      success.focus();
    }, 1500);
  }
})();


/* ================================================================
   MÓDULO 6: SMOOTH SCROLL ACCESIBLE PARA ENLACES INTERNOS
   WCAG 2.2 — Criterio 2.4.3 (Nivel A): Orden del Foco
   Al navegar a una sección mediante un anchor link, el foco
   debe moverse al destino para que los usuarios de teclado
   sepan dónde están.
   ================================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(event) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();

      // Cerrar el menú móvil si está abierto
      const nav    = document.getElementById('main-nav');
      const toggle = document.getElementById('nav-toggle');
      if (nav && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        nav.setAttribute('aria-hidden', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }

      // Scroll suave al destino
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      /*
       * El foco se mueve al destino (si tiene tabindex="-1" en el
       * HTML, como el <main id="contenido-principal">).
       * Si no tiene tabindex, el scroll visual es suficiente.
       */
      if (target.hasAttribute('tabindex')) {
        target.focus({ preventScroll: true });
      }
    });
  });
})();


/* ================================================================
   MÓDULO 7: ANIMACIONES DE ENTRADA (IntersectionObserver)
   WCAG 2.2 — Criterio 2.3.3 / prefers-reduced-motion
   Las animaciones solo se aplican si el usuario no ha indicado
   preferencia de movimiento reducido.
   ================================================================ */
(function initRevealAnimations() {
  // Respetar la preferencia del sistema operativo
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // No aplicar animaciones

  // Añadir clase .reveal a los elementos que animaremos
  const revealSelectors = [
    '.about-card',
    '.gallery-item',
    '.media-card',
    '.stat',
    '.gastro-figure',
    '.gastro-text',
    '.fieldset',
  ];

  const elements = document.querySelectorAll(revealSelectors.join(', '));
  elements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,  // Activar cuando el 12% del elemento es visible
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ================================================================
   MÓDULO 8: INDICADORES DE ENLACE EXTERNO
   WCAG 2.2 — Criterio 2.4.4 (Nivel A): Propósito de los Enlace
   Añade un indicador de "se abre en nueva pestaña" a todos los
   enlaces externos que no lo tengan ya en su aria-label.
   ================================================================ */
(function initExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    // Solo si no tiene ya la indicación en su aria-label
    const label = link.getAttribute('aria-label') || '';
    if (!label.includes('nueva pestaña') && !label.includes('new tab')) {
      const currentLabel = label || link.textContent.trim();
      link.setAttribute('aria-label', `${currentLabel} (se abre en nueva pestaña)`);
    }

    // Seguridad: rel=noopener para todos los target="_blank"
    const rel = link.getAttribute('rel') || '';
    if (!rel.includes('noopener')) {
      link.setAttribute('rel', `${rel} noopener noreferrer`.trim());
    }
  });
})();


/* ================================================================
   MÓDULO 9: NAVEGACIÓN CON FOCO POR TECLADO EN LAS TARJETAS POSTAL
   WCAG 2.2 — Criterio 2.1.1 (Nivel A): Teclado
   El usuario puede seleccionar la imagen de la postal usando
   las teclas de flecha (patron de roving tabindex).
   ================================================================ */
(function initPostcardKeyboardNav() {
  const postcardContainer = document.querySelector('.postcard-options');
  if (!postcardContainer) return;

  const radios = Array.from(postcardContainer.querySelectorAll('input[type="radio"]'));

  radios.forEach((radio, index) => {
    radio.addEventListener('keydown', (event) => {
      let newIndex = -1;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        newIndex = (index + 1) % radios.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        newIndex = (index - 1 + radios.length) % radios.length;
      }

      if (newIndex >= 0) {
        radios[newIndex].focus();
        radios[newIndex].checked = true;
        // Disparar evento change para validación en tiempo real
        radios[newIndex].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
})();
