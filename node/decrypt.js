const crypto = require('crypto');
const fs = require('fs');

const BACKUP_KEY = 'MyDifficultPassw';

function getCipher() {
  const algorithm = 'aes-128-ecb';
  const key = Buffer.from(BACKUP_KEY, 'utf8');
  return crypto.createDecipheriv(algorithm, key, ''); // ECB mode doesn't require an IV
}

function decryptAndSave(inputPath, outputPath) {
  const inputStream = fs.createReadStream(inputPath);
  const fileOutputStream = fs.createWriteStream(outputPath);
  const cipher = getCipher();
  const cipherInputStream = inputStream.pipe(cipher);

  cipherInputStream
    .pipe(fileOutputStream)
    .on('error', (err) => {
      console.error(err);
    })
    .on('finish', () => {
      console.log('Decryption and saving completed.');
    });
}

const encryptedMonefyExport = process.argv[2]

if(encryptedMonefyExport) {
  if (!fs.existsSync(encryptedMonefyExport)) {
    console.log('File not found!');
    return;
  }
  decryptAndSave(encryptedMonefyExport, 'decrypted.db');
} else {
  console.log('Usage: node decrypt.js <encryptedMonefyExport>')
}
