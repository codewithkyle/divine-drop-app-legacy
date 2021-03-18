const fs = require("fs");
const path = require("path");
const cwd = process.cwd();

const AppSettingsFile = path.join(cwd, "Client", "Models", "Globals", "AppSettings.cs");
const ConfigFile = path.join(cwd, "Client", "Scripts", "config.ts");

let data = fs.readFileSync(AppSettingsFile, { encoding: "utf-8"});
data = data.replace(/public\sstatic\sstring\sAPI \=.*?\;/, `public static string API = "${process.env.API_URL}";`);
fs.writeFileSync(AppSettingsFile, data);

data = fs.readFileSync(ConfigFile, { encoding: "utf-8"});
data = data.replace(/const\sAPI\_URL\s\=.*?\;/, `const API_URL = "${process.env.API_URL}";`);
fs.writeFileSync(ConfigFile, data);