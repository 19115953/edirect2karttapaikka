const express = require('express');
const app = express()

const getGMapsCoordinates = (url) => {
  try {
    const coordinates = (url.split("maps?q=")[1]).split(",");
//    const coordinates = (url.split("maps?q=")[1]).split("%2C");
    return [ Number(coordinates[1]), Number(coordinates[0]) ];
  } catch (err) {
    return null;
  }
}


const getKarttapaikkaUrl = (zoomLevel, etrsCoords) => {
    let url = "https://asiointi.maanmittauslaitos.fi/karttapaikka/?share=customMarker&n=";
    url +=  + etrsCoords[1] + "&e=" + etrsCoords[0];
    url += "&title=&desc=&zoom=" + zoomLevel;
    return url;
}

const getHtml = (gMapsUrl, zoomLevel) => {
  const coordinates = getGMapsCoordinates(gMapsUrl);
  if (coordinates) {
    const proj4 = require('proj4');
    proj4.defs('EPSG:3067', "+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs");
    const etrsCoordinates = proj4('EPSG:4326', 'EPSG:3067', coordinates);
    const karttapaikkaUrl = getKarttapaikkaUrl(zoomLevel, etrsCoordinates);
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="2; url=${karttapaikkaUrl}" />
      </head>
      <body>
        <p>Please follow <a href="${karttapaikkaUrl}">this link</a>.</p>
      </body>
    </html>    
    `
  }
  return '<h1>Linkki ei kelpaa</h1>'; 
}

app.get('/', (req, res) =>  {
  res.send(getHtml(req.query.url, 11));
});

app.get('*', (req, res) => {
  res.send('<h1>Sivua ei löydy!</h1>');
});

const port = process.env.PORT || 3001;

const message = () => {
  console.log("Serveri kyntää portissa " + port);
}

app.listen(port, message);
