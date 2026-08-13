// ================================================
// CONFIGURAÇÕES
// ================================================
var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzDDeNhsoTVMyYOB-3aKdgxOXXv1KdIV-9QA3SDiyQXO0EySJnCyQ0--Bxg1kU0JmjD3A/exec';

// ================================================
// LÓGICA DO FORMULÁRIO MULTI-ETAPAS
// ================================================

var currentStep = 1;

document.addEventListener('DOMContentLoaded', function () {
  updateProgressBar();
  initScrollReveal();
  initHeroAnimation();
  initSwiper();

  document.getElementById('lead-form').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && currentStep !== 11) {
      e.preventDefault();
    }
  });
});

// ================================================
// SWIPER - CARROSSEL DE DEPOIMENTOS
// ================================================
function initSwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper('.testimonial-swiper', {
      loop: true,
      slidesPerView: 'auto',
      centeredSlides: true,
      spaceBetween: 5,
      grabCursor: true,
      speed: 4000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
    });

    // Lógica de interação (blur e brilho)
    var swiperContainer = document.querySelector('.testimonial-swiper');
    if (swiperContainer) {
      var slides = swiperContainer.querySelectorAll('.swiper-slide');

      function highlightSlide(slide) {
        swiperContainer.classList.add('is-interacting');
        slides.forEach(function(s) { s.classList.remove('is-highlighted'); });
        slide.classList.add('is-highlighted');
      }

      function resetHighlight() {
        swiperContainer.classList.remove('is-interacting');
        slides.forEach(function(s) { s.classList.remove('is-highlighted'); });
      }

      slides.forEach(function(slide) {
        slide.addEventListener('mouseenter', function() { highlightSlide(slide); });
        slide.addEventListener('mouseleave', resetHighlight);
        
        slide.addEventListener('touchstart', function() { highlightSlide(slide); }, { passive: true });
        slide.addEventListener('touchend', resetHighlight);
        slide.addEventListener('touchcancel', resetHighlight);
      });
    }
  }
}

function initHeroAnimation() {
  const elements = [
    document.querySelector('.hero .badge'),
    document.querySelector('.hero h1'),
    document.querySelector('.hero p'),
    document.querySelector('.hero-cta-container')
  ];

  elements.forEach((el, index) => {
    if (el) {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 100);
    }
  });
}

// ================================================
// SCROLL REVEAL (ANIMAÇÕES)
// ================================================
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.2
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observa elementos simples
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-simulador, .reveal-lento').forEach(el => {
    revealObserver.observe(el);
  });

  // Observa grupos com delay (stagger)
  const staggerGroups = document.querySelectorAll('.stagger-group');
  staggerGroups.forEach(group => {
    const items = group.querySelectorAll('.stagger-item');
    const groupObserver = new IntersectionObserver((entries, grpObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('in-view');
            }, index * 120);
          });
          grpObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);
    groupObserver.observe(group);
  });
}

function revealForm() {
  var formSection = document.getElementById('formulario');
  var ctaContainer = document.getElementById('cta-container');
  if (formSection) {
    formSection.classList.add('active');
    // Força o reflow para aplicar display: block antes da animação de opacidade/transform
    formSection.offsetHeight;
    formSection.classList.add('visible');
  }
  if (ctaContainer) {
    ctaContainer.style.display = 'none';
  }
}

function updateProgressBar() {
  var fill = document.getElementById('progress-fill');
  if (!fill) return;

  var cargoInput = document.getElementById('input-cargo');
  var trafegoInput = document.getElementById('input-trafego');
  var cargoVal = cargoInput ? cargoInput.value : '';
  var trafegoVal = trafegoInput ? trafegoInput.value : '';
  
  var totalSteps = 11;
  if (cargoVal === 'autonomo') totalSteps -= 2;
  if (trafegoVal === 'nao') totalSteps--;

  var passoAtual = 1;
  if (currentStep === 1) passoAtual = 1;
  else if (currentStep === 2) passoAtual = 2;
  else if (currentStep === 3) passoAtual = 3;
  else if (currentStep >= 4) {
      var deductions = 0;
      if (cargoVal === 'autonomo') deductions += 2;
      if (trafegoVal === 'nao' && currentStep >= 7) deductions++;
      passoAtual = currentStep - deductions;
  }

  var percentage = (passoAtual / totalSteps) * 100;
  fill.style.width = percentage + '%';
}

