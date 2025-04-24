const axios = require('axios');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const path = require('path');
const MemoryStore = require('memorystore')(session);
const fs = require('fs');
const request = require('request');
const { tokenDB, tokenTele, botName, donoName, donoTele, apiLink, donoId, siteName, msgAdm2, msgAdm, fotoSite } = require("./config.json");
const admList = ["Moonlight_Devs", "pedrozzMods", "BotAdmMoon"]
const htmlPath = path.join(__dirname, './public/error.html');
const criadora = "Moonlight";

//EXPORTANDO MÓDULOS
const { botVersion, msg, msgApi, consoleVerde, consoleVerde2, consoleVermelho, consoleVermelho2, consoleAmarelo, consoleAmarelo2, consoleAzul, consoleAzul2, consoleErro, consoleAviso, consoleInfo, consoleOnline, consoleSucesso, fetchJson, getBuffer, timed, data, hora } = require("./dados/dados.js")
//SCRAPEER
const { ytsearch, ytMp3Query, ytMp4Query, ytMp3, ytMp4, instagramDl, tiktokDl, xvideosDl, apkpureDl, audiomeme, wikipedia, amazon, tiktokQuery, apkpureQuery, xvideosQuery, aptoide, Pinterest, PinterestMultiMidia, wallpaper, Playstore, CanvabemVindo, canvaLevel, canvaMusicCard, canvaMusicCard2, canvaMontagem, Hentaizinho, Hentaizinho2, travaZapImg, travaZapImg2, metadinha, metadinha2, logo, gemini, imagemAi, stickAi } = require("./dados/scraper.js")

//
var app = express()
app.enable('trust proxy');
app.set("json spaces", 2)
app.use(express.urlencoded({ extended: true }));
app.use(session({
secret: 'secret',
resave: true,
saveUninitialized: true,
cookie: { maxAge: 86400000 },
store: new MemoryStore({
checkPeriod: 86400000
}),
}));
app.use(cors())
app.use(express.static("public"))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
secret: 'seuSegredo',
resave: true,
saveUninitialized: true,
cookie: {
maxAge: 24 * 60 * 60 * 1000, 
}
}));

const userSchema = new mongoose.Schema({
username: { type: String, required: true },
password: { type: String, required: true },
key: { type: String, required: true },
saldo: { type: Number, default: 0 },
level: { type: Number, default: 0 },
tempoPlano: { type: Number, default: 0 },
ft: { type: String, default: null },
yt: { type: String, default: null },
zap: { type: String, default: null },
insta: { type: String, default: null },
wallpaper: { type: String, default: null },
isPlano: { type: Boolean, default: false },
isAdm: { type: Boolean, default: false },
isLite: { type: Boolean, default: false },
isPremium: { type: Boolean, default: false },
isGold: { type: Boolean, default: false },
isBanido: { type: Boolean, default: false },
});

const User = mongoose.model('Lady', userSchema);
Person = User;

async function diminuirSaldo(apikey) {
try {
const user = await User.findOne({ key: apikey });
if (!user) {
return "Sua apikey não foi encontrado.";
}

if (user.isBanido) {
return "Você é um usuário banido então não podera continuar com sua solicitação..."
} else if (user.saldo > 0) {
user.saldo--;
user.level = (parseFloat(user.level) + 0.1).toFixed(1);
await user.save();
} else {
return "Você não possui request o suficiente para completar essa ação 😖"
}
} catch (error) {
console.error('Erro ao diminuir saldo:', error);
}
}

async function adicionarSaldo(username) {
try {
const user = await User.findOne({ username });
if (!user) {
return false;
}
user.saldo += 1;
await user.save();
return true;
} catch (error) {
console.error('Erro ao adicionar saldo:', error);
return false;
}
}

async function readUsers() {
try {
return await User.find();
} catch (error) {
console.error('Erro ao acessar o banco de dados:', error);
return [];
}
}

async function saveUsers(users) {
try {
await User.deleteMany();
await User.insertMany(users);
} catch (error) {
console.error('Erro ao salvar os dados no banco de dados:', error);
}
}


//★・・・・★・・ BOT DO TELEGRAM ・・・★・・・・★

//====================[ MÓDULOS ]====================\\

const { Telegraf } = require('telegraf');
const os = require('os');
const hostname = os.hostname();
let HostOuNao;
if (hostname === "localhost") {
HostOuNao = "Termux"
} else {
HostOuNao = "Hospedagem paga"
}
const fotoMenu = "https://files.catbox.moe/yie1yr.png"
//====================CONFIGURAÇÕES=====================//
let bot;
if (HostOuNao === "Hospedagem paga") {
bot = new Telegraf(tokenTele);
} else {
bot = new Telegraf("8110817449:AAEqBxkRfIQ0zNPpPyqcqP4yUSbYe1RecwA");
consoleAviso("Api ligada no termux")
//ctx.reply("Ligado no termux...");
}
const PREFIX = "/";

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

