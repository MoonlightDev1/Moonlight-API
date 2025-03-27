/*
Projeto: Clara Base
Data: 05/03/25
Criador: PedrozzMods
Descrição: Um projeto para pessoas que estão começando a fazer bots
*/
//============( CONSTS NESCESSÁRIAS )===========\\
const fs = require('fs')
const chalk = require('chalk')
const moment = require('moment-timezone');
const axios = require('axios');
const fetch = require('node-fetch');
const os = require('os');
const speed = require('performance-now');
const cfonts = require('cfonts');
const request = require('request');
const { exec, spawn, execSync } = require('child_process');
const criadora = "Moonlight";
const botVersion = "1.4.0"

//============( MENSAGENS RAPIDAS )===========\\
const msg = {
dono: "Você precisa ser o dono pra poder usar esse comando",
query: "Acho que falta algo ai em...",
error: "Deu erro ao tenta solicitar ação"
}

//============( MENSAGENS DA API )===========\\
const msgApi = {
erro: "Desculpe, ocorreu um erro ao processar sua solicitação.",
paraQ: "Parece que falta um parâmetro obrigatório na sua solicitação.",
esperar: "Aguarde um momento enquanto processamos sua solicitação..."
}

//============( DATA E HORA )===========\\
const data = moment.tz('America/Sao_Paulo').format('DD/MM/YYYY');
const hora = moment.tz('America/Sao_Paulo').format('HH:mm:ss');

//============( MENSAGEM DE HORA )===========\\
if(hora > "00:00:00"){
var timed = 'Boa Madrugada 🌆' 
} 
if(hora > "05:30:00"){
var timed = 'Bom Dia 🏙️' 
}
if(hora > "12:00:00"){
var timed = 'Boa Tarde 🌇' 
}
if(hora > "19:00:00"){
var timed = 'Boa Noite 🌃' 
}           

//============( BANNER TERMINAL )===========\\
//CORES DO CONSOLE
var corzinhas = ["red", "green", "yellow", "blue", "magenta", "cyan", "white"]
const cor1 = corzinhas[Math.floor(Math.random() * (corzinhas.length))]	
const cor2 = corzinhas[Math.floor(Math.random() * (corzinhas.length))]
const cor3 = corzinhas[Math.floor(Math.random() * (corzinhas.length))]	
const cor4 = corzinhas[Math.floor(Math.random() * (corzinhas.length))]
const cor13 = corzinhas[Math.floor(Math.random() * (corzinhas.length))]	

const banner = cfonts.render("Moonlight|API", {
  font: 'tiny',
  align: 'center',
  colors: ['whiteBright', 'redBright']
});
const banner2 = cfonts.render((`${timed}`), {
font: 'console',
align: "center",
gradient: [`${cor3}`, `${cor4}`]
});                
const banner3 = cfonts.render((`©2025 Copyright by Pedrozz_Mods`), {
font: 'console',
align: 'center',
gradient: ['red', 'magenta']
});

//============( PING )===========\\
const cpuUsage = (os.loadavg()[0] * 100).toFixed(2);
const totalThreads = os.cpus().length;
const totalMemory = (os.totalmem() / Math.pow(1024, 3)).toFixed(2);
const freeMemory = (os.freemem() / Math.pow(1024, 3)).toFixed(2);
const nodeVersion = process.version;
const platform = os.platform();
const hostname = os.hostname();
let HostOuNao;
if (hostname === "localhost") {
HostOuNao = "Termux"
} else {
HostOuNao = "Hospedagem paga"
}

function formatTime(seconds) {
const days = Math.floor(seconds / (3600 * 24));
const hours = Math.floor((seconds % (3600 * 24)) / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const secs = Math.floor(seconds % 60);
return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

const uptime = process.uptime();

let timestamp = speed();
let latensi = speed() - timestamp;
const velocidadeBot = latensi.toFixed(4);

//============( CONSOLES )===========\\
//VERDE
const consoleVerde = (texto) => {console.log(chalk.green(texto))}
const consoleVerde2 = (texto, texto2) => {console.log(chalk.black(chalk.bgGreen(texto)), chalk.black(chalk.white(texto2)))}
//VERMELHO
const consoleVermelho = (texto) => {console.log(chalk.red(texto))}
const consoleVermelho2 = (texto, texto2) => {console.log(chalk.black(chalk.bgRed(texto)), chalk.black(chalk.white(texto2)))}
//AMARELO
const consoleAmarelo = (texto) => {console.log(chalk.yellow(texto))}
const consoleAmarelo2 = (texto, texto2) => {console.log(chalk.black(chalk.bgYellow(texto)), chalk.black(chalk.white(texto2)))}
//AZUL
const consoleAzul = (texto) => {console.log(chalk.blue(texto))}
const consoleAzul2 = (texto, texto2) => {console.log(chalk.black(chalk.bgBlue(texto)), chalk.black(chalk.white(texto2)))}
//CONSOLE DE ERRO
const consoleErro = (texto) => {console.log(chalk.black(chalk.bgRed(`[ ERRO ]`)), chalk.black(chalk.white(`Erro: ${texto}`)))}
//CONSOLE DE AVISO
//CONSOLE DE ERRO
const consoleInfo = (texto) => {console.log(chalk.black(chalk.bgBlue(`[ INFO ]`)), chalk.black(chalk.white(texto)))}
//CONSOLE DE AVISO
const consoleAviso = (texto) => {console.log(chalk.black(chalk.bgYellow(`[ AVISO ]`)), chalk.black(chalk.white(texto)))}
//CONSOLE DE SUCESSO
const consoleSucesso = (texto) => {console.log(chalk.black(chalk.bgGreen(`[ SUCESSO ]`)), chalk.black(chalk.white(texto)))}
//CONSOLE DE ONLINE 
const consoleOnline = (texto) => {console.log(chalk.black(chalk.bgGreen(`[ ONLINE ]`)), chalk.black(chalk.white(texto)))}

//============( GETBUFFER )===========\\
const getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}

//============( FETCHJSON )===========\\
async function fetchJson (url, options) {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

module.exports = { botVersion, msg, msgApi, consoleVerde, consoleVerde2, consoleVermelho, consoleVermelho2, consoleAmarelo, consoleAmarelo2, consoleAzul, consoleAzul2, consoleErro, consoleAviso, consoleInfo, consoleOnline, consoleSucesso, fetchJson, getBuffer, timed, data, hora, cpuUsage, totalThreads, totalMemory, freeMemory, nodeVersion, platform, hostname, HostOuNao, formatTime, uptime, velocidadeBot, latensi, timestamp, os, speed, banner, banner2, banner3 }