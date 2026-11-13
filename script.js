const $ = (id) => document.getElementById(id);

const fields = [
    "nome", "jogador", "nivel", "xp", "classe", "caminho",
    "men", "fis", "pro", "res", "sor",
    "vidaAtual", "vidaMaxima", "vontadeAtual", "vontadeMaxima",
    "esquiva", "bloqueio", "ataque"
];

function setStatus(msg) {
    const statusEl = $("status");
    if (statusEl) {
        statusEl.textContent = msg;
    }
}

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
        if (!["esquiva", "bloqueio", "ataque"].includes(input.id)) {
            updateCombat();
        }
    });
    input.addEventListener("input", (e) => {
        if (!["esquiva", "bloqueio", "ataque"].includes(e.target.id)) {
            updateCombat();
        }
    });
});

// function updateCombat() {
//     const proVal = Number($("pro")?.value || 1);
//     const resVal = Number($("res")?.value || 1);
//     const fisVal = Number($("fis")?.value || 1);

//     const esquivaEl = $("esquiva");
//     const bloqueioEl = $("bloqueio");
//     const ataqueEl = $("ataque");

//     if (esquivaEl) esquivaEl.value = 7 + proVal;
//     if (bloqueioEl) bloqueioEl.value = resVal + fisVal;
//     if (ataqueEl) ataqueEl.value = 5 + proVal;
// }

function getData() {
    const data = {};
    fields.forEach((id) => {
        const el = $(id);
        if (el) data[id] = el.value;
    });
    data.rsq = document.querySelector('input[name="rsq"]:checked')?.value || "cinza";
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
    const copiarBtn = $("copiar");
    if (copiarBtn) copiarBtn.disabled = false;
    setStatus("Ficha salva na URL!");
}

function loadFromUrl() {
    const match = window.location.hash.match(/data=([^&]+)/);
    if (!match) return;
    try {
        const data = decodeData(decodeURIComponent(match[1]));
        fields.forEach((id) => {
            const el = $(id);
            if (el && data[id] !== undefined) el.value = data[id];
        });
        if (data.rsq) {
            const radio = document.querySelector(`input[name="rsq"][value="${CSS.escape(data.rsq)}"]`);
            if (radio) radio.checked = true;
        }
        const copiarBtn = $("copiar");
        if (copiarBtn) copiarBtn.disabled = false;
        setStatus("Ficha carregada com sucesso!");
    } catch {
        setStatus("Não foi possível carregar os dados da URL.");
    }
}

const salvarBtn = $("salvar");
if (salvarBtn) salvarBtn.addEventListener("click", saveToUrl);

if ($("copiar")) {
    $("copiar").addEventListener("click", async () => {
        if ($("copiar").disabled) return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            setStatus("Link copiado para a área de transferência!");
        } catch {
            setStatus("Copie o link manualmente na barra do navegador.");
        }
    });
}

// Inicialização
const temHash = window.location.hash.match(/data=([^&]+)/);
if (temHash) {
    loadFromUrl();
} else {
    updateCombat();
}