async function enviarImg2(ctx, link, texto) {ctx.replyWithPhoto({ url: link }, {caption: texto});}
async function enviarAd(ctx, link) {await ctx.replyWithAudio({ url: link });}

// Comandos do bot
bot.start(async (ctx) => {
enviarImg2(ctx, "https://files.catbox.moe/qs6ahh.png", `${timed}\n\nOlá! 👋  Bem-vindo(a) ao Moonlight API!  Sou a Lunar, sua bot assistente.  Para mais informações sobre a Moonlight API acesse https://moonlight-api.onrender.com`);
});

async function resetRequest() {
const agora = new Date();
const horas = agora.getHours();
const minutos = agora.getMinutes();
const segundos = agora.getSeconds();

if (horas === 0 && minutos === 0 && segundos === 0) {
try {
await User.updateMany({ isAdm: true }, { saldo: 100000 });
await User.updateMany({ isPremium: true }, { saldo: 10000 });
await User.updateMany({ isGold: true }, { saldo: 30000 });
await User.updateMany({ isLite: true }, { saldo: 1000 });
await User.updateMany({ isAdm: false, isPremium: false, isGold: false, isLite: false }, { saldo: 100 });
bot.telegram.sendPhoto(
"7801551329",
"https://files.catbox.moe/qs6ahh.png",
{
caption: `As request dos usuários foram reiniciadas com sucesso`,
parse_mode: "Markdown",
reply_markup: {inline_keyboard: [[
{ text: "Moonlight Api", url: apiLink },
{ text: "SpeedCloud", url: `https://speedhosting.cloud` }
]]}});
} catch (err) {
console.error('Erro ao resetar requests:', err);
}
}
}
setInterval(resetRequest, 1000);
bot.on('text', async (ctx) => {

const chatId = ctx.message.chat.id;
const prefix = PREFIX;
const from = ctx;

const comando = ctx.state.command;
if (!comando) return;

switch (comando) {
case 'menu':
infoD = `╭━━━〔 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 〕━━━╮
┃  ⃟🌙๋࿆.•۟  play (nome da música)
┃  ⃟🌙๋࿆.•۟  play2 (nome da música)
╰━━━━━━━━━━━━━━━╯
╭━━━〔 𝐈 𝐀 〕━━━╮
┃  ⃟🌙๋࿆.•۟  gemini (texto)
┃  ⃟🌙๋࿆.•۟  gpt (texto)
╰━━━━..━━━━━━╯
╭━━━〔 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐃𝐎𝐍𝐎 〕━━━╮
┃  ⃟🌙๋࿆.•۟  username (nome do usuário/item)
┃  ⃟🌙๋࿆.•۟  password (nome do usuário/item)
┃  ⃟🌙๋࿆.•۟  key (nome do usuário/item)
┃  ⃟🌙๋࿆.•۟  saldo (nome do usuário/item)
┃  ⃟🌙๋࿆.•۟  level (nome do usuário/item)
┃  ⃟🌙๋࿆.•۟  apagaruser (nome do usuário)
┃  ⃟🌙๋࿆.•۟  user (nome do usuário)
╰━━━━━━━━━━━━━━━━━━╯`,
await bot.telegram.sendPhoto(ctx.chat.id, fotoMenu, {
caption: infoD,
reply_markup: {
inline_keyboard: [
[{ text: `SpeedCloud`, url: `https://speedhosting.cloud` }],
[{ text: `Moonlight API`, url: apiLink }]
]}})
break;

case 'apagaruser':
if (!isDono) return enviar(ctx, msg.dono);
if (!q) return enviar(ctx, "Falta o nome do usuário")
try {
s = await deletarUsuario(q);
enviar(ctx, s)
} catch (e) {
consoleErro(e)
enviar(ctx, "Deu erro")
}
break

case 'username':
case 'password':
case 'key':
case 'saldo':
case 'level': {
if (!isDono) return enviar(ctx, msg.dono);
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
const user = await User.findOne({ username: q });
ctx.replyWithPhoto({ url: user.ft }, {
caption: `Nome: ${user.username}
Senha: ${user.password}
ApiKey: ${user.key}
Request: ${user.saldo}
Level: ${user.level}
Lite: ${user.isLite ? "sim" : "não"}
Basico: ${user.isBasico ? "sim" : "não"}
Premium: ${user.isPremium ? "sim" : "não"}
Gold: ${user.isGold ? "sim" : "não"}
${user.isAdm ? "Usuário administrador" : ""}`,
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
sla9()
}
}
break;
//COMANDOS PARA OS USUÁRIOS 

case 'play':
try {
if (!ctx.message.text.includes(' ')) {return ctx.reply('Por favor, insira o nome da música após o comando.');}
data1 = await ytsearch(q)
api2 = data1.resultado[0];
const audioUrl = await ytMp3(api2.url)
enviar(from, `Enviando ${api2.title}...`)
ctx.replyWithPhoto({ url: api2.image }, {
caption: `*lıl.ılı.lıll「🎶 ᏞႮΝᎪᎡ ᎠϴᏔΝᏞϴᎪᎠ 🎶」llı.ıllı.ılı*
                ↻     ⊲  Ⅱ  ⊳     ↺
             
📄⃟ 𝚃𝚒𝚝𝚞𝚕𝚘: ${api2.title}
🕑⃟ 𝙳𝚞𝚛𝚊𝚌𝚊𝚘: ${api2.timestamp}
📱⃟ 𝙲𝚊𝚗𝚊𝚕: ${api2.author.name}
🟢⃟ 𝙳𝚎𝚜𝚌𝚛𝚒𝚌𝚊𝚘: ${api2.description}
🎭⃟ 𝙲𝚛𝚒𝚊𝚍𝚘𝚛: ${donoName}\n\n
Estou enviando seu áudio espere um momento...
`,});
await ctx.replyWithAudio({ url: audioUrl });
} catch (error) {
console.error(error);
ctx.reply(msg.error);}
break

case 'play2':
try {
if (!ctx.message.text.includes(' ')) {return ctx.reply('Por favor, insira o nome da música após o comando.');}
data1 = await ytsearch(q)
api2 = data1.resultado[0];
const audioUrl = await ytMp3(api2.url)
enviar(from, `Enviando ${api2.title}...`)
await ctx.replyWithAudio({ url: audioUrl });
} catch (error) {
console.error(error);
ctx.reply(msg.error);}
break

//INTELIGÊNCIAS ARTIFICIAIS 
case 'gpt':
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/turbo-ai?content= &text=${encodeURIComponent(q)}`)
enviar(ctx, result.content)
break
case 'gemini':
gg = await gemini(q)
console.log(gg)
enviar(ctx, gg.resposta)
break

///////\\/\/\/\/\/\/\/\/\////////\/\/\/\/\/\/////\\\\\\\
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

// ============== ROTAS DE CONFIGURACAO DA API ==============\\

app.get("/api/top", async (req, res) => {
const topUsers = await User.find({})
  .select('username level ft wallpaper saldo isAdm isPremium isLite isGold isPlano')
  .lean()

topUsers.forEach(user => { user.level = parseFloat(user.level) || 0; });
topUsers.sort((a, b) => b.level - a.level);

 res.json({ top: topUsers.slice(0, 6) });
})

app.get('/dashboard', async (req, res) => {
const user = req.session.user;
if (!user) {
return res.render('login', { aviso: false, aviso2: null });
}
const { username, password } = user;
try {
const userDb = await User.findOne({ username, password });
const quantidadeRegistrados = await User.countDocuments();
const topUsers = await User.find().sort({ level: -1 }).limit(5);
return res.render('dashboard', { Junim: true, msgAdm2, user, userDb, topUsers, quantidade: quantidadeRegistrados, aviso: false, aviso2: null });
} catch (error) {
console.error('Erro ao processar a rota:', error);
return res.status(500).send('Erro interno ao processar a rota.');
}
});

app.get('/myperfil', async (req, res) => {
const user = req.session.user;
if (user) {
const { username, password } = user;
const userDb = await User.findOne({ username, password });
const users = userDb;
const quantidadeRegistrados = await User.countDocuments();
const topUsers = await User.find().sort({ level: -1 }).limit(7);
return res.render('myperfil', { user, userDb, users, topUsers, quantidade: quantidadeRegistrados });
}
});

app.get('/search', async (req, res) => {
const searchTerm = req.query.search || '';
try {
const searchResults = await User.find({ username: { $regex: searchTerm, $options: 'i' } });
return res.render('search', { searchTerm, searchResults });
} catch (error) {
console.error('Erro ao buscar usuários:', error);
return res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
}
});

app.post('/register', async (req, res) => {
try {
const { username, password } = req.body;
const existingUser = await User.findOne({ username });
if (existingUser) {
return res.render('register', { aviso: true, aviso2: "Nome de usuário já existe. Por favor, escolha outro." });
}
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
const keycode = Math.floor(100000 + Math.random() * 900000).toString();
const ft = "https://i.pinimg.com/originals/e0/63/ee/e063ee69b75d8502aad9218e648db8e2.jpg";
const saldo = 100; 
const level = 0;
const key = `Moon_${keycode}`;
const insta = "https://www.instagram.com/moonlight_juliana"
const zap = "5511999999"
const yt = "https://m.youtube.com/@Moonlight_Devs"
const wallpaper = "https://files.catbox.moe/9rhpzu.jpg"
let dd;
if (admList.includes(username)) { dd = true; } else { dd = false; }
const user = new User({ username, password, key, saldo, level, ft, zap, insta, yt, wallpaper, isAdm: dd, isPremium: dd, isGold: dd });
await user.save();
bot.telegram.sendPhoto(
  "7801551329", 
  "https://files.catbox.moe/qs6ahh.png", 
  {
    caption: `O usuário "${username}" acabou de fazer um registro, mais informações abaixo:\n
Nome: ${username}
Senha: ${password}
Adm: ${dd}
Request: ${saldo}
ApiKey: Moon\\_${keycode}`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Moonlight Api", url: apiLink },
          { text: "SpeedCloud", url: `https://speedhosting.cloud` }
        ]
      ]
    }
  }
);
req.session.user = user;
res.redirect('/dashboard');

} catch (error) {
console.error(error);
res.status(500).json({ message: 'Erro ao registrar usuário.' });
}
});

