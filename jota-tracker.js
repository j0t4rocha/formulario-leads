/* ============================================================
   Jota Tracker v1 — rastreamento próprio (pixel + servidor)

   Instalação (no <head>):
   <script src="jota-tracker.js?v=1"
           data-site="ID-DO-CLIENTE"
           data-endpoint="https://SEU-PROJETO.supabase.co/functions/v1/meta-capi/track"
           data-pixel="ID-DO-PIXEL"          (opcional: carrega o pixel da Meta)
           data-auto-lead="off"              (opcional: desliga o Lead automático no envio de formulário)
           defer></script>

   Uso manual: jotaTrack('Lead', {dados}, {telefone, email}, 'event_id_opcional')
   ============================================================ */
(function () {
  var tag = document.currentScript;
  var SITE = tag.getAttribute("data-site");
  var ENDPOINT = tag.getAttribute("data-endpoint");
  var PIXEL = tag.getAttribute("data-pixel");
  var AUTO_LEAD = tag.getAttribute("data-auto-lead") !== "off";

  // ---------- pixel da Meta (navegador) ----------
  if (PIXEL && !window.fbq) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL);
  }

  // ---------- cookies ----------
  function lerCookie(nome) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + nome + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function gravarCookie(nome, valor, dias) {
    var exp = new Date(Date.now() + dias * 864e5).toUTCString();
    document.cookie = nome + "=" + encodeURIComponent(valor) + "; expires=" + exp + "; path=/; SameSite=Lax";
  }

  var fbclid = new URLSearchParams(location.search).get("fbclid");
  if (fbclid) gravarCookie("_fbc", "fb.1." + Date.now() + "." + fbclid, 90);
  if (!lerCookie("_fbp")) {
    gravarCookie("_fbp", "fb.1." + Date.now() + "." + Math.floor(Math.random() * 1e10), 90);
  }

  // Código curto do visitante (vai na mensagem do WhatsApp)
  var ref = lerCookie("_jref");
  if (!ref) {
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    ref = "";
    for (var i = 0; i < 5; i++) ref += letras[Math.floor(Math.random() * letras.length)];
    gravarCookie("_jref", ref, 90);
  }
  window.jotaRef = ref;

  function novoId() {
    return (window.crypto && crypto.randomUUID && crypto.randomUUID()) ||
      Date.now() + "-" + Math.random().toString(36).slice(2);
  }

  // Pega telefone/e-mail que a pessoa já digitou na página
  function dadosDaPagina() {
    var tel = document.querySelector('input[type="tel"]');
    var mail = document.querySelector('input[type="email"]');
    return {
      telefone: tel && tel.value ? tel.value : undefined,
      email: mail && mail.value ? mail.value : undefined,
    };
  }

  // ---------- função principal ----------
  function track(eventName, customData, userData, eventIdManual) {
    var eventId = eventIdManual || novoId();

    if (window.fbq) {
      window.fbq("track", eventName, customData || {}, { eventID: eventId });
    }

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        site_id: SITE,
        event_name: eventName,
        event_id: eventId,
        page_url: location.href,
        fbp: lerCookie("_fbp"),
        fbc: lerCookie("_fbc"),
        ref_code: ref,
        custom_data: customData || {},
        telefone: userData && userData.telefone,
        email: userData && userData.email,
      }),
      keepalive: true,
    }).catch(function () {});

    return eventId;
  }
  window.jotaTrack = track;

  // ---------- regras automáticas ----------

  // 1) PageView
  track("PageView");

  // 2) Clique em link de WhatsApp -> Contact + código na mensagem
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!/wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(href)) return;

    try {
      var url = new URL(href, location.href);
      var texto = url.searchParams.get("text") || "Olá!";
      if (texto.indexOf("cód.") === -1) texto += "\n\n(cód. " + ref + ")";
      url.searchParams.set("text", texto);
      a.setAttribute("href", url.toString());
    } catch (err) {}

    track("Contact", { content_name: "Clique WhatsApp" }, dadosDaPagina());
  }, true);

  // 3) Envio de formulário -> Lead (pode ser desligado com data-auto-lead="off")
  if (AUTO_LEAD) {
    document.addEventListener("submit", function () {
      track("Lead", { content_name: "Formulário" }, dadosDaPagina());
    }, true);
  }
})();
