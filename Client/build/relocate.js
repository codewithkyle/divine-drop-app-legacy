const fs = require("fs");
const glob = require("glob");
const path = require("path");
const cwd = process.cwd();
const outdir = path.join(cwd, "Client", "wwwroot", "js");
(()=>{
    const files = glob.sync(`${cwd}/_js/**/*.js`);
    for (let i = 0; i < files.length; i++){
        const file = files[i].replace(/.*[\\\/]/, "");
        fs.renameSync(files[i], path.join(outdir, file));
    }
    fs.rmdirSync(path.join(cwd, "_js"), {recursive: true, force: true});
})();