function goToStep(stepNumber) {
  var currentStepEl = document.getElementById('step-' + currentStep);
  var nextStepEl = document.getElementById('step-' + stepNumber);

  if (!nextStepEl) return;

  // Validação de campos obrigatórios ao avançar de passo
  if (stepNumber > currentStep && currentStepEl) {
    var inputs = currentStepEl.querySelectorAll('input[required]:not([type="hidden"])');
    var isValid = true;
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].value.trim() === '') {
        inputs[i].value = ''; // Remove apenas espaços vazios para forçar o required
      }
      if (!inputs[i].checkValidity()) {
        inputs[i].reportValidity();
        isValid = false;
        break;
      }
    }
    if (!isValid) return; // Interrompe o avanço
  }

  currentStep = stepNumber;
  updateProgressBar();

  if (currentStepEl) {
    currentStepEl.classList.remove('visible');
    setTimeout(function () {
      currentStepEl.classList.remove('active');

      if (stepNumber === 5) {
        var trafegoVal = document.getElementById('input-trafego').value;
        if (trafegoVal === 'sim') {
          document.getElementById('step-5-sim').style.display = 'block';
          document.getElementById('step-5-nao').style.display = 'none';
        } else {
          document.getElementById('step-5-sim').style.display = 'none';
          document.getElementById('step-5-nao').style.display = 'block';
        }
      }

      nextStepEl.classList.add('active');
      nextStepEl.offsetHeight; // Force reflow
      nextStepEl.classList.add('visible');


    }, 250);
  } else {
    nextStepEl.classList.add('active');
    nextStepEl.offsetHeight;
    nextStepEl.classList.add('visible');
  }
}

function prevStep(current) {
  if (current === 2) {
    goToStep(1);
  } else if (current === 3) {
    goToStep(2);
  } else if (current === 4) {
    var cargoVal = document.getElementById('input-cargo').value;
    if (cargoVal === 'autonomo') {
      goToStep(1);
    } else {
      goToStep(3);
    }
  } else if (current === 5) {
    goToStep(4);
  } else if (current === 6) {
    goToStep(5);
  } else if (current === 7) {
    var trafegoVal = document.getElementById('input-trafego').value;
    if (trafegoVal === 'sim') {
      goToStep(6);
    } else {
      goToStep(5);
    }
  } else if (current === 8) {
    goToStep(7);
  } else if (current === 9) {
    goToStep(8);
  } else if (current === 10) {
    goToStep(9);
  } else if (current === 11) {
    goToStep(10);
  }
}

