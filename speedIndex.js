/*
ESSE E UM SCRIPT DE CÓDIGO ABERTO DA API SPEEDCLOUD E SOMENTE OS ADM DA HOSPEDAGEM VAI PODER MUDAR ALGO NELA 😎
*/

bla = process.cwd()
//★・・・・・・★・・・ MÓDULOS ・・・★・・・・・・★
const fs = require('fs-extra');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');
const request = require('request');
const axios = require('axios');
const fetch = require('node-fetch');
const cron = require('node-cron');

// Configuração do servidor
const app = express();
const PORT = 5000;


const { criador, linkHost, mongoDb, DARK_APIKEY, DARK_USERNAME, tokenTelegram, botName, donoName, prefix, donoId} = require("./dono/config.json")
const BaseApiDark = "http://speedhosting.cloud:2025";
const { botVersion, msg, msgApi, consoleVerde, consoleVerde2, consoleVermelho, consoleVermelho2, consoleAmarelo, consoleAmarelo2, consoleAzul, consoleAzul2, consoleErro, consoleAviso, consoleInfo, consoleOnline, consoleSucesso, fetchJson, getBuffer, timed, data, hora, cpuUsage, totalThreads, totalMemory, freeMemory, nodeVersion, platform, hostname, HostOuNao, formatTime, uptime, velocidadeBot, latensi, timestamp, os, speed, banner, banner2, banner3 } = require("./dono/dados.js")
//SCRAPER DO BANCO DE DADOS
const { registrarUsuario, infoUser, modificarUsuario, registrarMemoria, limparHistorico, carregarDadosUsuarios } = require("./BANCO DE DADOS/usuario/usuario.js");
const { getPinterestMedia } = require("./BANCO DE DADOS/pinPedrozz.js")
const { sambaPornoSearch, playStoreSearch,memesDroid,amazonSearch,mercadoLivreSearch2,gruposZap,lulaFlix,pinterestVideoV2,pinterestVideo,animeFireDownload,animesFireSearch,animesFireEps,hentaihome,hentaitube,lojadomecanico,ultimasNoticias,randomGrupos,topFlix,uptodownsrc,uptodowndl,xvideosDownloader,xvideosSearch,fraseAmor,iFunny,frasesPensador,pensadorSearch,pinterest,wallpaper,wallpaper2,porno,hentai,styletext,twitter} = require ("./BANCO DE DADOS/scraper.js")
const {ytMp3, ytMp4} = require("./BANCO DE DADOS/youtubePh.js")
const { ytdown } = require("nayan-videos-downloader")
const { ytDonlodMp3, ytDonlodMp4, ytPlayMp3, ytPlayMp4, ytSearch } = require("./BANCO DE DADOS/youtube");
const { voiceAI, audiomeme, Hentaizinho, Hentaizinho2, plaquinha, canvaBemVindo, canvaLevel, canvaLevel2, canvaMusic, canvaBolsonaro, canavaComunismo } = require("./BANCO DE DADOS/pedrozz.js");
const { youtubeadl2, youtubeVideoDl, youtubeSearch, youtubeYtdlv2, youtubeChannel, youtubeTranscript } = require('./BANCO DE DADOS/play')
const { buscarAnimes, buscarDetalhesAnime, downloadAnime, dtsAnimeDrive, bscAnimeDrive } = require('./BANCO DE DADOS/animes.js');
const { GeminiImage, GeminiAI } = require('./BANCO DE DADOS/modulos/gemini.js');
const gemIAr = async (q) => {
  try {
    const response = await GeminiAI(q, { model: "gemini-1.5-flash" });
    return response;
  } catch (error) {
    console.error("Erro ao interagir com a IA:", error);
    return "Desculpe, houve um erro ao processar sua mensagem.";
  }
};


const bloqueados = new Map();
app.use((req, res, next) => {
  if (bloqueados.has(req.ip)) {
    return res.status(403).json({ message: 'Seu IP foi bloqueado temporariamente por excesso de requisições. Tente novamente mais tarde.' });
  }
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: 'Muito tráfego, por favor tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    if (!bloqueados.has(req.ip)) {
      console.warn(`[ALERTA] O IP ${req.ip} ultrapassou o limite de requisições e foi bloqueado por 15 minutos!`);
      bloqueados.set(req.ip, Date.now() + 15 * 60 * 1000); 
      setTimeout(() => bloqueados.delete(req.ip), 15 * 60 * 1000);
    }
    res.status(429).json({ message: 'Seu IP foi bloqueado temporariamente por excesso de requisições. Tente novamente mais tarde.' });
  }
});

//app.use(limiter);

//CONSTS DE DONO ETC.....
const admPermitido = ["pedrozzMods", "SpeedCloud", "Yuki"]
const ApiKeyCriador = ["pedrozz1", "SpeedCloud"]

const esperar = async (tempo) => {
return new Promise(funcao => setTimeout(funcao, tempo));
}
//★・・・・・・★・・・ MONGODB ・・・★・・・・・・★
mongoose
  .connect(mongoDb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => consoleOnline('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

//★・・・・・・★・・・ MIDDLEWARES ・・・★・・・・・・★
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// ★・・・・・★・・・ MODELO USUÁRIO ・・・★・・・・・★
const userSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  foto: { type: String, default: 'https://files.catbox.moe/6pc33c.jpg' },
  wallpaper: { type: String, default: 'https://i.pinimg.com/originals/6f/bc/f9/6fbcf93549ebfb8660953e347e3691f4.gif' },
  banner: { type: String, default: 'https://files.catbox.moe/njyi2j.jpg' },
  musica: { type: String, default: 'https://LINK' },
  request: { type: String, default: 100 },
  level: { type: String, default: 0 },
  apikey: { type: String, default: () => Math.random().toString(36).substring(2, 12) },
  basico: { type: Boolean, default: false },
  premium: { type: Boolean, default: false },
  gold: { type: Boolean, default: false },
  adm: { type: Boolean, default: false },
  tempoPlano: { type: String, default: 0 },
});

const User = mongoose.model('User', userSchema);


async function deletarUsuario(nome) {
  try {
    const resultado = await User.deleteOne({ nome: nome });
    
    if (resultado.deletedCount > 0) {
      return `Usuário '${nome}' foi deletado com sucesso!`;
    } else {
      return `Usuário '${nome}' não encontrado.`;
    }
  } catch (erro) {
    console.error('Erro ao deletar usuário:', erro);
  }
}

// Reset diário às 00:00
async function resetRequest() {
const agora = new Date();
const horas = agora.getHours();
const minutos = agora.getMinutes();
const segundos = agora.getSeconds();

if (horas === 0 && minutos === 0 && segundos === 0) { 
try {
limparHistorico()
await User.updateMany({ adm: true }, { request: 100000 });
await User.updateMany({ basico: true }, { request: 10000 });
await User.updateMany({ premium: true }, { request: 30000 });
await User.updateMany({ gold: true }, { request: 100000 });
await User.updateMany({ adm: false, premium: false }, { request: 100 });
bot.telegram.sendPhoto(
"-1002490100811",
"https://files.catbox.moe/6pc33c.jpg",
{
caption: `As request dos usuários foram reiniciadas com sucesso`,
parse_mode: "Markdown",
reply_markup: {inline_keyboard: [[
{ text: "API", url: `https://speedhosting.cloud:${PORT}` },
{ text: "Hospedagem", url: `https://speedhosting.cloud` }
]]}});
} catch (err) {
console.error('Erro ao resetar requests:', err);
}
}
}
setInterval(resetRequest, 1000);

// Função para salvar logs dos endpoints usados
const logFilePath = path.join(__dirname, 'dono/logs.json');
function salvarLog(endpoint) {
  let logs = {};
  if (fs.existsSync(logFilePath)) {
    logs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  }
  logs[endpoint] = (logs[endpoint] || 0) + 1;
  fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), 'utf8');
}

async function usarApiKey(apikey, endpoint) {
  const user = await User.findOne({ apikey });

  if (!user) return 'Usuário não encontrado';
  if (user.request <= 0) return 'Você não tem mais requests disponíveis';

  user.request -= 1;
  user.level = (parseFloat(user.level) + 0.1).toFixed(1);
  await user.save();
  salvarLog(endpoint);

consoleVerde2("[ LOG USUÁRIO ]", `usuário: ${user.nome}, Endpoint Usado: ${endpoint}`);
  return null;
}

