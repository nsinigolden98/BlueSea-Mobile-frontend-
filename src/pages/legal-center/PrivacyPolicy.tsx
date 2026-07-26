import type { LegalDocumentConfig, LegalSectionData } from '@/types/legal';
import { LegalDocumentTemplate } from '@/components/legal/LegalDocumentTemplate';
const privacyPolicySections: LegalSectionData[] = [
  {
    id: 'sec-01-introduction',
    chapterNumber: '01',
    title: 'Introduction',
    subtitle: 'Our Commitment to Data Protection & Personal Privacy',
    body: (
      <div className="space-y-4">
        <p>
          At <strong>BlueSea Mobile Technologies Limited</strong> (&quot;BlueSea Mobile&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we consider the protection of your personal and financial data to be fundamental to our operational integrity. As a digital financial technology platform operating across Nigeria, we build security and privacy directly into every system, API, and transaction protocol.
        </p>
        <p>
          This Privacy Policy (&quot;Policy&quot;) explains in transparent detail how we collect, process, store, disclose, and safeguard your personal data when you interact with our mobile application, web dashboard, APIs, digital wallet services, and payment facilities.
        </p>
        <p>
          This Policy is framed in strict compliance with the <strong>Nigeria Data Protection Act, 2023 (NDPA)</strong>, the regulations of the Nigeria Data Protection Commission (NDPC), Central Bank of Nigeria (CBN) Consumer Protection Frameworks, and applicable international privacy standards.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Privacy Principles Commitment',
        description: (
          <p>
            BlueSea Mobile will never sell, rent, or trade your personal information to third-party data brokers. Your data is used exclusively to facilitate financial transactions, prevent fraud, and comply with legal requirements in Nigeria.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-02-scope',
    chapterNumber: '02',
    title: 'Scope of this Privacy Policy',
    subtitle: 'Services, Digital Touchpoints & Platform Horizons',
    body: (
      <div className="space-y-4">
        <p>
          This Privacy Policy applies to all personal data processed by BlueSea Mobile across our complete ecosystem of consumer, corporate, and developer services, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Core Wallet Services:</strong> Digital stored-value accounts, NIBSS bank transfers, deposits, and automated withdrawals.</li>
          <li><strong>Utility & Services Payments:</strong> Mobile airtime, data subscriptions, electricity prepaid/postpaid tokens, cable television, internet subscriptions, and education e-PINs.</li>
          <li><strong>Blue Connect Network:</strong> Peer-to-peer social payment transfers using verified handles (@username), QR codes, and dynamic request links.</li>
          <li><strong>Corporate Solutions:</strong> Enterprise payroll automated disbursement systems, bulk settlements, and B2B vendor management portals.</li>
          <li><strong>Marketplace Facilities:</strong> Digital event ticketing passes, QR validation tags, and online promotional vouchers.</li>
          <li><strong>Future Expansion Horizons:</strong> Planned digital asset management, virtual asset service provider (VASP) integration, and merchant checkout APIs.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-03-information-we-collect',
    chapterNumber: '03',
    title: 'Information We Collect Overview',
    subtitle: 'Categorization & Essential Data Streams',
    body: (
      <div className="space-y-4">
        <p>
          To deliver secure financial services and comply with statutory Anti-Money Laundering (AML) mandates, we gather necessary personal information. We categorize the data we collect into six primary operational channels:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">1. User-Provided Data</span>
            Information submitted directly during account creation, KYC verification, and support communications.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">2. Identity & KYC Data</span>
            Biometric scans, government identifiers (NIN, BVN), and address proof documentation.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">3. Financial & Ledger Data</span>
            Virtual account ledgers, payment instrument tokens, bank account numbers, and settlement logs.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">4. Technical & Device Data</span>
            Device IDs, IP addresses, OS versions, telemetry logs, and app performance metrics.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'sec-04-information-you-provide',
    chapterNumber: '04',
    title: 'Information You Provide Directly',
    subtitle: 'Registration Details, Profiles & Manual Inputs',
    body: (
      <div className="space-y-4">
        <p>
          When you register for a BlueSea Mobile account or update your profile, you directly supply us with personal details required for service delivery:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Full legal name (first name, middle name, and surname).</li>
          <li>Primary mobile telephone number and secondary contact numbers.</li>
          <li>Verified personal or business email address.</li>
          <li>Residential street address, city, local government area (LGA), and state of residence.</li>
          <li>Date of birth and gender.</li>
          <li>Profile photograph or chosen display avatar.</li>
          <li>Corporate onboarding data (CAC registration numbers, Tax Identification Numbers [TIN], Memorandum of Association, and Director details for business accounts).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-05-identity-verification',
    chapterNumber: '05',
    title: 'Identity Verification Data (KYC & Biometrics)',
    subtitle: 'NIN, BVN, Facial Verification & Regulatory Checks',
    body: (
      <div className="space-y-4">
        <p>
          To satisfy Central Bank of Nigeria (CBN) Tiered Know-Your-Customer directives and Anti-Money Laundering laws, we collect and verify high-assurance identity attributes:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Bank Verification Number (BVN):</strong> Used exclusively to query the NIBSS central database to verify your name, date of birth, and linked bank accounts.</li>
          <li><strong>National Identification Number (NIN):</strong> Validated against the National Identity Management Commission (NIMC) database.</li>
          <li><strong>Facial Biometrics & Selfies:</strong> Facial verification photos processed to match your official government database photo for liveness detection and fraud prevention.</li>
          <li><strong>Government-Issued ID Documents:</strong> High-resolution uploads of International Passports, Driver&apos;s Licenses, Voter Cards, or National Identity Cards.</li>
        </ul>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Biometric & BVN Isolation',
        description: (
          <p>
            BlueSea Mobile does NOT store raw biometric fingerprint files or raw BVN databases. Verification queries are conducted via encrypted tokens provided by NIMC and NIBSS licensed verification partners.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-06-financial-information',
    chapterNumber: '06',
    title: 'Financial & Ledger Information',
    subtitle: 'Bank Accounts, Card Tokens & Transaction Records',
    body: (
      <div className="space-y-4">
        <p>
          To maintain your digital wallet and execute transactions, we collect and store:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Assigned dedicated virtual bank account numbers generated through partner commercial/microfinance banks.</li>
          <li>External bank account numbers and beneficiary account details used for outward transfers.</li>
          <li>Masked payment card details (first 6 and last 4 digits) and PCI-DSS compliant payment gateway tokens.</li>
          <li>Complete wallet transaction ledger history, including credits, debits, chargebacks, and fee assessments.</li>
          <li>Payroll payment instructions, beneficiary rosters, and salary disbursement logs submitted by corporate accounts.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-07-device-information',
    chapterNumber: '07',
    title: 'Device & Hardware Telemetry',
    subtitle: 'Hardware Identifiers, Fingerprints & Network Signals',
    body: (
      <div className="space-y-4">
        <p>
          When you access the BlueSea Mobile application, our security SDKs automatically capture device telemetry to protect your account against unauthorized logins:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Device model, manufacturer, hardware specifications, and system language.</li>
          <li>Operating system name, version, and security patch level (iOS / Android).</li>
          <li>Unique Device Identifiers (IMEI, Android ID, IDFV, or UUID).</li>
          <li>Mobile network operator name, SIM card serial status, and signal strength.</li>
          <li>Rooting or jailbreak detection status to prevent execution in compromised device environments.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-08-technical-information',
    chapterNumber: '08',
    title: 'Technical Usage & System Diagnostics',
    subtitle: 'IP Logs, API Traffic & Application Telemetry',
    body: (
      <div className="space-y-4">
        <p>
          Our servers automatically record technical parameters whenever your application connects to our microservices:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Internet Protocol (IP) address, port numbers, and access timestamps.</li>
          <li>App execution logs, feature interaction metrics, screen navigation flows, and session durations.</li>
          <li>Crash diagnostics, stack traces, latency benchmarks, and API response codes.</li>
          <li>Coarse geographical location derived from IP address or high-accuracy GPS location (when explicit permission is granted for proximity security).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-09-transaction-information',
    chapterNumber: '09',
    title: 'Detailed Transaction Metadata',
    subtitle: 'Timestamps, Biller Identifiers & Utility Tokens',
    body: (
      <div className="space-y-4">
        <p>
          For every financial interaction on BlueSea Mobile, we record complete metadata required for auditing, receipt generation, and dispute resolution:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Transaction reference codes, NIBSS Session IDs, and internal ledger tracking UUIDs.</li>
          <li>Utility bill payment details (Electricity Meter Numbers, DISCO identifiers, Smartcard Numbers, Telecom Operator IDs).</li>
          <li>Blue Connect social transaction memo notes, payment tags, and username recipient references.</li>
          <li>Ticket purchase metadata (Event IDs, seat categories, barcode hash tokens).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-10-cookies-overview',
    chapterNumber: '10',
    title: 'Cookies & Tracking Technologies Overview',
    subtitle: 'Web Storage, Session Tokens & SDK Telemetry',
    body: (
      <div className="space-y-4">
        <p>
          On our web interface and web applications, we use cookies, local storage, and web beacons to maintain session state, secure login credentials, and analyze web traffic patterns. Detailed choices regarding cookie controls are provided in Section 31.
        </p>
      </div>
    )
  },
  {
    id: 'sec-11-why-we-collect',
    chapterNumber: '11',
    title: 'Legal Bases & Why We Collect Data',
    subtitle: 'Statutory Foundations under NDPA 2023',
    body: (
      <div className="space-y-4">
        <p>
          Under Section 25 of the Nigeria Data Protection Act 2023, BlueSea Mobile processes your personal data only where a lawful legal basis exists:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Legal Basis</th>
                <th className="p-2.5 border-b">Operational Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">Contract Performance</td>
                <td className="p-2.5">Processing transfers, bill payments, wallet loading, and account balance management as requested by you.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Legal & Statutory Mandate</td>
                <td className="p-2.5">Fulfilling CBN KYC rules, NFIU reporting, Money Laundering Act 2022 obligations, and tax withholdings.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Legitimate Interests</td>
                <td className="p-2.5">Real-time fraud prevention, cyber threat monitoring, platform reliability enhancement, and system optimization.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Explicit User Consent</td>
                <td className="p-2.5">Direct marketing communications, promo notifications, and optional location-based security features.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'sec-12-how-we-use-information',
    chapterNumber: '12',
    title: 'How We Use Your Information',
    subtitle: 'Core Operational Purposes & Service Provision',
    body: (
      <div className="space-y-4">
        <p>
          We utilize collected information to deliver seamless, secure, and personalized financial experiences:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Create, authenticate, and maintain your primary BlueSea Wallet account.</li>
          <li>Route funds instantly across NIBSS interbank clearing switches and utility provider networks.</li>
          <li>Generate digital receipts, transaction statements, and electronic tax records.</li>
          <li>Verify beneficiary details before outgoing transfers to eliminate sending errors.</li>
          <li>Operate corporate payroll systems and generate bulk payment confirmations.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-13-fraud-detection',
    chapterNumber: '13',
    title: 'Fraud Detection & Prevention Systems',
    subtitle: 'Machine Learning Risk Scoring & Account Defense',
    body: (
      <div className="space-y-4">
        <p>
          Protecting your financial assets requires real-time analysis of transaction parameters. We process data through automated risk algorithms to detect abnormal velocity, impossible geographical travel, SIM swap attempts, or credential stuffing attacks.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'warning',
        title: 'Automated Fraud Interventions',
        description: (
          <p>
            When our fraud system detects high-risk activity on your account, transactions may be paused automatically for up to 24 hours to protect your funds while compliance officers verify account ownership.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-14-security-monitoring',
    chapterNumber: '14',
    title: 'Continuous Security & Cyber Monitoring',
    subtitle: 'SIEM Logging, Intrusion Prevention & Audits',
    body: (
      <div className="space-y-4">
        <p>
          We process server logs, application events, and network packets within our Security Information and Event Management (SIEM) infrastructure to intercept unauthorized access, DDoS attacks, and API exploitation attempts.
        </p>
      </div>
    )
  },
  {
    id: 'sec-15-identity-verification-use',
    chapterNumber: '15',
    title: 'Identity Verification & Ongoing Surveillance',
    subtitle: 'Sanction Screening & Regulatory Profiling',
    body: (
      <div className="space-y-4">
        <p>
          We cross-check user identity records against official domestic and international sanction watchlists, Politically Exposed Persons (PEP) databases, and law enforcement bulletins to satisfy mandatory Nigerian AML/CFT compliance mandates.
        </p>
      </div>
    )
  },
  {
    id: 'sec-16-customer-support',
    chapterNumber: '16',
    title: 'Customer Support & Dispute Escalations',
    subtitle: 'Ticket Logging, Call Audio & Case History',
    body: (
      <div className="space-y-4">
        <p>
          When you contact Customer Care, we collect communication logs, support ticket histories, and recorded customer service calls. These records are used to investigate failed transactions, resolve chargebacks, and evaluate service quality.
        </p>
      </div>
    )
  },
  {
    id: 'sec-17-improving-services',
    chapterNumber: '17',
    title: 'Platform Improvement & Quality Optimization',
    subtitle: 'Feature Analytics, Bug Fixes & UX Performance',
    body: (
      <div className="space-y-4">
        <p>
          We analyze aggregated, non-personally identifiable telemetry to optimize app load times, streamline checkout steps, refine UI navigation, and diagnose mobile device compatibility issues across various smartphone models in Nigeria.
        </p>
      </div>
    )
  },
  {
    id: 'sec-18-marketing-communications',
    chapterNumber: '18',
    title: 'Marketing Communications & Notifications',
    subtitle: 'Promotional Emails, App Alerts & Consent Opt-Outs',
    body: (
      <div className="space-y-4">
        <p>
          With your explicit consent, we may send promotional offers, cash-back campaign notifications, and feature releases via email, SMS, or push notifications. You retain full control over marketing channels and can opt-out at any time in app settings.
        </p>
      </div>
    )
  },
  {
    id: 'sec-19-regulatory-compliance',
    chapterNumber: '19',
    title: 'Legal & Regulatory Compliance Mandates',
    subtitle: 'CBN Directives, Statutory Taxes & Reporting',
    body: (
      <div className="space-y-4">
        <p>
          We use personal and transaction data to calculate statutory taxes, collect the Electronic Money Transfer Levy (EMTL), submit statutory regulatory filings to the Central Bank of Nigeria (CBN), and prepare reports for the Nigerian Financial Intelligence Unit (NFIU).
        </p>
      </div>
    )
  },
  {
    id: 'sec-20-service-providers',
    chapterNumber: '20',
    title: 'Sharing Information with Service Providers',
    subtitle: 'Vetted Infrastructure Partners & Cloud Vendors',
    body: (
      <div className="space-y-4">
        <p>
          We share necessary data with third-party technical vendors under strict Data Processing Agreements (DPAs) requiring adherence to NDPA 2023 security benchmarks. Trusted vendor categories include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Cloud hosting providers (Amazon Web Services, Microsoft Azure) maintaining Tier-IV data centers.</li>
          <li>SMS delivery networks and push notification aggregators.</li>
          <li>Identity verification and facial liveness inspection partners.</li>
          <li>Customer support ticket software providers.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-21-banking-partners',
    chapterNumber: '21',
    title: 'Sharing with Banking Partners & Clearing Systems',
    subtitle: 'NIBSS Interbank Settlement & Partner MFB/Commercial Banks',
    body: (
      <div className="space-y-4">
        <p>
          To complete bank transfers and process wallet deposits, we transmit recipient names, account numbers, and transfer memos to partner commercial banks, microfinance banks, and NIBSS Plc.
        </p>
      </div>
    )
  },
  {
    id: 'sec-22-payment-providers',
    chapterNumber: '22',
    title: 'Sharing with Payment Switches & Processors',
    subtitle: 'Card Networks, Utility Aggregators & DISCO Gateways',
    body: (
      <div className="space-y-4">
        <p>
          When you purchase electricity tokens, mobile data, or cable subscriptions, necessary utility customer IDs and payment values are shared with licensed payment gateways (Interswitch, Paystack, Flutterwave) and direct utility aggregators.
        </p>
      </div>
    )
  },
  {
    id: 'sec-23-regulatory-authorities',
    chapterNumber: '23',
    title: 'Disclosures to Statutory & Regulatory Bodies',
    subtitle: 'Mandatory Compliance Reporting Frameworks',
    body: (
      <div className="space-y-4">
        <p>
          We disclose user data to statutory regulators when required by law, including the Central Bank of Nigeria (CBN), the Nigeria Data Protection Commission (NDPC), the Federal Inland Revenue Service (FIRS), and State Internal Revenue Services.
        </p>
      </div>
    )
  },
  {
    id: 'sec-24-law-enforcement',
    chapterNumber: '24',
    title: 'Law Enforcement & Legal Process Requests',
    subtitle: 'Court Orders, EFCC Subpoenas & Police Requests',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile discloses information to law enforcement agencies (e.g., EFCC, NFIU, Nigeria Police Force) only upon receipt of a legally valid court order, search warrant, or official statutory summons issued by a court of competent jurisdiction in Nigeria.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Strict Disclosure Verification',
        description: (
          <p>
            Our legal team independently verifies the legal validity of every law enforcement request before disclosing any customer records. Informal or verbal requests for data are rejected.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-25-corporate-transactions',
    chapterNumber: '25',
    title: 'Corporate Transactions & Business Transfers',
    subtitle: 'Mergers, Acquisitions & Asset Reorganization',
    body: (
      <div className="space-y-4">
        <p>
          In the event of a corporate merger, acquisition, asset sale, or restructuring of BlueSea Mobile Technologies Limited, user records may be transferred as part of the business assets under strict confidentiality agreements and subject to NDPC notification.
        </p>
      </div>
    )
  },
  {
    id: 'sec-26-international-transfers',
    chapterNumber: '26',
    title: 'International & Cross-Border Data Transfers',
    subtitle: 'NDPA Article 41 Safeguards & Cloud Sovereignty',
    body: (
      <div className="space-y-4">
        <p>
          Your personal data is primarily hosted within high-security data infrastructure in Nigeria and tier-one global cloud data centers. When transferring data internationally for cloud redundancy or security processing, we ensure compliance with NDPA 2023 Cross-Border Data Transfer rules through Standard Contractual Clauses (SCCs).
        </p>
      </div>
    )
  },
  {
    id: 'sec-27-data-retention',
    chapterNumber: '27',
    title: 'Data Retention Policy & Statutory Timeline',
    subtitle: '5-Year Financial Retention Mandates under Nigerian Law',
    body: (
      <div className="space-y-4">
        <p>
          We retain personal data and financial transaction records for as long as your account remains active, and for a mandatory retention period following account closure:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Statutory Financial Retention:</strong> Transaction ledgers, KYC identity files, and transfer histories are retained for a minimum of <strong>five (5) years</strong> post-account closure, as mandated by the Money Laundering (Prevention and Prohibition) Act 2022 and CBN guidelines.</li>
          <li><strong>Non-Financial Telemetry:</strong> Technical logs, crash reports, and marketing consents are retained for up to 12 months before automated purging or anonymization.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-28-data-protection-measures',
    chapterNumber: '28',
    title: 'Data Protection & Cybersecurity Standards',
    subtitle: 'ISO 27001 Alignment, Defense-in-Depth & SOC-2 Controls',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile implements rigorous physical, administrative, and technical safeguards engineered to prevent unauthorized access, data destruction, alteration, or disclosure. Our security posture follows ISO/IEC 27001 information security standards and PCI-DSS payment security frameworks.
        </p>
      </div>
    )
  },
  {
    id: 'sec-29-encryption-standards',
    chapterNumber: '29',
    title: 'Encryption & Technical Security Architecture',
    subtitle: 'TLS 1.3 in Transit & AES-256 at Rest',
    body: (
      <div className="space-y-4">
        <p>
          We enforce advanced cryptographic protection across every layer of our platform:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Data in Transit:</strong> All network communication between mobile apps, web interfaces, and backend microservices is encrypted using Transport Layer Security (TLS 1.3) with elliptic curve cryptography.</li>
          <li><strong>Data at Rest:</strong> Database tables, storage buckets, and ledger archives are encrypted using AES-256 bit encryption keys managed in Hardware Security Modules (HSM).</li>
          <li><strong>Credential Hashing:</strong> User transaction PINs and passwords are salted and hashed using Argon2/PBKDF2 algorithms. Plaintext PINs are never stored or logged.</li>
        </ul>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Zero Plaintext PIN Storage',
        description: (
          <p>
            Your 4-digit transaction PIN is cryptographically hashed at the device level before transmission. No BlueSea Mobile employee, administrator, or database engineer can view your transaction PIN.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-30-user-security-responsibilities',
    chapterNumber: '30',
    title: 'User Security Responsibilities',
    subtitle: 'Safeguarding Credentials, Devices & OTP Tokens',
    body: (
      <div className="space-y-4">
        <p>
          Data security is a shared responsibility. You are required to maintain strict secrecy over your account credentials:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Never share your One-Time Password (OTP), login password, or transaction PIN with anyone.</li>
          <li>Enable biometric authentication (Face ID / Fingerprint) and device screen locks.</li>
          <li>Immediately notify <strong>security@blueseamobile.com</strong> if your mobile device is lost or stolen.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-31-cookies-policy',
    chapterNumber: '31',
    title: 'Cookies & Local Storage Policy Controls',
    subtitle: 'Managing Web Browser Preferences',
    body: (
      <div className="space-y-4">
        <p>
          You can control web cookies through your browser settings. Disabling essential session cookies may prevent web portal authentication and online account management.
        </p>
      </div>
    )
  },
  {
    id: 'sec-32-analytics',
    chapterNumber: '32',
    title: 'Analytics & Performance Diagnostic SDKs',
    subtitle: 'Privacy-Preserving Telemetry Monitors',
    body: (
      <div className="space-y-4">
        <p>
          We use privacy-preserving diagnostic SDKs to capture crash reports and app performance metrics. Diagnostic telemetry is stripped of personally identifiable information (PII) before transmission to analytics servers.
        </p>
      </div>
    )
  },
  {
    id: 'sec-33-childrens-privacy',
    chapterNumber: '33',
    title: 'Children&apos;s Privacy & Age Restrictions',
    subtitle: 'Strict Prohibition of Under-18 Registrations',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile services are strictly prohibited for individuals under eighteen (18) years of age. We do not knowingly collect personal data from minors. If we discover an account opened by a minor, it will be closed immediately.
        </p>
      </div>
    )
  },
  {
    id: 'sec-34-your-privacy-rights',
    chapterNumber: '34',
    title: 'Your Privacy Rights Under NDPA 2023',
    subtitle: 'Statutory Data Subject Rights Overview',
    body: (
      <div className="space-y-4">
        <p>
          Pursuant to the Nigeria Data Protection Act 2023, as a Data Subject you possess enforceable rights regarding your personal data processed by BlueSea Mobile:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">Right to Information & Access</span>
            Request confirmation and copies of personal records held by us.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">Right to Rectification</span>
            Correct inaccurate or incomplete personal profile records.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">Right to Erasure</span>
            Request data deletion, subject to mandatory 5-year financial retention laws.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-white block mb-1">Right to Data Portability</span>
            Obtain structured copies of your personal data for export.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'sec-35-access-requests',
    chapterNumber: '35',
    title: 'Data Access Requests (DSAR Protocol)',
    subtitle: 'How to Submit Formal Access Requests',
    body: (
      <div className="space-y-4">
        <p>
          You may submit a Data Subject Access Request (DSAR) by emailing <strong>dpo@blueseamobile.com</strong>. We will process and fulfill verified access requests within thirty (30) days without charge.
        </p>
      </div>
    )
  },
  {
    id: 'sec-36-correction-requests',
    chapterNumber: '36',
    title: 'Data Correction & Profile Update Requests',
    subtitle: 'Rectification Procedures for KYC Data',
    body: (
      <div className="space-y-4">
        <p>
          You can update profile details directly within the mobile application settings. For corrections involving legal names, NIN, or BVN modifications, official supporting documents must be submitted to compliance for re-verification.
        </p>
      </div>
    )
  },
  {
    id: 'sec-37-deletion-requests',
    chapterNumber: '37',
    title: 'Data Deletion & Account Erasure Limits',
    subtitle: 'Right to Erasure vs. Statutory Retention Mandates',
    body: (
      <div className="space-y-4">
        <p>
          While you may request account deletion, NDPA 2023 Article 34(2) provides that erasure rights do not override statutory financial retention obligations. Transaction ledger history and identity verification records will be retained for five (5) years post-deletion to comply with CBN and Anti-Money Laundering laws.
        </p>
      </div>
    )
  },
  {
    id: 'sec-38-withdrawal-of-consent',
    chapterNumber: '38',
    title: 'Withdrawal of Consent',
    subtitle: 'Revoking Consent for Non-Essential Processing',
    body: (
      <div className="space-y-4">
        <p>
          Where processing is based on consent (e.g., marketing updates), you may withdraw consent at any time via in-app privacy toggles. Withdrawal of consent does not affect processing conducted prior to revocation or processing grounded in contractual obligation.
        </p>
      </div>
    )
  },
  {
    id: 'sec-39-marketing-preferences',
    chapterNumber: '39',
    title: 'Managing Marketing Communications Preferences',
    subtitle: 'Opt-Out Links & Notification Toggles',
    body: (
      <div className="space-y-4">
        <p>
          You can unsubscribe from promotional emails by clicking the &quot;Unsubscribe&quot; link in any marketing email, or by toggling off push notifications in your mobile app account settings. Transactional security alerts (OTPs, balance updates, transfer receipts) cannot be disabled.
        </p>
      </div>
    )
  },
  {
    id: 'sec-40-policy-changes',
    chapterNumber: '40',
    title: 'Changes & Amendments to this Privacy Policy',
    subtitle: 'Revision Notifications & Prior Notice Window',
    body: (
      <div className="space-y-4">
        <p>
          We review and update this Privacy Policy periodically to reflect regulatory directives or service upgrades. Material amendments will be communicated at least fourteen (14) days prior to taking effect via email or in-app alerts.
        </p>
      </div>
    )
  },
  {
    id: 'sec-41-contact-dpo',
    chapterNumber: '41',
    title: 'Contacting BlueSea Mobile Data Protection Office',
    subtitle: 'DPO Office Address, Escalation & NDPC Complaint Rights',
    body: (
      <div className="space-y-4">
        <p>
          For privacy inquiries, data subject requests, or regulatory concerns, contact our designated Data Protection Officer:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
          <p><strong>Data Protection Officer:</strong> DPO Office, BlueSea Mobile Technologies Limited</p>
          <p><strong>DPO Email Desk:</strong> dpo@blueseamobile.com</p>
          <p><strong>General Privacy Desk:</strong> privacy@blueseamobile.com</p>
          <p><strong>Head Office:</strong> BlueSea Mobile Towers, Victoria Island, Lagos, Nigeria</p>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          If you believe your privacy rights have been violated and we have not resolved your grievance, you have the right to lodge a complaint with the <strong>Nigeria Data Protection Commission (NDPC)</strong> at <strong>info@ndpc.gov.ng</strong>.
        </p>
      </div>
    )
  },
  {
    id: 'sec-42-effective-date',
    chapterNumber: '42',
    title: 'Effective Date & Scope',
    subtitle: 'Operational Activation Threshold',
    body: (
      <div className="space-y-4">
        <p>
          This Privacy Policy officially takes effect on <strong>January 1, 2026</strong>, and applies to all current and registered users across BlueSea Mobile web and mobile applications.
        </p>
      </div>
    )
  },
  {
    id: 'sec-43-version-history',
    chapterNumber: '43',
    title: 'Version Control & Revision History',
    subtitle: 'Audit Log of Privacy Policy Modifications',
    body: (
      <div className="space-y-4">
        <p>
          Below is a log of historical privacy revisions:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Version</th>
                <th className="p-2.5 border-b">Release Date</th>
                <th className="p-2.5 border-b">Summary of Regulatory Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">v2.4.0</td>
                <td className="p-2.5">Jan 01, 2026</td>
                <td className="p-2.5">Comprehensive update for NDPA 2023 compliance, expanded Tiered KYC rules, Blue Connect social payment privacy rules, and corporate payroll data processing guidelines.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.1.0</td>
                <td className="p-2.5">Aug 10, 2025</td>
                <td className="p-2.5">Added utility bill payment data aggregation details and enhanced biometric storage isolation notices.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v1.0.0</td>
                <td className="p-2.5">Mar 01, 2024</td>
                <td className="p-2.5">Initial launch privacy framework for BlueSea Mobile consumer platform.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
];

const privacyPolicyConfig: LegalDocumentConfig = {
  metadata: {
    id: 'privacy-policy',
    title: 'Privacy Policy & Data Protection',
    shortDescription: 'How BlueSea Mobile collects, uses, protects, and manages your personal data and financial information in compliance with NDPA 2023 and CBN regulations.',
    category: 'Privacy & Data',
    version: '2.4.0',
    lastUpdated: 'July 25, 2026',
    effectiveDate: 'January 1, 2026',
    estimatedReadingTime: '22 min read',
    applicableRegion: 'Federal Republic of Nigeria',
    status: 'active'
  },
  previousDoc: {
    title: 'Terms & Conditions of Service',
    path: '/legal/terms'
  },
  nextDoc: {
    title: 'Refund & Cancellation Policy',
    path: '/legal/refund'
  },
  sections: privacyPolicySections
};


export function PrivacyPolicy() {
  return (
    <div className="relative">
            <LegalDocumentTemplate config={privacyPolicyConfig} />
    </div>
  );
}

export default PrivacyPolicy;