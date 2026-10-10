const fs = require('fs');
const path = require('path');
const https = require('https');

const carpetaDestino = path.join(__dirname, 'audios_russ_bray');

// Crear la carpeta local si no existe
if (!fs.existsSync(carpetaDestino)) {
  fs.mkdirSync(carpetaDestino, { recursive: true });
}

// URL oficial verificada de los audios de Russ Bray
const baseUrl = 'https://autodarts.x10.mx/russ_bray/';

console.log('=== Iniciando descarga de audios de Russ Bray (1 al 180) ===');
console.log(`Destino: ${carpetaDestino}`);

function descargarAudio(numero, intento = 1) {
  return new Promise((resolve, reject) => {
    const nombreArchivo = `${numero}.mp3`;
    const urlCompleta = `${baseUrl}${nombreArchivo}`;
    const rutaLocal = path.join(carpetaDestino, nombreArchivo);

    const req = https.get(
      urlCompleta,
      { rejectUnauthorized: false, timeout: 15000 },
      (res) => {
        if (res.statusCode === 200) {
          const streamEscritura = fs.createWriteStream(rutaLocal);
          res.pipe(streamEscritura);

          streamEscritura.on('finish', () => {
            streamEscritura.close();
            resolve({ numero, success: true });
          });

          streamEscritura.on('error', (err) => {
            fs.unlink(rutaLocal, () => {});
            if (intento <= 3) {
              resolve(descargarAudio(numero, intento + 1));
            } else {
              reject(err);
            }
          });
        } else {
          if (intento <= 3) {
            setTimeout(() => {
              resolve(descargarAudio(numero, intento + 1));
            }, 1000);
          } else {
            reject(new Error(`HTTP ${res.statusCode} para ${nombreArchivo}`));
          }
        }
      }
    );

    req.on('timeout', () => {
      req.destroy();
      if (intento <= 3) {
        resolve(descargarAudio(numero, intento + 1));
      } else {
        reject(new Error(`Timeout en ${nombreArchivo}`));
      }
    });

    req.on('error', (err) => {
      if (intento <= 3) {
        setTimeout(() => {
          resolve(descargarAudio(numero, intento + 1));
        }, 1000);
      } else {
        reject(err);
      }
    });
  });
}

async function procesarEnLotes() {
  const numeros = Array.from({ length: 180 }, (_, idx) => idx + 1);
  const CONCURRENCIA = 8;
  let completados = 0;
  let errores = [];

  for (let i = 0; i < numeros.length; i += CONCURRENCIA) {
    const lote = numeros.slice(i, i + CONCURRENCIA);
    const promesas = lote.map((num) =>
      descargarAudio(num)
        .then(() => {
          completados++;
          process.stdout.write(`\rProgreso: [${completados}/180] audios descargados...`);
        })
        .catch((err) => {
          errores.push({ num, error: err.message });
          console.error(`\nError en audio ${num}: ${err.message}`);
        })
    );

    await Promise.all(promesas);
  }

  console.log('\n\n=== Resumen de Descarga ===');
  console.log(`Audios completados: ${completados}/180`);
  if (errores.length > 0) {
    console.warn(`Errores encontrados (${errores.length}):`, errores);
  } else {
    console.log("¡Descarga completada con éxito! Revisa la carpeta 'audios_russ_bray'.");
  }
}

procesarEnLotes();
