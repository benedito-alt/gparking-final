// FORMATO PARA O NAVEGADOR (FRONTEND)
const supabaseUrl = 'https://csaqfeivvtmtjlnwuxql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFmZWl2dnRtdGpsbnd1eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTE4MTMsImV4cCI6MjA5MzgyNzgxM30.kBm3IARUdM_9PxDOAejc3Svg0d21ya0jiF-dpje5eOE';

// Usamos a variável global que o script do Supabase cria no HTML
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Não usamos module.exports no navegador! 
// A variável _supabase já ficará disponível para os outros arquivos .js