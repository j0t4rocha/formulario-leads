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
});

function updateProgressBar() {
  var fill = document.getElementById('progress-fill');
  if (!fill) return;

  var trafegoVal = document.getElementById('input-trafego').value;
  var percentage = 0;

  if (trafegoVal === 'sim') {
    // 5 steps: 20%, 40%, 60%, 80%, 100%
    if (currentStep === 1) percentage = 20;
    else if (currentStep === 2) percentage = 40;
    else if (currentStep === 3) percentage = 60;
    else if (currentStep === 4) percentage = 80;
    else if (currentStep === 5) percentage = 100;
  } else if (trafegoVal === 'nao') {
    // 4 steps: 25%, 50%, 75%, 100%
    if (currentStep === 1) percentage = 25;
    else if (currentStep === 2) percentage = 50;
    else if (currentStep === 3) percentage = 75;
    else if (currentStep === 5) percentage = 100;
  } else {
    // Before selecting trafego
    if (currentStep === 1) percentage = 20;
    else if (currentStep === 2) percentage = 40;
  }

  fill.style.width = percentage + '%';
}

function goToStep(stepNumber) {
  var currentStepEl = document.getElementById('step-' + currentStep);
  var nextStepEl = document.getElementById('step-' + stepNumber);

  if (!nextStepEl) return;

  currentStep = stepNumber;
  updateProgressBar();

  if (currentStepEl) {
    currentStepEl.classList.remove('visible');
    setTimeout(function () {
      currentStepEl.classList.remove('active');

      if (stepNumber === 3) {
        var trafegoVal = document.getElementById('input-trafego').value;
        if (trafegoVal === 'sim') {
          document.getElementById('step-3-sim').style.display = 'block';
          document.getElementById('step-3-nao').style.display = 'none';
        } else {
          document.getElementById('step-3-sim').style.display = 'none';
          document.getElementById('step-3-nao').style.display = 'block';
        }
      }

      nextStepEl.classList.add('active');
      nextStepEl.offsetHeight; // Force reflow
      nextStepEl.classList.add('visible');

      var formContainer = document.getElementById('form-container');
      if (formContainer) {
        window.scrollTo({ top: formContainer.offsetTop - 40, behavior: 'smooth' });
      }
    }, 250);
  } else {
    nextStepEl.classList.add('active');
    nextStepEl.offsetHeight;
    nextStepEl.classList.add('visible');
  }
}

function nextStep(current) {
  if (current === 1) {
    var step1 = document.getElementById('step-1');
    var inputs = step1.querySelectorAll('input[required]');
    for (var i = 0; i < inputs.length; i++) {
      if (!inputs[i].reportValidity()) {
        return;
      }
    }
    goToStep(2);
  }
}

function prevStep(current) {
  if (current === 2) {
    goToStep(1);
  } else if (current === 3) {
    goToStep(2);
  } else if (current === 4) {
    goToStep(3);
  } else if (current === 5) {
    var trafegoVal = document.getElementById('input-trafego').value;
    if (trafegoVal === 'sim') {
      goToStep(4);
    } else {
      goToStep(3);
    }
  }
}

function selectCardOption(fieldName, optionValue, step) {
  var input = document.getElementById('input-' + fieldName);
  if (input) {
    input.value = optionValue;
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

  if (step === 2) {
    setTimeout(function () {
      goToStep(3);
    }, 250);
  } else if (step === 3) {
    setTimeout(function () {
      var trafegoVal = document.getElementById('input-trafego').value;
      if (trafegoVal === 'sim') {
        goToStep(4);
      } else {
        goToStep(5);
      }
    }, 250);
  } else if (step === 4) {
    setTimeout(function () {
      goToStep(5);
    }, 250);
  } else if (step === 5) {
    var submitBlock = document.getElementById('submit-block');
    if (submitBlock) {
      submitBlock.style.display = 'block';
      setTimeout(function () {
        submitBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
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

  // Pixel browser — usa o MESMO event_id para deduplicação
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {}, { eventID: eventId });
  }

  // Google Analytics 4 — evento de lead
  if (typeof gtag !== 'undefined') {
    gtag('event', 'lead_gerado', { 'event_category': 'formulario' });
  }

  // Google Ads — conversão
  // mostrarObrigado() fica dentro do callback para garantir que o hit
  // seja enviado antes da tela mudar. Fallback de 1s protege o usuário
  // caso o gtag não carregue ou o callback demore demais.
  var obrigadoChamado = false;
  function chamarObrigado() {
    if (!obrigadoChamado) {
      obrigadoChamado = true;
      mostrarObrigado();
    }
  }

  setTimeout(chamarObrigado, 1000); // fallback de segurança

  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
      'send_to': 'AW-10817838805/tZzICO3yq7YcENW9rKYo',
      'event_callback': chamarObrigado,
      'transaction_id': eventId
    });
  } else {
    chamarObrigado();
  }
}

function mostrarObrigado() {
  document.getElementById('form-container').style.display = 'none';
  document.getElementById('obrigado').classList.add('visible');
  document.getElementById('obrigado').innerHTML += '<a href="https://wa.me/5521969584264?text=Oi%20Jota%2C%20acabei%20de%20preencher%20o%20formulário%20e%20quero%20minha%20análise!" target="_blank" style="display:inline-block;margin-top:1.5rem;background:#25D366;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:500;">👉 Garantir minha análise no WhatsApp</a>';
  window.scrollTo({ top: document.getElementById('formulario').offsetTop - 40, behavior: 'smooth' });
}