/* =============================================
   CONFIGURAÇÃO — COLE SUA URL DO APPS SCRIPT
   ============================================= */
const SCRIPT_URL = 'COLE_AQUI_A_URL_DO_APPS_SCRIPT';

/* =============================================
   PARTÍCULAS DE FUNDO
   ============================================= */
function criarParticulas() {
  const container = document.getElementById('bgParticles');
  const total = 18;

  for (let i = 0; i < total; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size = Math.random() * 6 + 3;
    const left = Math.random() * 100;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 15;
    const opacity = Math.random() * 0.05 + 0.02;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      --duration: ${duration}s;
      --delay: ${delay}s;
      --op: ${opacity};
    `;

    container.appendChild(p);
  }
}

/* =============================================
   ANIMAÇÕES DE REVEAL AO SCROLL
   ============================================= */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* =============================================
   MÁSCARA DE TELEFONE
   ============================================= */
document.getElementById('fone').addEventListener('input', function (e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
  if (v.length >= 7) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  else if (v.length >= 3) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length >= 1) v = `(${v}`;
  e.target.value = v;
});

/* =============================================
   RADIO OPTIONS
   ============================================= */
let anuncioSelecionado = '';

document.querySelectorAll('.radio-option').forEach(option => {
  option.addEventListener('click', function () {
    document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
    this.classList.add('selected');
    anuncioSelecionado = this.dataset.value;

    const atualField    = document.getElementById('investAtualField');
    const dispostoField = document.getElementById('investDispostoField');

    atualField.classList.remove('visible');
    dispostoField.classList.remove('visible');

    // Reseta os selects ao trocar opção
    document.getElementById('investAtual').value    = '';
    document.getElementById('investDisposto').value = '';

    if (anuncioSelecionado === 'Anuncio sozinho atualmente') {
      atualField.classList.add('visible');
    } else {
      dispostoField.classList.add('visible');
    }
  });
});

/* =============================================
   PEGAR VALOR DO INVESTIMENTO
   ============================================= */
function getInvestimento() {
  if (document.getElementById('investAtualField').classList.contains('visible'))
    return document.getElementById('investAtual').value;
  if (document.getElementById('investDispostoField').classList.contains('visible'))
    return document.getElementById('investDisposto').value;
  return '';
}

/* =============================================
   VALIDAÇÃO COM FEEDBACK VISUAL
   ============================================= */
function validarCampo(el) {
  if (!el.value || el.value.trim() === '') {
    el.classList.add('error');
    el.addEventListener('input', () => el.classList.remove('error'), { once: true });
    el.addEventListener('change', () => el.classList.remove('error'), { once: true });
    return false;
  }
  return true;
}

function validarRadio() {
  const group = document.getElementById('anuncioGroup');
  if (!anuncioSelecionado) {
    group.style.animation = 'none';
    group.offsetHeight; // reflow
    group.style.animation = 'shake 0.4s ease';
    setTimeout(() => group.style.animation = '', 500);
    return false;
  }
  return true;
}

/* =============================================
   ENVIO DO FORMULÁRIO
   ============================================= */
document.getElementById('btnEnviar').addEventListener('click', enviar);

function enviar() {
  const nome = document.getElementById('nome');
  const fone = document.getElementById('fone');
  const seg  = document.getElementById('segmento');
  const dor  = document.getElementById('dor');
  const inv  = getInvestimento();

  // Valida todos os campos
  const camposOk = [
    validarCampo(nome),
    validarCampo(fone),
    validarCampo(seg),
    validarRadio(),
    validarCampo(dor)
  ].every(Boolean);

  // Valida campo de investimento
  let investOk = true;
  if (document.getElementById('investAtualField').classList.contains('visible')) {
    investOk = validarCampo(document.getElementById('investAtual'));
  } else if (document.getElementById('investDispostoField').classList.contains('visible')) {
    investOk = validarCampo(document.getElementById('investDisposto'));
  }

  if (!camposOk || !investOk) return;

  // Inicia loading
  const btn = document.getElementById('btnEnviar');
  btn.disabled = true;
  document.getElementById('formBody').style.display    = 'none';
  document.getElementById('loadingState').style.display = 'block';

  // Monta os parâmetros
  const params = new URLSearchParams({
    nome:         nome.value.trim(),
    whatsapp:     fone.value.trim(),
    segmento:     seg.value,
    situacao:     anuncioSelecionado,
    investimento: inv,
    dificuldade:  dor.value,
    origem:       'Instagram',
    data:         new Date().toLocaleString('pt-BR')
  });

  fetch(`${SCRIPT_URL}?${params.toString()}`, {
    method: 'GET',
    mode:   'no-cors'
  })
  .then(() => {;
    window.location.href = "obrigado.html";
  })
  .catch(() => {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('formBody').style.display     = 'block';
    btn.disabled = false;
    alert('Erro ao enviar. Por favor, tente novamente.');
  });
}

/* =============================================
   INICIALIZAÇÃO
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  criarParticulas();
  initReveal();
});