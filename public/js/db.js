const { createClient } = require('@supabase/supabase-js');

// Essas informações você pega em: Settings > API no painel do Supabase
const supabaseUrl = 'https://csaqfeivvtmtjlnwuxql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFmZWl2dnRtdGpsbnd1eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTE4MTMsImV4cCI6MjA5MzgyNzgxM30.kBm3IARUdM_9PxDOAejc3Svg0d21ya0jiF-dpje5eOE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Exportamos o "supabase" para usar no server.js
module.exports = supabase;

// No objeto de dados que você envia para o banco:
const dadosUsuario = {
    id: user.id, // UUID do Auth
    nome: nome,
    telefone: telefone,
    tipo_usuario: tipo,
    faculdade_id: document.getElementById("faculdade").value // A nova linha mágica
};