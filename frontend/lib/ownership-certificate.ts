/**
 * lib/ownership-certificate.ts
 * Generates and prints a blockchain ownership certificate.
 * Uses the browser's built-in print dialog — no extra library needed.
 */

export interface CertificateData {
  propertyName: string;
  location:     string;
  propertyType: string;
  tokenId:      string;
  ownerWallet:  string;
  metadataHash: string;
  issuedAt:     string;   // ISO date string
  titleNumber?: string | null;
}

export function printOwnershipCertificate(data: CertificateData) {
  const win = window.open('', '_blank', 'width=800,height=600');
  if (!win) return;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Ownership Certificate — ${data.propertyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Montserrat', sans-serif;
      background: #fff;
      color: #1a1a2e;
      padding: 48px;
    }
    .cert {
      max-width: 720px;
      margin: 0 auto;
      border: 2px solid #d4a64a;
      border-radius: 12px;
      padding: 48px;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      border-bottom: 1px solid #e8e0d0;
      padding-bottom: 24px;
    }
    .brand { font-size: 22px; font-weight: 700; color: #1a1a2e; }
    .brand span { color: #d4a64a; }
    .cert-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #d4a64a;
      text-align: right;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #1a1a2e;
    }
    .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 32px; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }
    .field { background: #f9f6f0; border-radius: 8px; padding: 12px 16px; }
    .field-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 4px; }
    .field-value { font-size: 13px; font-weight: 600; color: #1a1a2e; word-break: break-all; }
    .hash-section { margin-bottom: 28px; }
    .hash-box {
      background: #1a1a2e;
      color: #d4a64a;
      border-radius: 8px;
      padding: 14px 16px;
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
    }
    .footer {
      border-top: 1px solid #e8e0d0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-note { font-size: 10px; color: #9ca3af; max-width: 400px; }
    .seal {
      width: 64px; height: 64px;
      border: 2px solid #d4a64a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #d4a64a;
      text-align: center;
      line-height: 1.2;
    }
    @media print {
      body { padding: 0; }
      .cert { border: 2px solid #d4a64a !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="header">
      <div class="brand">EDEN<span>ET</span></div>
      <div class="cert-label">Blockchain<br/>Ownership<br/>Certificate</div>
    </div>

    <h1>${data.propertyName}</h1>
    <p class="subtitle">${data.propertyType} · ${data.location}</p>

    <div class="grid">
      <div class="field">
        <div class="field-label">NFT Token ID</div>
        <div class="field-value">#${data.tokenId}</div>
      </div>
      ${data.titleNumber ? `
      <div class="field">
        <div class="field-label">Land Title Number</div>
        <div class="field-value">${data.titleNumber}</div>
      </div>` : '<div></div>'}
      <div class="field" style="grid-column: span 2;">
        <div class="field-label">Owner Wallet Address</div>
        <div class="field-value">${data.ownerWallet}</div>
      </div>
      <div class="field">
        <div class="field-label">Certificate Issued</div>
        <div class="field-value">${new Date(data.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="field">
        <div class="field-label">Registry</div>
        <div class="field-value">EDENET Blockchain Registry</div>
      </div>
    </div>

    <div class="hash-section">
      <div class="field-label" style="margin-bottom:8px;">Blockchain Metadata Hash (SHA-256)</div>
      <div class="hash-box">${data.metadataHash}</div>
    </div>

    <div class="footer">
      <div class="footer-note">
        This certificate is cryptographically secured on the blockchain.
        The metadata hash above uniquely identifies this property record.
        Verify authenticity at <strong>edenet.io/verify</strong>
      </div>
      <div class="seal">EDENET<br/>VERIFIED</div>
    </div>
  </div>

  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button onclick="window.print()" style="
      background:#d4a64a;color:#1a1a2e;border:none;
      padding:12px 32px;border-radius:8px;font-weight:700;
      font-size:14px;cursor:pointer;font-family:inherit;
    ">Print / Save as PDF</button>
  </div>

  <script>
    // Auto-trigger print after a short delay so fonts load
    setTimeout(() => window.print(), 600);
  </script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
