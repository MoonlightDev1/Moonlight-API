    const { likee } = require("herxa-media-downloader");

    async function likeedl(url) {
      if (!url) return "Input URL";
      try {
        const result = await likee(url);
        const fes = result.data;
        return({
          author: "Herza",
          status: 200,
          data: fes 
        });
      } catch (error) {
        console.error({
          author: "Herza",
          status: 500,
          message: "Error processing request",
          error: error.message
        });
      }
    }
module.exports = { likeedl }
