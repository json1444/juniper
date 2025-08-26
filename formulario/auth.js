// ===== CONFIGURAÇÃO SUPABASE =====
const SUPABASE_URL = "https://drbukxyfvbpcqfzykose.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== CADASTRO ======
document
  .getElementById("signup-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const name = document.getElementById("signup-name").value;
    const avatar = document.querySelector('input[name="avatar"]:checked')?.value;

    // Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: name,
          avatar: avatar,
        },
        emailRedirectTo: "https://projeto-luckpet.vercel.app/index.html",
      },
    });

    if (authError) {
      alert("Erro no cadastro: " + authError.message);
      return;
    }

    // Cria perfil na tabela "profiles"
    if (authData?.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name: name,
        avatar: avatar,
      });

      if (profileError) {
        console.error("Erro ao salvar perfil:", profileError);
      }
    }

    alert("Cadastro realizado! Verifique seu email para confirmar a conta.");
  });

// ====== LOGIN ======
document
  .getElementById("login-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erro no login: " + error.message);
      return;
    }

    // Redireciona para página inicial após login
    window.location.href = "https://projeto-luckpet.vercel.app/index.html";
  });
