// ---- Configuração do "mock" de autenticação (sem backend) ----
// Você pode trocar por leitura de .env no futuro ou integrar com Prisma na UC2.
const MOCK_USER = {
  email: "marcio.coutinho@al.senac.br",
  senha: "123456",
};

// Seletores
const form = document.getElementById("formLogin");
const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");
const lembrar = document.getElementById("lembrar");
const msg = document.getElementById("msg");
const btnEntrar = document.getElementById("btnEntrar");
const preencherExemplo = document.getElementById("preencherExemplo");

// Se já estiver logado (sessão aberta), envia direto para index.html
(function autoRedirectIfLogged() {
  const logged =
    sessionStorage.getItem("session_user") ||
    localStorage.getItem("session_user");
  if (logged) {
    window.location.href = "index.html";
  }
})();

// Mostrar/ocultar senha
toggleSenha.addEventListener("click", () => {
  const isPass = inputSenha.type === "password";
  inputSenha.type = isPass ? "text" : "password";
  toggleSenha.textContent = isPass ? "🙈" : "👁️";
});

// Preencher credenciais de exemplo
preencherExemplo.addEventListener("click", (e) => {
  e.preventDefault();
  inputEmail.value = MOCK_USER.email;
  inputSenha.value = MOCK_USER.senha;
  msg.textContent = "Credenciais de exemplo preenchidas.";
  msg.style.color = "#198754"; // verde
});

// Validação básica de e-mail
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simulação de autenticação (mock)
function autenticar(email, senha) {
  // Você pode expandir para aceitar mais de um usuário (array) se quiser.
  return email === MOCK_USER.email && senha === MOCK_USER.senha;
}

// Exibir mensagens
function feedback(texto, tipo = "erro") {
  msg.textContent = texto || "";
  msg.style.color = tipo === "ok" ? "#198754" : "#dc3545";
}

// Submissão do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  feedback("");

  const email = inputEmail.value.trim();
  const senha = inputSenha.value.trim();

  // Validações simples
  if (!email || !senha) return feedback("Informe e-mail e senha.");
  if (!emailValido(email)) return feedback("Informe um e-mail válido.");

  // "Processando"
  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  // Simule um pequeno delay (UX)
  await new Promise((r) => setTimeout(r, 400));

  // Autenticação mock
  if (!autenticar(email, senha)) {
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";
    return feedback("Credenciais inválidas. Dica: admin@empresa.com / 123456");
  }

  // Sessão: sessionStorage (padrão) ou localStorage (lembrar-me)
  const sessao = { email, ts: Date.now() };
  const payload = JSON.stringify(sessao);

  if (lembrar.checked) {
    localStorage.setItem("session_user", payload);
  } else {
    sessionStorage.setItem("session_user", payload);
  }

  feedback("Login realizado!", "ok");

  // Redirecionar ao sistema
  window.location.href = "index.html";
});