//★・・・・・・★・・ BOT DO TELEGRAM ・・・★・・・・・★

//====================[ MÓDULOS ]====================\\

const { Telegraf } = require('telegraf');

//====================CONFIGURAÇÕES=====================//

const bot = new Telegraf(tokenTelegram);
const PREFIX = prefix;

let username = '';
let comando = '';
let q = '';
let isDono = '';
bot.use((ctx, next) => {
    if (!username && ctx.from && ctx.from.username) {
        username = ctx.from.username;
    }
    return next();
});
bot.use((ctx, next) => {
    if (ctx.message && ctx.message.text) {
        isDono = ctx.from.id === donoId;
        comando = ctx.message.text.split(' ')[0];
        q = ctx.message.text.slice(comando.length).trim();

    }
    return next();
});
// Função para enviar mensagens
const enviar = (ctx, texto) => {
    ctx.reply(texto);
};

//E AQUI FICA A MÁGICA KKK
bot.use((ctx, next) => {
if (ctx.message && ctx.message.text) {
const messageText = ctx.message.text.trim();
if (messageText.startsWith(PREFIX)) {
const command = messageText.split(' ')[0].substring(PREFIX.length);
ctx.state.command = command;
ctx.state.args = messageText.split(' ').slice(1);
}
}
return next();
});

// Comandos do bot
bot.start((ctx) => {
enviar(ctx, 'Seja bem-vindo a essa base');
});

bot.on('text', async  (ctx) => {

const msg = ctx.message.text;
    const chatId = ctx.message.chat.id;
    
    // Verifica se é resposta para um usuário específico
    if (msg.startsWith("@")) {
        const [usuario, ...mensagemArray] = msg.split(" ");
        const nome = usuario.substring(1);
        const mensagem = mensagemArray.join(" ");

        let conversas = carregarConversas();
        if (!conversas[nome]) conversas[nome] = [];
        conversas[nome].push({ de: "suporte", mensagem });
        salvarConversas(conversas);

        ctx.reply(`📨 Resposta enviada para ${nome}`);
    }
    
    
const comando = ctx.state.command;
if (!comando) return;


switch (comando) {
case 'menu':
infoD = `┏━━━━━━━━━━━━━━━━━━┓
┃╭───────────────╮
┃│ ➥ Lista de comandos
┃┝───────────────╯
┃│ ➣  ͜⃟ꦿ${prefix}nome (nome do usuário/item)
┃│ ➣  ͜⃟ꦿ${prefix}senha  (nome do usuário/item)
┃│ ➣  ͜⃟ꦿ${prefix}apikey (nome do usuário/item)
┃│ ➣  ͜⃟ꦿ${prefix}request (nome do usuário/item)
┃│ ➣  ͜⃟ꦿ${prefix}level (nome do usuário/item)
┃│ ➣  ͜⃟ꦿ${prefix}premium (nome do usuário/item)
┃│ ➣  ͜⃟ꦿ${prefix}apagaruser (nome do usuário)
┃│ ➣  ͜⃟ꦿ${prefix}user (nome do usuário)
┃╰─────────────╯ 
┗━━━{𝑃𝐸𝐷𝑅𝑂𝑍𝑍 𝑀𝑂𝐷𝑆}━━━┛`,
await bot.telegram.sendPhoto(ctx.chat.id, `https://files.catbox.moe/olip14.jpg`, {
caption: infoD,
reply_markup: {
inline_keyboard: [
[{ text: `Hospedagem`, url: `https://speedhosting.cloud` }],
[{ text: `API`, url: `https://speedhosting.cloud:${PORT}` }]
]}})
break;

case 'apagaruser':
if (isDono) return enviar(ctx, msg.dono);
if (!q) return enviar(ctx, "Falta o nome do usuário")
try {
s = await deletarUsuario(q);
enviar(ctx, s)
} catch (e) {
consoleErro(e)
enviar(ctx, "Deu erro")
}
break

case 'nome':
case 'senha':
case 'apikey':
case 'request':
case 'premium': {
if (isDono) return enviar(ctx, msg.dono);
var [nome, item] = q.split("/");
if (!nome) return enviar(ctx, "falta o nome do usuário")
if (!item) return enviar(ctx, "falta o item que deseja alterar")
try {
const user = await User.findOne({ nome });
user[comando] = item;
await user.save();
enviar(ctx, `${comando} do ${nome} foi alterado com sucesso`)
} catch (e) {
consoleErro(e)
enviar(ctx, "Deu erro")
}
}//
break

case 'user': {
if (!q) return enviar(ctx, msg.query)
try {
const user = await User.findOne({ nome: q });
ctx.replyWithPhoto({ url: user.foto }, {
caption: `Nome: ${user.nome}
Senha: ${user.senha}
ApiKey: ${user.apikey}
Request: ${user.request}
Level: ${user.level}
Premium: ${user.premium ? "sim" : "não"}
Basico: ${user.basico ? "sim" : "não"}
Gold: ${user.gold ? "sim" : "não"}
${user.adm ? "Usuário administrador" : ""}`,
});
} catch (e) {
consoleErro(e)
enviar(ctx, msg.error)
}
}
break

case 'texto':
enviar(ctx, ctx.from.id);
break;

case 'figurinhas': {
async function sla9() {
var rnd = Math.floor(Math.random() * 8051)
ctx.replyWithSticker({ url: `https://raw.githubusercontent.com/badDevelopper/Testfigu/main/fig (${rnd}).webp` });
}
for (i = 0; i < 10; i++) {
await esperar(600)
sla9()
}
}
break;
  
default:
break;
}//
});

//================ ROTAS DA API =================//


app.get('/img18.gif', async (req, res) => {
    try {
        var BLAb = await fetchJson(`https://nekobot.xyz/api/image?type=pgif`);
        const response = await axios.get(BLAb.message, { responseType: 'arraybuffer' });

        res.setHeader('Content-Type', 'image/gif');
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Erro ao buscar o GIF');
    }
});
//---&. /tele?user=6954018108&msg=Teste
app.get('/tele', (req, res) => {
const { user, msg } = req.query;  
if (!user || !msg) {
return res.status(400).json({ erro: 'Os parâmetros user e msg são obrigatórios' });
}

bot.telegram.sendMessage(user, msg)
.then(() => {
res.json({ sucesso: 'Mensagem enviada com sucesso' });
})
.catch(err => {
console.error('Erro ao enviar mensagem:', err);
res.status(500).json({ erro: 'Falha ao enviar mensagem' });
});
});

//==============MENSAGEM COM O SUPORTE================//

const carregarConversas = () => {
    if (!fs.existsSync("./dono/conversas.json")) {
        fs.writeFileSync("./dono/conversas.json", JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync("./dono/conversas.json"));
};

const salvarConversas = (data) => {
    fs.writeFileSync("./dono/conversas.json", JSON.stringify(data, null, 2));
};

app.post("/enviar", (req, res) => {
    const { nome, mensagem } = req.body;
    if (!nome || !mensagem) {
        return res.status(400).json({ erro: "Nome e mensagem são obrigatórios!" });
    }

    let conversas = carregarConversas();
    if (!conversas[nome]) conversas[nome] = [];

    conversas[nome].push({ de: nome, mensagem });
    salvarConversas(conversas);

    bot.telegram.sendMessage("-1002490100811", `📩 Nova mensagem de ${nome}: ${mensagem}`);
    res.json({ sucesso: "Mensagem enviada com sucesso!" });
});


app.get("/suporte", (req, res) => {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório!" });
    let conversas = carregarConversas();
    res.json(conversas[nome] || []);
});
//★・・・・・・★・・ ROTAS PRINCIPAL ・・・★・・・・・★
app.get('/usar', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'usar');
if (erro) { return res.status(403).json({ erro }); }

  res.json({ mensagem: 'Request consumido com sucesso!' });
});

app.get('/estatisticas', (req, res) => {
  if (!fs.existsSync(logFilePath)) return res.json({ estatisticas: {} });

  const logs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  const ranking = Object.entries(logs)
    .sort((a, b) => b[1] - a[1])
    .map(([endpoint, usos]) => ({ endpoint, usos }));

  res.json({ estatisticas: ranking });
});

app.get('/rankA', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('nome level foto banner request')
      .lean(); 
    topUsers.forEach(user => {
      user.level = parseFloat(user.level) || 0;
    });
topUsers.sort((a, b) => b.level - a.level);

    res.json({ ranking: topUsers.slice(0, 6) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar o ranking' });
  }
});

