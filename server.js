const { exec } = require("child_process");

exec(`lt --port ${process.env.PORT || 3000}`);
