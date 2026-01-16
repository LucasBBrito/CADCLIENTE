// ======================= CONFIGURAÇÃO ==========================
const STORAGE_KEY = "cadclientes_db";

// Referências aos elementos da página
const form = document.getElementById("formCliente");
const msg = document.getElementById("msg");
const campos = {
  id: document.getElementById("id"),
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  celular: document.getElementById("celular"),
  obs: document.getElementById("obs"),
};
const busca = document.getElementById("busca");
const tbody = document.querySelector("#tabela tbody");

// ======================= FUNÇÕES DE LOCALSTORAGE =======================

// Gera ID único
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Carrega todos os clientes do localStorage
function carregarDB() {
  const dados = localStorage.getItem(STORAGE_KEY);
  return dados ? JSON.parse(dados) : [];
}

// Salva todos os clientes no localStorage
function salvarDB(clientes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

// LISTAR (com busca opcional)
function dbListar(q = "") {
  const clientes = carregarDB();
  if (!q) return clientes;

  const termo = q.toLowerCase();
  return clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(termo) ||
      c.email.toLowerCase().includes(termo)
  );
}

// BUSCAR POR ID
function dbBuscarPorId(id) {
  const clientes = carregarDB();
  return clientes.find((c) => c.id === id);
}

// CRIAR
function dbCriar(dados) {
  const clientes = carregarDB();
  const novoCliente = {
    id: gerarId(),
    ...dados,
    criadoEm: new Date().toISOString(),
  };
  clientes.push(novoCliente);
  salvarDB(clientes);
  return novoCliente;
}

// ATUALIZAR
function dbAtualizar(id, dados) {
  const clientes = carregarDB();
  const index = clientes.findIndex((c) => c.id === id);

  if (index === -1) {
    throw { erro: "Cliente não encontrado" };
  }

  clientes[index] = {
    ...clientes[index],
    ...dados,
    atualizadoEm: new Date().toISOString(),
  };

  salvarDB(clientes);
  return clientes[index];
}

// EXCLUIR
function dbExcluir(id) {
  const clientes = carregarDB();
  const novaLista = clientes.filter((c) => c.id !== id);

  if (novaLista.length === clientes.length) {
    throw { erro: "Cliente não encontrado" };
  }

  salvarDB(novaLista);
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

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #666; padding: 2rem;">
          Nenhum cliente encontrado.
        </td>
      </tr>
    `;
    return;
  }

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
function carregarClientes(q = "") {
  try {
    const lista = dbListar(q);
    renderTabela(lista);
  } catch (e) {
    console.error(e);
    msg.textContent = "Erro ao carregar clientes.";
  }
}

// ======================= EVENTOS =======================

// Submit do formulário (criar/atualizar)
form.addEventListener("submit", (e) => {
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
      dbAtualizar(campos.id.value, dados);
      msg.textContent = "Cliente atualizado com sucesso.";
    } else {
      // criar
      dbCriar(dados);
      msg.textContent = "Cliente criado com sucesso.";
    }
    limparForm();
    carregarClientes(busca.value.trim());
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
window.editar = function (id) {
  msg.textContent = "";
  try {
    const c = dbBuscarPorId(id);
    if (!c) {
      msg.textContent = "Cliente não encontrado.";
      return;
    }
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

window.excluir = function (id) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
  msg.textContent = "";
  try {
    dbExcluir(id);
    msg.textContent = "Cliente excluído.";
    carregarClientes(busca.value.trim());
  } catch (e) {
    console.error(e);
    msg.textContent = e?.erro || "Erro ao excluir cliente.";
  }
};

// ======================= INICIALIZAÇÃO =======================
carregarClientes();
