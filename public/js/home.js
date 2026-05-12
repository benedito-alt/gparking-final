// 1. CONFIGURAÇÃO DO CLIENTE
const supabaseUrl = 'https://csaqfeivvtmtjlnwuxql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFmZWl2dnRtdGpsbnd1eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTE4MTMsImV4cCI6MjA5MzgyNzgxM30.kBm3IARUdM_9PxDOAejc3Svg0d21ya0jiF-dpje5eOE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. VERIFICAÇÃO DE AUTENTICAÇÃO E DADOS
async function checkAuth() {
    try {
        const { data: { session }, error: sessionError } = await _supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // SE NÃO TIVER SESSÃO NO SUPABASE, VERIFICA O LOCALSTORAGE ANTES DE SAIR
        if (!session) {
            const emailSalvo = localStorage.getItem("emailUsuario");
            if (!emailSalvo) {
                console.log("Acesso negado. Redirecionando para login...");
                window.location.href = "index.html"; 
                return;
            }
            // Se tiver e-mail no storage, simulamos o perfil para não travar a página
            updateUI(true);
            return;
        }

        const userAuth = session.user;
        
        const { data: userData, error: dbError } = await _supabase
            .from('usuarios') 
            .select('*, faculdade(nome)')
            .eq('id', userAuth.id)
            .maybeSingle(); 

        if (userData) {
            localStorage.setItem("nomeUsuario", userData.nome);
            localStorage.setItem("emailUsuario", userAuth.email);
            localStorage.setItem("telefoneUsuario", userData.telefone || "");
            localStorage.setItem("tipoUsuario", userData.tipo_usuario);
            localStorage.setItem("nomeFaculdade", userData.faculdade?.nome || "Não vinculada");

            updateUI(true, userData);
        }
        
    } catch (err) {
        console.error("Erro crítico:", err.message);
    }
}

// 3. INTERFACE DO USUÁRIO (MOBILE E DESKTOP)
function updateUI(isLoggedIn, user = null) {
    const authButtons = document.getElementById("headerButtons");
    const userProfile = document.getElementById("userProfile");
    const mobileAuthItems = document.querySelectorAll(".mobile-only:not(.user-menu-item)");
    const mobileUserItems = document.querySelectorAll(".user-menu-item");

    if (isLoggedIn) {
        // Desktop
        if (authButtons) authButtons.querySelectorAll(".login-btn, .register-btn").forEach(btn => btn.style.display = "none");
        if (userProfile) userProfile.style.display = "flex";

        // Mobile (Menu Hambúrguer)
        mobileAuthItems.forEach(item => item.style.display = "none");
        mobileUserItems.forEach(item => item.style.display = "block");

        // Nome do Usuário
        const nome = user ? user.nome : localStorage.getItem("nomeUsuario");
        document.querySelectorAll(".user-name").forEach(el => el.textContent = nome);
    } else {
        if (userProfile) userProfile.style.display = "none";
        mobileUserItems.forEach(item => item.style.display = "none");
    }
    
    setupModalEvents();
}

// 4. GESTÃO DO PERFIL
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
        alert("Perfil atualizado!");
        location.reload();
    }
}

function setupModalEvents() {
    const btnEditarPerfil = document.querySelector(".edit-profile-btn");
    if (btnEditarPerfil) {
        btnEditarPerfil.onclick = () => {
            const nomeEl = document.getElementById("modalUserName");
            const telefoneEl = document.getElementById("modalUserPhone");

            if (btnEditarPerfil.textContent === "Editar Perfil") {
                nomeEl.innerHTML = `<input type="text" id="editNome" value="${nomeEl.textContent}" style="width:100%; color:black;">`;
                telefoneEl.innerHTML = `<input type="text" id="editTelefone" value="${telefoneEl.textContent}" style="width:100%; color:black;">`;
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
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// 5. INICIALIZAÇÃO E EVENTOS GLOBAIS
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();

    // Menu Toggle (MOBILE)
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    if (menuToggle && navMenu) {
        menuToggle.onclick = () => navMenu.classList.toggle('show');
    }

    // Fechar modal
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("profileModal").style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    // Logout
    document.querySelectorAll("#logoutBtn, #logoutMobile").forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            await _supabase.auth.signOut();
            localStorage.clear();
            window.location.href = "index.html";
        };
    });

    // Abrir Perfil
    document.querySelectorAll("#openProfileDropdown, #openProfileMobile").forEach(btn => {
        btn.onclick = (e) => { e.preventDefault(); openModal(); };
    });
});