app.get('/rankb', async (req, res) => {
  try {
    const topUsers = await User.find({})

    res.json({ ranking: topUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar o ranking' });
  }
});

app.get('/rank', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('nome level foto banner request')
      .lean();

topUsers.forEach(user => { user.level = parseFloat(user.level) || 0; });
topUsers.sort((a, b) => b.level - a.level);

    res.render('rank', { topUsers: topUsers.slice(0, 6) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar a página', details: err });
  }
});

app.get('/rankEnd', async (req, res) => {
  try {
  if (!fs.existsSync(logFilePath)) return res.json({ estatisticas: {} });

  const logs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  const ranking = Object.entries(logs)
    .sort((a, b) => b[1] - a[1])
    .map(([endpoint, usos]) => ({ endpoint, usos }));


  res.render('rankEnd', { rank: ranking });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar a página', details: err });
  }
});

app.post('/register', async (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ error: 'Nome e senha são obrigatórios!' });
  }

  try {
  let vip = false;
  let adm = false;
    let key = Math.random().toString(36).substring(2, 12);

    if (nome === "pedrozzMods") {
      vip = true;
      adm = true;
      key = 'pedrozz1';
    }

    const user = new User({
      nome,
      senha,
      premium: vip,
      adm: adm,
      apikey: key
    });
    await user.save();
bot.telegram.sendPhoto(
  "-1002490100811", 
  "https://files.catbox.moe/6pc33c.jpg", 
  {
    caption: `O usuário "${nome}" acabou de fazer um registro, mais informações abaixo:\n
Nome: ${nome}
Senha: ${senha}
Adm: ${adm}
ApiKey: ${key}`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "API", url: `https://speedhosting.cloud:${PORT}` },
          { text: "Hospedagem", url: `https://speedhosting.cloud` }
        ]
      ]
    }
  }
);
res.render("login", { aviso: true, aviso2: "Seu registro foi feito com sucesso" }); 
  } catch (err) {
    if (err.code === 11000) {
      return res.render("login", { aviso: true, aviso2: "Este nome de usuário já existe" }); 
    }
    res.status(500).json({ error: 'Erro ao registrar usuário', details: err });
  }
});
// Login
app.post('/login', async (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ error: 'Nome e senha são obrigatórios!' });
  }

  try {
const user = await User.findOne({ nome });
if (!user) return res.render("login", { aviso: true, aviso2: "Usuário não encontrado!" });
if (senha !== user.senha) {return res.render("login", { aviso: true, aviso2: "Senha incorreta!" });}

    res.cookie('nome', nome, { httpOnly: true });
    res.redirect('/docs');
  } catch (err) {
    res.status(500).json({ error: 'Erro ao realizar login', details: err });
  }
});

//PAINEL DA API
// Função para ler o arquivo visitas.json
function readVisits() {
    const data = fs.readFileSync('./dono/visitas.json', 'utf-8');
    return JSON.parse(data);
}

// Função para escrever no arquivo visitas.json
function writeVisits(visits) {
    const data = { visits: visits };
    fs.writeFileSync('./dono/visitas.json', JSON.stringify(data, null, 2));
}

app.get('/docs', async (req, res) => {
const { nome } = req.cookies;

if (!nome) return res.redirect('/login');
try {
const user = await User.findOne({ nome });
if (!user) return res.redirect('/login');
let visitasData = readVisits();
let visits = visitasData.visits;
visits++;
writeVisits(visits);
res.render('docs', {
aviso: false, 
aviso2: null,
nome: user.nome,
foto: user.foto,
musica: user.musica,
wallpaper: user.wallpaper,
apikey: user.apikey,
request: user.request,
level: user.level,
premium: user.premium,
adm: user.adm,
visitas: visits
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar a página', details: err });
  }
});

app.get('/suporte-chat', async (req, res) => {
const { nome } = req.cookies;
if (!nome) { res.render("suporte", { aviso: true, aviso2: "O login e nescessário para poder falar com o suporte.." }); 
await esperar(3000)
res.redirect('/login');
}
try {
const user = await User.findOne({ nome });
if (!user) { res.render("suporte", { aviso: true, aviso2: "Seu usuário não foi encontrado, voltando para fazer login." }); 
await esperar(3000)
res.redirect('/login');
}
res.render('suporte', {
aviso: false,
aviso2: null,
nome: user.nome,
foto: user.foto,
musica: user.musica,
wallpaper: user.wallpaper,
apikey: user.apikey,
request: user.request,
level: user.level,
premium: user.premium,
adm: user.adm,
});
} catch (err) {
res.status(500).json({ error: 'Erro ao carregar a página', details: err });
}
});

app.get('/maria', async (req, res) => {
const { nome } = req.cookies;
if (!nome) return res.redirect('/login');
try {
const user = await User.findOne({ nome });
if (!user) return res.redirect('/login');
res.render('maria_ai', {
nome: user.nome,
foto: user.foto,
musica: user.musica,
wallpaper: user.wallpaper,
apikey: user.apikey,
request: user.request,
level: user.level,
premium: user.premium,
adm: user.adm
});
} catch (err) {
res.status(500).json({ error: 'Erro ao carregar a página', details: err });
}
});

app.get('/perfil', async (req, res) => {
  const { nome } = req.cookies;

  if (!nome) return res.redirect('/login');

  try {
    const user = await User.findOne({ nome });
    if (!user) return res.redirect('/login');

    res.render('perfil', {
      nome: user.nome,
      foto: user.foto,
      musica: user.musica,
      wallpaper: user.wallpaper,
      banner: user.banner,
      apikey: user.apikey,
      request: user.request,
      premium: user.premium,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar a página', details: err });
  }
});

//MOSTRA OS USUÁRIO LOGADO NA API
app.get('/ver', async (req, res) => {
  const { nome } = req.cookies;

  if (!nome) return res.redirect('/login');

  try {
    const user = await User.findOne({ nome });
    if (!user) return res.redirect('/login');
if (admPermitido.includes(nome)) {
    res.render('users', {
      nome: user.nome,
      foto: user.foto,
      musica: user.musica,
      wallpaper: user.wallpaper,
      apikey: user.apikey,
      request: user.request,
      premium: user.premium,
    });
    } else {
    return res.redirect('/login');
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar a página', details: err });
  }
});

//PERFIL DO USUÁRIO(BETA)
app.get('/perfil4', async (req, res) => {
  const { nome } = req.cookies;

  try {
    const user = await User.findOne({ nome });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar perfil', details: err });
  }
});

//MOSTRA TODOS OS USUÁRIOS EM JSON
app.get('/users2', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários', details: err });
  }
});

// Rota para atualizar um usuário específico(beta)
app.post('/updateUser/:id', async (req, res) => {
  const userId = req.params.id;
  const { nome, senha, foto, wallpaper, musica, apikey, premium, request } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });


    if (nome) user.nome = nome;
    if (senha) user.senha = senha;
    if (foto) user.foto = foto;
    if (premium) user.premium = premium;

    if (user.premium) {
      if (wallpaper) user.wallpaper = wallpaper;
      if (musica) user.musica = musica;
      if (apikey) user.apikey = apikey;
    } else {

      if (wallpaper || musica || apikey) {
        return res.status(403).json({ error: 'Somente usuários premium podem alterar estas configurações!' });
      }
    }

    if (request) user.request = request;

    await user.save();

    res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: err });
  }
});
// Rota de Configuração do usuário 
app.post('/configuracao', async (req, res) => {
  const { nome } = req.cookies; 
  const { senha, foto, wallpaper, banner, musica, apikey, request } = req.body;

  if (!nome) {
    return res.status(401).json({ error: 'Você precisa estar logado para acessar esta página!' });
  }

  try {
    const user = await User.findOne({ nome });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado!' });
    }
//ta global
//let premium = true;
if (wallpaper) user.wallpaper = wallpaper;
if (senha) user.senha = senha;
if (foto) user.foto = foto;    
if (banner) user.banner = banner;

    if (user.premium) {
      if (musica) user.musica = musica;
      if (apikey) user.apikey = apikey;
      
    } else {

      if (musica || apikey) {
        return res.status(403).json({ error: 'Somente usuários premium podem alterar estas configurações!' });
      }
    }

await user.save();

    res.status(200).json({ message: 'Configurações atualizadas com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configurações', details: err });
  }
});

