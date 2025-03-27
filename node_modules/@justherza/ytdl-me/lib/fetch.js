const axios = require("axios").default
const cheerio = require("cheerio")
const valid = require("./valid")
const onlyNumber = require("./onlyNumber")
const saveIdURL = require("./saveId")

const consoles = (logs) => {
  return {
    log: (message) => {
      logs === true ? console.log("LOGS  :", message) : ""
    },
    warn: (message) => {
      logs === true ? console.warn("WARN  :", message) : ""
    },
    error: (message) => {
      logs === true ? console.error("ERROR :", message) : ""
    }
  }
}

async function ytInfo({ yt_link }) {
  const _yt_va = valid.youtube_url(yt_link)

  if (!_yt_va.valid) {
    return Promise.reject("Link YouTube is not valid!")
  }

  try {
    const getFc = await axios.get(`https://youtube.com/watch?v=${_yt_va.id}`)
    const $ = cheerio.load(getFc.data)

    let tors = []
    $("body script").each((i, el) => {
      const texts = $(el).text()
      if (texts?.match("var ytInitialData = ")) {
        tors.push(texts)
      }
    })

    if (!tors.length) {
      return Promise.reject("Failed to extract YouTube data.")
    }

    const dataJs = tors[0].slice(20, tors[0].length - 1)
    const jsonData = JSON.parse(dataJs)
    const content = jsonData.contents.twoColumnWatchNextResults.results.results.contents
    const vid_content = content[0]?.videoPrimaryInfoRenderer || null
    const owne_conte = content[1]?.videoSecondaryInfoRenderer || null

    return {
      image: `https://i.ytimg.com/vi/${_yt_va.id}/hqdefault.jpg`,
      title: vid_content?.title?.runs?.[0]?.text || null,
      description: owne_conte?.attributedDescription?.content || null,
      view: vid_content?.viewCount?.videoViewCountRenderer?.viewCount?.simpleText 
        ? onlyNumber(vid_content.viewCount.videoViewCountRenderer.viewCount.simpleText) 
        : null,
      like: vid_content?.videoActions?.menuRenderer?.topLevelButtons?.[0]?.segmentedLikeDislikeButtonRenderer?.likeButton?.toggleButtonRenderer?.defaultText?.simpleText 
        ? onlyNumber(vid_content.videoActions.menuRenderer.topLevelButtons[0].segmentedLikeDislikeButtonRenderer.likeButton.toggleButtonRenderer.defaultText.simpleText) 
        : null,
      id: _yt_va.id,
      yt_url: `https://youtu.be/${_yt_va.id}?feature=share`,
      channel: {
        pp: owne_conte?.owner?.videoOwnerRenderer?.thumbnail?.thumbnails?.[0]?.url || null,
        name: owne_conte?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text || null,
        url_ch: owne_conte?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url 
          ? `https://youtube.com${owne_conte.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}` 
          : null
      }
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * 
 * @param {{ yt_link: string, yt_format: "720"|"1080"|"1440"|"mp3"|"ogg", logs: boolean, saveId: boolean}} param0 
 * @returns {{info:{image:string,title:string,description:string,view:number|null,like:number|null,id:string,yt_url:string,channel:{pp:string|null,name:string|null,url:string|null}},media:string}}
 */
async function downloadMedia({ yt_link, yt_format, logs = false, saveId = false } = {}) {
  return new Promise(async (resolve, reject) => {

    const _lg = consoles(logs)
    _lg.log("Save information, this function running with logs")

    const _yt_va = valid.youtube_url(yt_link)
    const _yt_vr = valid.format_download(yt_format)

    if (!_yt_va.valid) {
      _lg.error("Link youtube is not valid!")
      return reject("Link youtube is not valid!")
    }
    if (!_yt_vr.format) {
      _lg.error("Format is not accepted!")
      return reject("Format is not accepted!")
    }

    const configs = {
      process: valid.get_url_ajax("download"),
      info: valid.get_url_ajax("info") + `?${new URLSearchParams({
        url: `https://youtube.com/watch?v=${_yt_va.id}`,
        format: _yt_vr.format
      })}`
    }

    const ytdwnId = async () => {
      try {
        return (await axios.get(configs.info)).data.id
      } catch (err) {
        return err.stack
      }
    }

    _lg.log(configs)

    try {
      _lg.log("Running...")
      const getYt = await ytInfo({
        yt_link: `https://youtube.com/watch?v=${_yt_va.id}`
      })
      if (saveId === true) {
        _lg.log("Search url...")
        const saveIdURLs = saveIdURL.getURLDownload(_yt_va.id, _yt_vr.format)

        if (typeof saveIdURLs === "string") {
          _lg.log("Content is save by storages")
          return resolve({
            info: getYt,
            media: saveIdURLs
          })
        }
      }
      const getId = await ytdwnId()
      _lg.log({
        yt_info: getYt,
        dwn_id: getId
      })

      async function Processed() {
        const url = `${configs.process}?id=${getId}`
        const dataRes = await axios.get(url)
        _lg.log(`Set status downloading is ${dataRes.data.text} (${(100 * dataRes.data.progress) / 1000}%)`)

        if (dataRes.data.success != 1) {
          setTimeout(Processed, 1000)
        } else {
          if (!dataRes.data.download_url) {
            _lg.error("Downloading is error")
            return reject("Downloading is error!")
          }
          if (saveId === true) {
            saveIdURL.saveURLDownload(_yt_va.id, _yt_vr.format, dataRes.data.download_url)
          }
          resolve({
            info: getYt,
            media: dataRes.data.download_url
          })
        }
      }
      Processed()
    } catch (err) {
      _lg.error(err)
      return reject(err)
    }
  })
}

module.exports = {
  downloadMedia,
  ytInfo
}
