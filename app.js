// ======================= CONFIGURAÇÃO ==========================
const API = "http://localhost:3001/api/clientes";

// Referências aos elementos da página
const form = document.getElementById("formCliente");
const msg = document.getElementById("msg");
const campos = {
  id: document.getElementById("id"),
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  celular: document.getElementById("celular"), // se seu input chama telefone, já explico abaixo
  obs: document.getElementById("obs"),
};
const busca = document.getElementById("busca");
const tbody = document.querySelector("#tabela tbody");

// ======================= FUNÇÕES DA API =======================

// LISTAR
async function apiListar(q = "") {
  const url = q ? `${API}?q=${encodeURIComponent(q)}` : API;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao listar clientes");
  return res.json();
}

// CRIAR
async function apiCriar(dados) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const body = await res.json();
  if (!res.ok) throw body;
  return body;
}

// ATUALIZAR
async function apiAtualizar(id, dados) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const body = await res.json();
  if (!res.ok) throw body;
  return body;
}

// EXCLUIR
async function apiExcluir(id) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json();
    throw body;
  }
}

// ======================= FUNÇÕES DE TELA =======================

function limparForm() {
  campos.id.value = "";
  campos.nome.value = "";
  campos.email.value = "";
  campos.celular.value = "";
  campos.obs.value = "";
  msg.textContent = "";
}

// Monta tabela
function renderTabela(lista) {
  tbody.innerHTML = "";
  lista.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>${c.celular}</td>
      <td>
        <button type="button" onclick="editar('${c.id}')">Editar</button>
        <button type="button" onclick="excluir('${c.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Carrega lista + desenha tabela
async function carregarClientes(q = "") {
  try {
    const lista = await apiListar(q);
    renderTabela(lista);
  } catch (e) {
    console.error(e);
    msg.textContent = "Erro ao carregar clientes.";
  }
}

// ======================= EVENTOS =======================

// Submit do formulário (criar/atualizar)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const dados = {
    nome: campos.nome.value.trim(),
    email: campos.email.value.trim(),
    celular: campos.celular.value.trim(),
    observacoes: campos.obs.value.trim(),
  };

  if (!dados.nome || !dados.email || !dados.celular) {
    msg.textContent = "Preencha nome, e-mail e celular.";
    return;
  }

  try {
    if (campos.id.value) {
      // atualizar
      await apiAtualizar(campos.id.value, dados);
      msg.textContent = "Cliente atualizado com sucesso.";
    } else {
      // criar
      await apiCriar(dados);
      msg.textContent = "Cliente criado com sucesso.";
    }
    limparForm();
    await carregarClientes(busca.value.trim());
  } catch (e) {
    console.error(e);
    msg.textContent = e?.erro || "Erro ao salvar cliente.";
  }
});

// Botão limpar
document.getElementById("btnLimpar").addEventListener("click", () => {
  limparForm();
});

// Campo de busca
busca.addEventListener("input", () => {
  const termo = busca.value.trim();
  carregarClientes(termo);
});

// ======================= AÇÕES DOS BOTÕES DA TABELA =======================

// Tornar funções globais para usar no onclick do HTML
window.editar = async function (id) {
  msg.textContent = "";
  try {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw await res.json();
    const c = await res.json();
    campos.id.value = c.id;
    campos.nome.value = c.nome;
    campos.email.value = c.email;
    campos.celular.value = c.celular;
    campos.obs.value = c.observacoes || "";
    msg.textContent = "Editando cliente. Altere os dados e clique em Salvar.";
  } catch (e) {
    console.error(e);
    msg.textContent = e?.erro || "Erro ao carregar cliente para edição.";
  }
};

window.excluir = async function (id) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
  msg.textContent = "";
  try {
    await apiExcluir(id);
    msg.textContent = "Cliente excluído.";
    await carregarClientes(busca.value.trim());
  } catch (e) {
    console.error(e);
    msg.textContent = e?.erro || "Erro ao excluir cliente.";
  }
};

// ======================= INICIALIZAÇÃO =======================
carregarClientes();