app.post('/configuracaoAdm', async (req, res) => {
    const { senha, foto, wallpaper, banner, musica, apikey, request, premium, adm, nome, level } = req.body;
    try {
    if (!nome) return res.status(500).json({ error: 'O nome do usuário é obrigatório', details: err.message });
        const user = await User.findOne({ nome });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        if (banner?.trim()) user.banner = banner;
        if (wallpaper?.trim()) user.wallpaper = wallpaper;
        if (musica?.trim()) user.musica = musica;
        if (foto?.trim()) user.foto = foto;
        if (apikey?.trim()) user.apikey = apikey;
        if (senha?.trim()) user.senha = senha;
        if (level?.trim()) user.level = level;
        if (request?.trim()) user.request = request;
        if (premium?.trim()) user.premium = premium;
        if (adm?.trim()) user.adm = adm;
        await user.save();
        res.status(200).json({ message: 'Configurações atualizadas com sucesso!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Erro ao atualizar configurações', details: err.message });
    }
});

app.get('/configuracaoAdmGet', async (req, res) => {
const { adm2 } = req.query;
if (!admPermitido.includes(adm2)) {return res.status(500).json({ resposta: 'ta parecendo que um usuário não adm tá tentando mudar algo em meu banco de dados kkk ISSO foi inútil' });}
const { senha, foto, wallpaper, banner, musica, apikey, request, premium, adm, nome, level } = req.query;
try {
if (!nome) return res.status(500).json({ resposta: 'O nome do usuário é obrigatório para fazer as alterações🤭' });
const user = await User.findOne({ nome });
if (!user) { return res.status(404).json({ resposta: 'Esse usuário não está no meu banco de dados não viu kk'}); }

if (banner?.trim()) user.banner = banner;
if (wallpaper?.trim()) user.wallpaper = wallpaper;
if (musica?.trim()) user.musica = musica;
if (foto?.trim()) user.foto = foto;
if (apikey?.trim()) user.apikey = apikey;
if (senha?.trim()) user.senha = senha;
if (level?.trim()) user.level = level;
if (request?.trim()) user.request = request;
if (premium?.trim()) user.premium = premium;
if (adm?.trim()) user.adm = adm;
await user.save();
res.status(200).json({ resposta: 'As configurações do usuário foi salva com sucesso no banco de dados 😊🧸' });
} catch (err) {
console.log(err);
res.status(500).json({ resposta: 'Deu erro ao salvar as informações desse usuário no meu banco de dados 😖' });
    }
});

app.get('/configAdm', async (req, res) => {
const { nome } = req.cookies;
const user = await User.findOne({ nome });
if (!nome) return res.redirect('/login');
if (!user.adm) return res.redirect('/docs');
  res.render('configAdm');
});

app.get('/verKey', async (req, res) => {
  try {
    const { apikey } = req.query;
if (!apikey) { return res.status(400).json({ erro: 'API Key é necessária' }); }
    const user = await User.findOne({ apikey });
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json({
      nome: user.nome,
      request: user.request,
      level: user.level,
      foto: user.foto,
      banner: user.banner,
      wallpaper: user.wallpaper,
      adm: user.adm,
      basico: user.basico,
      premium: user.premium,
      gold: user.gold,
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

//ROTAS DA API DE ADM
// Configurações do servidor
const API_URL = "https://speedhosting.cloud/api/application/users";
const API_TOKEN = "ptla_Sc8tEi3ch4pVp2vmTiarIBkkQ28XubYLtmdNh3WLTs6";

// Endpoint para listar usuários
app.get("/users", async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error.message);
    res.status(500).json({ error: "Não foi possível buscar os usuários." });
  }
});

app.get("/users/:username", async (req, res) => {
  const { username } = req.params; 
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const responseData = response.data.data; 
    
const user = responseData.find(user => user.attributes.username === username);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user); 
  } catch (error) {
    console.error("Erro ao buscar usuário:", error.message);
    res.status(500).json({ error: "Não foi possível buscar o usuário." });
  }
});

app.get("/speedcloud/:nome", async (req, res) => {
  const nome = req.params.nome;
  
  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ error: "Nome inválido ou ausente." });
  }

  const API_URL2 = `https://speedhosting.cloud/api/application/${nome}`;
const API_TOKEN2 = "ptla_Sc8tEi3ch4pVp2vmTiarIBkkQ28XubYLtmdNh3WLTs6";
  try {
    const response = await axios.get(API_URL2, {
      headers: {
        Authorization: `Bearer ${API_TOKEN2}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 5000,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar dados:", error.response?.data || error.message);
    res.status(500).json({ error: "Não foi possível buscar os dados." });
  }
});

//ROTAS DE API FICAM ABAIXO 
app.get('/api/chat', async (req, res) => {
try {
  const usuario = req.query.user;
  const userMessage = req.query.message
if (userMessage.includes("/api")) {
lulu = `
<span style:"color: yellow;">⚡ SpeedCloud API:</span>
http://speedhosting.cloud:5000
<br>
<span style:"color: red;">🌹 Dark Stars API:</span>
http://speedhosting.cloud:2025
<br>
<span style:"color: yellow;">⚡ SpeedCloud:</span>
http://speedhosting.cloud
`
res.json({ reply: lulu });
} else if (userMessage.includes("/clara")) {
clara = userMessage.replace("/clara", "");
lulu = await gemIAr(`Seu nome é "Valac Clara" uma personagem do anime "mairimashita iruma-kun". responda a essa pergunta:
${clara}`);
res.json({ reply: lulu });
} else {
  let uusuario = infoUser(usuario);

  if (!uusuario) {
    registrarUsuario(usuario, usuario, 'pt-br');
    uusuario = infoUser(usuario);
  }
    const prompt = `
Você é "Maria AI", uma assistente virtual da empresa "SpeedCloud", especializada em hospedagem de sites, bots e linguagens de programação.  
Seu objetivo é ajudar o usuário ${usuario} de forma simpática, direta e eficiente.  
Sempre mantenha um tom gentil, positivo e prestativo.  
Forneça somente as informações necessárias para atender ao que o usuário deseja no momento.

Links importantes:
API: https://speedcloud-api.onrender.com
API DARK STARS: https://darkstars-api.onrender.com
SpeedCloud Hosting: https://speedhosting.cloud

Memórias anteriores deste usuário:
${JSON.stringify(uusuario.memoria, null, 2)}

Mensagem do usuário:
"${userMessage}"

Responda de forma clara e objetiva, com um toque amigável.
    `;

   lulu = await gemIAr(prompt);

    // Registra a interação no banco de memória
    registrarMemoria(usuario, "user", userMessage);
    registrarMemoria(usuario, "maria", lulu);

    res.json({ reply: lulu });
}
  } catch (error) {
    console.error('Erro na IA:', error);
    res.status(500).json({ error: 'Erro ao processar sua mensagem' });
  }
});

//★・・・・・・★・・・ DOWNLOAD ・・・★・・・・・・★
app.get('/api/download/play', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'play');
if (erro) { return res.status(403).json({ erro }); }
 nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
api = await ytSearch(nome)
ytMp3(api[0].url).then((akk) => {
res.setHeader('Content-Type', 'audio/mpeg');
request.get(akk).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/playv2', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'play2');
if (erro) { return res.status(403).json({ erro }); }
 nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'})
api = await ytSearch(nome)
ytMp3(api[0].url).then((akk) => {
res.setHeader('Content-Type', 'audio/mpeg');
request.get(akk).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/playv3', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'play3');
if (erro) { return res.status(403).json({ erro }); }
const url = req.query.url;
if (!url) return res.json({ status: false, resultado: 'cadê o parâmetro url??' });
try {
ytMp3(url).then((akk) => {
res.setHeader('Content-Type', 'audio/mpeg');
request.get(akk).pipe(res);
})
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao processar o áudio." });
}
});

app.get('/api/download/playv4', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'play4');
if (erro) { return res.status(403).json({ erro }); }
const url = req.query.query;
if (!url) return res.json({ status: false, resultado: 'cadê o parâmetro url??' });
try {
api = await ytSearch(nome)
ytMp3(api[0].url).then((akk) => {
res.setHeader('Content-Type', 'audio/mpeg');
request.get(akk).pipe(res);
})
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao processar o áudio." });
}
});

app.get('/api/download/playv5', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'play5');
if (erro) { return res.status(403).json({ erro }); }
 nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'})
api = await ytSearch(nome)
ytdown(api[0].url).then((akk) => {
res.setHeader('Content-Type', 'audio/mpeg');
request.get(akk.data.audio).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/playv6', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'play6');
if (erro) { return res.status(403).json({ erro }); }
url = req.query.url
if(!url)return res.json({status:false, resultado:'Cade o parametro url??'})
ytdown(url).then((akk) => {
res.setHeader('Content-Type', 'audio/mpeg');
request.get(akk.data.audio).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/playDark', async(req, res, next) => {
url = req.query.url
if(!url)return res.json({status:false, resultado:'Cade o parametro nome??'})
const { ytmp3 } = require('ruhend-scraper')
const data = await ytmp3(url)
res.setHeader('Content-Type', 'audio/mpeg');
request.get(data.audio).pipe(res)
})

app.get('/api/download/playvd', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'playvd');
if (erro) { return res.status(403).json({ erro }); }
nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
api = await ytSearch(nome)
ytMp4(api[0].url).then((akk) => {
res.setHeader('Content-Type', 'video/mp4');
request.get(akk).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/playvdv2', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'playvd2');
if (erro) { return res.status(403).json({ erro }); }
 url = req.query.url
if(!url)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
ytMp4(url).then((akk) => {
res.setHeader('Content-Type', 'video/mp4');
request.get(akk).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/playvdv3', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'playvd2');
if (erro) { return res.status(403).json({ erro }); }
 nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
api = await ytSearch(nome)
ytdown(api[0].url).then((akk) => {
res.setHeader('Content-Type', 'video/mp4');
request.get(akk.data.video).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/playvdv4', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'playvd2');
if (erro) { return res.status(403).json({ erro }); }
url = req.query.url
if(!url)return res.json({status:false, resultado:'Cade o parametro url??'  }) 
ytdown(url).then((akk) => {
res.setHeader('Content-Type', 'video/mp4');
request.get(akk.data.video).pipe(res);
}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu audio...."
})
console.log(e)
})})

app.get('/api/download/audiomeme', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'audiomeme');
if (erro) { return res.status(403).json({ erro }); }
nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
audiomeme(nome).then((memin) => {
res.json({
status: true,
código: 200,
criador: `${criador}`,
host: linkHost,
resultado: memin
})}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: "Deu erro ao solicitar seu meme...."
})
console.log(e)
})})

app.get('/api/download/an1', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'dowload/an1');
if (erro) { return res.status(403).json({ erro }); }
var { url } = req.query;
if(!url) return res.json({message: "Faltando o parâmetro: 'url'"});
try {
const response = await fetch(`https://api.neoxr.eu/api/an1-get?url=${url}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
resultado: data3.data
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
}); }})

