// ================================================
// CONFIGURAÇÕES
// ================================================
var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzDDeNhsoTVMyYOB-3aKdgxOXXv1KdIV-9QA3SDiyQXO0EySJnCyQ0--Bxg1kU0JmjD3A/exec';

// ================================================
// LÓGICA DO FORMULÁRIO
// ================================================

function toggleTrafego(val) {
  var radio = document.querySelector('[name="trafego"][value="' + val + '"]');
  if (radio) radio.checked = true;
  document.getElementById('bloco-sim').classList.toggle('visible', val === 'sim');
  document.getElementById('bloco-nao').classList.toggle('visible', val === 'nao');
  document.getElementById('opt-sim').classList.toggle('selected', val === 'sim');
  document.getElementById('opt-nao').classList.toggle('selected', val === 'nao');
}

function selectExperiencia(el) {
  var radio = el.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  document.querySelectorAll('.radio-group-col .radio-opt').forEach(function(r) {
    r.classList.remove('selected');
  });
  el.classList.add('selected');
}

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
    nome:             data.get('nome'),
    whatsapp:         data.get('whatsapp'),
    email:            data.get('email'),
    instagram:        data.get('instagram') || '-',
    trafego:          data.get('trafego'),
    experiencia:      data.get('experiencia') || '-',
    valor_investido:  data.get('valor_investido') || '-',
    valor_pretendido: data.get('valor_pretendido') || '-',
    faturamento:      data.get('faturamento'),
    data:             new Date().toLocaleString('pt-BR'),
    event_id:         eventId,
    event_source_url: window.location.href
  };

  // Envia para Google Sheets + CAPI (servidor)
  // Content-Type text/plain evita preflight CORS e o GAS consegue receber
  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  }).catch(function() {});

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
      'event_callback': chamarObrigado
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