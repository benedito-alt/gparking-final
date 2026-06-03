// 1. CONFIGURAÇÃO DO CLIENTE
const supabaseUrl = 'https://csaqfeivvtmtjlnwuxql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFmZWl2dnRtdGpsbnd1eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTE4MTMsImV4cCI6MjA5MzgyNzgxM30.kBm3IARUdM_9PxDOAejc3Svg0d21ya0jiF-dpje5eOE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. VERIFICAÇÃO DE AUTENTICAÇÃO E DADOS
async function checkAuth() {
    try {
        const { data: { session }, error: sessionError } = await _supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // SE NÃO TIVER SESSÃO, EXPULSA O USUÁRIO PARA O LOGIN
        if (!session) {
            console.log("Acesso negado. Redirecionando para login...");
            window.location.href = "../index.html"; 
            return;
        }

        const userAuth = session.user;
        
        // Busca dados atualizados do banco
        const { data: userData, error: dbError } = await _supabase
            .from('usuarios') 
            .select('*, faculdade(nome)')
            .eq('id', userAuth.id)
            .maybeSingle(); 

        if (dbError) {
            console.error("Erro ao buscar dados do perfil:", dbError.message);
        }

        if (userData) {
            // Sincroniza o LocalStorage
            localStorage.setItem("nomeUsuario", userData.nome);
            localStorage.setItem("emailUsuario", userAuth.email);
            localStorage.setItem("telefoneUsuario", userData.telefone || "");
            localStorage.setItem("tipoUsuario", userData.tipo_usuario);
            localStorage.setItem("nomeFaculdade", userData.faculdade?.nome || "Não vinculada");

            showUserProfile(userData);
        }
        
    } catch (err) {
        console.error("Erro crítico:", err.message);
        window.location.href = "../index.html";
    }
}

// 3. INTERFACE DO USUÁRIO
function showUserProfile(user) {
    document.querySelectorAll(".login-btn, .register-btn").forEach(btn => btn.style.display = "none");
    
    const userProfile = document.getElementById("userProfile");
    if (userProfile) userProfile.style.display = "flex";
    
    document.querySelectorAll(".user-name").forEach((element) => {
        element.textContent = user.nome;
    });

    setupModalEvents();
}

// 4. GESTÃO DO PERFIL (EDIÇÃO)
async function saveProfileChanges() {
    const novoNome = document.getElementById("editNome").value;
    const novoTelefone = document.getElementById("editTelefone").value;
    
    const { data: { user } } = await _supabase.auth.getUser();

    const { error } = await _supabase
        .from('usuarios')
        .update({ nome: novoNome, telefone: novoTelefone })
        .eq('id', user.id);

    if (!error) {
        localStorage.setItem("nomeUsuario", novoNome);
        localStorage.setItem("telefoneUsuario", novoTelefone);
        
        document.getElementById("modalUserName").textContent = novoNome;
        document.getElementById("modalUserPhone").textContent = novoTelefone;
        document.querySelectorAll(".user-name").forEach(el => el.textContent = novoNome);
        
        const btnEditar = document.querySelector(".edit-profile-btn");
        btnEditar.textContent = "Editar Perfil";
        btnEditar.style.backgroundColor = ""; 
        
        alert("Perfil atualizado com sucesso!");
    }
}

function setupModalEvents() {
    const btnEditarPerfil = document.querySelector(".edit-profile-btn");
    if (btnEditarPerfil) {
        btnEditarPerfil.onclick = () => {
            const nomeEl = document.getElementById("modalUserName");
            const telefoneEl = document.getElementById("modalUserPhone");

            if (btnEditarPerfil.textContent === "Editar Perfil") {
                nomeEl.innerHTML = `<input type="text" id="editNome" value="${nomeEl.textContent}" style="width:100%; color:black; padding:5px;">`;
                telefoneEl.innerHTML = `<input type="text" id="editTelefone" value="${telefoneEl.textContent}" style="width:100%; color:black; padding:5px;">`;
                btnEditarPerfil.textContent = "Confirmar";
                btnEditarPerfil.style.backgroundColor = "#27ae60";
            } else {
                saveProfileChanges();
            }
        };
    }
}

