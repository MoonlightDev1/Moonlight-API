/* @CLOVERMYT */

// Canal: https://youtube.com/@clovermyt

// Canal WhatsApp: https://whatsapp.com/channel/0029Va974hY2975B61INGX3Q

// Instagram: https://www.instagram.com/clovermods?igsh=MmcyMHlrYnhoN2Zk

// Telegram: t.me/cinco_folhas

// Comunidade WhatsApp: https://chat.whatsapp.com/Kc5HLGCIokb37mA36NJrM6

// SE FOR REPOSTAR ME MARCA 🧙‍♂️🍀

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
const { token } = require("./config.js");
const msgAdm = true;
const msgAdm2 = "Sejam Todos bem-vindos a nossa rest Api's";
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

async function resetRequest() {
const agora = new Date();
const horas = agora.getHours();
const minutos = agora.getMinutes();
const segundos = agora.getSeconds();

if (horas === 0 && minutos === 0 && segundos === 0) {
try {
await User.updateMany({ isAdm: true }, { request: 100000 });
await User.updateMany({ isPremium: true }, { request: 10000 });
await User.updateMany({ isGold: true }, { request: 30000 });
await User.updateMany({ isLite: true }, { request: 1000 });
await User.updateMany({ adm: false, premium: false }, { request: 100 });
consoleVerde2("[ USUÁRIO ]", "As requests dos usuários foram reiniciadas")
} catch (err) {
console.error('Erro ao resetar requests:', err);
}
}
}
setInterval(resetRequest, 1000);
// ============== ROTAS DE CONFIGURACAO DA API ==============\\

app.get('/dashboard', async (req, res) => {
const user = req.session.user;
if (!user) {
return res.render('login', { aviso: false, aviso2: null });
}
const { username, password } = user;
try {
const userDb = await User.findOne({ username, password });
const quantidadeRegistrados = await User.countDocuments();
const topUsers = await User.find().sort({ saldo: -1 }).limit(5);
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
const key = keycode;
const insta = "https://www.instagram.com/moonlight_juliana"
const zap = "5511999999"
const yt = "https://m.youtube.com/@Moonlight_Devs"
const wallpaper = "https://files.catbox.moe/9rhpzu.jpg"
let dd;
if (admList.includes(username)) { dd = true; } else { dd = false; }
const user = new User({ username, password, key, saldo, level, ft, zap, insta, yt, wallpaper, isAdm: dd, isPremium: dd, isGold: dd });
await user.save();
console.log(user)
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
const { username2, password, key, ft, saldo, level, isAdm, isPremium, isGold, isLite, tempoPlano, isBanido } = req.body;
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
user.username = username2 || user.username;
user.password = password || user.password;
user.key = key || user.key;
user.ft = ft || user.ft;
user.saldo = saldo || user.saldo;
user.tempoPlano = tempoPlano || user.tempoPlano;
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

app.get("/api/ai/gemini", async (req, res) => {
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

app.get("/api/ai/imagemAi", async (req, res) => {
const {apikey, query} = req.query;
if (!query) return res.status(500).send("Parâmetro query é obrigatório")
if (!apikey) return res.status(500).send("Parâmetro apikey é obrigatório")
infoUser = await diminuirSaldo(apikey)
if (infoUser) return res.render('error', { aviso: false, aviso2: infoUser });
try {
imagemAi(query).then((data) => {
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

app.get("/api/ai/stickAi", async (req, res) => {
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

//EJS
app.get('/login', (req, res) => {
res.render('login', { aviso: false, aviso2: null });
});

app.get('/register', (req, res) => {
res.render('register', { aviso: false, aviso2: null });
});

//HTML
app.get('/planos', (req, res) => res.sendFile(__dirname + '/public/plano.html'));

app.get('/ko', (req, res) => res.sendFile(__dirname + '/public/ko.html'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

app.get("*", function(req, res) {
res.sendFile(htmlPath);
})

// ============== ROTAS NORMAIS DA API ==============\\

app.listen(3000, () => {
//console.log(banner.string, banner2.string, banner3.string)
consoleOnline("Server rodando: http://localhost:3000")
})

mongoose
  .connect(token, {
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
