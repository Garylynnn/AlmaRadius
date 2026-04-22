# ITC MEETING: RADIUS INFRASTRUCTURE & CERTIFICATE AUTOMATION
**Subject:** Deployment of High-Availability FreeIPA and FreeRADIUS Gateway
**Date:** April 22, 2026
**Presenter:** Security Systems Team

---

## 1. Executive Summary
We have successfully deployed a mission-critical Identity and Access Management (IAM) infrastructure based on FreeIPA and FreeRADIUS. The architecture is designed for high availability (HA) using a Primary-Replica model, ensuring uninterruptible authentication for our network infrastructure (Arista Access Points, Switches).

## 2. Infrastructure Architecture
### **2.1 Primary Node (ipa.almaradius.ho)**
*   **Role:** Master Certificate Authority (CA), Key Distribution Center (KDC), Primary RADIUS.
*   **IP Address:** 10.10.60.25 (Static)
*   **Services:** Directory Server, Kerberos, BIND (Internal), FreeRADIUS (EAP-TLS).
*   **Status:** Live & Synchronizing.

### **2.2 Replica Node (ipa2.almaradius.ho)**
*   **Role:** Read-Only Replica, Secondary RADIUS Failover.
*   **IP Address:** 10.10.60.26 (Static)
*   **Services:** Synced LDAP Database, Secondary KDC.
*   **Status:** Live (Replica-Install Successful).

### **2.3 Network Access Control (NAC)**
*   **Radius Secondary:** Configured with EAP-TLS using certificates issued by the FreeIPA Integrated CA.
*   **Current Clients:**
    *   Arista AP-1 (10.10.60.161)
    *   Arista AP-2 (10.10.81.191)
    *   Arista AP-3 (10.10.81.233)
*   **Authentication:** Mutual TLS using PKCS#12 certificates.

---

## 3. Automation Features Implementation
To reduce operational overhead, a custom **"Alma Radius Governance Tool"** (Web GUI) has been developed to automate the 6-stage certificate enrollment process.

### **3.1 Automated Certificate Lifecycle:**
1.  **Host Registration:** Automatic inclusion in FreeIPA Host Group.
2.  **CSR Generation:** Standardized 2048-bit RSA keys via OpenSSL.
3.  **Certificate Issuance:** Programmatic `ipa cert-request` with Principal binding.
4.  **Chain Verification:** Dynamic fetching of `ipa-ca.crt` trust anchor.
5.  **PKCS#12 Export:** Bundled `.p12` files with CA chain and secure password management.
6.  **Centralized Repository:** Automatic copying to `/home/p12_files/` for rapid deployment.

---

## 4. Security Enforcement & Compliance
*   **Firewall:** Strict UDP/TCP port hardening across 1812 (RADIUS), 389 (LDAP), and 88 (Kerberos).
*   **Persistence:** All certs are monitored by `certmonger` for auto-renewal indicators.
*   **Redundancy:** Multi-master database replication ensures zero data loss during server maintenance.

## 5. Next Steps
*   Integration of IoT VLAN devices.
*   Bi-weekly backup schedule for `/var/lib/ipa/private`.
*   User acceptance testing for the P12 automation GUI.

---
**Document Status:** FINAL / APPROVED
**Confidentiality:** Internal Use Only
