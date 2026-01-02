const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const exportDatabase = (req, res) => {
  const dbUser = process.env.POSTGRES_USER;
  const dbPassword = process.env.POSTGRES_PASSWORD;
  const dbName = process.env.POSTGRES_DB;
  const dbHost = process.env.POSTGRES_HOST;
  const dbPort = process.env.POSTGRES_PORT;

  const backupFileName = `backup_${Date.now()}.sql`;
  const backupFilePath = path.join(__dirname, "..", "..", "uploads", backupFileName);

  const command = `PGPASSWORD="${dbPassword}" pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -F c -b -v -f "${backupFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing pg_dump: ${error.message}`);
      return res.status(500).json({ message: "Database export failed", error: error.message });
    }
    if (stderr) {
      console.error(`pg_dump stderr: ${stderr}`);
    }
    
    res.download(backupFilePath, backupFileName, (err) => {
      if (err) {
        console.error(`Error sending file: ${err.message}`);
      }
      // Clean up the backup file after sending
      fs.unlink(backupFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`Error deleting backup file: ${unlinkErr.message}`);
        }
      });
    });
  });
};

module.exports = { exportDatabase };
