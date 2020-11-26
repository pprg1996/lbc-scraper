import { fetchCompraVentaAds } from "./scrape";
import express, { json } from "express";
const app = express();
const port = 9898;

let ads = {};
let isRefreshingAds = false;
const tiempoActualizacion = 60000;
let isScrapingCoolingDown = false;

const refreshAds = async () => {
  isRefreshingAds = true;
  ads = await fetchCompraVentaAds();
  isRefreshingAds = false;
};

app.get("/", (req, res) => {
  const fetchAndSend = async () => {
    res.type("application/json");
    if (!isRefreshingAds) {
      await refreshAds();
      res.send(JSON.stringify({ ads, status: "fresh" }));
    } else res.send(JSON.stringify({ ads, status: "refreshing" }));
  };

  fetchAndSend();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
