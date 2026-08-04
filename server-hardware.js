require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Conexão com o seu Supabase (as variáveis que estão no seu .env)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

console.log("Servidor iniciado com sucesso! Aguardando próxima configuração de hardware.");

// --- HARDWARE DESATIVADO TEMPORARIAMENTE ---
// Desativado para rodar o código no PC sem o Arduino/ESP32 conectado na porta COM.
/*
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({ path: 'COM3', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

console.log("Buscando dados do Arduino na porta COM...");

parser.on('data', async (dadosRecebidos) => {
    console.log("Texto do Arduino:", dadosRecebidos);

    if (dadosRecebidos.includes("ENTROU") || dadosRecebidos.includes("SAIU")) {
        const totalVagas = parseInt(dadosRecebidos.replace(/[^0-9]/g, ''), 10);

        const { error } = await supabase
            .from('vagas_estacionamento')
            .update({ disponiveis: totalVagas })
            .eq('id', 1);

        if (error) console.error("Erro ao atualizar Supabase:", error);
        else console.log(`Supabase atualizado com sucesso! Vagas atuais: ${totalVagas}`);
    }
});
*/