app.post('/login', async (req, res) => {
const { username, password } = req.body;
const senha = password
const user = await User.findOne({ username });
if (user) {
try {
if (user.password !== senha) {
return res.render('login', { aviso: true, aviso2: "Senha incorreta. Por favor, tente novamente." });
}
req.session.user = user;
res.redirect('/dashboard');
} catch (error) {
console.error('Erro ao acessar o banco de dados:', error);
return res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
}
} else {
res.render('login', { aviso: true, aviso2: "Este usuário não está presente aqui...." });
}

})

app.get('/admin', async (req, res) => {
const user = req.session.user;
if (user) {
try {
const isAdmin = await User.findOne({ _id: user._id, isAdm: true });
if (isAdmin) {
const users = await User.find();
return res.render('adminDashboard', { users, user });
} else {
return res.sendFile(htmlPath);
}
} catch (error) {
console.error('Erro ao acessar usuários:', error);
return res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
}
} else {
return res.sendFile(htmlPath);
}
});


app.get('/editar/:username', async (req, res) => {
const { user: currentUser, senha: currentPassword } = req.session;
const { username: targetUsername } = req.params;
const specialKey = 'Moonlight';
try {
const user = await User.findOne({ username: targetUsername });
if (!user) {
return res.status(404).send('Usuário não encontrado.');
}
const isAdminOrSpecialUser = currentUser.isAdm || currentUser.key === specialKey;
if (!isAdminOrSpecialUser && (user.key !== currentPassword || user.username !== currentUser.username)) {
return res.status(401).send('Acesso não autorizado para editar.');
}
res.render('edit', { user });
} catch (error) {
console.error('Erro ao acessar o banco de dados:', error);
return res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
}
});

