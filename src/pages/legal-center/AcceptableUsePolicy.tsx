import type { LegalDocumentConfig, LegalSectionData } from '@/types/legal';
import { LegalDocumentTemplate } from '@/components/legal/LegalDocumentTemplate';

const acceptableUsePolicySections: LegalSectionData[] = [
  {
    id: 'sec-01-introduction',
    chapterNumber: '01',
    title: 'Introduction',
    subtitle: 'Platform Integrity & Community Standards',
    body: (
      <div className="space-y-4">
        <p>
          Welcome to the Acceptable Use Policy (&quot;AUP&quot; or &quot;Policy&quot;) of <strong>BlueSea Mobile Technologies Limited</strong> (&quot;BlueSea Mobile&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
        </p>
        <p>
          BlueSea Mobile operates a licensed financial technology platform offering digital wallets, peer-to-peer transfers (&quot;Blue Connect&quot;), utility bill payments, airtime/data top-ups, corporate payroll services, ticket sales, and forthcoming products including merchant acquiring and regulated cryptocurrency services.
        </p>
        <p>
          To maintain a safe, resilient, transparent, and legally compliant financial environment for all individuals and enterprises, we enforce strict operational boundaries. This Policy defines the permissible boundaries of user conduct across all BlueSea Mobile mobile applications, web portals, application programming interfaces (APIs), and integrated services.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Mandatory Compliance Guarantee',
        description: (
          <p>
            By creating an account, accessing our infrastructure, or executing a financial transaction through BlueSea Mobile, you agree to strictly abide by this Acceptable Use Policy. Failure to comply may result in immediate transaction refusal, account suspension, asset freezing, and referral to Nigerian law enforcement.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-02-purpose',
    chapterNumber: '02',
    title: 'Purpose of This Policy',
    subtitle: 'Objectives & Risk Mitigation',
    body: (
      <div className="space-y-4">
        <p>
          The primary objectives of this Acceptable Use Policy are to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Protect Financial Assets:</strong> Shield customer funds, merchant balances, and operational ledgers against fraud, unauthorized diversion, and cyber theft.</li>
          <li><strong>Maintain System Reliability:</strong> Ensure uninterrupted high availability (99.99% uptime) across our payment gateways and bill-processing switches.</li>
          <li><strong>Uphold Regulatory Directives:</strong> Enforce strict adherence to Central Bank of Nigeria (CBN) regulations, Economic and Financial Crimes Commission (EFCC) mandates, Nigeria Data Protection Act (NDPA 2023), and the Cybercrimes (Prohibition, Prevention, etc.) Act.</li>
          <li><strong>Foster User Trust:</strong> Cultivate an ethical community of individual consumers and corporate organizations built on transparency and mutual accountability.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-03-scope',
    chapterNumber: '03',
    title: 'Scope of Application',
    subtitle: 'System Boundaries & Covered Assets',
    body: (
      <div className="space-y-4">
        <p>
          This Policy applies to all interactions with BlueSea Mobile infrastructure, including but not limited to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>BlueSea Mobile iOS and Android native applications.</li>
          <li>Web-based user dashboards, corporate payroll portals, and merchant terminals.</li>
          <li>Blue Connect handle resolution systems, QR code generators, and dynamic payment links.</li>
          <li>Developer APIs, webhook endpoints, and staging/production sandbox environments.</li>
          <li>All current and future financial products deployed under the BlueSea Mobile trademark.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-04-who-must-comply',
    chapterNumber: '04',
    title: 'Who Must Comply',
    subtitle: 'User Categories & Legal Persons',
    body: (
      <div className="space-y-4">
        <p>
          Compliance with this Policy is mandatory for all legal entities interacting with our platform, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Individual Consumers:</strong> Registered holders of personal Tier 1, Tier 2, and Tier 3 digital wallets.</li>
          <li><strong>Corporate &amp; Business Clients:</strong> Enterprises utilizing payroll automation, bulk disbursements, or merchant services.</li>
          <li><strong>Third-Party Integrators:</strong> Developers, fintech partners, and aggregators accessing BlueSea Mobile API switches.</li>
          <li><strong>Guests &amp; Visitors:</strong> Individuals visiting our public web domains, help centers, or customer portals.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-05-user-responsibilities',
    chapterNumber: '05',
    title: 'General User Responsibilities',
    subtitle: 'Duties of Due Diligence & Good Faith',
    body: (
      <div className="space-y-4">
        <p>
          As a user of BlueSea Mobile, you agree to exercise due diligence and act in good faith at all times. Your responsibilities include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Providing accurate, current, and verifiable identity information during account creation and KYC reviews.</li>
          <li>Maintaining exclusive physical and digital control over your login credentials, devices, and transaction PINs.</li>
          <li>Promptly reviewing account statements and transaction histories for unauthorized or erroneous charges.</li>
          <li>Executing financial transactions solely for legitimate, lawful, and authorized personal or business purposes.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-06-lawful-use',
    chapterNumber: '06',
    title: 'Lawful Use of the Platform',
    subtitle: 'Statutory Compliance Baseline',
    body: (
      <div className="space-y-4">
        <p>
          You must ensure that your use of BlueSea Mobile complies with all applicable local, national, and international laws, statutes, and regulatory guidelines in the Federal Republic of Nigeria and your jurisdiction of residence.
        </p>
        <p>
          You are expressly prohibited from utilizing BlueSea Mobile to facilitate, fund, conceal, or profit from any activity that constitutes a criminal offense or civil wrong under Nigerian law.
        </p>
      </div>
    )
  },
  {
    id: 'sec-07-responsible-account-usage',
    chapterNumber: '07',
    title: 'Responsible Account Usage',
    subtitle: 'Single Account Integrity & Profile Rules',
    body: (
      <div className="space-y-4">
        <p>
          To maintain ledger accuracy and prevent fraud, users must adhere to strict account setup standards:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Individual users may maintain only one (1) primary verified personal account tied to their unique Bank Verification Number (BVN) and National Identification Number (NIN).</li>
          <li>Creating duplicate, secondary, or synthetic personal accounts to circumvent account limits, promotional terms, or regulatory freezes is strictly prohibited.</li>
          <li>Accounts are non-transferable and may not be sold, rented, leased, or assigned to third parties.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-08-protecting-credentials',
    chapterNumber: '08',
    title: 'Protecting Login & Auth Credentials',
    subtitle: 'Credential Hygiene & Non-Disclosure',
    body: (
      <div className="space-y-4">
        <p>
          Your account security depends directly on credential secrecy. You are strictly forbidden from:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Sharing your master account password, 4-digit transaction PIN, or One-Time Passwords (OTPs) with any person or third-party service.</li>
          <li>Writing down credentials in plain text or using insecure, unencrypted credential-sharing tools.</li>
          <li>Authorizing unvetted third-party screen-scraping apps or automated money management tools to store your login tokens.</li>
        </ul>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Zero-Share Credential Rule',
        description: (
          <p>
            BlueSea Mobile staff will NEVER ask you for your transaction PIN, account password, or multi-factor OTP. Treat any request for your credentials as an active phishing attempt and report it immediately.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-09-wallet-usage',
    chapterNumber: '09',
    title: 'Acceptable Digital Wallet Usage',
    subtitle: 'Limits, Funding Sources & Transfers',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile digital wallets are designed for lawful personal and business financial management. Acceptable wallet operations include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Funding your wallet via verified commercial bank transfers, debit cards, or approved agent cash-in networks.</li>
          <li>Executing wallet-to-wallet transfers to verified friends, family, or commercial counterparties.</li>
          <li>Withdrawing balance funds to bank accounts registered in your verified legal name.</li>
          <li>Maintaining balances within designated Tier 1, Tier 2, or Tier 3 regulatory transaction thresholds.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-10-blue-connect-use',
    chapterNumber: '10',
    title: 'Proper Use of Blue Connect',
    subtitle: 'Handles, Payment Links & Peer Transfers',
    body: (
      <div className="space-y-4">
        <p>
          Blue Connect enables direct peer-to-peer transfers via customized user handles (@username) and dynamic payment links. When using Blue Connect, you must:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Select user handles that do not infringe upon third-party trademarks, registered brand names, or offensive terminology.</li>
          <li>Verify recipient account names prior to authorizing transfers; BlueSea Mobile is not responsible for misdirected transfers caused by user handle typos.</li>
          <li>Refrain from issuing payment links accompanied by deceptive, fraudulent, or extortionate payment demands.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-11-payroll-services',
    chapterNumber: '11',
    title: 'Responsible Use of Payroll Services',
    subtitle: 'Employer Obligations & Bulk Disbursements',
    body: (
      <div className="space-y-4">
        <p>
          Corporate organizations utilizing BlueSea Mobile Payroll and Bulk Disbursement tools agree to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Disburse funds exclusively to legitimate employees, contractors, or verified vendor bank accounts.</li>
          <li>Ensure all salary batch files are vetted through dual-control (&quot;Maker-Checker&quot;) approval workflows prior to dispatch.</li>
          <li>Refrain from utilizing payroll processing rails to execute structured money laundering, tax evasion, or wage theft operations.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-12-bill-payments',
    chapterNumber: '12',
    title: 'Proper Use of Bill Payment Services',
    subtitle: 'Utility, Airtime, Data & Education PINs',
    body: (
      <div className="space-y-4">
        <p>
          Bill payment services (including electricity, cable TV, internet, airtime, and education PINs) must be used for genuine consumption:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Ensure utility meter numbers, smartcard numbers, and telephone numbers are correctly entered before confirmation.</li>
          <li>Do not use automated carding scripts or stolen payment credentials to purchase airtime or utility tokens for unauthorized resale.</li>
          <li>Education PINs (WAEC, NECO, JAMB) purchased through the platform must not be resold above statutory price caps in violation of consumer protection guidelines.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-13-ticket-sales',
    chapterNumber: '13',
    title: 'Ticket Sales & Event Usage',
    subtitle: 'Fair Purchasing & Scalping Restrictions',
    body: (
      <div className="space-y-4">
        <p>
          When purchasing or selling event tickets through BlueSea Mobile:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>You must not utilize automated bot scripts to hoard event tickets for predatory secondary market scalping.</li>
          <li>Event organizers selling tickets must accurately represent event details, dates, venues, and refund terms.</li>
          <li>Selling counterfeit, revoked, or double-issued event tickets is strictly prohibited and triggers immediate account termination.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-14-future-crypto',
    chapterNumber: '14',
    title: 'Future Cryptocurrency & Digital Asset Services',
    subtitle: 'Framework for Regulated Digital Assets',
    body: (
      <div className="space-y-4">
        <p>
          Upon full deployment of BlueSea Mobile Cryptocurrency and Digital Asset modules under applicable SEC/CBN regulatory frameworks, users must:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Source digital assets strictly through verified legal origin paths.</li>
          <li>Refrain from executing trades involving sanctioned privacy coins, darknet mixer protocols (e.g., Tornado Cash), or illicit wallet addresses.</li>
          <li>Acknowledge that digital asset operations are subject to enhanced blockchain forensic analytics and real-time transaction screening.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-15-prohibited-activities',
    chapterNumber: '15',
    title: 'Prohibited Activities Overview',
    subtitle: 'Zero-Tolerance Violations',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile enforces a zero-tolerance policy against activities that threaten platform integrity, financial safety, or legal compliance.
        </p>
        <p>
          Engaging in any prohibited activity enumerated in Sections 16 through 31 will trigger immediate protective intervention, including transaction reversal, account freeze, regulatory reporting, and legal action.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'warning',
        title: 'Zero-Tolerance Enforcement Notice',
        description: (
          <p>
            Any attempt to utilize BlueSea Mobile for illegal, fraudulent, or malicious purposes will result in permanent offboarding and referral to local and international law enforcement agencies, including the EFCC, NPF Cybercrime Unit, and NFIU.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-16-fraudulent-transactions',
    chapterNumber: '16',
    title: 'Fraudulent Transactions',
    subtitle: 'Stolen Instruments & Chargeback Abuse',
    body: (
      <div className="space-y-4">
        <p>
          You are strictly forbidden from initiating, facilitating, or benefiting from fraudulent transactions. Prohibited acts include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Funding wallets using stolen debit cards, compromised bank accounts, or unauthorized payment credentials.</li>
          <li>Filing bad-faith, fraudulent payment reversals or chargeback claims with commercial banks after receiving legitimate services.</li>
          <li>Colluding with merchants or counterparties to execute fake sales transactions (&quot;cash-out fraud&quot;).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-17-identity-misrepresentation',
    chapterNumber: '17',
    title: 'Identity Misrepresentation & Impersonation',
    subtitle: 'Synthetic Identities & Impersonation',
    body: (
      <div className="space-y-4">
        <p>
          Users must maintain absolute truthfulness regarding their legal identity. You must not:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Impersonate any person, business entity, public official, or BlueSea Mobile employee.</li>
          <li>Register accounts using stolen, bought, or synthetic BVN, NIN, or corporate registration details.</li>
          <li>Utilize facial liveness bypass tools, deepfake masks, or static photos to complete KYC checks.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-18-money-laundering',
    chapterNumber: '18',
    title: 'Anti-Money Laundering (AML) Violations',
    subtitle: 'Structuring, Layering & Illicit Funds',
    body: (
      <div className="space-y-4">
        <p>
          In strict compliance with the Money Laundering (Prevention and Prohibition) Act 2022, users must not use BlueSea Mobile to convert, transfer, or disguise illicit funds. Prohibited conduct includes:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Structuring (&quot;Smurfing&quot;):</strong> Breaking large cash amounts into multiple small transfers below regulatory reporting thresholds to evade AML detection.</li>
          <li><strong>Layering:</strong> Passing funds through rapid, complex chains of internal wallet transfers without legitimate underlying commercial value.</li>
          <li>Handling funds derived from corruption, oil bunkering, kidnapping, drug trafficking, or advance-fee fraud (419).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-19-terrorist-financing',
    chapterNumber: '19',
    title: 'Counter-Terrorist Financing (CTF) Compliance',
    subtitle: 'Sanctions Screening & Prohibited Entities',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile strictly prohibits the use of its platform to directly or indirectly fund, support, or facilitate terrorist organizations, insurgations, or sanctioned entities.
        </p>
        <p>
          All transactions are screened in real time against domestic and international sanctions lists (including NFIU, OFAC, UN Security Council, and EU lists). Accounts attempting transactions with designated sanctioned parties will be instantly frozen and reported.
        </p>
      </div>
    )
  },
  {
    id: 'sec-20-unauthorized-access',
    chapterNumber: '20',
    title: 'Unauthorized Access Attempts',
    subtitle: 'Credential Stuffing & Network Probing',
    body: (
      <div className="space-y-4">
        <p>
          You must not attempt to gain unauthorized access to any portion of BlueSea Mobile infrastructure. Forbidden actions include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Attempting to access user accounts, administrative portals, or databases belonging to other parties.</li>
          <li>Executing brute-force attacks, dictionary attacks, or automated credential stuffing scripts.</li>
          <li>Port scanning, network probing, or mapping internal cloud network architectures.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-21-circumventing-security',
    chapterNumber: '21',
    title: 'Circumventing Security Controls',
    subtitle: 'Bypassing Biometrics & Geofencing',
    body: (
      <div className="space-y-4">
        <p>
          Users must not tamper with, disable, or bypass technical security mechanisms deployed by BlueSea Mobile, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Bypassing multi-factor authentication (MFA) step-up requirements or biometric checks.</li>
          <li>Using anonymizing VPNs, TOR exit nodes, or residential proxy networks to mask location during high-risk transfers.</li>
          <li>Modifying HTTP headers, SSL certificates, or API payload signatures to spoof client device hardware.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-22-hacking-exploitation',
    chapterNumber: '22',
    title: 'Hacking or Exploitation Attempts',
    subtitle: 'Zero-Day Exploits & Reverse Engineering',
    body: (
      <div className="space-y-4">
        <p>
          Users are strictly prohibited from exploiting software bugs or reverse-engineering application binaries:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Exploiting race conditions, ledger rounding errors, or timing flaws to inflate wallet balances.</li>
          <li>Decompiling, disassembling, or reverse-engineering BlueSea Mobile Android APKs, iOS IPAs, or web JS bundles.</li>
          <li>Withholding discovered security vulnerabilities for malicious exploitation instead of responsible reporting.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-23-malware-code',
    chapterNumber: '23',
    title: 'Malware, Viruses & Malicious Code',
    subtitle: 'Payload Injection & System Corruption',
    body: (
      <div className="space-y-4">
        <p>
          You must not upload, transmit, or introduce malicious software artifacts into BlueSea Mobile systems, including viruses, trojans, ransomware, keyloggers, logic bombs, SQL injection payloads, or cross-site scripting (XSS) code.
        </p>
      </div>
    )
  },
  {
    id: 'sec-24-automated-abuse',
    chapterNumber: '24',
    title: 'Automated Abuse (Bots & Unauthorized Scripts)',
    subtitle: 'Rate Limiting & Web Scraping',
    body: (
      <div className="space-y-4">
        <p>
          Except where explicit written permission is granted through authorized business APIs, you must not:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Deploy web crawlers, scrapers, spiders, or automated bots to extract pricing, user handles, or platform data.</li>
          <li>Automate high-frequency bill payment submissions or transaction requests that exceed published API rate limits.</li>
          <li>Utilize macro tools or auto-clickers to gaming promotional reward systems.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-25-spam-communications',
    chapterNumber: '25',
    title: 'Spam & Unsolicited Communications',
    subtitle: 'Blue Connect Spam & Phishing Distribution',
    body: (
      <div className="space-y-4">
        <p>
          You must not utilize Blue Connect payment memos, transfer notes, or customer messaging features to transmit:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Unsolicited commercial advertisements, spam, or promotional referral links.</li>
          <li>Phishing links, deceptive external URL shorteners, or malicious attachments.</li>
          <li>Abusive, defamatory, harassing, threatening, or extortionate text messages to counterparties.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-26-ip-violations',
    chapterNumber: '26',
    title: 'Intellectual Property Violations',
    subtitle: 'Trademarks, Logos & Brand Protection',
    body: (
      <div className="space-y-4">
        <p>
          The BlueSea Mobile name, brand trademarks, logos, UI designs, codebases, and domain names are the exclusive intellectual property of BlueSea Mobile Technologies Limited.
        </p>
        <p>
          You must not copy, modify, frame, mirror, or create derivative works of our platform assets without our prior written authorization.
        </p>
      </div>
    )
  },
  {
    id: 'sec-27-illegal-activity',
    chapterNumber: '27',
    title: 'Illegal or Criminal Activity',
    subtitle: 'Broad Prohibition on Harmful Commerce',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile services must not be used to process payments for illegal goods or services, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Illegal narcotics, prescription drug diversion, or controlled substances.</li>
          <li>Unlicensed firearms, explosives, weapons, or military munitions.</li>
          <li>Human trafficking, child exploitation material, or non-consensual adult content.</li>
          <li>Counterfeit goods, pirated software, or stolen property.</li>
          <li>Unregulated ponzi schemes, pyramid schemes, or illegal gambling operations.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-28-abuse-of-promotions',
    chapterNumber: '28',
    title: 'Abuse of Promotions or Rewards',
    subtitle: 'Referral Fraud & Cashback Gaming',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile offers referral bonuses, cashback rewards, and fee discounts in good faith. You must not engage in promotional gaming, such as:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Self-referring accounts created under fake names or alternate phone numbers.</li>
          <li>Executing circular wash-transactions between connected accounts solely to generate cashback rewards.</li>
          <li>Manipulating promotional codes through automated account generation.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-29-multiple-accounts',
    chapterNumber: '29',
    title: 'Multiple or Sybil Fraud Accounts',
    subtitle: 'Farm Accounts & Disguised Networks',
    body: (
      <div className="space-y-4">
        <p>
          Operating networks of multiple accounts (&quot;Sybil farming&quot;) to evade transaction limits, conceal beneficiary ownership, or conduct unauthorized commercial money service business (MSB) activities is strictly prohibited.
        </p>
      </div>
    )
  },
  {
    id: 'sec-30-false-documents',
    chapterNumber: '30',
    title: 'False Information or Forged Documents',
    subtitle: 'Document Tampering & Fraudulent Proofs',
    body: (
      <div className="space-y-4">
        <p>
          Submitting altered, forged, or fraudulent documentation during account opening, KYC tier upgrades, or transaction dispute reviews—including fake utility bills, forged bank statements, or edited government IDs—is a serious violation resulting in permanent blacklisting.
        </p>
      </div>
    )
  },
  {
    id: 'sec-31-interference',
    chapterNumber: '31',
    title: 'Interference with Platform Operations',
    subtitle: 'DDoS Attacks & Infrastructure Stress',
    body: (
      <div className="space-y-4">
        <p>
          You must not take any action that imposes an unreasonable or disproportionately large load on our cloud infrastructure, or attempt to disrupt the normal functioning of payment gateways through Distributed Denial of Service (DDoS) attacks or API flood operations.
        </p>
      </div>
    )
  },
  {
    id: 'sec-32-monitoring',
    chapterNumber: '32',
    title: 'Monitoring and Automated Enforcement',
    subtitle: 'Real-Time Auditing & Telemetry',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile continuously monitors transaction flows, system logs, API calls, and user interactions using automated risk telemetry, AI fraud models, and manual analyst reviews.
        </p>
        <p>
          We reserve the right to flag, hold, challenge, or inspect any transaction or account activity that triggers high-risk security thresholds without prior notice.
        </p>
      </div>
    )
  },
  {
    id: 'sec-33-investigation',
    chapterNumber: '33',
    title: 'Investigation of Violations',
    subtitle: 'Inquiry Procedures & Information Requests',
    body: (
      <div className="space-y-4">
        <p>
          When a potential violation of this Policy is identified, BlueSea Mobile will initiate a formal internal investigation. During an investigation:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>We may request additional identity verification documents, proof of source of funds, or commercial invoice evidence.</li>
          <li>You agree to cooperate fully and truthfully with our compliance officers within the specified timeframe.</li>
          <li>Failure to respond to compliance inquiries within five (5) business days may result in immediate account termination.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-34-temporary-restrictions',
    chapterNumber: '34',
    title: 'Temporary Restrictions & Limits',
    subtitle: 'Precautionary Account Holds',
    body: (
      <div className="space-y-4">
        <p>
          During active fraud reviews or suspicious transaction spikes, BlueSea Mobile may place temporary precautionary restrictions on an account, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Temporarily lowering daily transfer or withdrawal limits.</li>
          <li>Placing a temporary hold on specific incoming transfer funds pending clearance.</li>
          <li>Disabling outgoing Blue Connect or utility purchase capabilities.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-35-account-suspension',
    chapterNumber: '35',
    title: 'Account Suspension Protocols',
    subtitle: 'Administrative Freezing & Access Removal',
    body: (
      <div className="space-y-4">
        <p>
          In cases of confirmed policy breaches, regulatory directives, or court orders, BlueSea Mobile will suspend the user account.
        </p>
        <p>
          Suspension completely blocks account login, API access, and outbound payments. Remaining non-fraudulent balances will be sequestered in ring-fenced escrow accounts subject to regulatory disposition.
        </p>
      </div>
    )
  },
  {
    id: 'sec-36-permanent-closure',
    chapterNumber: '36',
    title: 'Permanent Account Closure & Offboarding',
    subtitle: 'Permanent Ban & Asset Disposition',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile reserves the right to permanently close and offboard any account for severe policy violations.
        </p>
        <p>
          Upon permanent closure, your right to use the platform is immediately terminated. Where permitted by law and regulatory authorities, remaining uncontested balances will be returned to the original funding bank account after deducting applicable chargeback claims, fines, or court-ordered forfeitures.
        </p>
      </div>
    )
  },
  {
    id: 'sec-37-reporting-abuse',
    chapterNumber: '37',
    title: 'Reporting Abuse or Security Concerns',
    subtitle: 'Whistleblower & Incident Escalation',
    body: (
      <div className="space-y-4">
        <p>
          We encourage our user community to actively report suspected fraud, phishing attempts, system vulnerabilities, or policy violations.
        </p>
        <p>
          To report abuse, contact our 24/7 Risk Escalations Desk at <strong>abuse@blueseamobile.com</strong> or submit an anonymous report through our security center.
        </p>
      </div>
    )
  },
  {
    id: 'sec-38-changes-to-policy',
    chapterNumber: '38',
    title: 'Changes to This Acceptable Use Policy',
    subtitle: 'Amendments & Policy Updates',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile may amend this Policy at any time to reflect changing laws, regulatory requirements, or security enhancements.
        </p>
        <p>
          Updated versions will be published on our website with a revised &quot;Last Updated&quot; date. Continued use of the platform following policy publication constitutes full acceptance of the updated terms.
        </p>
      </div>
    )
  },
  {
    id: 'sec-39-contact-compliance',
    chapterNumber: '39',
    title: 'Contacting BlueSea Mobile Compliance',
    subtitle: 'Legal & Risk Department Direct Lines',
    body: (
      <div className="space-y-4">
        <p>
          For inquiries regarding this Acceptable Use Policy, account restrictions, or compliance appeals:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
          <p><strong>Chief Risk &amp; Compliance Officer:</strong> Legal &amp; Regulatory Operations</p>
          <p><strong>Compliance Email:</strong> compliance@blueseamobile.com</p>
          <p><strong>Abuse &amp; Fraud Desk Email:</strong> abuse@blueseamobile.com</p>
          <p><strong>Compliance Hotline:</strong> +234 700 BLUESEA-RISK (+234 700 2583 7375)</p>
          <p><strong>Head Office:</strong> BlueSea Mobile Cyber Tower, Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    )
  },
  {
    id: 'sec-40-effective-date',
    chapterNumber: '40',
    title: 'Effective Date',
    subtitle: 'Legal Binding Standard',
    body: (
      <div className="space-y-4">
        <p>
          This Acceptable Use Policy is effective as of <strong>January 1, 2026</strong>, and applies to all existing and new accounts on the BlueSea Mobile platform.
        </p>
      </div>
    )
  },
  {
    id: 'sec-41-version-history',
    chapterNumber: '41',
    title: 'Version History & Audit Log',
    subtitle: 'Policy Revision Register',
    body: (
      <div className="space-y-4">
        <p>
          Historical log of revisions to the BlueSea Mobile Acceptable Use Policy:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Version</th>
                <th className="p-2.5 border-b">Effective Date</th>
                <th className="p-2.5 border-b">Key Amendments &amp; Regulatory Alignments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">v3.0.0</td>
                <td className="p-2.5">Jan 01, 2026</td>
                <td className="p-2.5">Comprehensive revision expanding rules for Blue Connect handles, corporate payroll maker-checker workflows, ticket anti-scalping, and future SEC digital asset frameworks.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.0.0</td>
                <td className="p-2.5">Sep 15, 2025</td>
                <td className="p-2.5">Enhanced Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) provisions under the Money Laundering Act 2022.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v1.0.0</td>
                <td className="p-2.5">Mar 01, 2024</td>
                <td className="p-2.5">Initial platform launch Acceptable Use Policy.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
];

const acceptableUsePolicyConfig: LegalDocumentConfig = {
  metadata: {
    id: 'legal-acceptable-use-policy',
    title: 'Platform Acceptable Use Policy',
    shortDescription: 'Comprehensive rules defining acceptable and prohibited conduct on BlueSea Mobile, protecting digital wallets, transfers, payroll, bill payments, and infrastructure against fraud and cyber abuse.',
    category: 'User Agreements',
    version: '3.0.0',
    lastUpdated: 'July 25, 2026',
    effectiveDate: 'January 1, 2026',
    estimatedReadingTime: '20 min read',
    applicableRegion: 'Federal Republic of Nigeria',
    status: 'active'
  },
  previousDoc: {
    title: 'Cookie & Tracking Policy',
    path: '/legal/cookie'
  },
  nextDoc: {
    title: 'Legal Center Home',
    path: '/legal'
  },
  sections: acceptableUsePolicySections
};



export function AcceptableUsePolicy() {
  return (
    <div className="relative">
            <LegalDocumentTemplate config={acceptableUsePolicyConfig} />
    </div>
  );
}

export default AcceptableUsePolicy;