function openModal() {
    const modal = document.getElementById("profileModal");
    if (!modal) return;
    
    document.getElementById("modalUserName").textContent = localStorage.getItem("nomeUsuario") || "Usuário";
    document.getElementById("modalUserEmail").textContent = localStorage.getItem("emailUsuario") || "";
    document.getElementById("modalUserPhone").textContent = localStorage.getItem("telefoneUsuario") || "Não informado";
    document.getElementById("modalUserType").textContent = localStorage.getItem("tipoUsuario") || "";
    document.getElementById("modalUserFaculdade").textContent = localStorage.getItem("nomeFaculdade") || "Não vinculada";

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// 5. INICIALIZAÇÃO E EVENTOS GLOBAIS
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();

    // Fechar modal
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("profileModal").style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    // Botões de Logout bono 
    document.querySelectorAll("#logoutBtn, #logoutMobile").forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            await _supabase.auth.signOut();
            localStorage.clear();
            window.location.href = "../index.html";
        };
    });

    // Abrir Perfil
    document.querySelectorAll("#openProfileDropdown, #openProfileMobile").forEach(btn => {
        btn.onclick = (e) => { e.preventDefault(); openModal(); };
    });
    
    const estacionarBtn = document.getElementById("estacionarBtn");
    if (estacionarBtn) {
        estacionarBtn.onclick = () => window.location.href = "setores.html";
    }
});
// ==========================================================
// CONTROLE DE NAVEGAÇÃO E SESSÃO MOBILE (GPARKING)
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
    const menuToggle = document.querySelector(".menu-toggle") || document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    if (menuToggle && navMenu) {
        // 1. Abre e fecha o menu vertical ao clicar nas 3 barrinhas
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("show");
        });

        // Fecha o menu se o usuário clicar fora dele
        document.addEventListener("click", (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove("show");
            }
        });

        // 2. CONTROLE ESTADO DE AUTENTICAÇÃO (Mudar botões se logado)
        if (typeof supabase !== 'undefined') {
            const { data: { session } } = await supabase.auth.getSession();

            // CAPTURA FORÇADA: Busca as tags <li> diretamente que contêm os IDs internos
            const liEntrar = document.querySelector('#navMenu li:has(#entrar)') || document.getElementById("entrar")?.closest('li');
            const liCriarConta = document.querySelector('#navMenu li:has(#criarConta)') || document.getElementById("criarConta")?.closest('li');
            const itensUsuarioLogado = document.querySelectorAll(".user-menu-item");

            if (session) {
                // SE ESTIVER LOGADO:
                // Força o desaparecimento completo de "Entrar" e "Criar conta"
                if (liEntrar) liEntrar.setAttribute("style", "display: none !important;");
                if (liCriarConta) liCriarConta.setAttribute("style", "display: none !important;");

                // Mostra os botões escondidos de perfil e sair
                itensUsuarioLogado.forEach(item => {
                    item.setAttribute("style", "display: block !important;");
                });

                // Injeta o nome do usuário no campo correspondente
                const userNameSpan = navMenu.querySelector(".user-name");
                if (userNameSpan && session.user.user_metadata?.name) {
                    userNameSpan.textContent = session.user.user_metadata.name;
                }

                // Configura a ação do clique no botão Sair Mobile original
                const logoutMobileBtn = document.getElementById("logoutMobile");
                if (logoutMobileBtn) {
                    logoutMobileBtn.addEventListener("click", async (e) => {
                        e.preventDefault();
                        await supabase.auth.signOut();
                        window.location.href = "home.html"; // Recarrega a página deslogado
                    });
                }
            } else {
                // SE NÃO ESTIVER LOGADO:
                if (liEntrar) liEntrar.setAttribute("style", "display: block !important;");
                if (liCriarConta) liCriarConta.setAttribute("style", "display: block !important;");
                
                itensUsuarioLogado.forEach(item => {
                    item.setAttribute("style", "display: none !important;");
                });
            }
        }
    }
});