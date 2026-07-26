import type { LegalDocumentConfig, LegalSectionData } from '@/types/legal';
import { LegalDocumentTemplate } from '@/components/legal/LegalDocumentTemplate';
const kycPolicySections: LegalSectionData[] = [
  {
    id: 'sec-01-introduction',
    chapterNumber: '01',
    title: 'Introduction',
    subtitle: 'Identity Verification as a Cornerstone of Platform Integrity',
    body: (
      <div className="space-y-4">
        <p>
          At <strong>BlueSea Mobile Technologies Limited</strong> (&quot;BlueSea Mobile&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), establishing and maintaining trust is fundamental to operating a secure digital financial ecosystem. Know Your Customer (&quot;KYC&quot;) procedures form the backbone of our operational security, protecting both our users and the broader financial infrastructure.
        </p>
        <p>
          This Know Your Customer (KYC) &amp; Anti-Money Laundering Policy (&quot;Policy&quot;) establishes the standard protocols and regulatory guidelines governing identity verification, customer due diligence, and ongoing transaction monitoring across all BlueSea Mobile products and touchpoints.
        </p>
        <p>
          Whether you access our platform for daily utility payments, digital wallet transfers, Blue Connect social transfers, corporate payroll processing, or upcoming digital financial assets, compliance with this Policy is mandatory.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Mandatory Compliance Notice',
        description: (
          <p>
            By registering an account or maintaining a digital wallet with BlueSea Mobile, you agree to fulfill all identity verification requirements appropriate to your operational account tier as mandated by Nigerian law and financial regulations.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-02-purpose',
    chapterNumber: '02',
    title: 'Purpose of the KYC Policy',
    subtitle: 'Scope, Safeguards & Financial Defense Objectives',
    body: (
      <div className="space-y-4">
        <p>
          The primary purpose of this Policy is to establish a clear, transparent, and robust framework for customer identification and risk management. Specifically, this Policy aims to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Prevent Financial Crime:</strong> Deter illicit activities, including identity theft, account takeover, wire fraud, payment scams, and illegal funds funneling.</li>
          <li><strong>Maintain Regulatory Alignment:</strong> Adhere to Central Bank of Nigeria (CBN) Anti-Money Laundering and Countering the Financing of Terrorism regulations.</li>
          <li><strong>Protect Account Holders:</strong> Ensure that funds are only accessible, transferable, and withdrawable by verified account owners.</li>
          <li><strong>Foster Financial Inclusion:</strong> Offer tiered entry levels allowing progressive access to financial services based on proportional identity documentation.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-03-commitment',
    chapterNumber: '03',
    title: 'Our Commitment to Financial Security',
    subtitle: 'Building a Reliable & Resilient Fintech Infrastructure',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile is dedicated to providing instant, frictionless financial services while maintaining zero tolerance for criminal exploitation. We invest continuously in automated verification technology, biometric anti-spoofing systems, and direct integration with official government databases to verify customer details rapidly and securely without compromising user experience.
        </p>
      </div>
    )
  },
  {
    id: 'sec-04-why-kyc-required',
    chapterNumber: '04',
    title: 'Why Identity Verification Is Required',
    subtitle: 'Systemic Security, Consumer Trust & Fraud Abatement',
    body: (
      <div className="space-y-4">
        <p>
          Digital financial services handle stored monetary value and settle directly through the national interbank payment clearing network (NIBSS). Financial institutions and payment service providers are legally obligated to establish the true legal identity of every account holder.
        </p>
        <p>
          Without robust KYC checks, financial platforms risk becoming vehicles for financial fraud, money laundering, and illegal transactions. Verifying your identity protects your wallet from unauthorized access and ensures that the financial system remains secure for all users.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Identity Protection Commitment',
        description: (
          <p>
            Verification details gathered during onboarding are used strictly for identity confirmation, fraud prevention, and regulatory reporting. Your KYC data is stored securely using AES-256 encryption and is never sold to third-party advertisers.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-05-regulatory-compliance',
    chapterNumber: '05',
    title: 'Regulatory Compliance Framework',
    subtitle: 'Statutory Foundations & Regulatory Authorities',
    body: (
      <div className="space-y-4">
        <p>
          Our KYC and AML protocols are designed and executed in accordance with statutory requirements established by Nigerian regulatory and enforcement authorities, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Central Bank of Nigeria (CBN):</strong> Customer Due Diligence (CDD) Regulations and Tiered Know Your Customer Frameworks.</li>
          <li><strong>Nigerian Financial Intelligence Unit (NFIU):</strong> Anti-Money Laundering, Counter-Terrorist Financing, and Counter-Proliferation Financing (AML/CFT/CPF) reporting mandates.</li>
          <li><strong>Economic and Financial Crimes Commission (EFCC):</strong> Money Laundering (Prevention and Prohibition) Act, 2022 guidelines.</li>
          <li><strong>Nigeria Data Protection Commission (NDPC):</strong> Nigeria Data Protection Act (NDPA) 2023 regulations regarding the lawful handling of personal verification data.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-06-aml',
    chapterNumber: '06',
    title: 'Anti-Money Laundering (AML) Framework',
    subtitle: 'Preventing the Disguise of Illicit Monies',
    body: (
      <div className="space-y-4">
        <p>
          Money laundering is the process of disguising the origin, ownership, or control of illegally obtained funds. BlueSea Mobile maintains strict AML controls designed to detect, block, and report suspicious transactions, structured transfers (&quot;smurfing&quot;), and attempts to deposit funds derived from illegal conduct.
        </p>
      </div>
    )
  },
  {
    id: 'sec-07-ctf',
    chapterNumber: '07',
    title: 'Counter-Terrorist Financing (CTF) Controls',
    subtitle: 'Sanctions Screening & Global Watchlist Monitoring',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile actively screens customer accounts against national and international terrorism and sanctions watchlists, including the United Nations Security Council Sanctions List, the OFAC Specially Designated Nationals (SDN) List, and Nigerian Consolidated Sanctions Lists. Accounts matching confirmed sanctioned individuals or designated terrorist entities will be frozen immediately and reported to statutory authorities.
        </p>
      </div>
    )
  },
  {
    id: 'sec-08-cdd',
    chapterNumber: '08',
    title: 'Customer Due Diligence (CDD) Standards',
    subtitle: 'Standardized Identification & Verification Requirements',
    body: (
      <div className="space-y-4">
        <p>
          Customer Due Diligence (CDD) is the standard process of gathering, verifying, and assessing information about a customer before or during account activation. Our CDD process requires users to provide accurate personal details, verified government identifiers, and valid contact channels proportional to their intended wallet usage.
        </p>
      </div>
    )
  },
  {
    id: 'sec-09-edd',
    chapterNumber: '09',
    title: 'Enhanced Due Diligence (EDD) Measures',
    subtitle: 'High-Risk Profiling, PEPs & Elevated Controls',
    body: (
      <div className="space-y-4">
        <p>
          Enhanced Due Diligence (EDD) applies to accounts that present higher operational, financial, or legal risk profiles. EDD protocols require additional documentation, proof of source of funds, and senior management approval. EDD applies automatically to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Politically Exposed Persons (PEPs):</strong> Individuals holding prominent public positions, their immediate family members, and close associates.</li>
          <li><strong>High-Volume / Corporate Merchants:</strong> Accounts requesting high daily transaction limits or enterprise bulk disbursement facilities.</li>
          <li><strong>High-Risk Geographic Activity:</strong> Accounts originating or transferring funds linked to international high-risk jurisdictions.</li>
          <li><strong>Flagged Suspicious Activity:</strong> Accounts displaying unusual transaction patterns or unverified high-value deposits.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-10-eligibility',
    chapterNumber: '10',
    title: 'Verification Eligibility Criteria',
    subtitle: 'Age, Residency & Capacity Requirements',
    body: (
      <div className="space-y-4">
        <p>
          To complete identity verification and maintain an active account on BlueSea Mobile, applicants must satisfy the following eligibility criteria:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Be at least <strong>eighteen (18) years of age</strong> or possess full legal capacity under Nigerian law.</li>
          <li>Possess a valid, registered Nigerian mobile telephone number linked to an active SIM card.</li>
          <li>Provide authentic government-issued identity credentials registered in the applicant&apos;s legal name.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-11-documents',
    chapterNumber: '11',
    title: 'Identity Documents We May Request',
    subtitle: 'Accepted Government Identifiers & Credentials',
    body: (
      <div className="space-y-4">
        <p>
          Depending on your chosen verification tier, BlueSea Mobile may request and validate one or more of the following official government identifiers:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>National Identification Number (NIN):</strong> Issued by the National Identity Management Commission (NIMC).</li>
          <li><strong>Bank Verification Number (BVN):</strong> Issued by the Central Bank of Nigeria via NIBSS.</li>
          <li><strong>International Passport:</strong> Valid, unexpired official Nigerian or international passport bio-data page.</li>
          <li><strong>Driver&apos;s License:</strong> Valid digital or physical license issued by the Federal Road Safety Corps (FRSC).</li>
          <li><strong>Voter&apos;s Card:</strong> Permanent Voter&apos;s Card (PVC) issued by the Independent National Electoral Commission (INEC).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-12-personal-info',
    chapterNumber: '12',
    title: 'Personal Information We Collect for KYC',
    subtitle: 'Data Fields Collected During Onboarding',
    body: (
      <div className="space-y-4">
        <p>
          During the identity verification process, we collect and process specific personal data attributes required for identity matching, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Full legal name (First name, Middle name, and Surname).</li>
          <li>Official Date of Birth (DOB) and Gender.</li>
          <li>Registered residential address and Local Government Area (LGA).</li>
          <li>Primary mobile phone number and verified email address.</li>
          <li>High-resolution digital photograph or real-time facial capture image.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-13-contact-verification',
    chapterNumber: '13',
    title: 'Contact Information Verification',
    subtitle: 'Mobile OTP & Electronic Mail Validation',
    body: (
      <div className="space-y-4">
        <p>
          Before completing account creation or upgrading verification tiers, users must verify ownership of their contact details through Two-Factor Authentication (2FA). One-Time Passwords (OTPs) are sent via SMS to the registered mobile number and via email verification links.
        </p>
      </div>
    )
  },
  {
    id: 'sec-14-verification-process',
    chapterNumber: '14',
    title: 'Identity Verification Process Flow',
    subtitle: 'Real-Time Database Queries & API Validation',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile uses automated verification integrations to cross-reference submitted details against official databases in real time:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Submission:</strong> The user inputs their NIN, BVN, or government ID details via the encrypted app interface.</li>
          <li><strong>Query Execution:</strong> Secure API tokens query NIMC or NIBSS databases to confirm name, date of birth, and phone number matches.</li>
          <li><strong>Liveness Match:</strong> A real-time facial selfie is compared against the database photograph using facial verification software.</li>
          <li><strong>Tier Activation:</strong> Upon successful validation, the account is upgraded instantly to the corresponding KYC level.</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-15-facial-verification',
    chapterNumber: '15',
    title: 'Facial Verification & Liveness Detection',
    subtitle: 'Biometric Anti-Spoofing Controls',
    body: (
      <div className="space-y-4">
        <p>
          For higher verification tiers (Tier 2 and Tier 3), users are required to perform a short facial liveness check using their smartphone camera. Liveness detection confirms that a live physical person is present during verification, preventing fraudulent attempts using static photographs, pre-recorded video, or AI-generated deepfakes.
        </p>
      </div>
    )
  },
  {
    id: 'sec-16-address-verification',
    chapterNumber: '16',
    title: 'Address Verification Protocols',
    subtitle: 'Proof of Residence & Utility Inspection',
    body: (
      <div className="space-y-4">
        <p>
          To unlock Tier 3 high-volume transaction limits, users must verify their residential address. Accepted proof of address documents (issued within the preceding three months) include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Prepaid or postpaid electricity bills (IKEDC, EKEDC, AEDC, IBEDC, PHED, etc.).</li>
          <li>Water utility or waste management bills.</li>
          <li>Bank account statements displaying full legal name and physical residential address.</li>
          <li>Formal tenancy agreements or physical agent verification reports.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-17-business-verification',
    chapterNumber: '17',
    title: 'Business & Merchant Verification (CAC & Corporate)',
    subtitle: 'Corporate Onboarding & Legal Entity Validation',
    body: (
      <div className="space-y-4">
        <p>
          Corporate accounts, payroll clients, and merchant accounts undergo business verification before receiving enterprise transaction clearance. Corporate onboarding requires:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Corporate Affairs Commission (CAC) Certificate of Incorporation / Registration.</li>
          <li>CAC Status Report or Forms CAC 1.1 / CAC 2 &amp; CAC 7 (Director and Shareholder details).</li>
          <li>Verified Tax Identification Number (TIN) issued by FIRS.</li>
          <li>Board Resolution authorizing the opening and operation of the BlueSea Mobile account.</li>
          <li>Complete Tier 3 KYC verification for all active account directors and ultimate beneficial owners (UBOs).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-18-verification-levels',
    chapterNumber: '18',
    title: 'Tiered Verification Levels Framework',
    subtitle: 'CBN Compliant Staged Verification Matrix',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile operates a structured tiered verification framework in strict alignment with Central Bank of Nigeria (CBN) guidelines. Higher verification levels unlock expanded features, larger wallet capacity, and higher transfer limits:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">KYC Tier</th>
                <th className="p-2.5 border-b">Required Documentation</th>
                <th className="p-2.5 border-b">Daily Cumulative Limit</th>
                <th className="p-2.5 border-b">Maximum Wallet Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Tier 0 (Unverified)</td>
                <td className="p-2.5">Mobile Phone Number, Basic Profile</td>
                <td className="p-2.5">₦0 (Read-Only)</td>
                <td className="p-2.5">₦0</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Tier 1 (Basic)</td>
                <td className="p-2.5">Full Name, Phone OTP, Date of Birth, Address</td>
                <td className="p-2.5">₦50,000</td>
                <td className="p-2.5">₦300,000</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Tier 2 (Intermediate)</td>
                <td className="p-2.5">Tier 1 + Verified NIN or BVN + Selfie Photo</td>
                <td className="p-2.5">₦200,000</td>
                <td className="p-2.5">₦500,000</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Tier 3 (Advanced)</td>
                <td className="p-2.5">Tier 2 + Govt ID + Proof of Address + Liveness Scan</td>
                <td className="p-2.5">₦5,000,000+</td>
                <td className="p-2.5">Unlimited Balance</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Corporate / Merchant</td>
                <td className="p-2.5">CAC Documents, TIN, Director KYC, Board Resolution</td>
                <td className="p-2.5">Custom High-Volume Limits</td>
                <td className="p-2.5">Unlimited Balance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'sec-19-account-limits',
    chapterNumber: '19',
    title: 'Account & Transaction Limits Policy',
    subtitle: 'Dynamic Risk Assessments & Regulatory Caps',
    body: (
      <div className="space-y-4">
        <p>
          Account transaction caps are enforced automatically by our ledger engine based on your active KYC tier. Single transaction limits, daily cumulative limits, and maximum wallet balances are subject to operational adjustments by BlueSea Mobile or changes in Central Bank of Nigeria mandates.
        </p>
      </div>
    )
  },
  {
    id: 'sec-20-wallet-access',
    chapterNumber: '20',
    title: 'Wallet Access Requirements Across Tiers',
    subtitle: 'Deposit, Airtime, Data & Transfer Features',
    body: (
      <div className="space-y-4">
        <p>
          Access to specific wallet capabilities depends on completing requisite identity levels:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Tier 1 Users:</strong> May deposit funds, purchase airtime, buy data, pay basic utility bills, and make small internal transfers up to daily caps.</li>
          <li><strong>Tier 2 Users:</strong> Unlock outward interbank bank transfers, higher utility transaction values, and Blue Connect handle transfers.</li>
          <li><strong>Tier 3 Users:</strong> Gain access to maximum transaction limits, physical/virtual card issuance, high-value transfers, and priority support.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-21-blue-connect-reqs',
    chapterNumber: '21',
    title: 'Blue Connect Verification Requirements',
    subtitle: 'Social Handles, Dynamic Links & Peer Transfers',
    body: (
      <div className="space-y-4">
        <p>
          To reserve custom Blue Connect payment handles (@username), generate dynamic payment request links, or initiate social peer-to-peer transfers, users must complete a minimum of <strong>Tier 2 Verification (Verified NIN or BVN)</strong>. This measure prevents handle squatting, impersonation fraud, and untraceable transfer networks.
        </p>
      </div>
    )
  },
  {
    id: 'sec-22-payroll-reqs',
    chapterNumber: '22',
    title: 'Payroll Verification & Corporate Clearance',
    subtitle: 'Enterprise Disbursements & Employee Roster Audits',
    body: (
      <div className="space-y-4">
        <p>
          Corporate accounts utilizing BlueSea Mobile Payroll Management for bulk salary distribution must undergo full Corporate KYC verification. Employee disbursement rosters are checked against standard risk lists to ensure salary payments are routed to verified individual accounts.
        </p>
      </div>
    )
  },
  {
    id: 'sec-23-crypto-reqs',
    chapterNumber: '23',
    title: 'Future Digital Asset & Cryptocurrency Verification',
    subtitle: 'Expanded KYC Standards for Future Products',
    body: (
      <div className="space-y-4">
        <p>
          Upon activation of future cryptocurrency, digital asset, or Virtual Asset Service Provider (VASP) integration features, users engaging in digital asset services will be required to undergo mandatory <strong>Tier 3 Advanced Verification</strong>, enhanced travel rule checks, and digital wallet screening to satisfy emerging SEC and CBN guidelines.
        </p>
      </div>
    )
  },
  {
    id: 'sec-24-ongoing-monitoring',
    chapterNumber: '24',
    title: 'Ongoing Monitoring & Risk Profiling',
    subtitle: 'Continuous Audits & Dynamic Account Evaluation',
    body: (
      <div className="space-y-4">
        <p>
          Identity verification is an ongoing compliance obligation rather than a single event. BlueSea Mobile employs automated risk monitoring engines that continuously evaluate transaction velocity, account relationships, login locations, and behavioral anomalies throughout the life of your account.
        </p>
      </div>
    )
  },
  {
    id: 'sec-25-suspicious-activity',
    chapterNumber: '25',
    title: 'Suspicious Activity Monitoring & STR Reporting',
    subtitle: 'Mandatory NFIU Filings & System Alerts',
    body: (
      <div className="space-y-4">
        <p>
          Our compliance surveillance system detects suspicious transaction patterns, including uncharacteristic deposit spikes, rapid pass-through transfers, structured payments below reporting thresholds, or transactions involving blacklisted accounts.
        </p>
        <p>
          Where suspicious activity is identified, BlueSea Mobile is required by law to file a formal <strong>Suspicious Transaction Report (STR)</strong> with the Nigerian Financial Intelligence Unit (NFIU) without notifying the account holder (&quot;anti-tipping off&quot; laws).
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Anti-Tipping Off Provisions',
        description: (
          <p>
            Under Section 17 of the Money Laundering (Prevention and Prohibition) Act 2022, financial institutions are strictly prohibited from disclosing to an account holder or third party that a Suspicious Transaction Report (STR) has been filed with regulatory authorities.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-26-fraud-detection',
    chapterNumber: '26',
    title: 'Fraud Detection & Anomaly Prevention',
    subtitle: 'Real-Time Interventions & Security Holds',
    body: (
      <div className="space-y-4">
        <p>
          To safeguard user balances against unauthorized access, our fraud engines automatically intercept transactions exhibiting high risk metrics. Suspected fraudulent transactions may trigger temporary security holds, requiring the account holder to complete re-authentication before funds are released.
        </p>
      </div>
    )
  },
  {
    id: 'sec-27-false-information',
    chapterNumber: '27',
    title: 'False, Misleading or Fraudulent Submissions',
    subtitle: 'Legal Consequences of Fraudulent Verification',
    body: (
      <div className="space-y-4">
        <p>
          Submitting fraudulent, altered, stolen, or forged identity documents, synthetic identities, false BVNs, or unauthorized NIN details is a criminal offense under Nigerian law.
        </p>
        <p>
          Accounts attempting to pass verification using fraudulent credentials will be permanently terminated, associated funds will be frozen, and offender details will be submitted to law enforcement agencies, including the EFCC and the Nigeria Police Force Cybercrime Unit.
        </p>
      </div>
    )
  },
  {
    id: 'sec-28-refusal',
    chapterNumber: '28',
    title: 'Refusal or Failure to Complete Verification',
    subtitle: 'Service Limitations Upon Non-Compliance',
    body: (
      <div className="space-y-4">
        <p>
          Users who refuse or fail to provide requested identity verification documents within specified timeframes will have their account features restricted. Depending on the missing documentation, unverified accounts may be restricted from executing outgoing transfers, loading funds, or initiating bill payments until compliance is achieved.
        </p>
      </div>
    )
  },
  {
    id: 'sec-29-account-restrictions',
    chapterNumber: '29',
    title: 'Account Restrictions & Lockout Protocols',
    subtitle: 'Automated Account Freeze Interventions',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile reserves the right to impose temporary administrative restrictions on an account under any of the following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Detection of mismatched KYC details during periodic database synchronization checks.</li>
          <li>Receipt of formal law enforcement or court order directing account restriction.</li>
          <li>Unresolved chargeback claims or suspected fraudulent transfer reports.</li>
          <li>Failure to complete mandatory periodic re-verification requests.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-30-temporary-suspension',
    chapterNumber: '30',
    title: 'Temporary Account Suspension Procedures',
    subtitle: 'Investigation Windows & Compliance Audits',
    body: (
      <div className="space-y-4">
        <p>
          When an account is temporarily suspended for verification review, our compliance desk conducts an internal investigation, usually resolved within <strong>forty-eight (48) to seventy-two (72) business hours</strong>, provided the account holder responds promptly to requests for additional information.
        </p>
      </div>
    )
  },
  {
    id: 'sec-31-permanent-closure',
    chapterNumber: '31',
    title: 'Permanent Account Closure & Blacklisting',
    subtitle: 'Irrevocable Termination & Compliance Blacklists',
    body: (
      <div className="space-y-4">
        <p>
          Where investigation confirms severe violations of this KYC Policy, involvement in fraudulent schemes, or persistent non-compliance, BlueSea Mobile will permanently close the account and blacklist the associated identity credentials across our network.
        </p>
      </div>
    )
  },
  {
    id: 'sec-32-reverification',
    chapterNumber: '32',
    title: 'Re-verification Triggers & Periodic KYC Refresh',
    subtitle: 'Document Expiry, Profile Changes & Routine Audits',
    body: (
      <div className="space-y-4">
        <p>
          Account holders are required to keep their identity information up to date. Re-verification may be triggered automatically under the following conditions:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Expiration of submitted government identity documents (e.g., expired Passport or Driver&apos;s License).</li>
          <li>Material changes to legal profile details (such as a legal name change post-marriage).</li>
          <li>An account upgrading to higher transaction limit brackets.</li>
          <li>Routine periodic compliance refresh cycles (conducted every 12 to 24 months depending on risk category).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-33-data-protection',
    chapterNumber: '33',
    title: 'Data Protection & Confidentiality During Verification',
    subtitle: 'NDPA 2023 Principles Applied to Verification Records',
    body: (
      <div className="space-y-4">
        <p>
          All personal information, identity images, and biometric validation files gathered during KYC processing are handled in strict compliance with the Nigeria Data Protection Act (NDPA) 2023. Verification records are processed exclusively for legitimate compliance, security, and fraud prevention purposes.
        </p>
      </div>
    )
  },
  {
    id: 'sec-34-record-retention',
    chapterNumber: '34',
    title: 'Storage & Retention of Verification Records',
    subtitle: '5-Year Statutory Retention Mandate',
    body: (
      <div className="space-y-4">
        <p>
          Pursuant to Section 13 of the Money Laundering (Prevention and Prohibition) Act 2022, BlueSea Mobile retains all identity verification documents, KYC logs, account files, and transaction histories for a mandatory period of <strong>at least five (5) years</strong> following the closure of the account or termination of the business relationship.
        </p>
      </div>
    )
  },
  {
    id: 'sec-35-sharing-kyc-info',
    chapterNumber: '35',
    title: 'Lawful Sharing of Verification Information',
    subtitle: 'Inter-Bank Disclosures & Regulatory Mandates',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile does not share personal verification records with commercial third parties. However, verification data may be disclosed to third parties under specific legal circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Licensed verification partners (NIMC, NIBSS) acting under strict data processing agreements.</li>
          <li>Partner commercial banks and settlement financial institutions required to complete clearing.</li>
          <li>Statutory regulatory and law enforcement agencies upon receipt of valid court orders or formal statutory requests.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-36-user-responsibilities',
    chapterNumber: '36',
    title: 'User Responsibilities & Duty of Honesty',
    subtitle: 'Accuracy Obligations & Prompt Profile Updates',
    body: (
      <div className="space-y-4">
        <p>
          As an account holder, you bear full responsibility for:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Providing true, accurate, current, and complete personal details during onboarding.</li>
          <li>Promptly updating your profile if your residential address, contact number, or legal status changes.</li>
          <li>Refraining from creating multiple accounts or operating accounts on behalf of unauthorized third parties.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-37-policy-changes',
    chapterNumber: '37',
    title: 'Amendments to Verification Requirements',
    subtitle: 'Regulatory Alignment & Revision Protocols',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile reserves the right to update this KYC Policy at any time to reflect changing regulatory requirements, legal updates, or service enhancements. Material changes to verification tiers or document requirements will be communicated to users via email, push notifications, or in-app alerts prior to taking effect.
        </p>
      </div>
    )
  },
  {
    id: 'sec-38-contact',
    chapterNumber: '38',
    title: 'Contacting BlueSea Mobile Compliance & KYC Desk',
    subtitle: 'Dedicated Verification Support Channels',
    body: (
      <div className="space-y-4">
        <p>
          If you have questions regarding identity verification, document submission, account upgrades, or tier restrictions, contact our Compliance &amp; KYC Desk:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
          <p><strong>Compliance &amp; KYC Officer:</strong> Desk of the Chief Compliance Officer</p>
          <p><strong>KYC Direct Support:</strong> kyc@blueseamobile.com</p>
          <p><strong>AML Escalations Desk:</strong> aml-compliance@blueseamobile.com</p>
          <p><strong>Head Office:</strong> BlueSea Mobile Towers, Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    )
  },
  {
    id: 'sec-39-effective-date',
    chapterNumber: '39',
    title: 'Effective Date',
    subtitle: 'Policy Operational Threshold',
    body: (
      <div className="space-y-4">
        <p>
          This Know Your Customer (KYC) &amp; AML Policy officially takes effect on <strong>January 1, 2026</strong>, and applies to all existing and newly registered accounts across BlueSea Mobile platforms.
        </p>
      </div>
    )
  },
  {
    id: 'sec-40-version-history',
    chapterNumber: '40',
    title: 'Version History & Control Audit',
    subtitle: 'Log of Historical Policy Amendments',
    body: (
      <div className="space-y-4">
        <p>
          Below is a record of policy revisions and regulatory adjustments:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Version</th>
                <th className="p-2.5 border-b">Release Date</th>
                <th className="p-2.5 border-b">Summary of Verification Amendments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">v2.4.0</td>
                <td className="p-2.5">Jan 01, 2026</td>
                <td className="p-2.5">Comprehensive update for CBN Tiered KYC compliance, liveness selfie integration, Blue Connect handle verification rules, and corporate payroll onboarding controls.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.1.0</td>
                <td className="p-2.5">Aug 15, 2025</td>
                <td className="p-2.5">Enhanced BVN and NIN automated query guidelines and introduced mandatory address validation for Tier 3 accounts.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v1.0.0</td>
                <td className="p-2.5">Mar 01, 2024</td>
                <td className="p-2.5">Initial release of the BlueSea Mobile customer verification framework.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
];

const kycPolicyConfig: LegalDocumentConfig = {
  metadata: {
    id: 'kyc-policy',
    title: 'Know Your Customer (KYC) & AML Policy',
    shortDescription: 'How BlueSea Mobile verifies user identity, protects customer accounts, complies with CBN regulations, and prevents financial fraud across all platform services.',
    category: 'User Agreements',
    version: '2.4.0',
    lastUpdated: 'July 25, 2026',
    effectiveDate: 'January 1, 2026',
    estimatedReadingTime: '20 min read',
    applicableRegion: 'Federal Republic of Nigeria',
    status: 'active'
  },
  previousDoc: {
    title: 'Privacy Policy & Data Protection',
    path: '/legal/privacy'
  },
  nextDoc: {
    title: 'Acceptable Use Policy',
    path: '/legal/acceptable-use'
  },
  sections: kycPolicySections
};


export function KYCPolicy() {
  return (
    <div className="relative">
            <LegalDocumentTemplate config={kycPolicyConfig} />
    </div>
  );
}

export default KYCPolicy;