app.get('/api/download/apkmirror', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'dowload/apkmirror');
if (erro) { return res.status(403).json({ erro }); }
var { url } = req.query;
if(!url) return res.json({message: "Faltando o parâmetro: 'url'"});
try {
const response = await fetch(`https://api.neoxr.eu/api/apkmirror-get?url=${url}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
resultado: data3.data
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
}); }})

app.get('/api/download/apkpure', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'dowload/apkpure');
if (erro) { return res.status(403).json({ erro }); }
var { url } = req.query;
if(!url) return res.json({message: "Faltando o parâmetro: 'url'"});
try {
const response = await fetch(`https://api.neoxr.eu/api/apkpure-get?url=${url}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
resultado: data3.data
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
}); }})

app.get('/api/download/rexdl', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'dowload/rexdl');
if (erro) { return res.status(403).json({ erro }); }
var { url } = req.query;
if(!url) return res.json({message: "Faltando o parâmetro: 'url'"});
try {
const response = await fetch(`https://api.neoxr.eu/api/rexdl-get?url=${url}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
resultado: data3.data
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
}); }})

app.get('/api/download/song', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'dowload/song');
if (erro) { return res.status(403).json({ erro }); }
var { query, selec } = req.query;
if(!query || !selec) return res.json({message: "Faltando o parâmetro: 'query é selec'"});
try {
const response = await fetch(`https://api.neoxr.eu/api/song?q=${query}&select=${selec}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
resultado: data3.data
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
}); }})

////★・・・・・・★・・・ ANIMES ・・・★・・・・・・★
app.get('/api/anime/animefireDow', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'animefireDow');
if (erro) { return res.status(403).json({ erro }); }
const { url } = req.query;  
if(!url)return res.json({status:false, resultado:'Cade o parametro url??'  }) 
downloadAnime(url).then((data) => {
res.json({
data
})}
).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: msgApi.erro
})
console.log(e)
})})

app.get('/api/anime/animefire', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'animefire');
if (erro) { return res.status(403).json({ erro }); }
nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
function removerMaiusculas(texto) {
    return texto.replace(/[A-Z]/g, ""); 
}
pesquisa = removerMaiusculas(nome)
let resultado3 = pesquisa.replace(/ /g, "-");
buscarAnimes(resultado3).then((data) => {
res.json({
data
})}
)
})

app.get('/api/anime/animefireEps', async(req, res, next) => {
const { url } = req.query;  
if(!url)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'animefireEps');
if (erro) { return res.status(403).json({ erro }); }
buscarDetalhesAnime(url).then((data) => {
res.json({
data
})}).catch(e => {
res.json({
status: false,
codigo: 400,
criador: criador,
host: linkHost,
resultado: msgApi.erro
})
console.log(e)
})})

app.get('/api/anime/animedrive', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'animefire');
if (erro) { return res.status(403).json({ erro }); }
nome = req.query.nome
if(!nome)return res.json({status:false, resultado:'Cade o parametro nome??'  }) 
function removerMaiusculas(texto) {
    return texto.replace(/[A-Z]/g, ""); 
}
bscAnimeDrive(removerMaiusculas(nome)).then((data) => {
res.json({
data
})}
)
})

app.get('/api/anime/animedriveEps', async(req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'animefire');
if (erro) { return res.status(403).json({ erro }); }
url = req.query.url
if(!url)return res.json({status:false, resultado:'Cade o parametro url??'  }) 
dtsAnimeDrive(url).then((data) => {
res.json({
data
})}
)
})

app.get('/api/anime/infoAnime', async (req, res, next) => {
    const { nome } = req.query;
    if (!nome) {
        return res.status(400).json({ error: "Faltou o parâmetro 'nome' na query." });
    }
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'infoAnimes');
if (erro) { return res.status(403).json({ erro }); }
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nome)}&limit=1`);
        const anime = response.data.data[0];

        const apiStatus = await fetchJson(`${BaseApiDark}/api/outros/translate?ling=pt&text=${anime.status}&apikey=${DARK_APIKEY}&username=${DARK_USERNAME}`);
        const apiSynopsis = await fetchJson(`${BaseApiDark}/api/outros/translate?ling=pt&text=${anime.synopsis}&apikey=${DARK_APIKEY}&username=${DARK_USERNAME}`);

        res.json({
            status: true,
            code: 200,
            criador: criador,
            resultado: {
                titulo: anime.title,
                titulo_japones: anime.title_japanese || 'N/A',
                imagem: anime.images.jpg.image_url,
                nota: anime.score || 'Sem avaliação',
                episodios: anime.episodes || 'Desconhecido',
                status: apiStatus.result,
                generos: anime.genres.map(g => g.name).join(', ') || 'N/A',
                trailer: anime.trailer.url || 'nenhum',
                sinopse: apiSynopsis.result || 'Sem sinopse disponível.'
            }
        });
    } catch (e) {
        console.error(e.toString());
        return res.json({
            status: false,
            code: 500,
            criador: criador,
            erro: "Ocorreu um erro! Por favor, tente novamente."
        });
    }
});

app.get('/api/anime/nomePersonagem', async (req, res, next) => {
    const {nome } = req.query;
    if (!nome) {
        return res.status(400).json({ error: "Faltou o parâmetro 'nome' na query." });
    }
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'nomePersonagem');
if (erro) { return res.status(403).json({ erro }); }
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nome)}&limit=1`);
        const anime = response.data.data[0];

        const id = anime.mal_id;
        const personagensResponse = await axios.get(`https://api.jikan.moe/v4/anime/${id}/characters`);
        const personagens = personagensResponse.data.data;

        const lista = personagens.slice(0, 5).map(p => `${p.character.name} (${p.role})`).join(', ');

        res.json({
            status: true,
            code: 200,
            criador: criador,
            resultado: {
                titulo: anime.title,
                imagem: anime.images.jpg.image_url,
                personagens: lista || 'Sem personagens.'
            }
        });
    } catch (e) {
        console.error(e.toString());
        return res.json({
            status: false,
            code: 500,
            criador: criador,
            erro: "Ocorreu um erro! Por favor, tente novamente."
        });
    }
});

