const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/render", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: "Missing HTML" });
    }

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PDF renderer running on port ${PORT}`);
});