function selectCardOption(fieldName, optionValue, step) {
  var input = document.getElementById('input-' + fieldName);
  if (input) {
    input.value = optionValue;
  }

  if (fieldName === 'cargo') {
    if (optionValue === 'autonomo') {
      var cadeirasInput = document.getElementById('input-cadeiras');
      var unidadesInput = document.getElementById('input-unidades');
      if(cadeirasInput) cadeirasInput.value = '';
      if(unidadesInput) unidadesInput.value = '';
    }
  }

  if (fieldName === 'trafego') {
    if (optionValue === 'sim') {
      document.getElementById('input-valor_pretendido').value = '-';
    } else {
      document.getElementById('input-valor_investido').value = '-';
      document.getElementById('input-experiencia').value = '-';
    }
  }

  var selector = '.card-option[data-field="' + fieldName + '"]';
  document.querySelectorAll(selector).forEach(function (card) {
    if (card.getAttribute('data-value') === optionValue) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  if (step === 1) {
    setTimeout(function () {
      var cargoVal = document.getElementById('input-cargo').value;
      if (cargoVal === 'autonomo') {
        goToStep(4);
      } else {
        goToStep(2);
      }
    }, 250);
  } else if (step === 2) {
    setTimeout(function () {
      goToStep(3);
    }, 250);
  } else if (step === 3) {
    setTimeout(function () {
      goToStep(4);
    }, 250);
  } else if (step === 4) {
    setTimeout(function () {
      goToStep(5);
    }, 250);
  } else if (step === 5) {
    setTimeout(function () {
      var trafegoVal = document.getElementById('input-trafego').value;
      if (trafegoVal === 'sim') {
        goToStep(6);
      } else {
        goToStep(7);
      }
    }, 250);
  } else if (step === 6) {
    setTimeout(function () {
      goToStep(7);
    }, 250);
  } else if (step === 7) {
    setTimeout(function () {
      goToStep(8);
    }, 250);
  }
}

// ================================================
// ENVIO E DIRECIONAMENTO
// ================================================

function enviarForm(e) {
  e.preventDefault();

  var btn = document.querySelector('.btn-submit');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  var form = document.getElementById('lead-form');
  var data = new FormData(form);

  // Gera event_id único para deduplicação browser <-> servidor
  var eventId = 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

  var payload = {
    nome: data.get('nome'),
    whatsapp: data.get('whatsapp'),
    email: data.get('email'),
    instagram: data.get('instagram') || '-',
    cargo: data.get('cargo'),
    cadeiras: data.get('cadeiras') || '-',
    unidades: data.get('unidades') || '-',
    trafego: data.get('trafego'),
    experiencia: data.get('experiencia') || '-',
    valor_investido: data.get('valor_investido') || '-',
    valor_pretendido: data.get('valor_pretendido') || '-',
    faturamento: data.get('faturamento'),
    data: new Date().toLocaleString('pt-BR'),
    event_id: eventId,
    event_source_url: window.location.href
  };



  // Envia para Google Sheets + CAPI (servidor)
  // Content-Type text/plain evita preflight CORS e o GAS consegue receber
  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  }).catch(function () { });

  // Envia evento customizado para o dataLayer (Google Tag Manager)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_gerado',
    eventId: eventId
  });

  // Compilação do texto dinâmico para WhatsApp com formatação amigável
  var mapInvestimento = {
    'ate500': 'Até R$500/mês',
    '500a1000': 'Entre R$500 e R$1.000/mês',
    '1000a3000': 'Entre R$1.000 e R$3.000/mês',
    '3000a5000': 'Entre R$3.000 e R$5.000/mês',
    'acima5000': 'Acima de R$5.000/mês'
  };
  var mapExperiencia = {
    'otima': 'Ótima — tive bons resultados',
    'regular': 'Regular — tive alguns resultados',
    'ruim': 'Ruim — não tive retorno',
    'pessima': 'Péssima — perdi dinheiro'
  };
  var mapFaturamento = {
    'ate8k': 'Até R$8.000/mês',
    '8a15k': 'Entre R$8.000 e R$15.000/mês',
    '15a30k': 'Entre R$15.000 e R$30.000/mês',
    '30a50k': 'Entre R$30.000 e R$50.000/mês',
    'acima50k': 'Acima de R$50.000/mês'
  };

  var friendlyInvestimento = mapInvestimento[payload.valor_investido] || payload.valor_investido;
  var friendlyPretendido = mapInvestimento[payload.valor_pretendido] || payload.valor_pretendido;
  var friendlyExperiencia = mapExperiencia[payload.experiencia] || payload.experiencia;
  var friendlyFaturamento = mapFaturamento[payload.faturamento] || payload.faturamento;

  var textoWhats = "Fala, Jota! Acabei de preencher o formulário no site e quero destravar o crescimento da minha barbearia.\n\n" +
    "*Meus Dados:*\n" +
    "Nome: " + payload.nome + "\n" +
    "E-mail: " + payload.email + "\n" +
    "WhatsApp: " + payload.whatsapp + "\n" +
    "Instagram: " + (payload.instagram || '-') + "\n\n" +
    "*Raio-X do Negócio:*\n" +
    "Cargo: " + (payload.cargo === 'autonomo' ? 'Barbeiro Autônomo' : 'Proprietário de Barbearia') + "\n";
    
  if (payload.cargo === 'proprietario') {
      textoWhats += "Tamanho: " + payload.cadeiras + " em " + payload.unidades + "\n";
  }

  textoWhats += "Já investiu em tráfego?: " + (payload.trafego === 'sim' ? 'Sim' : 'Não') + "\n";

  if (payload.trafego === 'sim') {
    textoWhats += "Investimento mensal: " + friendlyInvestimento + "\n" +
                  "Experiência com tráfego: " + friendlyExperiencia + "\n";
  } else {
    textoWhats += "Investimento mensal pretendido: " + friendlyPretendido + "\n";
  }

  textoWhats += "Faturamento mensal: " + friendlyFaturamento + "\n\n" +
    "Gostaria de marcar a nossa sessão de diagnóstico. Quais são os seus próximos horários disponíveis?";

  var linkWhats = "https://wa.me/5521969584264?text=" + encodeURIComponent(textoWhats);

  var btnFinal = document.getElementById('btn-whatsapp-final');
  var alternativeMsg = document.getElementById('success-alternative');
  var successSub = document.querySelector('.success-sub');
  
  if (!alternativeMsg) {
    alternativeMsg = document.createElement('div');
    alternativeMsg.id = 'success-alternative';
    alternativeMsg.style.marginTop = '24px';
    alternativeMsg.style.display = 'none';
    alternativeMsg.innerHTML = '<p style="color: var(--text-muted); font-size: 15px; line-height: 1.6;">Recebemos seus dados com sucesso!</p><p style="color: var(--text-muted); font-size: 15px; line-height: 1.6; margin-top: 12px;">Em breve, um de nossos especialistas entrará em contato com você para darmos os próximos passos.</p>';
    var successSection = document.getElementById('success-section');
    if (successSection) {
      successSection.appendChild(alternativeMsg);
    }
  }

  // Lógica de qualificação (ICP)
  var isDisqualified = (payload.faturamento === 'ate8k') && 
                       (payload.valor_investido === 'ate500' || payload.valor_pretendido === 'ate500');

  if (isDisqualified) {
    if (btnFinal) btnFinal.style.display = 'none';
    if (successSub) successSub.style.display = 'none';
    if (alternativeMsg) alternativeMsg.style.display = 'block';
  } else {
    if (btnFinal) {
      btnFinal.style.display = 'inline-flex';
      btnFinal.href = linkWhats;
    }
  }

  // Mostra a tela de agradecimento após um pequeno delay para garantir o disparo
  setTimeout(function () {
    mostrarObrigado();
  }, 100);
}

