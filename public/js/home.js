// home.js - Sistema GParking (Versão Final Supabase)

// Configuração do Supabase (Garanta que estas variáveis existam no escopo global ou importe-as)
const supabaseUrl = 'https://csaqfeivvtmtjlnwuxql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFmZWl2dnRtdGpsbnd1eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTE4MTMsImV4cCI6MjA5MzgyNzgxM30.kBm3IARUdM_9PxDOAejc3Svg0d21ya0jiF-dpje5eOE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 1. VERIFICAÇÃO DE AUTENTICAÇÃO REAL
async function checkAuth() {
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        const userAuth = session.user;
        
        // Busca dados extras na tabela 'usuarios'
        const { data: userData, error } = await _supabase
            .from('usuarios')
            .select('*, faculdade(nome)')
            .eq('id', userAuth.id)
            .single();

        if (userData) {
            // Atualiza LocalStorage para garantir consistência
            localStorage.setItem("nomeUsuario", userData.nome);
            localStorage.setItem("emailUsuario", userAuth.email);
            localStorage.setItem("telefoneUsuario", userData.telefone || "");
            localStorage.setItem("tipoUsuario", userData.tipo_usuario);
            localStorage.setItem("userFaculdade", userData.faculdade_id);
            localStorage.setItem("nomeFaculdade", userData.faculdade?.nome || "Não vinculada");

            window.currentUser = userData;
            showUserProfile(userData);
        }
    } else {
        showLoginButtons();
    }
}

function notificarSucesso(mensagem) {
    Toastify({
        text: mensagem,
        duration: 3500,
        close: true,
        gravity: "top", 
        position: "right",
        style: {
            background: "linear-gradient(to right, #4a148c, #6a1b9a)",
            borderRadius: "10px"
        }
    }).showToast();
}

function showUserProfile(user) {
    document.querySelectorAll(".login-btn, .register-btn").forEach(btn => btn.style.display = "none");
    
    const userProfile = document.getElementById("userProfile");
    if (userProfile) userProfile.style.display = "flex";
    
    document.querySelectorAll(".user-name").forEach((element) => {
        element.textContent = user.nome;
    });
    
    // Carregar Foto
    const photoKey = `userAvatar_${localStorage.getItem("emailUsuario")}`;
    const fotoSalva = localStorage.getItem(photoKey);
    const avatares = document.querySelectorAll(".user-avatar, .user-avatar-small, #modalAvatar");
    
    if (fotoSalva) {
        avatares.forEach(img => img.src = fotoSalva);
    }

    setupModalEvents();
}

function showLoginButtons() {
    document.querySelectorAll(".login-btn, .register-btn").forEach(btn => btn.style.display = "block");
    const userProfile = document.getElementById("userProfile");
    if (userProfile) userProfile.style.display = "none";
}

// 2. LOGICA DE PERFIL (SALVAR NO BANCO)
async function saveProfileChanges() {
    const novoNome = document.getElementById("editNome").value;
    const novoTelefone = document.getElementById("editTelefone").value;
    const { data: { user } } = await _supabase.auth.getUser();

    const { error } = await _supabase
        .from('usuarios') // Corrigido de 'profiles' para 'usuarios'
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
        
        notificarSucesso("Perfil atualizado com sucesso!");
    } else {
        alert("Erro ao atualizar perfil: " + error.message);
    }
}

// 3. EVENTOS DO MODAL
function setupModalEvents() {
    const btnEditarPerfil = document.querySelector(".edit-profile-btn");

    if (btnEditarPerfil) {
        btnEditarPerfil.onclick = () => {
            const nomeEl = document.getElementById("modalUserName");
            const telefoneEl = document.getElementById("modalUserPhone");

            if (btnEditarPerfil.textContent === "Editar Perfil") {
                nomeEl.innerHTML = `<input type="text" id="editNome" value="${nomeEl.textContent}" style="width:100%; color: black; padding:5px; border-radius:5px;">`;
                telefoneEl.innerHTML = `<input type="text" id="editTelefone" value="${telefoneEl.textContent}" style="width:100%; color: black; padding:5px; border-radius:5px;">`;
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
    
    document.getElementById("modalUserName").textContent = localStorage.getItem("nomeUsuario");
    document.getElementById("modalUserEmail").textContent = localStorage.getItem("emailUsuario");
    document.getElementById("modalUserPhone").textContent = localStorage.getItem("telefoneUsuario") || "Não informado";
    document.getElementById("modalUserType").textContent = localStorage.getItem("tipoUsuario");
    document.getElementById("modalUserFaculdade").textContent = localStorage.getItem("nomeFaculdade") || "Carregando...";

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// 4. INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    // Dentro da checkAuth(), onde você recebe o userData do Supabase:
if (userData) {
    localStorage.setItem("nomeFaculdade", userData.faculdade?.nome || "Não vinculada");
    // ... restante do código
}
    // Botão Estacionar
    const estacionarBtn = document.getElementById("estacionarBtn");
    if (estacionarBtn) {
        estacionarBtn.onclick = () => window.location.href = "setores.html";
    }

    // Logout
    document.querySelectorAll("#logoutBtn, #logoutMobile").forEach(btn => {
        if (btn) btn.onclick = async (e) => {
            e.preventDefault();
            await _supabase.auth.signOut();
            localStorage.clear();
            window.location.href = "index.html";
        };
    });

    // Abrir Perfil
    document.querySelectorAll("#openProfileDropdown, #openProfileMobile").forEach(btn => {
        if (btn) btn.onclick = (e) => { e.preventDefault(); openModal(); };
    });

    // Fechar Modal
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) closeBtn.onclick = () => {
        document.getElementById("profileModal").style.display = "none";
        document.body.style.overflow = "auto";
    };
});