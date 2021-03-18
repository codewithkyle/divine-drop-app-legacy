const fs = require("fs");
const path = require("path");
const cwd = process.cwd();
require("dotenv").config();

let data;

const AppSettingsFile = path.join(cwd, "Client", "Models", "Globals", "AppSettings.cs");
data = fs.readFileSync(AppSettingsFile, { encoding: "utf-8"}).toString();
data = data.replace(/public\sstatic\sstring\sAPI \=.*?\;/, `public static string API = "${process.env.API_URL}";`);
fs.writeFileSync(AppSettingsFile, data);

const ConfigFile = path.join(cwd, "Client", "Scripts", "config.ts");
data = fs.readFileSync(ConfigFile, { encoding: "utf-8"}).toString();
data = data.replace(/const\sAPI\_URL\s\=.*?\;/, `const API_URL = "${process.env.API_URL}";`);
fs.writeFileSync(ConfigFile, data);

const IndexFile = path.join(cwd, "Client", "wwwroot", "index.html");
data = fs.readFileSync(IndexFile, { encoding: "utf-8"}).toString();
data = data.replace("REPLACE_WITH_CACHEBUST", Date.now());
fs.writeFileSync(IndexFile, data);