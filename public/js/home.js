// home.js - Sistema GParking (Versão Oficial Corrigida)

// 1. CONFIGURAÇÃO DO CLIENTE (Utilizando suas credenciais)
const supabaseUrl = 'https://csaqfeivvtmtjlnwuxql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFmZWl2dnRtdGpsbnd1eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTE4MTMsImV4cCI6MjA5MzgyNzgxM30.kBm3IARUdM_9PxDOAejc3Svg0d21ya0jiF-dpje5eOE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. VERIFICAÇÃO DE AUTENTICAÇÃO E DADOS
async function checkAuth() {
    try {
        const { data: { session }, error: sessionError } = await _supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
            const userAuth = session.user;
            
            // Busca dados do usuário e o nome da faculdade vinculada
            const { data: userData, error: dbError } = await _supabase
                .from('usuarios') 
                .select('*, faculdade(nome)')
                .eq('id', userAuth.id)
                .maybeSingle(); 

            if (dbError) {
                console.error("Erro ao buscar dados do perfil:", dbError.message);
                return;
            }

            if (userData) {
                // Sincroniza o LocalStorage com os dados mais recentes do banco
                localStorage.setItem("nomeUsuario", userData.nome);
                localStorage.setItem("emailUsuario", userAuth.email);
                localStorage.setItem("telefoneUsuario", userData.telefone || "");
                localStorage.setItem("tipoUsuario", userData.tipo_usuario);
                localStorage.setItem("nomeFaculdade", userData.faculdade?.nome || "Não vinculada");

                showUserProfile(userData);
            }
        } else {
            showLoginButtons();
        }
    } catch (err) {
        console.error("Erro na verificação de login:", err.message);
        showLoginButtons();
    }
}

// 3. INTERFACE DO USUÁRIO
function showUserProfile(user) {
    // Esconde botões de Login/Cadastro
    document.querySelectorAll(".login-btn, .register-btn").forEach(btn => btn.style.display = "none");
    
    // Mostra o container do perfil
    const userProfile = document.getElementById("userProfile");
    if (userProfile) userProfile.style.display = "flex";
    
    // Atualiza nomes na tela
    document.querySelectorAll(".user-name").forEach((element) => {
        element.textContent = user.nome;
    });

    setupModalEvents();
}

function showLoginButtons() {
    document.querySelectorAll(".login-btn, .register-btn").forEach(btn => btn.style.display = "block");
    const userProfile = document.getElementById("userProfile");
    if (userProfile) userProfile.style.display = "none";
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
        
        if (typeof Toastify !== "undefined") {
            Toastify({
                text: "Perfil atualizado!",
                duration: 3000,
                style: { background: "green" }
            }).showToast();
        }
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

    // Evento para fechar modal
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("profileModal").style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    // Botões de Logout
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
    
    // Botão Estacionar
    const estacionarBtn = document.getElementById("estacionarBtn");
    if (estacionarBtn) {
        estacionarBtn.onclick = () => window.location.href = "setores.html";
    }
});