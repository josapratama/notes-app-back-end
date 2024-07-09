const { exec } = require("child_process");
const os = require("os");

const isWindows = os.platform() === "win32";

const command = isWindows
  ? "npm run start:prod:win"
  : "npm run start:prod:unix";

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error: ${err}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