app.get('/deletar/:username', async (req, res) => {
const { user: currentUser, senha: currentPassword } = req.session;
const { username: targetUsername } = req.params;
const specialKey = 'Moonlight';
try {
const user = await User.findOne({ username: targetUsername });
if (!user) {
return res.status(404).send('Usuário não encontrado.');
}
const isAdminOrSpecialUser = currentUser.isAdm || currentUser.key === specialKey;
if (!isAdminOrSpecialUser && (user.key !== currentPassword || user.username !== currentUser.username)) {
return res.status(401).send('Acesso não autorizado para deletar.');
}
await User.deleteOne({ username: targetUsername });
res.redirect('/dashboard');
} catch (error) {
console.error('Erro ao acessar o banco de dados:', error);
return res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
}
});


app.post('/edit/:username', async (req, res) => {
const { username } = req.params;
const { username2, password, key, ft, saldo, level, isAdm, isPremium, isGold, isLite, tempoPlano, isBanido, isPlano } = req.body;
try {
const user = await User.findOne({ username });
if (!user) {
return res.status(404).send('Usuário não encontrado.');
}
const isAdmValue = isAdm === 'true';
const isPremiumValue = isPremium === 'true';
const isGoldValue = isGold === 'true';
const isLiteValue = isLite === 'true';
const isBanidoValue = isBanido === 'true';
const isPlanoValue = isPlano === 'true';
user.username = username2 || user.username;
user.password = password || user.password;
user.key = key || user.key;
user.ft = ft || user.ft;
user.saldo = saldo || user.saldo;
user.tempoPlano = tempoPlano || user.tempoPlano;
user.isPlano = isPlanoValue;
user.isAdm = isAdmValue;
user.isPremium = isPremiumValue;
user.isGold = isGoldValue;
user.isLite = isLiteValue;
user.isBanido = isBanidoValue;
user.level = level || user.level;
await user.save();
return res.redirect('/dashboard');
} catch (error) {
console.error('Erro ao acessar o banco de dados:', error);
return res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
}
});


app.post('/editarr/:username', async (req, res) => {
const { username } = req.params;
const { password, key, ft, insta, wallpaper, zap, yt } = req.body;
try {
const user = await User.findOne({ username });
if (!user) {
return res.status(404).send('Usuário não encontrado.');
}
user.password = password || user.password;
user.key = key || user.key;
user.ft = ft || user.ft;
user.yt = yt || user.yt;
user.insta = insta || user.insta
user.zap = zap || user.zap
user.wallpaper = wallpaper || user.wallpaper
await user.save();
return res.render('login', { aviso: false, aviso2: null });
} catch (error) {
console.error('Erro ao acessar o banco de dados:', error);
return res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
}
});
// ============== ROTAS NORMAIS DA API ==============\\

//======[ DOWNLOAD ]======\\

