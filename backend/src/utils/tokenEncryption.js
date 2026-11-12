
const crypto = require("crypto");

const ENCRYPTION_KEY = Buffer.from(
    process.env.TOKEN_ENCRYPTION_KEY,
    "hex"
);

function encrypt(text) {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        ENCRYPTION_KEY,
        iv
    );

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText) {
    const [iv, authTag, encrypted] = encryptedText.split(":");

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        ENCRYPTION_KEY,
        Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

module.exports = { encrypt, decrypt };
