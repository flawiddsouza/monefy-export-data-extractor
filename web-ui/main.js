const BACKUP_KEY = 'MyDifficultPassw'

function isDecryptionSuccessful(decryptedBytes) {
    const sqliteHeader = "SQLite format 3";
    const headerBytes = new TextEncoder().encode(sqliteHeader)
    for (let i = 0; i < headerBytes.length; i++) {
        if (decryptedBytes[i] !== headerBytes[i]) {
            return false
        }
    }
    return true
}

function arrayBufferToWordArray(arrayBuffer) {
    const words = []
    const view = new DataView(arrayBuffer)
    for (let i = 0; i < arrayBuffer.byteLength; i += 4) {
        words.push(view.getInt32(i, false))
    }
    return CryptoJS.lib.WordArray.create(words, arrayBuffer.byteLength)
}

function decryptAndSave(file) {
    const fileReader = new FileReader()

    fileReader.onload = async (event) => {
        try {
            const encryptedDataWordArray = arrayBufferToWordArray(event.target.result)
            const key = CryptoJS.enc.Utf8.parse(BACKUP_KEY)
            const decryptedData = CryptoJS.AES.decrypt(
                { ciphertext: encryptedDataWordArray },
                key,
                { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
            )
            const decryptedBytes = new Uint8Array(decryptedData.sigBytes)
            for (let i = 0; i < decryptedData.sigBytes; i++) {
                decryptedBytes[i] = decryptedData.words[i >>> 2] >>> (24 - (i % 4) * 8) & 0xff
            }
            if (isDecryptionSuccessful(decryptedBytes)) {
                const blob = new Blob([decryptedBytes], { type: 'application/octet-stream' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = file.name + '_decrypted.db'
                link.click()
                URL.revokeObjectURL(url)
            } else {
                alert('Decryption failed: Given file is not a valid Monefy export')
            }
        } catch (error) {
            alert('Decryption failed: Given file is not a valid Monefy export')
        }
    }

    fileReader.onerror = () => {
        alert('File reading failed: ' + fileReader.error)
    }

    fileReader.readAsArrayBuffer(file)
}

const fileInput = document.querySelector('#file')
const form = document.querySelector('#form')

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const file = fileInput.files[0]
    if (file) {
        decryptAndSave(file)
    } else {
        console.log('Please select a file.')
    }
})