app.get("/api/download/ytMp3", async (req, res) => {
const url = req.query.url
if (!url) return res.status(500).send("Parâmetro url obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
const yt = await ytMp3(url)
res.setHeader('Content-Type', 'audio/mpeg');
request.get(yt).pipe(res);
})

app.get("/api/download/ytMp4", async (req, res) => {
const url = req.query.url
if (!url) return res.status(500).send("Parâmetro url obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
const yt = await ytMp4(url)
res.setHeader('Content-Type', 'video/mp4');
request.get(yt).pipe(res);
})

app.get("/api/download/play", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
ytMp3Query(query).then((data) => {
res.setHeader('Content-Type', 'audio/mpeg');
request.get(data).pipe(res);
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/playvd", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
ytMp4Query(query).then((data) => {
res.setHeader('Content-Type', 'video/mp4');
request.get(data).pipe(res);
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/audiomeme", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
audiomeme(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/apkpure", async (req, res) => {
const url = req.query.url
if (!url) return res.status(500).send("Parâmetro url obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
apkpureDl(url).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/xvideos", async (req, res) => {
const url = req.query.url
if (!url) return res.status(500).send("Parâmetro url obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
xvideosDl(url).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/instagram", async (req, res) => {
const url = req.query.url
if (!url) return res.status(500).send("Parâmetro url obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
instagramDl(url).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/tiktok", async (req, res) => {
const url = req.query.url
if (!url) return res.status(500).send("Parâmetro url obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
tiktokDl(url).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/tiktokUser", async (req, res) => {
const { name, apikey } = req.query
if (!name) return res.status(500).send("Parâmetro name obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/tiktok-user-posts?user=${name}`)
res.json({
status: "online",
criadora,
resultado: result.data.videos
})

} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/tiktokImages", async (req, res) => {
const { url, apikey } = req.query
if (!url) return res.status(500).send("Parâmetro url obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/tiktok-images?url=${url}`)
res.json({
status: "online",
criadora,
resultado: {
titulo: result.title,
username: result.username,
musica: result.music,
perfil: result.profile,
imagens: result.images
}
})

} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/instagramDl", async (req, res) => {
const { url, apikey } = req.query
if (!url) return res.status(500).send("Parâmetro url obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/instagram-DL?url=${url}`)
res.json({
status: "online",
criadora,
resultado: result.data
})

} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/Facebook", async (req, res) => {
const { url, apikey } = req.query
if (!url) return res.status(500).send("Parâmetro url obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/facebook?url=${url}`)
res.json({
status: "online",
criadora,
resultado: {
qualidade: result[0].quality,
download: result[0].link_sd
}
})

} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/download/CupCutDl", async (req, res) => {
const { url, apikey } = req.query
if (!url) return res.status(500).send("Parâmetro url obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/capcut-DL?url=${url}`)
res.json({
status: "online",
criadora,
resultado: {
titulo: result.title,
imagem: result.thumbnail,
tamanho: result.size,
download: result.video
}
})

} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

//======[ PESQUISA ]======\\

app.get("/api/pesquisa/youtube", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
ytsearch(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/xvideos", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
xvideosQuery(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/tiktok", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
tiktokQuery(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/amazon", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
amazon(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/wikipedia", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
wikipedia(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/aptoide", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
aptoide(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/apkPureQuery", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
apkpureQuery(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/pinterest", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
Pinterest(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/PinterestMultiMidia", async (req, res) => {
const url = req.query.url
if (!url) return res.status(500).send("Parâmetro url obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
PinterestMultiMidia(url).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/Playstore", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
Playstore(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/pesquisa/wallpaper", async (req, res) => {
const query = req.query.query
if (!query) return res.status(500).send("Parâmetro query obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
wallpaper(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

//======[ CANVA ]======\\

app.get("/api/canva/bemVindo", async (req, res) => {
const {titulo, avatar, fundo, desc, nome} = req.query
if (!titulo || !avatar || !fundo || !desc || !nome) return res.status(500).send("Parâmetro titulo, avatar, fundo, desc, nome são obrigatórios")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
data = await CanvabemVindo(titulo, avatar, fundo, desc, nome);
const response = await axios.get(data, { responseType: "arraybuffer" });

  res.setHeader("Content-Type", response.headers["content-type"]);

  res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

app.get("/api/canva/level", async (req, res) => {
const {avatar, fundo, nome, level1, level2} = req.query
if (!nome || !avatar || !fundo || !level1) return res.status(500).send("Parâmetro nome, avatar, fundo, level1, level2 são obrigatórios")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
data = await canvaLevel(avatar, fundo, nome, level1, level2);
const response = await axios.get(data, { responseType: "arraybuffer" });

  res.setHeader("Content-Type", response.headers["content-type"]);

  res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

app.get("/api/canva/musicCard", async (req, res) => {
const {avatar, artistName, time, name} = req.query
if (!avatar || !artistName || !time || !name) return res.status(500).send("Parâmetro avatar, artistName, time, name são obrigatórios")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
data = await canvaMusicCard(avatar, artistName, time, name);
const response = await axios.get(data, { responseType: "arraybuffer" });

  res.setHeader("Content-Type", response.headers["content-type"]);

  res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

app.get("/api/canva/musicCard2", async (req, res) => {
const {avatar, name, artistName} = req.query
if (!avatar || !name || !artistName) return res.status(500).send("Parâmetro avatar, name, artistName são obrigatórios")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
data = await canvaMusicCard2(avatar, name, artistName)
const response = await axios.get(data, { responseType: "arraybuffer" });

  res.setHeader("Content-Type", response.headers["content-type"]);

  res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

app.get("/api/canva/montagem/:nome", async (req, res) => {
const nome = req.params.nome
const link = req.query.url
if (!link) return res.status(500).send("Parâmetro url e obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
data = await canvaMontagem(nome, link)
const response = await axios.get(data, { responseType: "arraybuffer" });
res.setHeader("Content-Type", response.headers["content-type"]);
res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

//======[ +18 ]======\\

app.get("/api/18/:nome", async (req, res) => {
const nome = req.params.nome
if (!nome) return res.status(500).send("Parâmetro nome obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
Hentaizinho(nome).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/1-8/:nome", async (req, res) => {
const nome = req.params.nome
if (!nome) return res.status(500).send("Parâmetro nome obrigatório")
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
Hentaizinho2(nome).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

//======[ IMAGEM ]======\\

app.get("/api/imagem/metadinha", async (req, res) => {
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
metadinha().then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/imagem/metadinha2", async (req, res) => {
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
metadinha2().then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/imagem/travaZapImg", async (req, res) => {
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
travaZapImg().then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/imagem/travaZapImg2", async (req, res) => {
const apikey = req.query.apikey;
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
travaZapImg2().then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/imagem/logo/:logoName", async (req, res) => {
 const { apikey, query } = req.query;
 const logoName = req.params.logoName;

 if (!apikey) return res.status(400).json({ erro: "Parâmetro 'apikey' é obrigatório" });
 if (!query) return res.status(400).json({ erro: "Parâmetro 'query' é obrigatório" });

 const infoUser = await diminuirSaldo(apikey);
 if (infoUser) {
  return res.render('error', { aviso: false, aviso2: infoUser });
 }

 try {
  const dd = await logo(logoName, query)
  const response = await axios.get(dd, { responseType: "arraybuffer" });

  res.setHeader("Content-Type", response.headers["content-type"]);

  res.send(response.data);
 } catch (e) {
  res.status(500).json({
   status: "offline",
   erro: "Erro ao buscar a imagem"
  });
 }
});

//========[ INTELIGÊNCIAS ]========\\

app.get("/api/ai/texto/gemini", async (req, res) => {
const {apikey, query} = req.query;
if (!query) return res.status(500).send("Parâmetro query é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
gemini(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/ai/texto/chatGpt", async (req, res) => {
const {apikey, query} = req.query;
if (!query) return res.status(500).send("Parâmetro query é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/turbo-ai?content= &text=${encodeURIComponent(query)}`)
res.json({
starus: "online",
criadora,
resultado: result.content
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/ai/texto/gptPrompt", async (req, res) => {
const {apikey, query, prompt} = req.query;
if (!query) return res.status(500).send("Parâmetro query é obrigatório")
if (!prompt) return res.status(500).send("Parâmetro prompt é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/turbo-ai?content=${encodeURIComponent(prompt)}&text=${encodeURIComponent(query)}`)
console.log(result)
res.json({
starus: "online",
criadora,
resultado: result.content
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get('/api/ai2/texto/:modelo', async (req, res) => {
const { modelo } = req.params;
var { query } = req.query;
if (!query) return res.status(400).json({ erro: 'texto é necessário' });
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

if (modelo === "llma") {
model = "@cf/meta/llama-3.2-3b-instruct"
} else if (modelo === "llama2") {
model = "@cf/meta/llama-3.1-8b-instruct"
} else if (modelo === "mistral") {
model = "@cf/mistral/mistral-7b-instruct-v0.1"
} else if (modelo === "sqlcode") {
model = "@cf/defog/sqlcoder-7b-2"
} else if (modelo === "deepseek") {
model = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b"
} else if (modelo === "deepseek-code") {
model = "@hf/thebloke/deepseek-coder-6.7b-instruct-awq"
}
run(model, { messages: [ { role: "system", content: " " }, { role: "user", content: query }, ], }).then((response) => {
return res.json({
status: 'true',
criadora,
resultado: {
modelo: `${modelo} AI`,
resposta: response.result.response
}
});
});

} catch (error) {
console.error('Erro ao buscar dados da API:', error);
return res.json({
status: 'false',
criadora,
resultado: {
resposta: msgApi.erro
}
});
}
});

app.get("/api/ai/imagem/similar", async (req, res) => {
const {apikey, url} = req.query;
if (!url) return res.status(500).send("Parâmetro url é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/face-similar?url=${url}`)
nomeD = result.name.replace("Tienes un Parecido Con ", "")
res.json({
starus: "online",
criadora,
resultado: {
nome: `Parce o/a ${nomeD}`,
similar: result.similar,
imagem: result.imagem,
outros: result.others
}
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

app.get("/api/ai/imagem/imagemAi", async (req, res) => {
const {apikey, query} = req.query;
if (!query) return res.status(500).send("Parâmetro query é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await imagemAi(query)
console.log(result)
const response = await axios.get(result.resultado.imagem, { responseType: "arraybuffer" });
res.setHeader("Content-Type", response.headers["content-type"]);
res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

app.get("/api/ai/imagem/colorAi", async (req, res) => {
const {apikey, url} = req.query;
if (!url) return res.status(500).send("Parâmetro url é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/colorize-ai?url=${url}`)
const response = await axios.get(result.url, { responseType: "arraybuffer" });
res.setHeader("Content-Type", response.headers["content-type"]);
res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

app.get("/api/ai/imagem/TextoToImg", async (req, res) => {
const {apikey, query} = req.query;
if (!query) return res.status(500).send("Parâmetro query é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
result = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/txt-to-image2?text=${query}`)
console.log(result)
const response = await axios.get(result.data.image, { responseType: "arraybuffer" });
res.setHeader("Content-Type", response.headers["content-type"]);
res.send(response.data);
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
console.log(e)
}
})

app.get("/api/ai/sricker/stickAi", async (req, res) => {
const {apikey, query} = req.query;
if (!query) return res.status(500).send("Parâmetro query é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
stickAi(query).then((data) => {
res.json({
data
})
})
} catch (e) {
res.json({
status: "offline",
criadora,
erro: "Deu erro na sua solicitação"
})
}
})

////★・・・・・・★・・・ FIGURINHAS ・・・★・・・・・・★

app.all('/api/sticker/emojimix', async (req, res) => {
try {
const { emoji1, emoji2 } = req.query;
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
let api = await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
let d = await api.json();
let imgUrl = d.results[0].media_formats.png_transparent.url;
res.json({ 
status: true, 
criadora,
resultado: {
emoji1,
emoji2,
type: "sticker",
emojimixUrl: imgUrl
} });
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
})

app.all('/api/sticker/emojimix2', async (req, res) => {
 try {
  const { apikey, emoji } = req.query;
  if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });

  infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });

  try {
   let api = await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji)}`);
   let data = await api.json();

   if (!data.results || data.results.length === 0) {
    return res.status(404).json({ erro: "Nenhum sticker encontrado para esse emoji." });
   }

   let stickers = data.results.map(item => ({
    tags: item.tags,
    stickerUrl: item.media_formats.png_transparent.url
   }));

   res.json({
    status: true,
    criadora,
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


app.all('/api/sticker/figu_emoji', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 102)
 res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/Figurinha-emoji/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })

app.all('/api/sticker/figu_desenho2', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 102)
 res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/anya-bot/master/Figurinhas/figu_flork/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })

app.all('/api/sticker/figu_aleatori', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 8051)
 res.send(await getBuffer(`https://raw.githubusercontent.com/badDevelopper/Testfigu/master/fig (${rnd}).webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
} catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })
app.all('/api/sticker/figu_memes', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 109)
 res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/Figurinha-memes/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
} catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })
 
app.all('/api/sticker/figu_anime', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 109)
 res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/figurinha-anime/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })
 
app.all('/api/sticker/figu_coreana', async (req, res) => {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 43)
 res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/figurinha-coreana/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 })
app.all('/api/sticker/figu_bebe', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 17)
 res.send(await getBuffer(`https://raw.githubusercontent.com/badDevelopper/Apis/master/pack/figbebe/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })
 
app.all('/api/sticker/figu_desenho', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 50)
 res.send(await getBuffer(`https://raw.githubusercontent.com/Scheyot2/sakura-botv6/master/FIGURINHAS/figurinha-desenho/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })
 
app.all('/api/sticker/figu_animais', async (req, res) => {
try {
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
 try {
 res.type('png')
 var rnd = Math.floor(Math.random() * 50)
 res.send(await getBuffer(`https://raw.githubusercontent.com/badDevelopper/Apis/master/pack/figanimais/${rnd}.webp`))
 } catch (e) {
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
 })

//FEITAS POR PEDROZZ MODS

app.all('/api/sticker/:nomesFigu', async (req, res) => {
try {
const { nomesFigu } = req.params;
const { apikey } = req.query; 
if (!apikey) return res.status(400).json({ erro: 'API Key é necessária' });
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
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
 res.send("Deu erro na sua solicitação")
 console.log(e)
 }
 } catch (error) {
console.error('Erro no endpoint:', error);
res.status(500).json({ status: false, mensagem: "Erro interno ao processar a solicitação." });
}
}) 
//MOON AI CHAT 
app.post('/send', async (req, res) => {

const speed = require('performance-now');
const prefix = "/";
const botName = '𝐊𝐘𝐓𝐓𝐘 𝐁𝐎𝐓'
const emoji = '👑'

if(hora > "00:00:00"){
var timed = '𝐁𝐨𝐚 𝐌𝐚𝐝𝐫𝐮𝐠𝐚𝐝𝐚 🌆' 
} 
if(hora > "05:00:00"){
var timed = '𝐁𝐨𝐦 𝐃𝐢𝐚 🏙️' 
}
if(hora > "12:00:00"){
var timed = '𝐁𝐨𝐚 𝐓𝐚𝐫𝐝𝐞 🌇' 
}
if(hora > "19:00:00"){
var timed = '𝐁𝐨𝐚 𝐍𝐨𝐢𝐭𝐞 🌃' 
} 
    const command = req.body.command;
    const parts = command.split(' ');
    const baseCommand = parts[0].substring(prefix.length);
    const q = parts.slice(1).join(' ');

    let response;

    const enviar = (texto) => {
        response = texto;
    }

    const esperar = async (tempo) => {
        return new Promise(funcao => setTimeout(funcao, tempo));
    }

    // Verificação para comandos sem prefixo
    if (command.toLowerCase() === 'oi') {
        response = `Olá 👋 usuário`;
    } else if (command.toLowerCase() === 'olá') {
        response = `Oi 👋 usuário`;
    } else if (command.toLowerCase() === 'moon') {
        response = `Este e minha criadora 😌`;
    } else if (command.toLowerCase() === 'bom dia') {
        response = `Bom dia usuário 🤗`;
    } else if (command.toLowerCase() === 'boa tarde') {
        response = `Boa tarde usuário 🤗`;
    } else if (command.toLowerCase() === 'boa noite') {
        response = `Boa noite usuário 🤗`;
    } else if (command.toLowerCase() === 'comunidade') {
        response = ` Aqui o link: <br>https://chat.whatsapp.com/IeINkpVR5C3HTM6Gwe0Onv`;        
    } else if (command.toLowerCase().includes('bot')) {
        response = `𝐏𝐫𝐚𝐳𝐞𝐫 𝐦𝐞 𝐜𝐡𝐚𝐦𝐨 𝐊𝐢𝐭𝐭𝐲 𝐮𝐦𝐚 𝐜𝐡𝐚𝐭 𝐛𝐨𝐭 𝐟𝐞𝐢𝐭𝐚 𝐩𝐚𝐫𝐚 𝐬𝐮𝐚𝐬 𝐧𝐞𝐜𝐞𝐬𝐬𝐢𝐝𝐚𝐝𝐞𝐬 🥰`;
    } else {
switch (baseCommand) {
//COMEÇO DOS COMANDOS DO BOT
case 'imagine':

break
//
case 'voz':
response = { type: 'image', url: fotoMenu };
break
//
case 'midias':
response = { type: 'video', url: `${BaseApiDark}/api/download/youtube-video?url=${api.url}&apikey=pedrozz1&username=pedrozzMods` };
response = { type: 'audio', url: `${BaseApiDark}/api/download/youtube-audio?url=${api.url}&apikey=pedrozz1&username=pedrozzMods` }
response = { type: 'image', url: api };
break
//FIM DOS COMANDO DO BOT
default:
enviar(`comando não existe`)
}
}

res.json(response);
});

//EJS
app.get('/login', (req, res) => {
res.render('login', { aviso: false, aviso2: null });
});

app.get('/register', (req, res) => {
res.render('register', { aviso: false, aviso2: null });
});

//HTML
app.get('/planos', (req, res) => res.sendFile(__dirname + '/public/plano.html'));
app.get('/MoonAi', (req, res) => res.sendFile(__dirname + '/public/aiMoon.html'));
app.get('/ko', (req, res) => res.sendFile(__dirname + '/public/ko.html'));
app.get('/Moondownload', (req, res) => res.sendFile(__dirname + '/public/d.html'));
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

app.get("*", function(req, res) {
res.sendFile(htmlPath);
})

// ============== ROTAS NORMAIS DA API ==============\\

app.listen(3000, () => {
//console.log(banner.string, banner2.string, banner3.string)
consoleOnline("Server rodando: http://localhost:3000")
bot.launch().then(() => {
consoleSucesso('Bot iniciado');
}).catch(err => {
console.error('Erro ao iniciar o bot:', err);
});
consoleOnline('O bot acaba de ser iniciado');
})

mongoose
 .connect(tokenDB, {
 useNewUrlParser: true,
 useUnifiedTopology: true,
 })
 .then(() => consoleOnline('Conectado ao MongoDB'))
 .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

module.exports = app
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
consoleAviso(`A index da api foi atualizado estou reiniciando para salvar as alterações`)
process.exit()
})

fs.watchFile("./dados/scraper.js", () => {
fs.unwatchFile(file)
consoleAviso(`Os scraper da api foi atualizado estou reiniciando para salvar as alterações`)
process.exit()
})
