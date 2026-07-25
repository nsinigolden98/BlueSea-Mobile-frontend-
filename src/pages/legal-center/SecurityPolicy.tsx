import type { LegalDocumentConfig, LegalSectionData } from '@/types/legal';
import { LegalDocumentTemplate } from '@/components/legal/LegalDocumentTemplate';
import {
  Shield,
  Lock,
  Fingerprint,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Smartphone,
  Eye,
  Server,
  Cpu,
  FileText,
  CheckCircle2,
  Database,
  Users,
  Bell,
  Globe,
  RefreshCw,
  AlertCircle,
  PhoneCall,
  Mail,
  Building2,
  Scale,
  Search,
  Briefcase,
  Wallet,
  Share2,
  History,
  Sparkles,
  Network,
  HardDrive,
  FileCheck,
  CreditCard,
  Send,
  Terminal,
  UserCheck,
  Radio,
  Zap
} from 'lucide-react';

const securityPolicySections: LegalSectionData[] = [
  {
    id: 'sec-01-introduction',
    chapterNumber: '01',
    title: 'Introduction',
    subtitle: 'Cybersecurity Architecture & Trust Infrastructure',
    body: (
      <div className="space-y-4">
        <p>
          At <strong>BlueSea Mobile Technologies Limited</strong> (&quot;BlueSea Mobile&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), security is not merely a feature—it is the foundational pillar upon which our financial technology ecosystem is engineered.
        </p>
        <p>
          As a licensed financial technology platform operating within the Federal Republic of Nigeria, BlueSea Mobile safeguards millions of transactions, personal customer records, corporate payroll disbursements, and payment integrations. We maintain a defense-in-depth security posture designed to detect, prevent, and mitigate sophisticated cyber threats while ensuring high availability and regulatory compliance.
        </p>
        <p>
          This Information Security Policy (&quot;Security Policy&quot;) outlines the technical, administrative, and physical safeguards implemented across our platforms, mobile applications, cloud networks, and API gateways. It also sets forth the mandatory security obligations of our users to maintain account integrity.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Institutional Grade Protection Guarantee',
        description: (
          <p>
            BlueSea Mobile employs end-to-end cryptographic safeguards, zero-trust infrastructure architecture, and 24/7 automated threat monitoring to guarantee the safety of customer funds and sensitive payment data.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-02-security-commitment',
    chapterNumber: '02',
    title: 'Our Security Commitment',
    subtitle: 'Proactive Defense & Zero-Trust Governance',
    body: (
      <div className="space-y-4">
        <p>
          We are committed to maintaining maximum trust and transparency regarding how we secure customer assets. BlueSea Mobile pledges to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Protect Customer Capital:</strong> Ensure user funds held across digital wallets and payment channels are isolated and backed by licensed institutional bank custodians.</li>
          <li><strong>Enforce Zero-Trust Architecture:</strong> Continuously verify every transaction, session token, and internal system request regardless of network origin.</li>
          <li><strong>Maintain Regulatory Compliance:</strong> Adhere strictly to Central Bank of Nigeria (CBN) Cybersecurity Frameworks, the Nigeria Data Protection Act (NDPA 2023), and PCI-DSS Data Security Standards.</li>
          <li><strong>Invest in Continuous Innovation:</strong> Deploy cutting-edge artificial intelligence, biometric verification systems, and hardware security modules to counter evolving threat vectors.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-03-security-principles',
    chapterNumber: '03',
    title: 'Core Security Principles',
    subtitle: 'The CIA Triad & Defense-in-Depth',
    body: (
      <div className="space-y-4">
        <p>
          Our security model is built around five internationally recognized cybersecurity principles:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Confidentiality:</strong> Restricting access to private data strictly to authorized systems and account holders using AES-256 encryption.</li>
          <li><strong>Integrity:</strong> Guaranteeing that financial ledgers, transaction payloads, and audit logs cannot be altered or tampered with without detection.</li>
          <li><strong>Availability:</strong> Designing fault-tolerant multi-region cloud networks to ensure 99.99% uptime for payment operations.</li>
          <li><strong>Least Privilege:</strong> Restricting internal system access for employees to the absolute minimum necessary to perform verified duties.</li>
          <li><strong>Defense-in-Depth:</strong> Deploying overlapping security layers so that the failure of any single component does not compromise platform security.</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-04-account-protection',
    chapterNumber: '04',
    title: 'Account Protection Infrastructure',
    subtitle: 'Multi-Layered Account Shielding',
    body: (
      <div className="space-y-4">
        <p>
          Every BlueSea Mobile account is fortified with proprietary account protection mechanisms from the moment of registration. These include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Hardware-Backed Transaction PINs:</strong> High-risk financial operations require authorization using a distinct 4-digit PIN stored in encrypted keystores.</li>
          <li><strong>Biometric Authentication:</strong> Native integration with Android Fingerprint API, Touch ID, and Apple Face ID for secure local app unlock.</li>
          <li><strong>Automatic Session Timeout:</strong> Inactive mobile sessions auto-lock after two (2) minutes of inactivity to prevent physical unauthorized access.</li>
          <li><strong>Biometric Step-Up:</strong> Mandatory biometric or PIN re-authentication required prior to revealing sensitive credentials, virtual card details, or transfer approvals.</li>
        </ul>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Cryptographic Credential Isolation',
        description: (
          <p>
            BlueSea Mobile never stores user passwords or transaction PINs in plaintext. All authorization credentials are salted and hashed using industrial-strength Argon2/bcrypt algorithms before storage.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-05-password-security',
    chapterNumber: '05',
    title: 'Password & Passcode Security',
    subtitle: 'Complexity Requirements & Storage Standards',
    body: (
      <div className="space-y-4">
        <p>
          We enforce stringent password complexity rules to protect against dictionary, brute-force, and credential-stuffing attacks:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Passwords must be a minimum of eight (8) characters long and include uppercase letters, lowercase letters, numbers, and special symbols.</li>
          <li>Passwords are automatically checked in real time against known breached password databases (HaveIBeenPwned API integration).</li>
          <li>Sequential, repetitive, or easily predictable numbers (e.g., 1234, 0000, or birth years) are strictly rejected for transaction PINs.</li>
          <li>Accounts trigger automated lockouts after five (5) consecutive failed login or PIN attempts.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-06-mfa-security',
    chapterNumber: '06',
    title: 'Multi-Factor Authentication (MFA)',
    subtitle: 'Step-Up Verification for Sensitive Operations',
    body: (
      <div className="space-y-4">
        <p>
          Multi-Factor Authentication (MFA) is mandatory across the BlueSea Mobile ecosystem. MFA combines something you know (Password/PIN), something you have (Registered Mobile Device or Hardware Key), and something you are (Biometrics).
        </p>
        <p>
          Step-up MFA verification is automatically triggered during high-risk scenarios, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Logging in from an unrecognized smartphone or IP location.</li>
          <li>Executing transactions exceeding predefined daily risk limits.</li>
          <li>Changing linked phone numbers, email addresses, or withdrawal accounts.</li>
          <li>Exporting transaction histories or updating payroll disbursement lists.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-07-login-security',
    chapterNumber: '07',
    title: 'Login Security & Anomaly Detection',
    subtitle: 'Real-Time Threat Analysis & Brute-Force Shield',
    body: (
      <div className="space-y-4">
        <p>
          Our authentication gateways analyze over thirty (30) contextual variables during every login attempt. If anomalous pattern matches are flagged (e.g., impossible travel time between login locations, suspicious ASN routing, or botnet IP signatures), the request is challenged or blocked.
        </p>
        <p>
          Users receive immediate real-time Push and Email notifications for every successful login attempt containing device name, approximate location, IP address, and timestamp.
        </p>
      </div>
    )
  },
  {
    id: 'sec-08-session-management',
    chapterNumber: '08',
    title: 'Session Management & Token Security',
    subtitle: 'Short-Lived JWTs & Remote Revocation',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile utilizes cryptographically signed, short-lived JSON Web Tokens (JWT) for mobile and web API requests. Session security features include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Token Rotation:</strong> Access tokens automatically expire every fifteen (15) minutes and require seamless refresh token exchange.</li>
          <li><strong>Concurrent Login Controls:</strong> Active sessions are restricted per device architecture to eliminate hijacked token reuse.</li>
          <li><strong>Remote Session Termination:</strong> Users can view all active logged-in devices within the app and instantly terminate any active session with a single tap.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-09-device-recognition',
    chapterNumber: '09',
    title: 'Device Recognition & Binding',
    subtitle: 'Hardware Fingerprinting & Trusted Device Lists',
    body: (
      <div className="space-y-4">
        <p>
          During registration, your mobile device generates a unique cryptographic device fingerprint based on hardware identity factors, operating system parameters, and secure enclave elements.
        </p>
        <p>
          When you log in on a new or unrecognized hardware device, BlueSea Mobile enforces a mandatory <strong>Device Binding Protocol</strong> requiring OTP validation sent to your verified phone number/email along with a live facial liveness check.
        </p>
      </div>
    )
  },
  {
    id: 'sec-10-identity-verification',
    chapterNumber: '10',
    title: 'Identity Verification & Biometric Checks',
    subtitle: 'KYC, BVN & NIN Cryptographic Matching',
    body: (
      <div className="space-y-4">
        <p>
          To eliminate identity theft, impersonation, and fraudulent account opening, BlueSea Mobile connects directly with official identity repositories in Nigeria, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>NIBSS Verification:</strong> Direct cryptographic matching of Bank Verification Numbers (BVN) against biometric databases.</li>
          <li><strong>NIMC NIN Integration:</strong> Automated verification of National Identification Numbers (NIN) against the national identity repository.</li>
          <li><strong>Liveness Detection Engine:</strong> Active 3D facial liveness scans during registration to prevent spoofing using static photographs, video playback, or deepfake masks.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-11-transaction-monitoring',
    chapterNumber: '11',
    title: 'Transaction Monitoring Infrastructure',
    subtitle: 'Sub-Millisecond Payment Inspection',
    body: (
      <div className="space-y-4">
        <p>
          Every payment, bill transfer, airtime top-up, or withdrawal executed through BlueSea Mobile passes through our proprietary <strong>Real-Time Transaction Audit Engine</strong> prior to dispatching authorization calls to external banking switches or utility gateways.
        </p>
        <p>
          The engine evaluates transaction velocity, payment amount, recipient account age, geographic origin, and user historical baseline in real time.
        </p>
      </div>
    )
  },
  {
    id: 'sec-12-fraud-detection',
    chapterNumber: '12',
    title: 'Automated Fraud Detection & AI Rules',
    subtitle: 'Predictive Machine Learning Protection',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile utilizes machine learning models trained on millions of historical financial data points. Our automated fraud engines detect pattern anomalies such as:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Rapid drain of wallet balances immediately following a password change.</li>
          <li>Multiple rapid payments to newly created merchant accounts or unverified handles.</li>
          <li>Automated script attempts targeting utility bill token generation API limits.</li>
          <li>Unusual bulk airtime or data purchases originating from unusual IP ranges.</li>
        </ul>
      </div>
    ),
    callouts: [
      {
        type: 'warning',
        title: 'Automated Account Freeze Protocol',
        description: (
          <p>
            If our AI fraud engine detects severe high-risk fraud signatures, the system will automatically place a temporary freeze on outgoing transfers and dispatch an urgent security alert to the account holder for manual confirmation.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-13-suspicious-activity',
    chapterNumber: '13',
    title: 'Suspicious Activity Monitoring',
    subtitle: '24/7 Security Operations Center (SOC)',
    body: (
      <div className="space-y-4">
        <p>
          Our dedicated 24/7/365 Security Operations Center (SOC) is staffed by certified cybersecurity analysts and fraud operations specialists who continuously review flagged alerts, investigate transaction anomalies, and coordinate threat responses.
        </p>
      </div>
    )
  },
  {
    id: 'sec-14-aml-controls',
    chapterNumber: '14',
    title: 'Anti-Money Laundering (AML) Controls',
    subtitle: 'Regulatory Compliance & Sanction Screening',
    body: (
      <div className="space-y-4">
        <p>
          In accordance with the Money Laundering (Prevention and Prohibition) Act 2022 and CBN regulations, BlueSea Mobile enforces rigorous AML monitoring:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Automated Sanctions Screening:</strong> Real-time screening of all users against OFAC, UN, EU, and Nigerian Financial Intelligence Unit (NFIU) watchlists.</li>
          <li><strong>PEP Monitoring:</strong> Enhanced due diligence and continuous transaction monitoring for Politically Exposed Persons (PEPs).</li>
          <li><strong>STR &amp; CTR Reporting:</strong> Automatic filing of Suspicious Transaction Reports (STRs) and Currency Transaction Reports (CTRs) to the NFIU where statutory thresholds are met.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-15-blue-connect-security',
    chapterNumber: '15',
    title: 'Blue Connect Security Infrastructure',
    subtitle: 'Encrypted Social Transfers & Dynamic Link Protection',
    body: (
      <div className="space-y-4">
        <p>
          Blue Connect enables direct peer-to-peer transfers via handles (@username) and dynamic payment links. To prevent spoofing and fraud:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Handle Verification:</strong> Verified account handles display cryptographic badges confirming identity verification.</li>
          <li><strong>Dynamic Link Expiration:</strong> Blue Connect payment links utilize dynamic tokenization and auto-expire after single use or set timeframes.</li>
          <li><strong>Pre-Confirmation Display:</strong> The app enforces a mandatory verification screen showing the legal account name associated with a handle prior to PIN entry.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-16-wallet-security',
    chapterNumber: '16',
    title: 'Digital Wallet Security Architecture',
    subtitle: 'Segregated Accounts & Cryptographic Double-Entry Ledgers',
    body: (
      <div className="space-y-4">
        <p>
          Your BlueSea Mobile wallet is secured using immutable double-entry ledger database systems. Core wallet safeguards include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Segregated Banking Custody:</strong> 100% of customer wallet balances are held in ring-fenced, segregated liquid pool accounts with CBN-licensed commercial banks.</li>
          <li><strong>Ledger Reconciliation:</strong> Automated hourly reconciliation checks compare internal wallet ledgers with commercial bank balances to ensure zero ledger drift.</li>
          <li><strong>Instant Freeze Mechanisms:</strong> Ability to instantly isolate compromised wallet balances without affecting underlying transaction logs.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-17-payroll-security',
    chapterNumber: '17',
    title: 'Payroll & Corporate Services Security',
    subtitle: 'Maker-Checker Workflows & IP Whitelisting',
    body: (
      <div className="space-y-4">
        <p>
          Corporate organizations utilizing BlueSea Mobile Payroll and Bulk Disbursement portals are protected by advanced enterprise controls:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Dual-Control Authorization (Maker-Checker):</strong> Requirement that payroll files uploaded by an Initiator (&quot;Maker&quot;) must be reviewed and digitally signed by an Approver (&quot;Checker&quot;) before execution.</li>
          <li><strong>Corporate IP Whitelisting:</strong> Option to restrict corporate portal login access strictly to authorized corporate office IP addresses.</li>
          <li><strong>Batch Verification Hash:</strong> Cryptographic hashing of uploaded CSV payroll files to prevent unauthorized mid-transit salary edits.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-18-payment-security',
    chapterNumber: '18',
    title: 'Payment Switch & Card Security',
    subtitle: 'PCI-DSS Level 1 Compliance & Tokenization',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile processes payment card transactions in full compliance with the <strong>Payment Card Industry Data Security Standard (PCI-DSS Level 1)</strong>.
        </p>
        <p>
          Primary Account Numbers (PANs), card expiry dates, and CVVs are never stored on our servers. All card details are replaced with secure cryptographic tokens provided by PCI-certified payment processors (such as Interswitch, Paystack, and Flutterwave).
        </p>
      </div>
    )
  },
  {
    id: 'sec-19-data-encryption',
    chapterNumber: '19',
    title: 'Data Encryption Standards',
    subtitle: 'AES-256 at Rest & TLS 1.3 in Transit',
    body: (
      <div className="space-y-4">
        <p>
          We employ state-of-the-art cryptographic standards across every layer of our data stack:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Data at Rest:</strong> All databases, cloud storage buckets, and user records are encrypted using Advanced Encryption Standard (AES-256) with HSM-managed master keys.</li>
          <li><strong>Data in Transit:</strong> All data transmitted between mobile devices, web clients, microservices, and external banking switches is encrypted using Transport Layer Security (TLS 1.3) with forced Perfect Forward Secrecy (PFS).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-20-secure-communications',
    chapterNumber: '20',
    title: 'Secure Communications & Network Security',
    subtitle: 'SSL Pinning, HSTS & Email Protection',
    body: (
      <div className="space-y-4">
        <p>
          To protect data transmission from interception or man-in-the-middle (MITM) attacks:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>SSL Certificate Pinning:</strong> Native mobile applications strictly validate BlueSea Mobile server certificate public keys, blocking unauthorized proxy interception.</li>
          <li><strong>HTTP Strict Transport Security (HSTS):</strong> Enforced across all web domains to mandate HTTPS connection headers.</li>
          <li><strong>Email Integrity (SPF, DKIM, DMARC):</strong> Full domain authentication standards deployed to ensure official communication emails cannot be spoofed by phishers.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-21-data-storage-protection',
    chapterNumber: '21',
    title: 'Data Storage & Cloud Infrastructure Security',
    subtitle: 'Isolated VPCs & Immutable Vault Backups',
    body: (
      <div className="space-y-4">
        <p>
          Our cloud architecture is hosted in enterprise-grade, SOC 2 Type II certified data centers. Production environments are segregated inside isolated Virtual Private Clouds (VPCs) with zero direct public internet exposure for backend databases.
        </p>
        <p>
          Automated database snapshots are encrypted and stored in air-gapped, immutable write-once-read-many (WORM) storage vaults to ensure rapid disaster recovery capability.
        </p>
      </div>
    )
  },
  {
    id: 'sec-22-access-control',
    chapterNumber: '22',
    title: 'Internal Access Control Standards',
    subtitle: 'Role-Based Access Control (RBAC) & Privileged Access',
    body: (
      <div className="space-y-4">
        <p>
          Internal employee access to BlueSea Mobile systems is governed strictly by the Principle of Least Privilege:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>No BlueSea Mobile employee has direct access to user account passwords, transaction PINs, or raw encryption keys.</li>
          <li>Privileged Access Management (PAM) requires hardware key MFA, manager approval, and continuous session recording for developer system access.</li>
          <li>All administrative actions executed on support portals generate unalterable, audit-logged event trails.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-23-internal-security-practices',
    chapterNumber: '23',
    title: 'Internal Personnel Security Practices',
    subtitle: 'Vetting, Security Awareness & Code Reviews',
    body: (
      <div className="space-y-4">
        <p>
          Our personnel security controls ensure that all employees adhere to rigorous operational security protocols:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Comprehensive background checks and law enforcement vetting for all staff prior to employment.</li>
          <li>Mandatory quarterly cybersecurity and anti-phishing training for all engineering and operational teams.</li>
          <li>Mandatory static and dynamic application security testing (SAST/DAST) and peer code reviews before releasing app updates.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-24-third-party-security',
    chapterNumber: '24',
    title: 'Third-Party Service & Vendor Security',
    subtitle: 'Vendor Risk Management & API Isolation',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile integrates with partner banks, telecommunication operators, and utility aggregators via secure API channels.
        </p>
        <p>
          All third-party vendors undergo rigorous initial and annual Vendor Security Risk Assessments. External APIs are isolated behind security gateways that inspect all incoming and outgoing payloads for malicious code or parameter manipulation attempts.
        </p>
      </div>
    )
  },
  {
    id: 'sec-25-security-audits',
    chapterNumber: '25',
    title: 'Independent Security Audits & Certifications',
    subtitle: 'Penetration Testing & Regulatory Filings',
    body: (
      <div className="space-y-4">
        <p>
          To ensure objective security validation, BlueSea Mobile engages licensed, independent cybersecurity auditing firms to conduct:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Bi-Annual Penetration Testing:</strong> Extensive black-box, grey-box, and white-box penetration testing of mobile apps, web portals, and API endpoints.</li>
          <li><strong>Annual Vulnerability Assessments:</strong> Automated and manual infrastructure security assessments.</li>
          <li><strong>Regulatory Filings:</strong> Annual cybersecurity compliance reports submitted directly to the Central Bank of Nigeria (CBN) and Nigeria Data Protection Commission (NDPC).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-26-system-monitoring',
    chapterNumber: '26',
    title: 'System Monitoring & Event Logging',
    subtitle: 'Centralized SIEM & Threat Ingestion',
    body: (
      <div className="space-y-4">
        <p>
          All microservices, firewalls, database connections, and authentication nodes stream telemetry data in real time to our centralized Security Information and Event Management (SIEM) system.
        </p>
        <p>
          Automated parsing engines analyze server logs to detect anomalous access spikes, privilege escalation attempts, or network port probing instantaneously.
        </p>
      </div>
    )
  },
  {
    id: 'sec-27-incident-detection',
    chapterNumber: '27',
    title: 'Incident Detection Systems',
    subtitle: 'Web Application Firewalls & EDR Defense',
    body: (
      <div className="space-y-4">
        <p>
          Our network perimeters are guarded by enterprise Web Application Firewalls (WAF) and Distributed Denial of Service (DDoS) mitigation networks capable of filtering multi-gigabit traffic surges.
        </p>
        <p>
          Endpoint Detection and Response (EDR) software is deployed across all internal workstation endpoints to isolate malware, ransomware, or unauthorized executable execution automatically.
        </p>
      </div>
    )
  },
  {
    id: 'sec-28-incident-response',
    chapterNumber: '28',
    title: 'Security Incident Response Protocol',
    subtitle: 'Rapid Containment, Forensics & Remediation',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile maintains a comprehensive Incident Response Plan (IRP) governed by our Computer Security Incident Response Team (CSIRT). In the event of a suspected security event, our protocol initiates four immediate phases:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Containment:</strong> Isolation of affected microservices or network segments to prevent breach expansion.</li>
          <li><strong>Eradication:</strong> Elimination of threat actors, compromised credentials, or malicious artifacts.</li>
          <li><strong>Recovery:</strong> System restoration from clean, verified backups under continuous monitoring.</li>
          <li><strong>Post-Incident Forensics:</strong> Detailed root-cause analysis and infrastructure hardening to prevent reoccurrence.</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-29-customer-notification',
    chapterNumber: '29',
    title: 'Customer Breach Notification Procedures',
    subtitle: 'Transparent Reporting & Timely Alerts',
    body: (
      <div className="space-y-4">
        <p>
          In the unlikely event of a security incident that directly impacts user personal data or wallet balance safety, BlueSea Mobile will:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Notify affected users via verified email, SMS, and in-app alerts without undue delay and within regulatory timeframes (not exceeding 72 hours under NDPA standards).</li>
          <li>Provide actionable guidance on steps users should take to protect their accounts (e.g., password reset, PIN update, card lock).</li>
          <li>Maintain a transparent Status Page regarding system recovery milestones.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-30-user-responsibilities',
    chapterNumber: '30',
    title: 'User Security Responsibilities',
    subtitle: 'Your Role as a Security Partner',
    body: (
      <div className="space-y-4">
        <p>
          Securing your financial account is a shared responsibility. To maintain account integrity, users must strictly adhere to the following security guidelines:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Never disclose your account password, transaction PIN, OTP, or biometric credentials to anyone, including persons claiming to represent BlueSea Mobile.</li>
          <li>Ensure your mobile device operating system (Android/iOS) is continuously updated with the latest security patches.</li>
          <li>Enable screen lock mechanisms (PIN, pattern, or biometrics) on your personal smartphone.</li>
          <li>Immediately report lost or stolen mobile devices linked to your BlueSea account.</li>
        </ul>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Golden Rule of Fintech Security',
        description: (
          <p>
            <strong>BlueSea Mobile staff will NEVER ask for your Transaction PIN, Password, OTP, or Card CVV via phone call, SMS, WhatsApp, or email.</strong> Any such request is a fraudulent phishing attempt.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-31-phishing-awareness',
    chapterNumber: '31',
    title: 'Phishing & Smishing Defense Awareness',
    subtitle: 'Identifying Fraudulent Messages & Websites',
    body: (
      <div className="space-y-4">
        <p>
          Phishing involves bad actors impersonating legitimate brands to steal credentials. Protect yourself by recognizing phishing indicators:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Official Website:</strong> Ensure you are visiting our official, secure website at <code>https://blueseamobile.com</code>. Never enter credentials on unverified domains.</li>
          <li><strong>Official Email Sender:</strong> All official communications originate strictly from domains ending in <code>@blueseamobile.com</code>. Be wary of lookalike domains (e.g., @blue-sea-mobile.com).</li>
          <li><strong>Urgent Pressure Tactics:</strong> Exercise extreme caution if a message threatens immediate account suspension unless you click a link and enter your PIN.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-32-social-engineering',
    chapterNumber: '32',
    title: 'Social Engineering & SIM-Swap Awareness',
    subtitle: 'Protecting Against Impersonation & Phone Theft',
    body: (
      <div className="space-y-4">
        <p>
          Social engineering occurs when attackers manipulate individuals into giving up confidential information.
        </p>
        <p>
          In the event of a <strong>SIM-Swap</strong> (sudden loss of cellular network reception on your phone), contact your mobile network provider immediately and notify BlueSea Mobile support to temporarily lock your account until cellular service is safely restored.
        </p>
      </div>
    )
  },
  {
    id: 'sec-33-safe-device-practices',
    chapterNumber: '33',
    title: 'Safe Mobile & Computing Device Practices',
    subtitle: 'Jailbreak Detection & Public Wi-Fi Risks',
    body: (
      <div className="space-y-4">
        <p>
          For your safety, the BlueSea Mobile application performs automated runtime security checks on your device:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Rooted/Jailbroken Devices:</strong> The application will refuse to run or restrict high-value operations on rooted Android devices or jailbroken iOS devices, as these environments compromise built-in OS sandboxing.</li>
          <li><strong>Public Wi-Fi Networks:</strong> Avoid conducting financial transactions over unsecured public Wi-Fi hotspots without using a reputable Virtual Private Network (VPN).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-34-reporting-concerns',
    chapterNumber: '34',
    title: 'Reporting Security Concerns & Bug Bounty',
    subtitle: 'Vulnerability Disclosure Program (VDP)',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile welcomes responsible security researchers and community members to report potential software vulnerabilities or suspicious activities.
        </p>
        <p>
          If you discover a potential vulnerability in our platforms, please report it directly to our security engineering team at <strong>security@blueseamobile.com</strong> under our Responsible Vulnerability Disclosure policy. Please include detailed steps to reproduce the issue while refraining from accessing or altering user data.
        </p>
      </div>
    )
  },
  {
    id: 'sec-35-account-suspension',
    chapterNumber: '35',
    title: 'Account Restrictions & Emergency Locks',
    subtitle: 'Protective Locks & Reinstatement Framework',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile reserves the right to place an immediate administrative or security restriction on any account if:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>The account demonstrates extreme high-risk activity signatures or automated fraud patterns.</li>
          <li>Multiple failed PIN/OTP attempts indicate an ongoing brute-force attack.</li>
          <li>We receive formal directives from the Central Bank of Nigeria, NFIU, or law enforcement authorities.</li>
        </ul>
        <p>
          Account holders can request account reinstatement by completing verified biometric liveness re-verification through customer support.
        </p>
      </div>
    )
  },
  {
    id: 'sec-36-continuous-improvements',
    chapterNumber: '36',
    title: 'Continuous Security Improvements',
    subtitle: 'Adapting to Emerging Cyber Threat Landscapes',
    body: (
      <div className="space-y-4">
        <p>
          Cyber threats continuously evolve. BlueSea Mobile reviews and updates its security architecture, fraud rules, encryption protocols, and employee training programs continuously to stay ahead of malicious actors and maintain leading financial industry protection standards.
        </p>
      </div>
    )
  },
  {
    id: 'sec-37-policy-updates',
    chapterNumber: '37',
    title: 'Changes to This Security Policy',
    subtitle: 'Revision Governance & Notification Protocols',
    body: (
      <div className="space-y-4">
        <p>
          We may update this Security Policy periodically to reflect technological advancements, operational updates, or statutory requirements. When updates occur, the &quot;Last Updated&quot; date at the top of this policy will be revised accordingly.
        </p>
      </div>
    )
  },
  {
    id: 'sec-38-contact-security',
    chapterNumber: '38',
    title: 'Contacting the BlueSea Mobile Security Team',
    subtitle: 'Dedicated Cyber Defense & Information Security Channels',
    body: (
      <div className="space-y-4">
        <p>
          For security inquiries, incident reporting, or vulnerability disclosures, reach out directly to our Chief Information Security Officer (CISO) desk:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
          <p><strong>Security Operations Center Email:</strong> security@blueseamobile.com</p>
          <p><strong>Fraud Escalations Desk Email:</strong> fraud-reports@blueseamobile.com</p>
          <p><strong>24/7 Security Hotline:</strong> +234 700 BLUESEA-SEC (+234 700 2583 732)</p>
          <p><strong>Corporate Head Office:</strong> BlueSea Mobile Cyber Tower, Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    )
  },
  {
    id: 'sec-39-effective-date',
    chapterNumber: '39',
    title: 'Effective Date',
    subtitle: 'Information Security Governance Benchmark',
    body: (
      <div className="space-y-4">
        <p>
          This Information Security Policy is effective as of <strong>January 1, 2026</strong>, and applies to all digital assets, systems, and user accounts across the BlueSea Mobile ecosystem.
        </p>
      </div>
    )
  },
  {
    id: 'sec-40-version-history',
    chapterNumber: '40',
    title: 'Version History & Security Audit Log',
    subtitle: 'Historical Audit Control Trail',
    body: (
      <div className="space-y-4">
        <p>
          Historical log of amendments made to the BlueSea Mobile Information Security Policy:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Version</th>
                <th className="p-2.5 border-b">Effective Date</th>
                <th className="p-2.5 border-b">Summary of Security Enhancement Revisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">v3.0.0</td>
                <td className="p-2.5">Jan 01, 2026</td>
                <td className="p-2.5">Comprehensive security framework upgrade adding automated 3D facial liveness verification, Blue Connect handle verification controls, and Zero-Trust API gateway standards.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.2.0</td>
                <td className="p-2.5">Jul 10, 2025</td>
                <td className="p-2.5">Enhanced PCI-DSS Level 1 tokenization requirements, real-time SIEM ingestion standards, and maker-checker corporate payroll protection.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v1.0.0</td>
                <td className="p-2.5">Mar 01, 2024</td>
                <td className="p-2.5">Initial launch of the BlueSea Mobile Platform Information Security Architecture.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
];

const securityPolicyConfig: LegalDocumentConfig = {
  metadata: {
    id: 'legal-security-policy',
    title: 'Platform Information Security Policy',
    shortDescription: 'Comprehensive details on how BlueSea Mobile protects customer accounts, secures digital wallets, enforces end-to-end encryption, monitors transactions, detects fraud, and safeguards infrastructure.',
    category: 'User Agreements',
    version: '3.0.0',
    lastUpdated: 'July 25, 2026',
    effectiveDate: 'January 1, 2026',
    estimatedReadingTime: '22 min read',
    applicableRegion: 'Federal Republic of Nigeria',
    status: 'active'
  },
  previousDoc: {
    title: 'Refund & Reversal Policy',
    path: '/legal/refund'
  },
  nextDoc: {
    title: 'Cookie & Tracking Policy',
    path: '/legal/cookie'
  },
  sections: securityPolicySections
};

function SecurityHeaderBadges() {
  const badges = [
    { icon: <Shield className="w-3.5 h-3.5 text-emerald-500" />, label: 'AES-256 Data Encryption' },
    { icon: <Lock className="w-3.5 h-3.5 text-sky-500" />, label: 'PCI-DSS Level 1 Compliant' },
    { icon: <Fingerprint className="w-3.5 h-3.5 text-purple-500" />, label: 'Biometric 3D Liveness Check' },
    { icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />, label: 'CBN Security Framework' },
    { icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, label: '24/7 Real-Time Fraud Engine' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          {badge.icon}
          <span>{badge.label}</span>
        </span>
      ))}
    </div>
  );
}

function SecurityFeatureGrid() {
  const features = [
    { icon: <Shield className="w-4 h-4 text-emerald-500" />, label: 'AES-256 Storage' },
    { icon: <Lock className="w-4 h-4 text-sky-500" />, label: 'TLS 1.3 Transmission' },
    { icon: <Fingerprint className="w-4 h-4 text-purple-500" />, label: 'Hardware Biometrics' },
    { icon: <ShieldCheck className="w-4 h-4 text-blue-500" />, label: 'Zero-Trust Architecture' },
    { icon: <KeyRound className="w-4 h-4 text-amber-500" />, label: 'Hardware PIN Enclave' },
    { icon: <Smartphone className="w-4 h-4 text-teal-500" />, label: 'Device Fingerprinting' },
    { icon: <Eye className="w-4 h-4 text-indigo-500" />, label: '3D Facial Liveness' },
    { icon: <Server className="w-4 h-4 text-slate-500" />, label: 'Isolated VPC Clouds' },
    { icon: <Cpu className="w-4 h-4 text-emerald-600" />, label: 'AI Risk Engine' },
    { icon: <FileText className="w-4 h-4 text-blue-600" />, label: 'Audit Log Verification' },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, label: 'NIBSS BVN Matched' },
    { icon: <Database className="w-4 h-4 text-rose-500" />, label: 'WORM Backup Vaults' },
    { icon: <Users className="w-4 h-4 text-purple-600" />, label: 'Role-Based Access' },
    { icon: <Bell className="w-4 h-4 text-amber-500" />, label: 'Instant Login Alerts' },
    { icon: <Globe className="w-4 h-4 text-sky-500" />, label: 'DDoS WAF Protection' },
    { icon: <RefreshCw className="w-4 h-4 text-emerald-500" />, label: 'Auto Token Rotation' },
    { icon: <AlertCircle className="w-4 h-4 text-red-500" />, label: 'Fraud Auto-Freeze' },
    { icon: <PhoneCall className="w-4 h-4 text-indigo-400" />, label: 'SIM-Swap Protection' },
    { icon: <Mail className="w-4 h-4 text-blue-400" />, label: 'DMARC & SPF Signed' },
    { icon: <Building2 className="w-4 h-4 text-slate-600" />, label: 'Segregated Pool Custody' },
    { icon: <Scale className="w-4 h-4 text-purple-500" />, label: 'NDPA 2023 Compliant' },
    { icon: <Search className="w-4 h-4 text-teal-500" />, label: 'Bi-Annual Pen-Tests' },
    { icon: <Briefcase className="w-4 h-4 text-amber-600" />, label: 'Maker-Checker Payroll' },
    { icon: <Wallet className="w-4 h-4 text-emerald-500" />, label: 'Ring-Fenced Wallet' },
    { icon: <Share2 className="w-4 h-4 text-rose-400" />, label: 'Dynamic Link Expiry' },
    { icon: <History className="w-4 h-4 text-amber-500" />, label: 'SIEM Log Ingestion' },
    { icon: <Sparkles className="w-4 h-4 text-yellow-400" />, label: 'Step-Up Verification' },
    { icon: <Network className="w-4 h-4 text-cyan-500" />, label: 'SSL Cert Pinning' },
    { icon: <HardDrive className="w-4 h-4 text-slate-400" />, label: 'HSM Master Keys' },
    { icon: <FileCheck className="w-4 h-4 text-green-600" />, label: 'Sanctions Screening' },
    { icon: <CreditCard className="w-4 h-4 text-blue-500" />, label: 'PCI Tokenization' },
    { icon: <Send className="w-4 h-4 text-teal-500" />, label: 'Outward P2P Encrypted' },
    { icon: <Terminal className="w-4 h-4 text-slate-700 dark:text-slate-300" />, label: 'SAST/DAST Code Scan' },
    { icon: <UserCheck className="w-4 h-4 text-emerald-600" />, label: 'Employee Vetting' },
    { icon: <Radio className="w-4 h-4 text-purple-400" />, label: '24/7 SOC Telemetry' },
    { icon: <Zap className="w-4 h-4 text-yellow-500" />, label: 'Sub-MS API Inspection' }
  ];

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 my-6">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        Core Cyber Defense &amp; Information Security Infrastructure
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
        {features.map((feat, i) => (
          <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
            {feat.icon}
            <span className="truncate">{feat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecurityPolicy() {
  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-4 pt-4 -mb-4">
        <SecurityHeaderBadges />
        <SecurityFeatureGrid />
      </div>

      <LegalDocumentTemplate config={securityPolicyConfig} />
    </div>
  );
}

export default SecurityPolicy;