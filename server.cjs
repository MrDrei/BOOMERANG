var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/inquiry", async (req, res) => {
    const { name, company, email, phone, interest, message, assembledLine } = req.body;
    if (!name || !company || !email) {
      return res.status(400).json({
        success: false,
        error: "Required fields (name, company, email) are missing."
      });
    }
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    const receiverEmail = process.env.EMAIL_RECEIVER || "bauzondiode@gmail.com";
    console.log(`[Inquiry Received] ${name} from ${company} (Email: ${email})`);
    if (!accessKey) {
      console.log(`Simulating SMTP dispatch since no WEB3FORMS_ACCESS_KEY is set.`);
      return res.json({
        success: true,
        simulated: true,
        message: `Inquiry successfully logged! To receive actual emails from this live form to ${receiverEmail}, please add a free WEB3FORMS_ACCESS_KEY to the AI Studio Secrets panel. (Refer to .env.example)`
      });
    }
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `[BOOMERANG CORP INQUIRY] from ${name} of ${company}`,
          from_name: "Boomerang Portal Mailer",
          name,
          email,
          phone: phone || "Not specified",
          interest: interest || "General Machinery Interest",
          message: message || "No additional text provided.",
          engineered_assembly_line: assembledLine && assembledLine.length > 0 ? assembledLine.join(", ") : "None assembled"
        })
      });
      const data = await response.json();
      if (data.success) {
        return res.json({
          success: true,
          simulated: false,
          message: `Inquiry successfully delivered to ${receiverEmail}`
        });
      } else {
        throw new Error(data.message || "Web3Forms API rejected the transmission.");
      }
    } catch (error) {
      console.error("Email proxy forwarding error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to transmit inquiry to server."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Emails will target: ${process.env.EMAIL_RECEIVER || "bauzondiode@gmail.com"}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
