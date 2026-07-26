import type { LegalDocumentConfig, LegalSectionData } from '@/types/legal';
import { LegalDocumentTemplate } from '@/components/legal/LegalDocumentTemplate';

const termsAndConditionsSections: LegalSectionData[] = [
  {
    id: 'sec-01-introduction',
    chapterNumber: '01',
    title: 'Introduction',
    subtitle: 'Welcome to BlueSea Mobile Financial Services',
    body: (
      <div className="space-y-4">
        <p>
          Welcome to <strong>BlueSea Mobile</strong>, a financial technology platform engineered and operated by BlueSea Mobile Technologies Limited (&quot;BlueSea Mobile&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). BlueSea Mobile provides digital financial infrastructure, mobile wallet systems, instant utility settlements, peer-to-peer transfers, corporate payroll solutions, and value-added payment services across the Federal Republic of Nigeria.
        </p>
        <p>
          This document (&quot;Terms & Conditions&quot;, &quot;Terms&quot;, or &quot;Agreement&quot;) forms a legally binding contract between BlueSea Mobile Technologies Limited and you (&quot;User&quot;, &quot;Account Holder&quot;, or &quot;you&quot;). By creating an account, downloading our mobile application, accessing our web interface, or utilizing any of our APIs, products, or financial tools, you acknowledge that you have read, understood, and agreed to be governed by these Terms in their entirety.
        </p>
        <p>
          BlueSea Mobile operates in full alignment with the regulatory oversight of the Central Bank of Nigeria (&quot;CBN&quot;), the Nigeria Data Protection Commission (&quot;NDPC&quot;), the Economic and Financial Crimes Commission (&quot;EFCC&quot;), the Nigerian Financial Intelligence Unit (&quot;NFIU&quot;), and all other relevant statutory authorities governing electronic payment systems and non-bank financial technology providers in Nigeria.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Legal Binding Agreement',
        description: (
          <p>
            Please read these Terms carefully before accessing or using BlueSea Mobile. If you do not agree to every provision contained herein, you are strictly prohibited from creating an account or accessing any of our digital payment services.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-02-acceptance',
    chapterNumber: '02',
    title: 'Acceptance of These Terms',
    subtitle: 'Electronic Signatures, Consent & Binding Contract',
    body: (
      <div className="space-y-4">
        <p>
          By clicking &quot;I Agree&quot;, checking an online acceptance box during registration, or actively utilizing any BlueSea Mobile product, you execute an electronic signature that carries the equivalent legal weight, validity, and enforceability as a physical handwritten signature pursuant to the <strong>Evidence Act, 2011</strong> and the <strong>Cybercrimes (Prohibition, Prevention, etc.) Act, 2015</strong> of the Federal Republic of Nigeria.
        </p>
        <p>
          Your continued interaction with our platforms constitutes ongoing consent to these Terms, including any subsequent amendments, operational updates, or supplemental regulatory policies published from time to time on our platform.
        </p>
      </div>
    ),
    subSections: [
      {
        id: 'sub-02-01',
        title: '2.1 Capacity to Contract',
        content: (
          <p>
            You represent and warrant that you possess full legal capacity under Nigerian law to enter into a binding contract and that you are not barred from receiving financial services under any law of Nigeria or other applicable jurisdiction.
          </p>
        )
      },
      {
        id: 'sub-02-02',
        title: '2.2 Electronic Communications',
        content: (
          <p>
            You agree to receive all disclosures, legal notices, monthly account statements, fee schedule revisions, and regulatory communications electronically via email, push notifications, or in-app messaging.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-03-definitions',
    chapterNumber: '03',
    title: 'Definitions & Interpretation',
    subtitle: 'Clarification of Core Platform Terminology',
    body: (
      <div className="space-y-4">
        <p>
          Throughout this Agreement, the following terms shall have the specific meanings assigned below:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            <strong>&quot;Account&quot; or &quot;BlueSea Wallet&quot;:</strong> A digital stored-value ledger account created on the BlueSea Mobile network assigned to an individual or corporate user to record deposits, transfers, and utility disbursements.
          </li>
          <li>
            <strong>&quot;BVN&quot;:</strong> Bank Verification Number as issued by the Central Bank of Nigeria via NIBSS.
          </li>
          <li>
            <strong>&quot;NIN&quot;:</strong> National Identification Number issued by the National Identity Management Commission (NIMC).
          </li>
          <li>
            <strong>&quot;Blue Connect&quot;:</strong> The internal peer-to-peer social payment routing system allowing users to transfer funds using verified usernames, phone numbers, or dynamic QR tokens.
          </li>
          <li>
            <strong>&quot;KYC&quot;:</strong> Know Your Customer protocols required under Nigerian Anti-Money Laundering laws and CBN regulations.
          </li>
          <li>
            <strong>&quot;NIBSS&quot;:</strong> Nigeria Inter-Bank Settlement System Plc, responsible for interbank clearing and electronic funds transfer settlements.
          </li>
          <li>
            <strong>&quot;Payroll Services&quot;:</strong> The automated bulk disburser system enabling verified corporate clients to process salary, wage, and vendor payments.
          </li>
          <li>
            <strong>&quot;Merchant Services&quot;:</strong> Commercial payment acceptance, API checkout, and point-of-sale facilities provided to business entities.
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-04-eligibility',
    chapterNumber: '04',
    title: 'Eligibility to Use BlueSea Mobile',
    subtitle: 'Age Restrictions, Residency & Legal Standing',
    body: (
      <div className="space-y-4">
        <p>
          Access to BlueSea Mobile services is subject to strict eligibility verification. To register and maintain an active account, you must satisfy all of the following requirements:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Be a natural person at least 18 years of age, or a corporate entity lawfully incorporated under the Companies and Allied Matters Act (CAMA) 2020 at the Corporate Affairs Commission (CAC) of Nigeria.</li>
          <li>Reside in Nigeria or maintain a verifiable financial presence in Nigeria through a valid Nigerian bank account or mobile phone number (+234 country code).</li>
          <li>Possess a valid, verifiable Bank Verification Number (BVN) and/or National Identification Number (NIN).</li>
          <li>Not be listed on any international or domestic sanction lists published by the United Nations Security Council, US Office of Foreign Assets Control (OFAC), EFCC, or the Nigerian Sanctions Committee.</li>
        </ol>
      </div>
    ),
    callouts: [
      {
        type: 'warning',
        title: 'Underage Account Prohibition',
        description: (
          <p>
            Minors under 18 years of age are strictly prohibited from opening individual financial accounts on BlueSea Mobile. Any account created using fraudulent age declarations will be frozen immediately upon discovery.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-05-registration',
    chapterNumber: '05',
    title: 'Account Registration & Profile Setup',
    subtitle: 'Truthful Onboarding & Account Uniqueness',
    body: (
      <div className="space-y-4">
        <p>
          When completing registration on BlueSea Mobile, you agree to provide complete, accurate, truthful, and current information. You must complete phone number verification via One-Time Password (OTP) delivered to your registered mobile network number.
        </p>
        <p>
          Each individual user is permitted to hold only one (1) active primary personal wallet account tied to their verified BVN and primary phone number. Duplicate accounts created to circumvent transaction limits, manipulate referral programs, or obscure identity will be suspended without prior notice.
        </p>
      </div>
    )
  },
  {
    id: 'sec-06-kyc',
    chapterNumber: '06',
    title: 'Identity Verification & Tiered KYC Framework',
    subtitle: 'CBN Tiered Account Regulations & Due Diligence',
    body: (
      <div className="space-y-4">
        <p>
          In accordance with the Central Bank of Nigeria (CBN) Three-Tiered Know-Your-Customer (KYC) framework and Anti-Money Laundering regulations, account functionality and transaction limits are categorized into distinct operational tiers:
        </p>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-3 border-b">Tier Level</th>
                <th className="p-3 border-b">Verification Required</th>
                <th className="p-3 border-b">Single Tx Limit</th>
                <th className="p-3 border-b">Daily Cumulative Limit</th>
                <th className="p-3 border-b">Max Balance Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-semibold">Tier 1</td>
                <td className="p-3">Full Name, Phone Number, DOB, NIN</td>
                <td className="p-3">₦50,000</td>
                <td className="p-3">₦300,000</td>
                <td className="p-3">₦300,000</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Tier 2</td>
                <td className="p-3">Tier 1 + BVN Verification & Facial Selfie</td>
                <td className="p-3">₦200,000</td>
                <td className="p-3">₦500,000</td>
                <td className="p-3">₦500,000</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Tier 3</td>
                <td className="p-3">Tier 2 + Government Issued ID & Proof of Address</td>
                <td className="p-3">₦5,000,000</td>
                <td className="p-3">₦25,000,000</td>
                <td className="p-3">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Corporate</td>
                <td className="p-3">CAC Documents, Director BVNs, Tax ID (TIN)</td>
                <td className="p-3">Bespoke / Custom</td>
                <td className="p-3">Bespoke / Custom</td>
                <td className="p-3">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          BlueSea Mobile reserves the right to request enhanced due diligence documentation at any time, including proof of source of funds, utility bills, or video verification calls, whenever unusual transaction patterns are detected.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Mandatory NIN & BVN Linking',
        description: (
          <p>
            Pursuant to CBN regulatory directives, all accounts must be linked to a verified NIN and BVN. Unlinked or partially verified accounts will be restricted from outgoing transfers and withdrawals.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-07-responsibilities',
    chapterNumber: '07',
    title: 'User Responsibilities & Conduct',
    subtitle: 'Lawful Maintenance & Operational Integrity',
    body: (
      <div className="space-y-4">
        <p>
          As an Account Holder, you assume full responsibility for all activities occurring under your BlueSea Mobile profile. You agree to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Ensure that all payment instructions, bank account numbers, beneficiary details, and meter numbers entered into the platform are accurate before confirming transactions.</li>
          <li>Refrain from using BlueSea Mobile for illegal money laundering, cyber-crime, terrorism financing, fraudulent chargebacks, or illicit gambling.</li>
          <li>Maintain updated application software on your mobile device to ensure the latest security patches are operational.</li>
          <li>Immediately notify BlueSea Mobile Customer Support if you lose access to your registered mobile phone number or suspect account compromise.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-08-security',
    chapterNumber: '08',
    title: 'Account Security & Credential Safeguarding',
    subtitle: 'PINs, Passwords, Biometrics & Immediate Breach Reporting',
    body: (
      <div className="space-y-4">
        <p>
          You are solely responsible for maintaining the confidentiality of your security credentials, including your login password, 4-digit transaction PIN, Two-Factor Authentication (2FA) codes, and biometric credentials (fingerprint or facial ID).
        </p>
        <p>
          BlueSea Mobile staff will <strong>NEVER</strong> contact you via phone call, SMS, email, or social media asking for your transaction PIN, password, or OTP. Any request for your full PIN or OTP is a fraudulent phishing attempt and must be reported immediately to <strong>security@blueseamobile.com</strong>.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'warning',
        title: 'Liability for Negligent Disclosure',
        description: (
          <p>
            BlueSea Mobile is not liable for financial losses resulting from your voluntary disclosure of authentication credentials, OTPs, or PINs to third parties, fake customer support handles, or fraudulent websites.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-09-wallet-services',
    chapterNumber: '09',
    title: 'Wallet Services & Stored Value Operations',
    subtitle: 'Nature of Funds, Partner Banking & Non-Interest Account',
    body: (
      <div className="space-y-4">
        <p>
          Your BlueSea Wallet holds stored electronic value denominated in Nigerian Naira (NGN). Wallet balances represent funds held on deposit with our licensed partner commercial and microfinance banks in Nigeria in dedicated custodial accounts.
        </p>
        <p>
          Stored value balances in your standard BlueSea Wallet do not earn interest unless explicitly designated under a specific licensed investment savings product. Funds in your wallet are available for instant deployment across supported platform services, transfers, and withdrawals.
        </p>
      </div>
    )
  },
  {
    id: 'sec-10-deposits',
    chapterNumber: '10',
    title: 'Deposit Facilities & Funding Protocols',
    subtitle: 'Dedicated Virtual Accounts, Cards & USSD Channels',
    body: (
      <div className="space-y-4">
        <p>
          You can fund your BlueSea Wallet using any of our authorized funding channels:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Dedicated Virtual Bank Account:</strong> Instant bank transfer from any Nigerian bank via NIBSS Instant Payments (NIP) to your unique BlueSea virtual account number.</li>
          <li><strong>Debit Card Top-Up:</strong> Instant card charge via integrated PCI-DSS compliant payment gateways (Interswitch, Paystack, Flutterwave).</li>
          <li><strong>USSD Ingestion:</strong> Directly dial bank-specific USSD strings integrated within the BlueSea application.</li>
        </ul>
        <p>
          Deposits are processed in real-time. However, delays stemming from NIBSS interbank network congestion or partner bank system outages are outside our direct operational control.
        </p>
      </div>
    )
  },
  {
    id: 'sec-11-withdrawals',
    chapterNumber: '11',
    title: 'Withdrawal Facilities & Settlement Timelines',
    subtitle: 'Outward NIP Transfers to Commercial Banks in Nigeria',
    body: (
      <div className="space-y-4">
        <p>
          You may withdraw funds from your BlueSea Wallet to any verified commercial bank account or licensed financial institution in Nigeria via the NIBSS Instant Payment network.
        </p>
        <p>
          Withdrawals are subject to your account&apos;s daily KYC tier limits and routine anti-fraud security checks. While outward transfers are executed instantly under normal system operations, withdrawals flagged for security review may require up to 24 hours for manual compliance clearance.
        </p>
      </div>
    )
  },
  {
    id: 'sec-12-internal-transfers',
    chapterNumber: '12',
    title: 'Internal Wallet Transfers & Peer-to-Peer Operations',
    subtitle: 'Zero-Fee Transfers Within BlueSea Network',
    body: (
      <div className="space-y-4">
        <p>
          Registered users can initiate zero-fee peer-to-peer (P2P) transfers to other BlueSea Wallet holders. P2P transfers are settled instantaneously and reflected on the respective internal transaction ledgers immediately.
        </p>
        <p>
          <strong>Finality of Internal Transfers:</strong> Once you confirm an internal transfer with your PIN, the funds are credited to the recipient immediately. Internal transfers are final, irrevocable, and cannot be recalled or reversed by BlueSea Mobile unless required by a court order or regulatory directive.
        </p>
      </div>
    )
  },
  {
    id: 'sec-13-blue-connect',
    chapterNumber: '13',
    title: 'Blue Connect Social & Transactional Protocol',
    subtitle: 'Username Transfers, Social Payment Links & Privacy',
    body: (
      <div className="space-y-4">
        <p>
          <strong>Blue Connect</strong> is an interactive social-payment feature allowing BlueSea Mobile users to discover contacts, send funds via custom handles (@username), share transaction splits, and initiate request-to-pay prompts.
        </p>
        <p>
          By enabling Blue Connect, you consent to allow other verified BlueSea users to discover your profile handle using your registered phone number or email address. You can adjust your profile discoverability settings at any time in the Privacy section of your account profile.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'tip',
        title: 'Verify Handle Identifiers',
        description: (
          <p>
            Always double-check recipient handles on Blue Connect before entering your transaction PIN. BlueSea Mobile is not responsible for funds transferred to unintended recipients due to user typing errors.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-14-payroll-services',
    chapterNumber: '14',
    title: 'Corporate & Business Payroll Services',
    subtitle: 'Automated Bulk Disbursements, Salary Routing & Validation',
    body: (
      <div className="space-y-4">
        <p>
          Verified corporate clients and enterprise business accounts may utilize BlueSea Payroll Services for automated bulk salary disbursements, contractor stipends, and vendor payments.
        </p>
        <p>
          Corporate clients warrant that all employee payout files, bank details, and wage computations submitted for bulk disbursement are fully authorized, accurate, and compliant with Nigerian Labor laws and tax regulations. BlueSea Mobile acts solely as a processing gateway and is not liable for payroll accounting discrepancies created by the employer.
        </p>
      </div>
    )
  },
  {
    id: 'sec-15-bill-payments',
    chapterNumber: '15',
    title: 'Utility, Telecom & Bill Payment Services',
    subtitle: 'Airtime, Data, Electricity, Cable TV & Education PINs',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile enables instant bill settlement for third-party service providers across Nigeria, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Airtime & Data Subscriptions:</strong> MTN, Airtel, Glo, and 9mobile network recharges.</li>
          <li><strong>Electricity Meter Tokens:</strong> Prepaid and postpaid billing across licensed distribution companies (IKEDC, EKEDC, AEDC, IBEDC, KAEDCO, PHED, EEDC, KEDCO, etc.).</li>
          <li><strong>Cable TV Subscriptions:</strong> MultiChoice (DSTV, GOTV), Startimes, and Showmax.</li>
          <li><strong>Internet Bills:</strong> Spectranet, Smile, Swift, and Fibre broadband providers.</li>
          <li><strong>Education PINs:</strong> Examination e-PINs for WAEC, JAMB, and NECO.</li>
        </ul>
        <p>
          All utility and bill payments are routed through third-party aggregator networks and utility operator gateways. Once a bill payment transaction is executed and a digital token/PIN is generated, the sale is final and non-refundable.
        </p>
      </div>
    )
  },
  {
    id: 'sec-16-ticket-sales',
    chapterNumber: '16',
    title: 'Event Ticketing & Digital Voucher Sales',
    subtitle: 'Pass Issuance, Organizer Liability & QR Validation',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile provides a digital marketplace for purchasing event tickets, concert passes, conference registrations, and promotional vouchers. Digital tickets are issued in the form of unique encrypted QR codes stored within your app.
        </p>
        <p>
          BlueSea Mobile acts as a ticketing agent on behalf of event organizers. We are not responsible for event cancellations, rescheduling, venue safety, or quality of performance. Ticket refunds for canceled events must be sought directly from the designated event organizer.
        </p>
      </div>
    )
  },
  {
    id: 'sec-17-future-crypto',
    chapterNumber: '17',
    title: 'Future Digital Assets & Cryptocurrency Services',
    subtitle: 'Regulatory Notice & SEC VASP Framework Roadmap',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile continually expands its technological infrastructure to integrate next-generation financial services, including potential future digital asset management, stablecoin utility, and virtual asset services (&quot;Crypto Services&quot;).
        </p>
        <p>
          <strong>Regulatory Framework Notice:</strong> Any future launch of Crypto Services will be strictly governed by the rules on Virtual Assets Service Providers (VASP) issued by the Securities and Exchange Commission (SEC) of Nigeria and applicable guidelines from the Central Bank of Nigeria.
        </p>
        <p>
          Digital asset products, if introduced, carry inherent market volatility risks. Nothing contained in this platform constitutes financial investment advice, and users acknowledge that virtual assets are not guaranteed by the Nigeria Deposit Insurance Corporation (NDIC).
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'information',
        title: 'Roadmap & Future Expansion',
        description: (
          <p>
            Cryptocurrency and digital asset services are currently in regulatory preparation and will be activated only upon complete regulatory licensing and compliance checks in Nigeria.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-18-fees',
    chapterNumber: '18',
    title: 'Fee Structure, Tariffs & Charges',
    subtitle: 'Transparent Pricing, Service Tariffs & Statutory Taxes',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile maintains a transparent fee structure. Up-to-date transaction tariffs, bank withdrawal charges, bill processing fees, and payment gateway fees are displayed transparently in the application prior to final transaction execution.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Internal Wallet Transfers:</strong> ₦0.00 (Free between BlueSea users).</li>
          <li><strong>Outward Bank Transfers:</strong> Tiered charges compliant with CBN approved electronic banking fee guidelines (e.g., ₦10 to ₦50 depending on transfer value).</li>
          <li><strong>Statutory Stamp Duty:</strong> Applicable Electronic Money Transfer Levy (EMTL) of ₦50 on deposits/transfers of ₦10,000 and above as mandated by the Federal Inland Revenue Service (FIRS) of Nigeria.</li>
          <li><strong>SMS Notifications:</strong> Optional SMS alert delivery charges as billed by telecommunication providers.</li>
        </ul>
        <p>
          BlueSea Mobile reserves the right to adjust service charges with a minimum fourteen (14) days prior notice published on our application or communicated via email.
        </p>
      </div>
    )
  },
  {
    id: 'sec-19-failed-transactions',
    chapterNumber: '19',
    title: 'Failed, Delayed & Interrupted Transactions',
    subtitle: 'NIBSS Outages, Interbank Delays & Resolution Windows',
    body: (
      <div className="space-y-4">
        <p>
          Transactions may occasionally fail, delay, or drop due to interbank network connection timeouts, NIBSS switches, electricity distribution server downtimes, or telecommunication network disruptions.
        </p>
        <p>
          In the event of a debited but uncompleted transaction:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Automated Reversals:</strong> Our automated reconciliation engine periodically sweeps and reverses unfulfilled transactions back to your wallet within 24 hours.</li>
          <li><strong>Manual Resolution SLA:</strong> If an automated refund is not triggered within 24 hours due to partner bank delay, open a ticket via Customer Support. Manual interbank logging will resolve the issue within 3 to 5 business days.</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-20-refund-policy',
    chapterNumber: '20',
    title: 'Refund & Reversal Policy Overview',
    subtitle: 'Conditions for Reversals & Dispute Evaluation',
    body: (
      <div className="space-y-4">
        <p>
          Refunds are granted strictly under verified technical failure conditions where payment was debited from a user&apos;s wallet but the intended service (airtime, data, bill token, outward bank credit) was not rendered by the underlying provider.
        </p>
        <p>
          <strong>Non-Refundable Scenarios:</strong> Refunds will NOT be issued if you entered an incorrect phone number, wrong meter number, invalid DSTV smartcard number, or wrong destination bank account number, provided the transaction was successfully processed by the recipient network.
        </p>
      </div>
    )
  },
  {
    id: 'sec-21-availability',
    chapterNumber: '21',
    title: 'Service Availability & SLA Target',
    subtitle: 'Uptime Commitments, Maintenance Windows & Outages',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile strives to deliver 99.9% application uptime. However, scheduled maintenance, system upgrades, emergency security patches, or server center outages may require temporary suspension of service accessibility.
        </p>
        <p>
          We will endeavor to issue advance notifications for planned system maintenance via in-app banners or email notifications. BlueSea Mobile is not liable for indirect financial losses incurred during operational maintenance windows.
        </p>
      </div>
    )
  },
  {
    id: 'sec-22-acceptable-use',
    chapterNumber: '22',
    title: 'Acceptable Use Policy (AUP)',
    subtitle: 'System Usage Rules, Integrity & Technical Limits',
    body: (
      <div className="space-y-4">
        <p>
          You agree to access BlueSea Mobile exclusively through our official applications, mobile SDKs, and authorized web portals. You strictly agree NOT to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of the BlueSea software platform.</li>
          <li>Use automated scripts, bots, scrapers, or crawlers to interact with our APIs without explicit written consent from BlueSea Mobile.</li>
          <li>Introduce viruses, trojan horses, worms, logic bombs, or malicious code designed to disrupt platform infrastructure.</li>
          <li>Overload or launch Denial of Service (DoS) attacks against our servers and network hosts.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-23-fraud-prevention',
    chapterNumber: '23',
    title: 'Fraud Detection & Anti-Fraud Framework',
    subtitle: 'Automated Risk Scoring, Device Fingerprinting & Holds',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile employs sophisticated real-time transaction monitoring, behavioral analytics, and device fingerprinting technology to detect and neutralize fraudulent transactions.
        </p>
        <p>
          If your account exhibits suspicious transaction velocity, abnormal high-value transfers, or login attempts from compromised devices, our fraud engine will automatically place a temporary administrative hold on your account pending manual compliance verification.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Zero Tolerance for Payment Fraud',
        description: (
          <p>
            Accounts involved in carding, unauthorized bank debits, or phishing proceeds will be frozen instantly, and all associated balance funds locked pending law enforcement investigation.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-24-aml',
    chapterNumber: '24',
    title: 'Anti-Money Laundering (AML) Compliance',
    subtitle: 'Money Laundering Act 2022 & Statutory Obligations',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile strictly enforces Anti-Money Laundering policies pursuant to the <strong>Money Laundering (Prevention and Prohibition) Act, 2022</strong>, the CBN Anti-Money Laundering Regulations, and international Financial Action Task Force (FATF) standards.
        </p>
        <p>
          Under Nigerian law, BlueSea Mobile is legally required to monitor, record, and report any suspicious transaction or high-value currency transfer to the Nigerian Financial Intelligence Unit (NFIU) and the EFCC without notifying the account holder (&quot;Prohibition of Tipping-Off&quot;).
        </p>
      </div>
    )
  },
  {
    id: 'sec-25-ctf',
    chapterNumber: '25',
    title: 'Counter-Terrorist Financing (CTF) Protocols',
    subtitle: 'Sanction Screening & Asset Freezing Mandates',
    body: (
      <div className="space-y-4">
        <p>
          In accordance with the Terrorism (Prevention and Prohibition) Act, 2022, BlueSea Mobile conducts continuous automated screening of all registered user databases and transaction beneficiaries against local and international terrorism sanction lists.
        </p>
        <p>
          Any match identified during screening will result in the immediate freezing of the user&apos;s wallet, blocking of pending transactions, and submission of mandatory statutory reports to competent Nigerian security authorities.
        </p>
      </div>
    )
  },
  {
    id: 'sec-26-prohibited-activities',
    chapterNumber: '26',
    title: 'Prohibited Activities & Restricted Industries',
    subtitle: 'Explicit Unlawful Uses & Service Bans',
    body: (
      <div className="space-y-4">
        <p>
          You are explicitly prohibited from using your BlueSea Wallet or merchant services for transactions involving or related to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Unlicensed gambling, illegal sports betting syndicates, or unauthorized lotteries.</li>
          <li>Sale of counterfeit goods, illicit narcotics, prescription drugs, or unauthorized firearms.</li>
          <li>Ponzi schemes, multi-level marketing (MLM) high-yield investment programs (HYIP), or fraudulent financial solicitations.</li>
          <li>Pornography, sexually explicit content, human trafficking, or exploitation.</li>
          <li>Unregulated black-market currency exchange or hawala remittance networks.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-27-suspended-accounts',
    chapterNumber: '27',
    title: 'Suspended Accounts & Temporary Holds',
    subtitle: 'Administrative Freezes, Investigations & Timelines',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile reserves the right to suspend or place an administrative freeze on your account under any of the following conditions:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Receipt of a formal court order, police directive, or CBN/EFCC/NFIU restriction mandate.</li>
          <li>Detection of fraudulent deposits or chargeback notices from partner financial institutions.</li>
          <li>Failure to complete required periodic KYC verification updates upon request.</li>
          <li>Reasonable suspicion that your account credentials have been compromised by an unauthorized third party.</li>
        </ol>
        <p>
          Administrative suspensions for compliance reviews typically last up to 180 days, depending on law enforcement directives and clearance of documentation.
        </p>
      </div>
    )
  },
  {
    id: 'sec-28-restricted-accounts',
    chapterNumber: '28',
    title: 'Restricted Accounts & Operational Limitations',
    subtitle: 'Partial Feature Capping & Verification Holds',
    body: (
      <div className="space-y-4">
        <p>
          Account restriction limits certain platform features while allowing reduced functionality. For instance, a restricted account may allow incoming wallet deposits but block outward interbank bank withdrawals pending completion of address verification or ID confirmation.
        </p>
      </div>
    )
  },
  {
    id: 'sec-29-account-closure',
    chapterNumber: '29',
    title: 'Account Termination & Voluntary Closure',
    subtitle: 'Termination Procedures & Data Retention Mandates',
    body: (
      <div className="space-y-4">
        <p>
          You may terminate your BlueSea Wallet at any time by clearing your remaining account balance, settling any pending fee liabilities, and submitting an account closure request through customer support.
        </p>
        <p>
          <strong>Statutory Data Retention:</strong> Pursuant to Section 8 of the Money Laundering Act 2022 and CBN regulations, BlueSea Mobile is required to retain account identification records, transaction ledgers, and KYC files for a minimum of <strong>five (5) years</strong> following account closure.
        </p>
      </div>
    )
  },
  {
    id: 'sec-30-intellectual-property',
    chapterNumber: '30',
    title: 'Intellectual Property Rights & Licensing',
    subtitle: 'Trademarks, Software Copyrights & Restricted License',
    body: (
      <div className="space-y-4">
        <p>
          All intellectual property rights in the BlueSea Mobile application, website design, brand logos, custom software code, UI graphics, user interfaces, and documentation are the exclusive property of BlueSea Mobile Technologies Limited.
        </p>
        <p>
          We grant you a non-exclusive, non-transferable, revocable, personal license to download and use the BlueSea Mobile app on your mobile device strictly for personal or internal business financial transactions in accordance with these Terms.
        </p>
      </div>
    )
  },
  {
    id: 'sec-31-third-party-services',
    chapterNumber: '31',
    title: 'Third-Party Integrations & External Links',
    subtitle: 'Telcos, Aggregators, Payment Gateways & External Portals',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile integrates third-party APIs, telco switches, electricity distribution networks, and bank payment gateways to deliver seamless payment processing.
        </p>
        <p>
          We do not guarantee the perpetual availability or error-free operation of external third-party infrastructure. Your interactions with third-party merchants or websites linked within our application are governed by the respective third party&apos;s terms of service and privacy policies.
        </p>
      </div>
    )
  },
  {
    id: 'sec-32-disclaimers',
    chapterNumber: '32',
    title: 'Warranties & Legal Disclaimers',
    subtitle: 'Services Provided "AS IS" & "AS AVAILABLE"',
    body: (
      <div className="space-y-4">
        <p>
          To the maximum extent permitted under applicable law of the Federal Republic of Nigeria, BlueSea Mobile platforms and services are provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis without express or implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
        </p>
        <p>
          We do not warrant that our application will be uninterrupted, error-free, completely immune to cyber-attacks, or that defects will be corrected instantaneously.
        </p>
      </div>
    )
  },
  {
    id: 'sec-33-limitation-of-liability',
    chapterNumber: '33',
    title: 'Limitation of Liability',
    subtitle: 'Cap on Financial Damages & Indirect Loss Exclusion',
    body: (
      <div className="space-y-4">
        <p>
          To the extent permitted under Nigerian law, BlueSea Mobile Technologies Limited, its directors, officers, employees, agents, and banking partners shall NOT be liable for any indirect, incidental, consequential, special, punitive, or loss of profits damages arising out of or in connection with your use or inability to use our platform.
        </p>
        <p>
          In any event, BlueSea Mobile&apos;s total aggregate liability to you for all claims arising out of these Terms shall not exceed the lesser of: (a) ₦50,000 (Fifty Thousand Nigerian Naira), or (b) the total service fee charges paid by you to BlueSea Mobile in the three (3) months preceding the event giving rise to liability.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Statutory Protections Retained',
        description: (
          <p>
            Nothing in these Terms excludes or limits consumer rights mandated by the Federal Competition and Consumer Protection Commission (FCCPC) Act or non-waivable Central Bank of Nigeria Consumer Protection Guidelines.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-34-indemnification',
    chapterNumber: '34',
    title: 'Indemnification & Hold Harmless',
    subtitle: 'User Protection Obligations toward BlueSea Mobile',
    body: (
      <div className="space-y-4">
        <p>
          You agree to defend, indemnify, and hold harmless BlueSea Mobile Technologies Limited, its parent companies, subsidiaries, affiliates, directors, officers, and employees from and against any claims, liabilities, damages, losses, costs, or legal fees resulting from:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Your breach or violation of any provision in these Terms & Conditions.</li>
          <li>Your violation of any Nigerian law, statutory regulation, or third-party right.</li>
          <li>Fraudulent, negligent, or unlawful activities executed through your account.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-35-privacy-reference',
    chapterNumber: '35',
    title: 'Privacy Policy & Data Protection Reference',
    subtitle: 'Compliance with Nigeria Data Protection Act (NDPA) 2023',
    body: (
      <div className="space-y-4">
        <p>
          Your privacy and personal data protection are fundamental to our operations. Our collection, storage, processing, and sharing of your personal details and financial records are governed by the <strong>BlueSea Mobile Privacy Policy</strong> and strictly comply with the <strong>Nigeria Data Protection Act, 2023 (NDPA)</strong>.
        </p>
        <p>
          By using BlueSea Mobile, you consent to our data processing activities, including identity validation with NIMC, BVN verification via NIBSS, and statutory reporting to credit bureaus and regulatory databases.
        </p>
      </div>
    )
  },
  {
    id: 'sec-36-changes-to-agreement',
    chapterNumber: '36',
    title: 'Amendments & Modifications to Terms',
    subtitle: 'Revision Protocols & Notification Mechanisms',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile reserves the right to modify, amend, or update these Terms & Conditions at any time to reflect changes in Nigerian financial regulations, statutory laws, or platform functional upgrades.
        </p>
        <p>
          Whenever material updates are made, we will notify you at least fourteen (14) days in advance via in-app notification, email, or a prominent banner on our website. Your continued use of BlueSea Mobile after the effective date of the amended Terms constitutes full acceptance of the updated terms.
        </p>
      </div>
    )
  },
  {
    id: 'sec-37-governing-law',
    chapterNumber: '37',
    title: 'Governing Law & Jurisdiction',
    subtitle: 'Federal Republic of Nigeria Statutory Framework',
    body: (
      <div className="space-y-4">
        <p>
          These Terms & Conditions, their interpretation, validity, and any dispute or non-contractual obligations arising out of or in connection with them shall be governed by, construed, and enforced in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>.
        </p>
        <p>
          Key statutory frameworks governing this contract include the Central Bank of Nigeria Act 2007, Banks and Other Financial Institutions Act (BOFIA) 2020, Companies and Allied Matters Act (CAMA) 2020, Money Laundering (Prevention and Prohibition) Act 2022, Cybercrimes Act 2015/2024, and the Evidence Act 2011.
        </p>
      </div>
    )
  },
  {
    id: 'sec-38-dispute-resolution',
    chapterNumber: '38',
    title: 'Dispute Resolution & Arbitration Framework',
    subtitle: 'Informal Negotiation, Mediation & Binding Arbitration in Lagos',
    body: (
      <div className="space-y-4">
        <p>
          In the event of any dispute, claim, controversy, or disagreement arising out of or relating to these Terms or platform operations:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Informal Negotiation:</strong> Parties shall first attempt in good faith to resolve the dispute through informal negotiation by submitting a detailed notice of dispute to <strong>legal@blueseamobile.com</strong>. The negotiation period shall last for thirty (30) days from receipt of notice.</li>
          <li><strong>Binding Arbitration:</strong> If the dispute is not settled through negotiation within thirty (30) days, the dispute shall be referred to and finally resolved by binding arbitration under the <strong>Arbitration and Mediation Act, 2023</strong> of Nigeria.</li>
          <li><strong>Arbitration Venue:</strong> The seat and venue of arbitration shall be Lagos, Nigeria. The proceedings shall be conducted in the English language by a single arbitrator appointed jointly by the parties.</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-39-customer-support',
    chapterNumber: '39',
    title: 'Customer Support, Escalations & Appeals',
    subtitle: 'Help Desk SLAs & Regulatory CBN Escalation Route',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile is dedicated to prompt resolution of user grievances. Our dedicated customer support channels operate 24/7 to log complaints, transaction inquiries, and account access issues.
        </p>
        <p>
          <strong>CBN Escalation Route:</strong> If your financial dispute remains unresolved through our internal complaints process within thirty (30) days, you retain the right under CBN guidelines to escalate your complaint directly to the <strong>CBN Consumer Protection Department</strong> by emailing <strong>cpd@cbn.gov.ng</strong>.
        </p>
      </div>
    )
  },
  {
    id: 'sec-40-contact-info',
    chapterNumber: '40',
    title: 'Contact Information & Official Address',
    subtitle: 'Legal Notice Address & Electronic Communications',
    body: (
      <div className="space-y-4">
        <p>
          For official legal communications, regulatory notices, compliance inquiries, or formal dispute notifications, contact BlueSea Mobile Technologies Limited through the following official channels:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
          <p><strong>Corporate Head Office:</strong> BlueSea Mobile Technologies Towers, Victoria Island, Lagos State, Nigeria.</p>
          <p><strong>Legal & Compliance Desk:</strong> legal@blueseamobile.com</p>
          <p><strong>Data Protection Officer:</strong> dpo@blueseamobile.com</p>
          <p><strong>Customer Care Line:</strong> +234 (0) 1 800 BLUESEA / +234 700 2583 732</p>
          <p><strong>Official Web Portal:</strong> https://www.blueseamobile.com</p>
        </div>
      </div>
    )
  },
  {
    id: 'sec-41-effective-date',
    chapterNumber: '41',
    title: 'Effective Date & Binding Execution',
    subtitle: 'Operational Activation Date',
    body: (
      <div className="space-y-4">
        <p>
          These Terms & Conditions officially take effect on <strong>January 1, 2026</strong>, and supersede all prior legal agreements, oral representations, or terms of service previously issued by BlueSea Mobile.
        </p>
      </div>
    )
  },
  {
    id: 'sec-42-version-history',
    chapterNumber: '42',
    title: 'Version Control & Revision History',
    subtitle: 'Complete Audit Trail of Legal Modifications',
    body: (
      <div className="space-y-4">
        <p>
          This document is maintained under strict version control. Below is a log of recent regulatory revisions:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Version</th>
                <th className="p-2.5 border-b">Release Date</th>
                <th className="p-2.5 border-b">Key Amendments / Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">v2.4.0</td>
                <td className="p-2.5">Jan 01, 2026</td>
                <td className="p-2.5">Comprehensive revision for CBN Tiered KYC updates, Money Laundering Act 2022 alignment, NDPA 2023 references, SEC VASP crypto roadmap integration, and Blue Connect P2P terms.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.3.1</td>
                <td className="p-2.5">Jul 15, 2025</td>
                <td className="p-2.5">Added Corporate Payroll Services SLAs and expanded electricity bill token resolution terms.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.0.0</td>
                <td className="p-2.5">Jan 10, 2025</td>
                <td className="p-2.5">Major platform upgrade introducing Blue Connect handles and multi-tier wallet security limits.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v1.0.0</td>
                <td className="p-2.5">Mar 01, 2024</td>
                <td className="p-2.5">Initial launch of BlueSea Mobile consumer payment platform and wallet terms.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
];

const termsAndConditionsConfig: LegalDocumentConfig = {
  metadata: {
    id: 'terms-and-conditions',
    title: 'Terms & Conditions of Service',
    shortDescription: 'The official legal agreement governing your access to and use of BlueSea Mobile financial technology platform, wallet services, bill payments, payroll, and digital solutions in Nigeria.',
    category: 'User Agreements',
    version: '2.4.0',
    lastUpdated: 'July 25, 2026',
    effectiveDate: 'January 1, 2026',
    estimatedReadingTime: '25 min read',
    applicableRegion: 'Federal Republic of Nigeria',
    status: 'active'
  },
  previousDoc: {
    title: 'Legal Overview & Index',
    path: '/legal'
  },
  nextDoc: {
    title: 'Privacy Policy & Data Protection',
    path: '/legal/privacy'
  },
  sections: termsAndConditionsSections
};

export function TermsAndConditions() {
  return (
    <div className="relative">
        <LegalDocumentTemplate config={termsAndConditionsConfig} />
    </div>
  );
}

export default TermsAndConditions;