function mostrarObrigado() {
  document.getElementById('form-container').style.display = 'none';
  
  var successSection = document.getElementById('success-section');
  if (successSection) {
    successSection.style.display = 'block';
  }
  
  setTimeout(function () {
    if (successSection) {
      successSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 150);
}

// ================================================
// SIMULADOR DE FATURAMENTO
// ================================================

function calcularPotencial() {
  var cadeiras = parseInt(document.getElementById('sim-cadeiras').value) || 0;
  var ticket   = parseFloat(document.getElementById('sim-ticket').value) || 0;
  var cortes   = parseInt(document.getElementById('sim-cortes').value) || 0;
  var resultado = cadeiras * ticket * cortes * 26;

  var resultadoEl = document.getElementById('sim-resultado');
  var valorEl = document.getElementById('sim-valor');

  valorEl.textContent = resultado.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  });
  resultadoEl.style.display = 'block';
  resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ================================================
// FAQ ACCORDION
// ================================================

function toggleAccordion(header) {
  var item = header.parentElement;
  var isOpen = item.classList.contains('open');

  // Fecha todos os itens
  document.querySelectorAll('.accordion-item').forEach(function(el) {
    el.classList.remove('open');
  });

  // Abre o clicado (se não estava aberto)
  if (!isOpen) {
    item.classList.add('open');
  }
}