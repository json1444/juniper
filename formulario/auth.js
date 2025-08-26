// ===== CONFIGURAÇÃO SUPABASE =====
const SUPABASE_URL = "https://drbukxyfvbpcqfzykose.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== LOGIN =====
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Erro no login: " + error.message);
    return;
  }

  // Redireciona para página principal
  window.location.href = "../index.html";
});

// ===== CADASTRO =====
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const petName = document.getElementById("signupName").value;
  const avatar = document.querySelector("input[name='avatar']:checked")?.value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        pet_name: petName,
        avatar: avatar,
      },
      emailRedirectTo: "https://projeto-luckpet.vercel.app/index.html",
    },
  });

  if (error) {
    alert("Erro no cadastro: " + error.message);
    return;
  }

  alert("Cadastro realizado! Confirme seu e-mail para continuar.");
});

// ===== VERIFICAR LOGIN E ATUALIZAR HEADER =====
async function checkUser() {
  const { data } = await supabaseClient.auth.getUser();

  if (data.user) {
    const user = data.user;
    const petName = user.user_metadata?.pet_name || "Meu Pet";
    const avatar = user.user_metadata?.avatar || "cachorro";

    // Exemplo: trocar o botão "Entrar" pelo perfil
    const headerUser = document.getElementById("header-user");
    if (headerUser) {
      headerUser.innerHTML = `
        <div class="user-info">
          <img src="../img/avatares/ava-${avatar}.jpg" alt="Avatar" class="user-avatar">
          <span>${petName}</span>
        </div>
      `;
    }
  }
}

checkUser();
