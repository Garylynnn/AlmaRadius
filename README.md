# AlmaRadius Automation Management Tool

This application provides a Sleek Web UI for managing FreeIPA hosts and automating the PKCS#12 certificate lifecycle for RADIUS clients.

## System Requirements
* **Operating System**: Linux (Tested on AlmaLinux 10.1)
* **Identity Management**: FreeIPA CLI (`ipa`) must be installed and configured.
* **Security Tools**: OpenSSL must be installed.
* **Runtime**: Node.js v20 or higher.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment file and fill in your Gemini API Key (if using AI features):
```bash
cp .env.example .env
```

### 3. Directory Setup
Ensure the target directory for `.p12` files exists and has correct permissions:
```bash
sudo mkdir -p /home/p12_files
sudo chown $USER:$USER /home/p12_files
```

### 4. Running the App

#### Development
```bash
npm run dev
```

#### Production (using pm2)
```bash
# Build the UI
npm run build

# Run the server
npx tsx server.ts
```

## Automation Logic
The tool automates the following sequence:
1. `ipa host-add` - Registers the device in FreeIPA.
2. `openssl req` - Generates a 2048-bit private key and CSR.
3. `ipa cert-request` - Requests a certificate from the IPA CA.
4. `curl` - Retrieves the CA trust anchor.
5. `openssl pkcs12` - Bundles the above into a password-protected `.p12` file.
6. `cp` - Moves the file to the central export vault.

## Support
Built for the AlmaRadius Infrastructure Project (Primary: 10.10.60.25, Replica: 10.10.60.26).
