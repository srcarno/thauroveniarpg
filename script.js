const $ = (id) => document.getElementById(id);

const fields = [
  "nome", "jogador", "nivel", "xp", "classe", "caminho",
  "men", "fis", "pro", "res", "sor",
  "vidaAtual", "vidaMaxima", "vontadeAtual", "vontadeMaxima",
  "anotacoes"
];

function clampInput(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  let value = Number(input.value);
  if (!Number.isFinite(value)) value = min;
  input.value = String(Math.min(max, Math.max(min, value)));
}

document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("change", () => {
    clampInput(input);
    updateCombat();
  });
  input.addEventListener("input", updateCombat);
});

function updateCombat() {
  $("esquiva").textContent = 7 + Number($("pro").value || 1);
  $("bloqueio").textContent = 5 + Number($("res").value || 1);
  $("ataque").textContent = 5 + Number($("pro").value || 1);
}

function getData() {
  const data = {};
  fields.forEach((id) => data[id] = $(id).value);
  data.rsq = document.querySelector('input[name="rsq"]:checked')?.value || "cinza";
  data.esquiva = $("esquiva").textContent;
  data.bloqueio = $("bloqueio").textContent;
  data.ataque = $("ataque").textContent;
  return data;
}

function encodeData(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function decodeData(encoded) {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function saveToUrl() {
  const encoded = encodeData(getData());
  const url = `${window.location.origin}${window.location.pathname}#data=${encodeURIComponent(encoded)}`;
  history.replaceState(null, "", url);
  $("copiar").disabled = false;
  $("status").textContent = "Ficha salva na URL.";
}

function loadFromUrl() {
  const match = window.location.hash.match(/data=([^&]+)/);
  if (!match) return;
  try {
    const data = decodeData(decodeURIComponent(match[1]));
    fields.forEach((id) => {
      if (data[id] !== undefined) $(id).value = data[id];
    });
    if (data.rsq) {
      const radio = document.querySelector(`input[name="rsq"][value="${CSS.escape(data.rsq)}"]`);
      if (radio) radio.checked = true;
    }
    updateCombat();
    $("copiar").disabled = false;
    $("status").textContent = "Ficha carregada da URL.";
  } catch {
    $("status").textContent = "Não foi possível carregar os dados da URL.";
  }
}

$("salvar").addEventListener("click", saveToUrl);

$("copiar").addEventListener("click", async () => {
  if ($("copiar").disabled) return;
  try {
    await navigator.clipboard.writeText(window.location.href);
    $("status").textContent = "Link copiado!";
  } catch {
    $("status").textContent = "Não foi possível copiar automaticamente. Copie o link pela barra do navegador.";
  }
});

document.querySelectorAll('input[name="rsq"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".rsq-option i").forEach((item) => item.style.background = "#d8dadd");
    const selected = radio.closest(".rsq-option").querySelector("i");
    const colors = {
      "amarelo": "#ffb83f",
      "amarelo-claro": "#ffc96f",
      "cinza": "#ffffff",
      "vermelho-claro": "#ff7b80",
      "vermelho": "#ff3e45"
    };
    selected.style.background = colors[radio.value];
  });
});

loadFromUrl();
updateCombat();