app.get('/api/anime/novosAnimes', async (req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'novosAnimes');
if (erro) { return res.status(403).json({ erro }); }
    try {
        const response = await axios.get('https://api.jikan.moe/v4/seasons/now');
        const animes = response.data.data;
        const lista = animes.slice(0, 5).map(a => `${a.title} (${a.episodes || 'Episódios desconhecidos'})`).join(', ');

        res.json({
            status: true,
            code: 200,
            criador: criador,
            resultado: {
                lista: lista || 'Sem novos animes.'
            }
        });
    } catch (e) {
        console.error(e.toString());
        return res.json({
            status: false,
            code: 500,
            criador: criador,
            erro: "Ocorreu um erro! Por favor, tente novamente."
        });
    }
});

////★・・・・・・★・・・ PESQUISAS ・・・★・・・・・・★
app.get('/api/pesquisa/an1', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'pesquisa/an1');
if (erro) { return res.status(403).json({ erro }); }
var { query } = req.query;
if(!query) return res.json({message: "Faltando o parâmetro: 'query'"});
try {
const response = await fetch(`https://api.neoxr.eu/api/an1?q=${query}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
resultado: data3.data
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
}); }});

app.get('/api/pesquisas/:nomeRota', async (req, res) => {
const { apikey } = req.query;  
const { nomeRota } = req.params;
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, `pesquisa/${nomeRota}`);
if (erro) { return res.status(403).json({ erro }); }
var { query } = req.query;
if(!query) return res.json({message: "Faltando o parâmetro: 'query'"});
try {
const response = await fetch(`https://api.neoxr.eu/api/${nomeRota}?q=${query}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
resultado: data3.data
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
}); }});

app.get('/api/pesquisa/youtubeCanal', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'youtubeCanal');
if (erro) { return res.status(403).json({ erro }); }
const nome = req.query.nome;
if (!nome) return res.json({ status: false, resultado: 'cadê o parâmetro nome??' });
try {
const result = await youtubeChannel(nome);
res.json({ status: true, resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do canal." });
}
});

app.get('/api/pesquisa/youtube', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'youtube');
if (erro) { return res.status(403).json({ erro }); }
const nome = req.query.nome;
if (!nome) return res.json({ status: false, resultado: 'cadê o parâmetro nome??' });
try {
const result = await fetch(`http://speedhosting.cloud:2025/api/pesquisa/youtube?query=${nome}&apikey=pedrozz1&username=pedrozzMods`)
api = await result.json()
res.json({ status: true, resultado: api.resultado });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/transcricao', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'youtubeTranscricao');
if (erro) { return res.status(403).json({ erro }); }
const url = req.query.url;
if (!url) return res.json({ status: false, resultado: 'cadê o parâmetro url??' });
try {
const result = await youtubeTranscript(url);
res.json({ status: true, resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/pensadorPesquisa', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'pensadorPesquisa');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await pensadorSearch(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/pensadorFrases', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'pensadorFrase');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await frasesPensador(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/frasesDeAmor', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'frasesDeAmor');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await fraseAmor(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/pinterest', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'pinterest');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
pin = await fetchJson(`https://api.febrita.biz.id/search/pinterest?query=${query}`)
res.json({ 
status: true, 
criador: criador,
resultado: pin.result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/wallpaper', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'wallpaper');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await wallpaper(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/wallpaper2', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'wallpaper2');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await wallpaper2(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/hentai', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'hentai');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await hentai(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/amazon', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'amazon');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await amazonSearch(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

app.get('/api/pesquisa/playstore', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'playstore');
if (erro) { return res.status(403).json({ erro }); }
const query = req.query;
if (!query) return res.json({ status: false, resultado: 'cadê o parâmetro query??' });
try {
const result = await playStoreSearch(query);
res.json({ 
status: true, 
criador: criador,
resultado: result });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "ocorreu um erro ao buscar informações do vídeo." });
}
});

////★・・・・・・★・・・ FIGURINHAS ・・・★・・・・・・★

app.all('/sticker/emojimix', async (req, res) => {
try {
const { emoji1, emoji2 } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'emojimix');
if (erro) { return res.status(403).json({ erro }); }
try {
let api = await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
let d = await api.json();
let imgUrl = d.results[0].media_formats.png_transparent.url;
res.json({ 
status: true, 
criador: criador,
resultado: {
emoji1,
emoji2,
type: "sticker",
emojimixUrl: imgUrl
} });
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
})

app.all('/sticker/emojimix2', async (req, res) => {
    try {
        const { apikey, emoji } = req.query;
        if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });

        const erro = await usarApiKey(apikey, 'emojimix2');
        if (erro) return res.status(403).json({ erro });

        try {
            let api = await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji)}`);
            let data = await api.json();

            if (!data.results || data.results.length === 0) {
                return res.status(404).json({ erro: "Nenhum sticker encontrado para esse emoji." });
            }

            // Processando os resultados
            let stickers = data.results.map(item => ({
                tags: item.tags, // Pegando as tags dos emojis
                stickerUrl: item.media_formats.png_transparent.url // Link da sticker
            }));

            res.json({
                status: true,
                criador: criador,
                resultado: {
                    emoji,
                    type: "sticker",
                    stickers
                }
            });

        } catch (e) {
            console.error('Erro ao buscar os stickers:', e);
            res.status(500).json({ status: false, mensagem: "Erro ao buscar os stickers." });
        }

    } catch (error) {
        console.error('Erro no endpoint:', error);
        res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
    }
});


app.all('/sticker/figu_emoji', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 102)
   res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/Figurinha-emoji/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })

app.all('/sticker/figu_desenho2', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 102)
   res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/anya-bot/master/Figurinhas/figu_flork/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })

app.all('/sticker/figu_aleatori', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 8051)
   res.send(await getBuffer(`https://raw.githubusercontent.com/badDevelopper/Testfigu/master/fig (${rnd}).webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
} catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })
app.all('/sticker/figu_memes', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 109)
   res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/Figurinha-memes/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
} catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })
   
app.all('/sticker/figu_anime', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 109)
   res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/figurinha-anime/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })
   
app.all('/sticker/figu_coreana', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 43)
   res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/figurinha-coreana/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   })
app.all('/sticker/figu_bebe', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 17)
   res.send(await getBuffer(`https://raw.githubusercontent.com/badDevelopper/Apis/master/pack/figbebe/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })
   
app.all('/sticker/figu_desenho', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 50)
   res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/figurinha-desenho/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })
   
app.all('/sticker/figu_animais', async (req, res) => {
try {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
   res.type('png')
    var rnd = Math.floor(Math.random() * 50)
   res.send(await getBuffer(`https://raw.githubusercontent.com/badDevelopper/Apis/master/pack/figanimais/${rnd}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
   })

//FEITAS POR PEDROZZ MODS

app.all('/sticker/:nomesFigu', async (req, res) => {
try {
const { nomesFigu } = req.params;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'figurunhas');
if (erro) { return res.status(403).json({ erro }); }
   try {
const config = {
figu_random: { pastaName: 'random', NomeFig: 'ramdon', max: 585 },
'figu+18': { pastaName: '+18', NomeFig: 'figurinhas', max: 89 },
figu_memes2: { pastaName: 'memes', NomeFig: 'figurinhas', max: 49 },
figu_anime2: { pastaName: 'animes', NomeFig: 'figurinhas', max: 220 },
figu_coreanas2: { pastaName: 'coreanas', NomeFig: 'figurinhas', max: 73 },
figu_gatos: { pastaName: 'gatos', NomeFig: 'figurinhas', max: 108 },
figu_bts: { pastaName: 'bts', NomeFig: 'figurinhas', max: 30 },
};

const { pastaName, NomeFig, max } = config[nomesFigu];

   res.type('png')
    var numero = Math.floor(Math.random() * max)
   res.send(await getBuffer(`https://pedrozz13755.github.io/Arquivos_web/figurinhas/${pastaName}/${NomeFig}${numero}.webp`))
   } catch (e) {
   res.send(msgApi.error)
   }
   } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
})   

