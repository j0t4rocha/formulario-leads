// ================================================
// CONFIGURAÇÕES
// ================================================
var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwMaYbz97o6MTaKpe6RJLh9rMs19S8t42qtkcYlbLnHEL9wktFeYmeZhj41xSqdJKc66w/exec';

// ================================================
// LÓGICA DO FORMULÁRIO
// ================================================

function toggleTrafego(val) {
  // Marca o radio manualmente
  var radio = document.querySelector('[name="trafego"][value="' + val + '"]');
  if (radio) radio.checked = true;

  // Mostra/esconde blocos
  document.getElementById('bloco-sim').classList.toggle('visible', val === 'sim');
  document.getElementById('bloco-nao').classList.toggle('visible', val === 'nao');

  // Atualiza visual
  document.getElementById('opt-sim').classList.toggle('selected', val === 'sim');
  document.getElementById('opt-nao').classList.toggle('selected', val === 'nao');
}

function selectExperiencia(el) {
  // Marca o radio manualmente
  var radio = el.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Atualiza visual
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
    data:             new Date().toLocaleString('pt-BR')
  };

  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(function() {
    mostrarObrigado();
  })
  .catch(function() {
    mostrarObrigado();
  });
}

function mostrarObrigado() {
  document.getElementById('form-container').style.display = 'none';
  document.getElementById('obrigado').classList.add('visible');
  window.scrollTo({ top: document.getElementById('formulario').offsetTop - 40, behavior: 'smooth' });

  // ================================================
  // DISPARA EVENTO DE CONVERSÃO (página de obrigado)
  // Descomente as linhas abaixo após configurar os pixels
  // ================================================

  // Dispara conversão — Meta Pixel
  if (typeof fbq !== 'undefined') fbq('track', 'Lead');

  // Dispara conversão — Google Ads
  if (typeof gtag !== 'undefined') gtag('event', 'conversion', {'send_to': 'AW-10817838805'});
}
