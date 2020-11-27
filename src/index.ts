import { fetchCompraVentaAds, Ad } from "./scrape";
import express from "express";
import cors from "cors";

const app = express();
const port = 9898;

app.use(cors());

let ads: {
  ventaAds: Ad[];
  compraAds: Ad[];
} = { compraAds: [], ventaAds: [] };

let isRefreshingAds = false;
const tiempoActualizacion = 60000;
let isScrapingCoolingDown = false;

const refreshAds = async () => {
  isRefreshingAds = true;
  const ads = await fetchCompraVentaAds();
  isRefreshingAds = false;

  return ads;
};

refreshAds().then(result => (ads = result));

app.get("/", (req, res) => {
  const fetchAndSend = async () => {
    res.type("application/json");
    res.send(JSON.stringify(ads));
  };

  fetchAndSend();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