////★・・・・・・★・・・ UPLOADS ・・・★・・・・・・★
app.post('/api/upload/catbox', async (req, res) => {
try {
const { file } = req.body;
const { catbox } = require("./dono/upload.js");
if (!file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
const fileBuffer = Buffer.from(file, 'base64');
const fileUrl = await catbox(fileBuffer);
console.log(fileUrl)
res.json({ resultado: fileUrl });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "Ocorreu um erro ao processar o upload." });
}
});

app.post('/api/upload/supa', async (req, res) => {
try {
const { file } = req.body;
const { supa } = require("./dono/upload.js");
if (!file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
const fileBuffer = Buffer.from(file, 'base64');
const fileUrl = await supa(fileBuffer);
console.log(fileUrl)
res.json({ resultado: fileUrl });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "Ocorreu um erro ao processar o upload." });
}
});

app.post('/api/upload/api8030', async (req, res) => {
try {
const { file } = req.body;
const { api8030 } = require("./dono/upload.js");
if (!file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
const fileBuffer = Buffer.from(file, 'base64');
const fileUrl = await api8030(fileBuffer);
console.log(fileUrl)
res.json({ resultado: fileUrl });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "Ocorreu um erro ao processar o upload." });
}
});

app.post('/api/upload/api2', async (req, res) => {
try {
const { file } = req.body;
const { api2 } = require("./dono/upload.js");
if (!file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
const fileBuffer = Buffer.from(file, 'base64');
const fileUrl = await api2(fileBuffer);
console.log(fileUrl)
res.json({ resultado: fileUrl });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "Ocorreu um erro ao processar o upload." });
}
});

////★・・・・・・★・・・ AIS ・・・★・・・・・・★
app.get('/api/ai/:nomeAI', async (req, res) => {
const { nomeAI } = req.params;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, nomeAI);
if (erro) { return res.status(403).json({ erro }); }
var { texto } = req.query;
if (!texto) return res.status(400).json({ erro: 'texto é necessário' });
    try {
const response = await fetch(`https://api.neoxr.eu/api/ai-cloudflare?prompt=${texto}&history=%5B%5D&model=${nomeAI}`);
const data3 = await response.json();

return res.json({
status: 'true',
criador: criador,
modelo: nomeAI,
resultado: {
resposta: data3.data.message
}
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
});
}
});

app.get('/apit/ai/gemini', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'gemini');
if (erro) { return res.status(403).json({ erro }); }
var { texto } = req.query;
if (!texto) return res.status(400).json({ erro: 'texto é necessário' });
try {
const data3 = await gemIAr(texto);
return res.json({
status: 'true',
criador: criador,
modelo: "Gemini AI",
resultado: {
resposta: data3.resposta
}
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
});
}
});

app.get('/apit/ai/cloud', async (req, res) => {
var { texto } = req.query;
if (!texto) return res.status(400).json({ erro: 'texto é necessário' });
try {

async function run(model, input) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/1a796eb44670bd17367488c4f493606f/ai/run/${model}`,
    {
      headers: { Authorization: "Bearer WCfkbAYTXFr56omtKxidKaqfd3hmPFdXT_rEQPxG" },
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  const result = await response.json();
  return result;
}


run("@cf/meta/llama-3-8b-instruct", {
  messages: [
    {
      role: "system",
      content: " ",
    },
    {
      role: "user",
      content:
       texto,
    },
  ],
}).then((response) => {
return res.json({
status: 'true',
criador: criador,
modelo: "Gemini AI",
resultado: {
resposta: response.result.response
}
});
});

} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
});
}
});

app.get('/api/ai/voice/:nome', async (req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'vozAI');
if (erro) { return res.status(403).json({ erro }); }
const { nome } = req.params;
if(!nome)return res.json({status:false, message:'Cadê o parâmetro name?'})
var { texto} = req.query;
try{
if (nome == "Charlotte") {
voiceId = "XB0fDUnXU5powFXDhCwa"
} else if (nome == "Alice") {
voiceId = "Xb7hH8MSUJpSbSDYk0k2"
} else if (nome == "Jessica") {
voiceId = "cgSgspJ2msm6clMCkdW9"
} else if (nome == "Matilda") {
voiceId = "XrExE9yKIg1WjnnlVkGX"
} else if (nome == "Lily") {
voiceId = "pFZP5JQG7iQjIQuC4Bku"
} else if (nome == "Chris") {
voiceId = "iP95p4xoKVk53GoZ742B"
} else if (nome == "Liam") {
voiceId = "TX3LPaxmHKxFdv7VOQHJ"
} else if (nome == "Eric") {
voiceId = "cjVigY5qzO86Huf0OWal"
} else if (nome == "Daniel") {
voiceId = "onwK4e9ZLuTAKqWW03F9"
} else if (nome == "Roger") {
voiceId = "CwhRBWXzGAHq8TQ4Fs17"
}else if (nome == "Charlie") {
voiceId = "IKne3meq5aSn9XLyUdCD"
}else if (nome == "George") {
voiceId = "JBFqnCBsd6RMkjVDRZzb"
}else if (nome == "Laura") {
voiceId = "FGY2WhTYpPnrIDTdsKH5"
}else if (nome == "Sarah") {
voiceId = "EXAVITQu4vr4xnSDxMaL"
}
const El = await voiceAI(texto, voiceId);
res.sendFile(bla + '/BANCO DE DADOS/temp/voiceAi.mp3')
} catch (err) {
res.json({status: 404, error: 'Ocorreu um erro na geração da sua voz usando inteligência artificial. Notifique ao administrador(a) por favor.'})
};
});

app.get('/apit/ai/gtaimg', async (req, res) => {
const { apikey, url } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
if (!url) return res.status(400).json({ erro: 'url é necessária' });
const erro = await usarApiKey(apikey, 'gtaimg');
if (erro) { return res.status(403).json({ erro }); }
try {
const {img2gtas} = require('./BANCO DE DADOS/img2gta.js')
const data3 = await img2gtas(url);
return res.json({
status: 'true',
criador: criador,
resultado: {
url: data3.img_url
}
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
});
}
});

app.get('/apit/ai/animeia', async (req, res) => {
const { apikey, url } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
if (!url) return res.status(400).json({ erro: 'url é necessária' });
const erro = await usarApiKey(apikey, 'animeia');
if (erro) { return res.status(403).json({ erro }); }
try {
const {animeia} = require('./BANCO DE DADOS/img2anime.js')
const data3 = await animeia(url);
return res.json({
status: 'true',
criador: criador,
resultado: {
url: data3.img_url
}
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
});
}
});

app.get('/apit/ai/remini', async (req, res) => {
const { apikey, url } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
if (!url) return res.status(400).json({ erro: 'url é necessária' });
const erro = await usarApiKey(apikey, 'remini');
if (erro) { return res.status(403).json({ erro }); }
try {
const {hdimage} = require('./BANCO DE DADOS/remini.js')
const data3 = await hdimage(url, "enhance", 1);
return res.json({
status: 'true',
criador: criador,
resultado: {
url: data3.img_url
}
});
} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criador: criador,
resultado: {
resposta: msgApi.erro
}
});
}
});
//★・・・・・・★・・・ IMAGENS ・・・★・・・・・・★ 
app.all('/api/imagem/travazap', async (req, res) => {
   try {
   const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, "travazap");
if (erro) { return res.status(403).json({ erro }); }
   json = JSON.parse(fs.readFileSync('./BANCO DE DADOS/json/travazap.json').toString())
   random = json[Math.floor(Math.random() * json.length)]
   res.type('png')
   res.send(await getBuffer(random))
   } catch (e) {
   res.send(msgApi.erro)
   }
   })
app.all('/api/imagem/travazapF', async (req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, "travazapF");
if (erro) { return res.status(403).json({ erro }); }
   try {
   json = JSON.parse(fs.readFileSync('./BANCO DE DADOS/json/femininotrava.json').toString())
   random = json[Math.floor(Math.random() * json.length)]
   res.type('png')
   res.send(await getBuffer(random))
   } catch (e) {
   res.send(msgApi.erro)
   }
   })

app.get('/api/imagem/metadinha', async (req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, "travazapF");
if (erro) { return res.status(403).json({ erro }); }
json = JSON.parse(fs.readFileSync(bla +'/BANCO DE DADOS/metadinha.json').toString())
random = json[Math.floor(Math.random() * json.length)]
res.json(random) 
})

app.get('/api/imagem/metadinha2', async (req, res, next) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, "metadinha2");
if (erro) { return res.status(403).json({ erro }); }json = JSON.parse(fs.readFileSync(bla +'/BANCO DE DADOS/metadinhaPedrozz.json').toString())
random = json[Math.floor(Math.random() * json.length)]
res.json(random) 
})
//★・・・・・・★・・・ CANVA ・・・★・・・・・・★
app.get('/api/canva/bem-vindo', async(req, res) => {
var { titulo, avatar, fundo, desc } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'canva/bem-vindo');
if (erro) { return res.status(403).json({ erro }); }
if (!titulo || !avatar || !fundo || !desc) return res.status(400).json({ error: "Faltou o parâmetro..." });
var BLAb = await canvaBemVindo(titulo, avatar, fundo, desc)
res.type('jpg')
res.send(await getBuffer(BLAb))
})

app.get('/api/canva/bem-vindo2', async(req, res) => {
var { titulo, avatar, fundo, desc, nome } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'canva/bem-vindo2');
if (erro) { return res.status(403).json({ erro }); }
if (!titulo || !avatar || !fundo || !desc) return res.status(400).json({ error: "Faltou o parâmetro..." });
var BLAb = await getBuffer(`https://api.popcat.xyz/welcomecard?background=${fundo}&text1=${nome}&text2=${titulo}&text3=${desc}&avatar=${avatar}`)
console.log(BLAb)
res.type('jpg')
res.send(BLAb)
})

app.get('/api/canva/level', async(req, res) => {
var { avatar, fundo, nome, level1, level2 } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'canva/level');
if (erro) { return res.status(403).json({ erro }); }
if (!avatar || !fundo || !nome || !level1 || !level2) return res.status(400).json({ error: "Faltou o parâmetro..." });
var BLAb = await canvaLevel(avatar, fundo, nome, level1, level2)
res.type('jpg')
res.send(await getBuffer(BLAb))
})

