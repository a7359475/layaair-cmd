const path = require("path");
const spawn = require("child_process").spawn;

let exe = path.join("node_modules/layanative/out/main.js");
let args = [exe];
args.push(process.argv.slice(2));
spawn("node", args);