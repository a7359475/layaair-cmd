const path = require("path");
const spawn = require("child_process").spawn;
const
{
	printOk,
	printErr,
	printQuotation,
	tr
} = require("./print.js");

let exe = path.join(__dirname, "node_modules", "layanative", "out", "main.js");
let args = [exe];
args.push(process.argv.slice(2));
let cp = spawn("node", args);
cp.stdout.on('data', function(data)
{
	printQuotation(data.toString());
})
cp.stderr.on('data', function(data)
{
	printErr(data.toString());
})