app.get('/api/canva/level2', async(req, res) => {
var { avatar, nome, level1, level2, level3, rank, fundo } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'canava/level2');
if (erro) { return res.status(403).json({ erro }); }
if (!level1 || !level2 || !level3 || !rank || !fundo) return res.status(400).json({ error: "Faltou o parâmetro..." });
var BLAb = await canvaLevel2(avatar, nome, level1, level2, level3, rank, fundo)
res.type('jpg')
res.send(await getBuffer(BLAb))
})

app.get('/api/canva/musicCard', async(req, res) => {
var { avatar, nomemusic, nameart } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'canva/musicCard');
if (erro) { return res.status(403).json({ erro }); }
if (!avatar || !nomemusic || !nameart) return res.status(400).json({ error: "Faltou o parâmetro..." });
var BLAb = await canvaMusic(avatar, nomemusic, nameart)
res.type('jpg')
res.send(await getBuffer(BLAb))
})

app.get('/api/canva/bolsonaro', async(req, res) => {
var { link } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'canva/bolsonaro');
if (erro) { return res.status(403).json({ erro }); }
if (!link) return res.status(400).json({ error: "Faltou o parâmetro link" });
var BLAb = await canvaBolsonaro(link)
res.type('jpg')
res.send(await getBuffer(BLAb))
})

app.get('/api/canva/comunismo', async(req, res) => {
var { link } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'canva/comunismo');
if (erro) { return res.status(403).json({ erro }); }
if (!link) return res.status(400).json({ error: "Faltou o parâmetro link" });
var BLAb = await canavaComunismo(link)
res.type('jpg')
res.send(await getBuffer(BLAb))
})

app.get('/api/ferramentas/printSite', async(req, res) => {
var { url } = req.query;
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, "printSite");
if (erro) { return res.status(403).json({ erro }); }
if (!url) return res.status(400).json({ error: "Faltou o parâmetro url" });
res.type('jpg')
res.send(await getBuffer(`https://api.popcat.xyz/screenshot?url=${url}`))
})

//★・・・・・・★・・・ +18 ・・・★・・・・・・★

app.get('/api/18/:nomeHentai', async(req, res) => {
const { nomeHentai } = req.params;
if (!nomeHentai) return res.status(400).json({ error: "Faltou o parâmetro nome da imagem" });
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, nomeHentai);
if (erro) { return res.status(403).json({ erro }); }
var BLAb = await Hentaizinho(nomeHentai)
res.type('jpg')
res.send(await getBuffer(BLAb))

})

app.get('/api/1o8/:nomeHentai', async(req, res) => {
const { nomeHentai } = req.params;
if (!nomeHentai) return res.status(400).json({ error: "Faltou o parâmetro nome da imagem" });
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, nomeHentai);
if (erro) { return res.status(403).json({ erro }); }
var BLAb = await Hentaizinho2(nomeHentai)
res.type('jpg')
res.send(await getBuffer(BLAb))

})

app.get('/api/:plaquinha2', async(req, res) => {
const { plaquinha2 } = req.params;
var { texto} = req.query;
if (!plaquinha2) return res.status(400).json({ error: "Faltou o parâmetro nome da plaquinha" });
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, plaquinha2);
if (erro) { return res.status(403).json({ erro }); }
if (!texto) return res.status(400).json({ error: "Faltou o parâmetro texto" });
var BLAb = await plaquinha(plaquinha2, texto)
res.type('jpg')
res.send(await getBuffer(BLAb))
})

app.get('/api/download/PinterestMultiMidia', async (req, res) => {
const { apikey, url } = req.query;
if (!apikey) {return res.status(400).json({ erro: 'API Key é necessária' });}
const erro = await usarApiKey(apikey, 'PinterestMultiMidia');
if (erro) {return res.status(403).json({ erro });}
if (!url) {return res.json({ status: false, resultado: 'Cadê o parâmetro url??' });}
try {
const data = await getPinterestMedia(url); 
res.json({ data });
} catch (e) {
console.error(e);
res.json({ status: false, resultado: "Ocorreu um erro ao buscar informações do vídeo." });
    }
});

app.get('/api/download/pinterestmp4', async(req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'pinterestmp4');
if (erro) { return res.status(403).json({ erro }); }
var { url } = req.query;
if (!url) return res.status(400).json({ error: "Faltou o parâmetro url" });
var BLAb = await pinterestVideo(url)
res.json({BLAb})
console.log(BLAb)
})

app.get('/api/download/pinterestmp4v2', async(req, res) => {
const { apikey } = req.query;  
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
const erro = await usarApiKey(apikey, 'pinterestmp4v2');
if (erro) { return res.status(403).json({ erro }); }
var { url } = req.query;
if (!url) return res.status(400).json({ error: "Faltou o parâmetro url" });
var BLAb = await pinterestVideoV2(url)
console.log(BLAb)
})

app.get('/api/download/jjj', async(req, res) => {
const { Youtube } = require('ytdownloader.js')
fff = await new Youtube().ytmp3("https://www.youtube.com/watch?v=iX66G5DzIQ4", false)
console.log(fff)
})


//ROTAS PRINCIPAIS DA API (HTML)
app.get('/verificar', (req, res) => res.sendFile(__dirname + '/public/users.html'));

app.get('/plano', (req, res) => res.sendFile(__dirname + '/public/plano.html'));

app.get('/rankt', (req, res) => res.sendFile(__dirname + '/public/rank.html'));

/*app.get('*', function(req, res) { 
res.sendFile(__dirname + '/public/404.html')
})*/

//ROTAS PRINCIPAIS DA API (EJS)
app.get('/', (req, res) => {
res.render("login", { aviso: false, aviso2: null });
});

app.get('/login', (req, res) => {
res.render("login", { aviso: false, aviso2: null });
});

app.get('/registro', (req, res) => {
  res.render('registro');
});

app.get('/config', (req, res) => {
  res.render('config');
});

// ★・・・・・・★・・・ SERVIDOR ・・・★・・・・・・★
app.listen(PORT, () => {
console.log(banner.string, banner2.string, banner3.string)
//================LIGA O BOT AQUI=================//
bot.launch().then(() => {
consoleSucesso('Bot iniciado');
}).catch(err => {
console.error('Erro ao iniciar o bot:', err);
});
consoleOnline('O bot acaba de ser iniciado');

consoleSucesso(`Servidor rodando em http://localhost:${PORT}`);
});

//★・・・・・・★・・・ ATUALIZAÇÃO ・・・★・・・・・・★
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
consoleAviso(`A index da api foi atualizado estou reiniciando para salvar as alterações 🧸`)
process.exit()
})