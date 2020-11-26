const puppeteer = require("puppeteer");
import type { Browser, Page, ElementHandle } from "puppeteer";

interface Ad {
  usernameAndRating: string;
  descripcionYBanco: string;
  precioBtc: number;
  limiteInferior: number;
  limiteSuperior: number;
  adUrl: string;
}

const lbcUrl = "https://www.localbitcoins.com/";
const comprarUrl = "https://localbitcoins.com/buy-bitcoins-online/ves/";
const venderUrl = "https://localbitcoins.com/sell-bitcoins-online/ves/";

(async () => {
  const listarAds = async (page: Page, url: string) => {
    await page.goto(url);
    const cantidadDePaginas = ((await page.$$(".page-item")).length - 4) / 2;

    const adRows = await page.$$(".clickable");

    const scrapePage = async (adRows: ElementHandle<Element>[]) => {
      const pageAds: Ad[] = [];

      for (const adRow of adRows) {
        const anchorNombre = await adRow.$(".column-user > a");
        const usernameAndRating = await anchorNombre.evaluate(anchor => anchor.innerHTML);

        const tdDescripcion = await adRow.$("td:nth-child(2)");
        const descripcionRaw = await tdDescripcion.evaluate(td => (td as HTMLElement).innerText);
        const descripcionYBanco = descripcionRaw;

        const tdPrecioPorBtc = await adRow.$(".column-price");
        const precioRaw = await tdPrecioPorBtc.evaluate(td => (td as HTMLElement).innerText);
        const precioBtc = Number(precioRaw.replace(" VES", "").replace(/,/g, ""));

        const tdLimites = await adRow.$(".column-limit");
        const limitsRaw = await tdLimites.evaluate(td => (td as HTMLElement).innerText);
        const limiteInferior = Number(limitsRaw.slice(0, limitsRaw.indexOf(" ")).replace(/,/g, ""));
        const limiteSuperior = Number(limitsRaw.slice(limitsRaw.indexOf(" ") + 3, -4).replace(/,/g, ""));

        const anchorAd = await adRow.$(".column-button > a");
        const adUrl = lbcUrl + (await anchorAd.evaluate(a => a.getAttribute("href")));

        const ad = { usernameAndRating, descripcionYBanco, precioBtc, limiteInferior, limiteSuperior, adUrl };
        pageAds.push(ad);
      }

      return pageAds;
    };

    const allAds: Ad[] = [];
    allAds.push(...(await scrapePage(adRows)));

    for (let pagina = 2; pagina <= cantidadDePaginas; pagina++) {
      await page.goto(url + `?page=${pagina}`);
      const adRows = await page.$$(".clickable");

      allAds.push(...(await scrapePage(adRows)));
    }

    return allAds;
  };

  // const browser = (await puppeteer.connect({ browserURL: "http://127.0.0.1:9222" })) as Browser;
  const browser = (await puppeteer.launch({ headless: true })) as Browser;
  const page = await browser.newPage();

  // const ventaAds = await listarAds(page, venderUrl);
  const compraAds = await listarAds(page, comprarUrl);

  // ventaAds.sort((a, b) => b.precioBtc - a.precioBtc);
  compraAds.sort((a, b) => a.precioBtc - b.precioBtc);

  // ventaAds.forEach(venta => console.log(venta.precioBtc + " " + venta.adUrl));
  compraAds.forEach(compra => console.log(compra.precioBtc + " " + compra.adUrl));

  browser.close();
})();
