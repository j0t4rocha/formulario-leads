// ================================================
// CONFIGURAÇÕES
// ================================================
var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwMaYbz97o6MTaKpe6RJLh9rMs19S8t42qtkcYlbLnHEL9wktFeYmeZhj41xSqdJKc66w/exec';
var META_PIXEL_ID = '1526385979054190';
var META_ACCESS_TOKEN = 'EAAEaDK1vzZBABRRiVfdZAJheR1jWZBEI5fo7Pf2eKv5avosqkBivPcUnK8KgiCFDvhx0WswoXgpZApuZBYZAe40Ud6y3HkuFfuhJdHp8DC4fkGTStOUHuTPV2xxWHCIkPHQZBVe17q8jmHzZBFaV48hHuZCYIehuy8lD0UuxK23MS4UNshloF2sp2VyaeZCwLjGx49sAZDZD';

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

  // Envia para Google Sheets
  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function() {});

  // Envia para API de Conversões da Meta
  enviarMetaAPI(payload);

  mostrarObrigado();
}

function enviarMetaAPI(payload) {
  var eventId = 'lead_' + Date.now();

  var body = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: {
        em: hashString(payload.email.trim().toLowerCase()),
        ph: hashString(payload.whatsapp.replace(/\D/g, '')),
        fn: hashString(payload.nome.split(' ')[0].toLowerCase()),
        ln: hashString(payload.nome.split(' ').slice(1).join(' ').toLowerCase())
      },
      custom_data: {
        trafego:     payload.trafego,
        faturamento: payload.faturamento,
        experiencia: payload.experiencia
      }
    }]
  };

  fetch('https://graph.facebook.com/v19.0/' + META_PIXEL_ID + '/events?access_token=' + META_ACCESS_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).catch(function() {});
}

// Hash SHA-256 para dados do usuário (exigido pela Meta)
async function hashString(str) {
  if (!str) return '';
  var msgBuffer = new TextEncoder().encode(str);
  var hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  var hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function mostrarObrigado() {
  document.getElementById('form-container').style.display = 'none';
  document.getElementById('obrigado').classList.add('visible');
  window.scrollTo({ top: document.getElementById('formulario').offsetTop - 40, behavior: 'smooth' });

  // Meta Pixel — evento Lead (browser)
  if (typeof fbq !== 'undefined') fbq('track', 'Lead');

  // Google Ads — conversão
  if (typeof gtag !== 'undefined') gtag('event', 'conversion', {'send_to': 'AW-10817838805'});
}
