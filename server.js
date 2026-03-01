const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.post("/render", async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    const html = req.body?.html;

    if (!html) {
      return res.status(400).json({
        error: "Missing HTML",
        received: req.body
      });
    }

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({
      error: "PDF generation failed",
      message: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("PDF renderer running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PDF renderer running on port ${PORT}`);
});
