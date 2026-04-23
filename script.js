// ================================================
// CONFIGURAÇÕES
// ================================================
var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxnuCbq8LECgV5iJzYJhM6zu-8OZP30p2dwC2EL0LUHM6l3rPFxc9ya-ShWWPEgk_bEwQ/exec';

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
  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function() {});

  // Pixel browser — usa o MESMO event_id para deduplicação
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {}, { eventID: eventId });
  }

  // Google Ads — conversão
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', { 'send_to': 'AW-10817838805' });
  }

  mostrarObrigado();
}

function mostrarObrigado() {
  document.getElementById('form-container').style.display = 'none';
  document.getElementById('obrigado').classList.add('visible');
  window.scrollTo({ top: document.getElementById('formulario').offsetTop - 40, behavior: 'smooth' });
}
