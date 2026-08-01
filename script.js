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

function revealForm() {
  var formSection = document.getElementById('formulario');
  var ctaContainer = document.getElementById('cta-container');
  if (formSection) {
    formSection.classList.add('active');
    // Força o reflow para aplicar display: block antes da animação de opacidade/transform
    formSection.offsetHeight;
    formSection.classList.add('visible');
    
    setTimeout(function () {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
  if (ctaContainer) {
    ctaContainer.style.display = 'none';
  }
}

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

  var textoWhats = "Oi Jota! Acabei de preencher o formulário de diagnóstico da minha barbearia:\n\n" +
    "*Nome:* " + payload.nome + "\n" +
    "*WhatsApp:* " + payload.whatsapp + "\n" +
    "*E-mail:* " + payload.email + "\n" +
    "*Instagram:* " + (payload.instagram || '-') + "\n" +
    "*Já investiu em tráfego:* " + (payload.trafego === 'sim' ? 'Sim' : 'Não') + "\n";

  if (payload.trafego === 'sim') {
    textoWhats += "*Quanto investia:* " + friendlyInvestimento + "\n" +
                  "*Experiência:* " + friendlyExperiencia + "\n";
  } else {
    textoWhats += "*Quanto pretende investir:* " + friendlyPretendido + "\n";
  }
  textoWhats += "*Faturamento mensal:* " + friendlyFaturamento + "\n\n" +
                "Gostaria de concluir meu diagnóstico e confirmar a sessão agendada!";

  var linkWhats = "https://wa.me/5521969584264?text=" + encodeURIComponent(textoWhats);
  
  var btnConcluir = document.getElementById('btn-concluir-whatsapp');
  if (btnConcluir) {
    btnConcluir.href = linkWhats;
  }

  // Mostra a tela de agradecimento após um pequeno delay para garantir o disparo
  setTimeout(function () {
    mostrarObrigado();
  }, 100);
}

function mostrarObrigado() {
  document.getElementById('form-container').style.display = 'none';
  
  var agendaSection = document.getElementById('agenda-section');
  if (agendaSection) {
    agendaSection.style.display = 'block';
  }
  
  setTimeout(function () {
    if (agendaSection) {
      agendaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 150);
}