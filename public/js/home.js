// home.js - Sistema GParking (Versão Final Supabase)

// 1. VERIFICAÇÃO DE AUTENTICAÇÃO
function checkAuth() {
    const nomeSalvo = localStorage.getItem("nomeUsuario");
    const faculdadeSalva = localStorage.getItem("userFaculdade");

    if (nomeSalvo) {
        const user = {
            nome: nomeSalvo,
            email: localStorage.getItem("emailUsuario"),
            telefone: localStorage.getItem("telefoneUsuario"),
            tipo: localStorage.getItem("tipoUsuario") || "Aluno" 
        };
        window.currentUser = user; 
        showUserProfile(user);

        // Carrega setores apenas se houver faculdade vinculada ao usuário
        if (faculdadeSalva) {
            carregarSetores(faculdadeSalva);
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
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
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
    
    // Carregar Foto de Perfil
    const photoKey = `userAvatar_${user.email}`;
    const fotoSalva = localStorage.getItem(photoKey);
    const avatares = document.querySelectorAll(".user-avatar, .user-avatar-small, #modalAvatar");
    
    if (fotoSalva) {
        avatares.forEach(img => img.src = fotoSalva);
    } else {
        avatares.forEach(img => img.src = "img/fotomidia.jpeg");
    }

    const estacionarBtn = document.getElementById("estacionarBtn");
    if (estacionarBtn) {
        estacionarBtn.onclick = () => window.location.href = "setores.html";
    }
    
    setupModalEvents();
}

function showLoginButtons() {
    document.querySelectorAll(".login-btn, .register-btn").forEach(btn => btn.style.display = "block");
    const userProfile = document.getElementById("userProfile");
    if (userProfile) userProfile.style.display = "none";
}

// 2. BUSCA DE DADOS (SUPABASE)
async function popularFaculdades() {
    // Ajustado para 'faculdade' no singular conforme seu banco
    const { data, error } = await _supabase.from('faculdade').select('id, nome');
    
    if (data) {
        const select = document.getElementById('faculdade');
        if (!select) return;

        select.innerHTML = '<option value="" disabled selected>Selecione sua faculdade</option>';
        data.forEach(f => {
            select.add(new Option(f.nome, f.id));
        });
    }
}

async function carregarSetores(fId) {
    const { data, error } = await _supabase
        .from('setores')
        .select('*')
        .eq('faculdade_id', fId); 
    
    if (data) {
        console.log("Setores filtrados para a faculdade:", data);
        // Aqui você insere a lógica para renderizar os setores na tela
    }
}

// 3. LOGICA DE PERFIL E SEGURANÇA
async function saveProfileChanges() {
    const inputNome = document.getElementById("editNome");
    const inputTelefone = document.getElementById("editTelefone");
    const email = localStorage.getItem("emailUsuario");

    if (!inputNome || !inputTelefone) return;

    const novoNome = inputNome.value;
    const novoTelefone = inputTelefone.value;

    // Atualiza no Supabase (na sua tabela de usuários/profiles)
    const { error } = await _supabase
        .from('profiles') // certifique-se que o nome da tabela é profiles ou users
        .update({ nome: novoNome, telefone: novoTelefone })
        .eq('email', email);

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

async function handlePasswordChange(novaSenha) {
    if (novaSenha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    const { data, error } = await _supabase.auth.updateUser({
        password: novaSenha
    });

    if (!error) {
        notificarSucesso("Senha alterada com sucesso!");
        document.getElementById("btnCancelarSenha").click();
    } else {
        alert("Erro ao alterar senha: " + error.message);
    }
}

// 4. EVENTOS E AUXILIARES
function setupModalEvents() {
    const passArea = document.getElementById("passwordChangeArea");
    const mainActions = document.getElementById("mainProfileActions");
    
    const btnAbrirTrocaSenha = document.getElementById("btnAbrirTrocaSenha");
    const btnSalvarSenha = document.getElementById("btnSalvarSenha");
    const btnCancelarSenha = document.getElementById("btnCancelarSenha");
    const btnEditarPerfil = document.querySelector(".edit-profile-btn");

    if (btnAbrirTrocaSenha) {
        btnAbrirTrocaSenha.onclick = (e) => {
            e.preventDefault();
            passArea.style.display = "block";
            mainActions.style.display = "none";
        };
    }

    if (btnCancelarSenha) {
        btnCancelarSenha.onclick = (e) => {
            e.preventDefault();
            passArea.style.display = "none";
            mainActions.style.display = "flex";
            document.getElementById("newPasswordInput").value = "";
        };
    }

    if (btnSalvarSenha) {
        btnSalvarSenha.onclick = (e) => {
            e.preventDefault();
            const novaSenha = document.getElementById("newPasswordInput").value;
            handlePasswordChange(novaSenha);
        };
    }

    if (btnEditarPerfil) {
        btnEditarPerfil.onclick = () => {
            const nomeEl = document.getElementById("modalUserName");
            const telefoneEl = document.getElementById("modalUserPhone");

            if (btnEditarPerfil.textContent === "Editar Perfil") {
                nomeEl.innerHTML = `<input type="text" id="editNome" value="${nomeEl.textContent}" style="width:100%; color: black;">`;
                telefoneEl.innerHTML = `<input type="text" id="editTelefone" value="${telefoneEl.textContent}" style="width:100%; color: black;">`;
                btnEditarPerfil.textContent = "Salvar Alterações";
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
    
    // Preenche dados do modal
    document.getElementById("modalUserName").textContent = localStorage.getItem("nomeUsuario");
    document.getElementById("modalUserEmail").textContent = localStorage.getItem("emailUsuario");
    document.getElementById("modalUserPhone").textContent = localStorage.getItem("telefoneUsuario") || "Não informado";
    document.getElementById("modalUserType").textContent = localStorage.getItem("tipoUsuario");

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// 5. INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    popularFaculdades();
    
    // Logout
    const logoutAction = (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "index.html"; // Ajustado para raiz
    };

    document.querySelectorAll("#logoutBtn, #logoutMobile").forEach(btn => {
        if (btn) btn.onclick = logoutAction;
    });

    // Modal
    document.querySelectorAll("#openProfileDropdown, #openProfileMobile").forEach(btn => {
        if (btn) btn.onclick = (e) => { e.preventDefault(); openModal(); };
    });

    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) closeBtn.onclick = () => {
        document.getElementById("profileModal").style.display = "none";
        document.body.style.overflow = "auto";
    };
});