import type { LegalDocumentConfig, LegalSectionData } from '@/types/legal';
import { LegalDocumentTemplate } from '@/components/legal/LegalDocumentTemplate';
import {
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  Smartphone,
  Zap,
  Tv,
  Wifi,
  GraduationCap,
  Briefcase,
  Ticket,
  Coins,
  Store,
  HelpCircle,
  PhoneCall,
  FileText,
  Lock,
  Scale,
  Building2,
  Search,
  Mail,
  Share2,
  History,
  Sparkles,
  Server,
  AlertTriangle,
  Database,
  Users,
  CreditCard,
  Send,
  Slash,
  Eye,
  HardDrive,
  FileCheck,
  Bell
} from 'lucide-react';

const refundPolicySections: LegalSectionData[] = [
  {
    id: 'sec-01-introduction',
    chapterNumber: '01',
    title: 'Introduction',
    subtitle: 'Fairness, Financial Transparency & Automated Reversals',
    body: (
      <div className="space-y-4">
        <p>
          This Refund &amp; Transaction Reversal Policy (&quot;Policy&quot;) governs all payment reversals, failed transaction resolutions, and refund claims executed on digital platforms owned and operated by <strong>BlueSea Mobile Technologies Limited</strong> (&quot;BlueSea Mobile&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
        </p>
        <p>
          As a modern Nigerian financial technology platform, BlueSea Mobile interfaces with multiple banking switches, telecommunications networks, power distribution companies, cable providers, and third-party payment gateways. We are committed to maintaining maximum platform transparency and ensuring that user funds are protected at every stage of a transaction.
        </p>
        <p>
          By creating an account, funding your digital wallet, or initiating any transaction on the BlueSea Mobile ecosystem, you accept and agree to the guidelines, timelines, and procedures set forth in this Policy.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Core Consumer Protection Commitment',
        description: (
          <p>
            BlueSea Mobile guarantees that you will never lose funds due to a verifiable system error, server downtime, or third-party API processing failure. If a transaction fails to deliver the requested value, your funds will be restored in accordance with this Policy.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-02-purpose',
    chapterNumber: '02',
    title: 'Purpose of the Refund Policy',
    subtitle: 'Establishing Clear Dispute & Settlement Mechanics',
    body: (
      <div className="space-y-4">
        <p>
          The primary purpose of this Policy is to establish a predictable, fair, and legally sound framework for handling disputed, pending, duplicate, or unfulfilled transactions across all our payment channels.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Protect Customer Assets:</strong> Ensure customers are promptly reimbursed whenever value is not delivered due to technical failures.</li>
          <li><strong>Set Operational SLA Standards:</strong> Define concrete resolution timeframes for internal support teams, partner banks, and bill aggregators.</li>
          <li><strong>Prevent Abuse &amp; Friendly Fraud:</strong> Establish clear boundaries regarding completed digital deliveries that cannot be reversed.</li>
          <li><strong>Maintain Regulatory Alignment:</strong> Adhere to Central Bank of Nigeria (CBN) Dispute Resolution Frameworks and FCCPC Guidelines.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-03-scope',
    chapterNumber: '03',
    title: 'Scope of This Policy',
    subtitle: 'Applicable Products & Delivery Channels',
    body: (
      <div className="space-y-4">
        <p>
          This Policy applies comprehensively to all transaction types, payment methods, and digital product verticals available on BlueSea Mobile, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Wallet Funding (NIBSS Instant Payment, Direct Card Funding, USSD, Virtual Accounts).</li>
          <li>Outward Interbank Bank Transfers &amp; Internal Wallet Transfers.</li>
          <li>Blue Connect Social Transfers (@handles &amp; Dynamic Payment Request Links).</li>
          <li>Airtime Purchase &amp; Data Bundle Top-Ups (MTN, Airtel, Glo, 9mobile).</li>
          <li>Utility Payments (Prepaid &amp; Postpaid Electricity Tokens across all Nigerian DisCos).</li>
          <li>Cable TV Subscriptions (DSTV, GOTV, StarTimes, Showmax) &amp; Internet Broadband Top-Ups.</li>
          <li>Education PINs (WAEC, NECO, JAMB, NABTEB).</li>
          <li>Corporate Payroll Disbursements &amp; Merchant Commerce Payments.</li>
          <li>Event, Concert &amp; Transport Ticket Purchases.</li>
          <li>Future Cryptocurrency &amp; Digital Asset Service Transactions.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-04-general-principles',
    chapterNumber: '04',
    title: 'General Refund Principles',
    subtitle: 'The Fundamental Rules Governing Digital Value Settlement',
    body: (
      <div className="space-y-4">
        <p>
          Digital financial services settle instantly through automated clearing systems. Consequently, our refund framework operates under three core rules:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Unfulfilled Value Rule:</strong> If your account is debited but the third-party service provider fails to deliver the purchased service or token, you are entitled to a 100% full refund to your BlueSea Mobile wallet.</li>
          <li><strong>Delivered Value Irreversibility Rule:</strong> Once digital value (airtime, data bundle, electricity token, education PIN, or cable TV activation) has been successfully generated and delivered to the correct recipient identifier, the transaction is final and irreversible.</li>
          <li><strong>User Attribution Rule:</strong> BlueSea Mobile is not responsible for losses arising from correct processing of incorrect data entered by the user (e.g., entering an incorrect phone number, wrong meter number, or incorrect bank account number).</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-05-successful-transactions',
    chapterNumber: '05',
    title: 'Successful Transactions',
    subtitle: 'Finality of Completed Deliveries',
    body: (
      <div className="space-y-4">
        <p>
          A transaction is classified as &quot;Successful&quot; when our payment gateway receives an explicit <strong>HTTP 200 / Success Acknowledgement Code</strong> from the destination network (e.g., Telco, Electricity DisCo, Multichoice, or NIBSS Clearing House) confirming that the requested value or credit has been applied.
        </p>
        <p>
          Because digital goods are consumed immediately upon delivery, successful transactions cannot be canceled, recalled, or refunded under any circumstances.
        </p>
      </div>
    )
  },
  {
    id: 'sec-06-failed-transactions',
    chapterNumber: '06',
    title: 'Failed Transactions & Automated Reversals',
    subtitle: 'Instant Auto-Recredit Protocol',
    body: (
      <div className="space-y-4">
        <p>
          A transaction is classified as &quot;Failed&quot; when the underlying payment processor or utility aggregator returns an explicit rejection code (e.g., network timeout, invalid meter number, or switch route failure).
        </p>
        <p>
          BlueSea Mobile operates an <strong>Automated Reversal Engine</strong>. When a transaction fails explicitly, debited funds are instantly returned to your BlueSea Mobile wallet within zero to fifteen (0-15) minutes without requiring manual support intervention.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Automated Wallet Recovery',
        description: (
          <p>
            Our core ledger monitors all pending transaction queues. If a payment attempt fails at the partner API boundary, our system automatically initiates a rollback and credits your wallet ledger in real time.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-07-pending-transactions',
    chapterNumber: '07',
    title: 'Pending Transactions',
    subtitle: 'Reconciliation Windows & Temporary Holds',
    body: (
      <div className="space-y-4">
        <p>
          A transaction is marked as &quot;Pending&quot; when our systems have debited your wallet and dispatched the payment request, but the partner service provider (e.g., DisCo, NIBSS, or Telco aggregator) has not yet returned a conclusive success or failure response due to network latency.
        </p>
        <p>
          Pending transactions enter an automated reconciliation window lasting between <strong>15 minutes and 24 hours</strong>. During this window, funds remain locked to prevent double spending. If the partner confirms delivery, the status updates to Successful. If the partner confirms non-delivery or fails to respond within 24 hours, the funds are automatically reversed to your wallet.
        </p>
      </div>
    )
  },
  {
    id: 'sec-08-reversed-transactions',
    chapterNumber: '08',
    title: 'Reversed Transactions',
    subtitle: 'Manual Audit Adjustments & Exception Settlement',
    body: (
      <div className="space-y-4">
        <p>
          Where an automated reversal fails to trigger due to asynchronous partner responses, BlueSea Mobile compliance officers perform manual reconciliation. Upon auditing the gateway logs and confirming non-delivery with the service provider, a manual ledger reversal is posted directly to the user&apos;s wallet.
        </p>
      </div>
    )
  },
  {
    id: 'sec-09-duplicate-payments',
    chapterNumber: '09',
    title: 'Duplicate Payments',
    subtitle: 'Double Debit Resolution Protocol',
    body: (
      <div className="space-y-4">
        <p>
          Duplicate debits occur when a user taps the pay button multiple times during payment switch congestion, or when a network retry causes a dual charge for a single bill purchase.
        </p>
        <p>
          If a duplicate payment produces only one successful product delivery, the second debited amount is classified as a duplicate debit and will be refunded in full to the user&apos;s wallet within <strong>two (2) to twenty-four (24) hours</strong> following automated ledger reconciliation.
        </p>
      </div>
    )
  },
  {
    id: 'sec-10-wallet-funding',
    chapterNumber: '10',
    title: 'Wallet Funding Refunds',
    subtitle: 'Virtual Accounts, Card Payments & USSD Deposits',
    body: (
      <div className="space-y-4">
        <p>
          When you fund your BlueSea Mobile wallet via bank transfer to your dedicated virtual account, debit card, or USSD code:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Successful Deposit:</strong> Once funds land in your BlueSea Mobile wallet, they are available for use or withdrawal. Withdrawing deposited funds back to an external bank account incurs standard NIBSS transaction processing fees.</li>
          <li><strong>Delayed Deposit:</strong> If your bank account is debited but your BlueSea wallet is not credited within 1 hour, the delay is typically caused by interbank NIBSS switch delay. Such deposits will credit automatically once the settlement file is received.</li>
          <li><strong>Erroneous Transfer:</strong> Transfers made to the wrong virtual account number due to user input error cannot be refunded by BlueSea Mobile unless the recipient consents to a voluntary reversal.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-11-wallet-withdrawals',
    chapterNumber: '11',
    title: 'Wallet Withdrawal Issues',
    subtitle: 'Outward Interbank Transfer Reversals',
    body: (
      <div className="space-y-4">
        <p>
          When transferring funds from your BlueSea Mobile wallet to an external commercial bank account (e.g., GTBank, Zenith Bank, Access Bank):
        </p>
        <p>
          If NIBSS or the destination bank rejects the transfer (due to account inactivity, name mismatch, or destination bank switch downtime), the transfer status changes to &quot;Failed&quot;, and the total transfer amount including processing fees is returned to your BlueSea Mobile wallet within <strong>15 minutes</strong>.
        </p>
      </div>
    )
  },
  {
    id: 'sec-12-internal-transfers',
    chapterNumber: '12',
    title: 'Internal Wallet Transfer Refunds',
    subtitle: 'P2P Instant Ledger Transfers',
    body: (
      <div className="space-y-4">
        <p>
          Internal transfers between BlueSea Mobile wallet holders execute instantly on our private database ledger. Because internal transfers settle in real time, they are <strong>strictly final and non-refundable</strong> once authorized by the sender using their Transaction PIN or Biometric Key.
        </p>
        <p>
          If you mistakenly transfer funds to the wrong BlueSea Mobile user, you must request a refund directly from the recipient. BlueSea Mobile cannot arbitrarily debit another user&apos;s wallet without their written consent or a valid Nigerian Court Order.
        </p>
      </div>
    )
  },
  {
    id: 'sec-13-blue-connect',
    chapterNumber: '13',
    title: 'Blue Connect Transactions',
    subtitle: 'Social Handles & Dynamic Payment Request Links',
    body: (
      <div className="space-y-4">
        <p>
          Blue Connect enables payments via custom handles (@username) and dynamic payment links.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Handle Payments:</strong> Payments sent to verified handles are final upon confirmation. Users must double-check display names on the verification screen before confirming.</li>
          <li><strong>Payment Request Links:</strong> Payments completed via dynamic links are credited directly to the creator&apos;s wallet. Disputes regarding unfulfilled merchant goods paid via Blue Connect links must be raised within 24 hours under our Merchant Dispute Protocol.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-14-airtime-refunds',
    chapterNumber: '14',
    title: 'Airtime Purchase Refunds',
    subtitle: 'Virtual Top-Up (VTU) Rules across Nigerian Telcos',
    body: (
      <div className="space-y-4">
        <p>
          Airtime top-ups (MTN, Airtel, Glo, 9mobile) are delivered directly to the telecommunication operator&apos;s central switch.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Delivered Airtime:</strong> Once the telco confirms airtime delivery to the phone number entered, the purchase is complete and non-refundable. Airtime cannot be converted back to wallet cash through standard support.</li>
          <li><strong>Wrong Phone Number:</strong> If you enter an incorrect phone number and the airtime successfully delivers to that number, BlueSea Mobile cannot recall the airtime from the telco network.</li>
          <li><strong>Failed Delivery:</strong> If the telco network rejects the top-up, your wallet is refunded instantly.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-15-data-refunds',
    chapterNumber: '15',
    title: 'Data Purchase Refunds',
    subtitle: 'SME, Gifting & Direct Data Bundles',
    body: (
      <div className="space-y-4">
        <p>
          Data bundle deliveries are processed instantly. Once the mobile network operator confirms data allocation to the specified SIM card, the transaction is finalized.
        </p>
        <p>
          If data top-up fails due to telco porting issues or network outages, our system performs auto-reversal within 15 minutes. Unfulfilled data requests unresolved after 2 hours will be refunded manually upon logging a support ticket.
        </p>
      </div>
    )
  },
  {
    id: 'sec-16-electricity-refunds',
    chapterNumber: '16',
    title: 'Electricity Bill Payments & Token Delivery',
    subtitle: 'Prepaid Tokens & Postpaid Account Reversals',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile processes utility bill payments across all Nigerian Electricity Distribution Companies (IKEDC, EKEDC, AEDC, IBEDC, PHED, KAEDCO, EEDC, KEDCO, YEDC, JED, BEDC).
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Generated Prepaid Tokens:</strong> Once a 20-digit electricity token is generated by the DisCo API and displayed in your transaction receipt, the purchase is final. Generated tokens cannot be returned, exchanged, or refunded.</li>
          <li><strong>Wrong Meter Number:</strong> Tokens generated for a valid meter number entered by the user belong to that meter and cannot be credited to a different meter.</li>
          <li><strong>DisCo API Failures:</strong> If your wallet is debited but the DisCo fails to issue a token due to server downtime, the transaction will enter Pending status for up to 2 hours before auto-refunding to your wallet.</li>
        </ul>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Electricity Token Verification Tip',
        description: (
          <p>
            Always verify the Meter Owner&apos;s Legal Name displayed on the BlueSea Mobile confirmation screen before finalizing electricity purchases to avoid crediting wrong meters.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-17-cable-tv-refunds',
    chapterNumber: '17',
    title: 'Cable TV Subscription Refunds',
    subtitle: 'DSTV, GOTV, StarTimes & Showmax Activations',
    body: (
      <div className="space-y-4">
        <p>
          Cable TV renewals credit smartcards and IUC numbers directly via provider gateways (MultiChoice, StarTimes).
        </p>
        <p>
          Once MultiChoice or StarTimes returns a successful activation response, the package subscription is live and non-refundable. If an activation attempt fails due to incorrect smartcard numbers or provider downtime, funds are automatically returned to your BlueSea wallet.
        </p>
      </div>
    )
  },
  {
    id: 'sec-18-internet-refunds',
    chapterNumber: '18',
    title: 'Internet Bill Payments',
    subtitle: 'Fiber & LTE Broadband Subscriptions',
    body: (
      <div className="space-y-4">
        <p>
          Internet service payments (Spectranet, Smile, Swift, IPNX) credit account numbers managed by ISPs. Successful account top-ups are non-refundable. In the event of an ISP system error where funds are debited without account top-up, BlueSea Mobile will verify with the ISP and process a full refund within 24 hours.
        </p>
      </div>
    )
  },
  {
    id: 'sec-19-education-pins',
    chapterNumber: '19',
    title: 'Education PIN Purchases',
    subtitle: 'WAEC, NECO, JAMB & NABTEB Exam Tokens',
    body: (
      <div className="space-y-4">
        <p>
          Education PINs are confidential cryptographic numbers generated from official examination board servers.
        </p>
        <p>
          Once an Education PIN is generated and displayed on your screen or delivered via SMS/Email, the PIN is deemed consumed and <strong>strictly non-refundable</strong> under any circumstances to prevent digital reproduction fraud.
        </p>
      </div>
    )
  },
  {
    id: 'sec-20-payroll-transactions',
    chapterNumber: '20',
    title: 'Payroll Transactions & Bulk Disbursements',
    subtitle: 'Corporate Payout Reversals & Error Recalls',
    body: (
      <div className="space-y-4">
        <p>
          Corporate organizations utilizing BlueSea Mobile Payroll Management for automated salary disbursements:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Failed Line-Item Disbursements:</strong> Individual salary payouts that fail due to invalid beneficiary account details are automatically reversed to the corporate employer&apos;s Payroll Master Wallet within 1 hour.</li>
          <li><strong>Erroneous Overpayments:</strong> If an employer mistakenly disburses excess funds to an employee account, the employer must initiate a formal Payroll Recall Request. BlueSea Mobile will contact the recipient and attempt recovery under NIBSS dispute guidelines.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-21-ticket-sales',
    chapterNumber: '21',
    title: 'Ticket Sales & Event Cancellations',
    subtitle: 'Facilitation Standards & Organizer Terms',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile acts as an authorized ticketing partner for event organizers, cinema operators, and transport companies.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Event Postponement or Cancellation:</strong> If an event is officially canceled by the organizer, refunds will be issued to ticket buyers in accordance with the event organizer&apos;s refund policy and released funds.</li>
          <li><strong>User Change of Mind:</strong> Tickets purchased for valid, active events are non-refundable unless explicitly permitted by the event organizer&apos;s terms.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-22-crypto-transactions',
    chapterNumber: '22',
    title: 'Future Cryptocurrency & Digital Asset Transactions',
    subtitle: 'Blockchain Irreversibility & Distributed Settlement Rules',
    body: (
      <div className="space-y-4">
        <p>
          Upon launch of future cryptocurrency services, transactions executed on public blockchain networks (such as Bitcoin, Ethereum, Solana, or USDT networks) are cryptographically final, immutable, and irreversible.
        </p>
        <p>
          Transfers executed to incorrect wallet addresses, un supported blockchain networks, or smart contracts cannot be recovered, reversed, or refunded by BlueSea Mobile.
        </p>
      </div>
    )
  },
  {
    id: 'sec-23-merchant-services',
    chapterNumber: '23',
    title: 'Merchant Service Transactions',
    subtitle: 'Escrow Safeguards & Commercial Disputes',
    body: (
      <div className="space-y-4">
        <p>
          Payments made to verified BlueSea Merchants for goods or services may be subject to escrow holding periods. If a merchant fails to fulfill an order, the customer must log a Merchant Dispute within 48 hours. Upon investigation, if non-delivery is established, funds will be refunded to the buyer.
        </p>
      </div>
    )
  },
  {
    id: 'sec-24-chargebacks',
    chapterNumber: '24',
    title: 'Chargebacks & External Card Disputes',
    subtitle: 'Interswitch, Mastercard & Visa Rules',
    body: (
      <div className="space-y-4">
        <p>
          If you fund your wallet or pay for services using a debit/credit card and subsequently file an unauthorized chargeback with your card-issuing bank:
        </p>
        <p>
          BlueSea Mobile will provide transaction logs, IP logs, 2FA authorization records, and delivery proofs to the card scheme processors. If a chargeback is filed fraudulently for a service successfully delivered, BlueSea Mobile reserves the right to place an administrative hold on your wallet balance equal to the chargeback amount plus scheme arbitration fees.
        </p>
      </div>
    )
  },
  {
    id: 'sec-25-payment-disputes',
    chapterNumber: '25',
    title: 'Payment Dispute Resolution Framework',
    subtitle: 'Internal Escalation Levels & Fair Hearings',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile is dedicated to resolving customer transaction grievances through a transparent three-tiered dispute escalation mechanism:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Tier 1 (Support Desk):</strong> In-app chat or email logging handled within 2 to 12 hours.</li>
          <li><strong>Tier 2 (Reconciliation Unit):</strong> Direct API switch audit and aggregator query resolved within 24 to 48 hours.</li>
          <li><strong>Tier 3 (Executive Compliance Desk):</strong> Formal review for complex legal or merchant claims resolved within 5 business days.</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-26-refund-procedure',
    chapterNumber: '26',
    title: 'Step-by-Step Refund Request Procedure',
    subtitle: 'How to Submit an Incident Ticket',
    body: (
      <div className="space-y-4">
        <p>
          To request a refund for an unfulfilled or failed transaction, follow these simple steps:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Open the BlueSea Mobile app and navigate to <strong>Transaction History</strong>.</li>
          <li>Select the affected transaction record and tap <strong>Report an Issue</strong>.</li>
          <li>Select the issue category (e.g., Value Not Received, Double Debit, Network Failure).</li>
          <li>Attach supporting details (such as debit bank alert, receipt screenshot, or meter status message).</li>
          <li>Submit the ticket to generate a tracking Ticket ID (e.g., #REF-2026-9982).</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-27-supporting-info',
    chapterNumber: '27',
    title: 'Required Supporting Information',
    subtitle: 'Mandatory Audit Artifacts',
    body: (
      <div className="space-y-4">
        <p>
          To expedite your refund investigation, please provide:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>BlueSea Mobile Unique Transaction Reference Number (Txn Ref).</li>
          <li>Bank Session ID or Retrieval Reference Number (RRN) for funding disputes.</li>
          <li>Date, exact time, and monetary amount debited.</li>
          <li>Recipient identifier (Phone number, Meter number, Smartcard ID, or Account Number).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-28-investigation-process',
    chapterNumber: '28',
    title: 'Investigation Process & Technical Audits',
    subtitle: 'API Log Reconciliation & Gateway Queries',
    body: (
      <div className="space-y-4">
        <p>
          Upon receiving a refund request, our Technical Operations team audits server logs, inspects JSON payload responses from payment gateways, queries NIBSS clearing logs, and verifies delivery status with the destination provider before authorizing ledger reimbursement.
        </p>
      </div>
    )
  },
  {
    id: 'sec-29-resolution-timeframes',
    chapterNumber: '29',
    title: 'Estimated Resolution Timeframes (SLAs)',
    subtitle: 'Service Level Expectations Across Products',
    body: (
      <div className="space-y-4">
        <p>
          We commit to resolving refund requests according to the following Service Level Agreements (SLAs):
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Category</th>
                <th className="p-2.5 border-b">Failure Condition</th>
                <th className="p-2.5 border-b">Target Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Internal Wallet &amp; P2P</td>
                <td className="p-2.5">Failed System Transfer</td>
                <td className="p-2.5">0 - 15 Minutes (Instant)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Airtime &amp; Mobile Data</td>
                <td className="p-2.5">Uncredited Telco Top-Up</td>
                <td className="p-2.5">15 Mins - 2 Hours</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Electricity Bills &amp; Utility Tokens</td>
                <td className="p-2.5">DisCo API Network Timeout</td>
                <td className="p-2.5">2 - 24 Hours</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Interbank Transfer Withdrawal</td>
                <td className="p-2.5">NIBSS Switch Reversal Delay</td>
                <td className="p-2.5">24 - 48 Hours</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800 dark:text-white">Card Funding Chargebacks</td>
                <td className="p-2.5">Bank Card Gateway Claim</td>
                <td className="p-2.5">5 - 14 Business Days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'sec-30-exceptional-circumstances',
    chapterNumber: '30',
    title: 'Exceptional Circumstances',
    subtitle: 'System Downtime, Outages & Court Orders',
    body: (
      <div className="space-y-4">
        <p>
          Resolution timeframes may be extended beyond standard SLAs under exceptional circumstances, including major national payment clearing system outages, emergency maintenance windows on telecommunication backbones, or formal regulatory freeze orders issued by law enforcement or competent courts of law.
        </p>
      </div>
    )
  },
  {
    id: 'sec-31-fraudulent-requests',
    chapterNumber: '31',
    title: 'Fraudulent Refund Requests & Misuse',
    subtitle: 'Friendly Fraud & Legal Sanctions',
    body: (
      <div className="space-y-4">
        <p>
          Filing fraudulent refund claims—such as claiming non-receipt of electricity tokens or airtime top-ups that were successfully consumed—is a violation of our Terms &amp; Conditions and Nigerian law.
        </p>
        <p>
          Accounts found attempting to claim fraudulent refunds will be suspended, flagged on central industry fraud databases, and referred to law enforcement under the Cybercrimes (Prohibition, Prevention, Etc.) Act.
        </p>
      </div>
    )
  },
  {
    id: 'sec-32-customer-responsibilities',
    chapterNumber: '32',
    title: 'Customer Responsibilities',
    subtitle: 'Pre-Authorization Verification Obligations',
    body: (
      <div className="space-y-4">
        <p>
          Customers have a duty of care when initiating financial transactions on BlueSea Mobile:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Carefully verify destination phone numbers, meter numbers, smartcard numbers, and bank account details prior to authorizing payments.</li>
          <li>Keep transaction PINs, passcodes, and 2FA credentials confidential.</li>
          <li>Report transaction discrepancies within seven (7) days of occurrence.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-33-bluesea-responsibilities',
    chapterNumber: '33',
    title: 'BlueSea Mobile Responsibilities',
    subtitle: 'Operational Excellence & Fiduciary Integrity',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile is committed to maintaining high operational standards:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Maintain automated transaction auditing and logging systems.</li>
          <li>Reimburse unfulfilled transaction values promptly within defined SLA timeframes.</li>
          <li>Provide responsive customer support assistance across multiple help channels.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-34-provider-delays',
    chapterNumber: '34',
    title: 'Service Provider Delays',
    subtitle: 'Third-Party Network SLA Dependencies',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile relies on telecommunication switches, energy aggregators, and bank clearing nodes. Delays originating within third-party networks are reconciled as rapidly as upstream partners process settlement files.
        </p>
      </div>
    )
  },
  {
    id: 'sec-35-third-party-responsibilities',
    chapterNumber: '35',
    title: 'Third-Party Provider Responsibilities',
    subtitle: 'Upstream Settlement & Aggregator SLAS',
    body: (
      <div className="space-y-4">
        <p>
          Third-party service providers (such as DisCos, Telcos, and NIBSS) remain contractually responsible for the validity, service availability, and operational uptime of their utility delivery servers.
        </p>
      </div>
    )
  },
  {
    id: 'sec-36-force-majeure',
    chapterNumber: '36',
    title: 'Force Majeure',
    subtitle: 'Events Beyond Reasonable Control',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile shall not be held liable for delayed refunds or temporary reversal failures resulting from circumstances beyond our reasonable control, including natural disasters, national power grid collapses, severed undersea fiber optic cables, civil unrest, or nationwide banking infrastructure blackouts.
        </p>
      </div>
    )
  },
  {
    id: 'sec-37-policy-updates',
    chapterNumber: '37',
    title: 'Amendments to This Refund Policy',
    subtitle: 'Revision Protocol & Policy Publication',
    body: (
      <div className="space-y-4">
        <p>
          We reserve the right to modify this Policy at any time. Updated versions will be published on our website and mobile app with a revised effective date. Continued use of our services following an update indicates acceptance of the amended Refund Policy.
        </p>
      </div>
    )
  },
  {
    id: 'sec-38-contact-support',
    chapterNumber: '38',
    title: 'Contacting Customer Support & Disputes Desk',
    subtitle: 'Dedicated Reversals Help Channels',
    body: (
      <div className="space-y-4">
        <p>
          If you have questions, require manual assistance, or wish to follow up on an active refund ticket, please reach out through our official channels:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
          <p><strong>Refunds &amp; Disputes Email:</strong> refunds@blueseamobile.com</p>
          <p><strong>Customer Support Email:</strong> support@blueseamobile.com</p>
          <p><strong>Telephone Support Hotline:</strong> +234 700 BLUESEA (0700 2583 732)</p>
          <p><strong>In-App Support:</strong> Navigation Drawer &gt; Support &gt; Live Chat</p>
          <p><strong>Head Office:</strong> BlueSea Mobile Towers, Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    )
  },
  {
    id: 'sec-39-effective-date',
    chapterNumber: '39',
    title: 'Effective Date',
    subtitle: 'Policy Operational Benchmark',
    body: (
      <div className="space-y-4">
        <p>
          This Refund &amp; Reversal Policy is effective as of <strong>January 1, 2026</strong>, and applies to all transactions processed on or after this date.
        </p>
      </div>
    )
  },
  {
    id: 'sec-40-version-history',
    chapterNumber: '40',
    title: 'Version History & Revision Control',
    subtitle: 'Historical Policy Audit Log',
    body: (
      <div className="space-y-4">
        <p>
          Historical log of amendments made to the BlueSea Mobile Refund Policy:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Version</th>
                <th className="p-2.5 border-b">Effective Date</th>
                <th className="p-2.5 border-b">Summary of Key Reversal Amendments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">v2.4.0</td>
                <td className="p-2.5">Jan 01, 2026</td>
                <td className="p-2.5">Comprehensive update introducing automated reversal SLAs for DisCo utility bills, Blue Connect handle refund protocols, and corporate payroll recall guidelines.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.1.0</td>
                <td className="p-2.5">Aug 15, 2025</td>
                <td className="p-2.5">Enhanced auto-recredit mechanisms for failed interbank transfers and updated chargeback arbitration procedures.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v1.0.0</td>
                <td className="p-2.5">Mar 01, 2024</td>
                <td className="p-2.5">Initial launch of the BlueSea Mobile consumer refund and dispute framework.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
];

const refundPolicyConfig: LegalDocumentConfig = {
  metadata: {
    id: 'refund-policy',
    title: 'Refund & Transaction Reversal Policy',
    shortDescription: 'Clear, transparent guidelines on refund eligibility, automated failed transaction reversals, service-specific rules, dispute resolution SLAs, and customer responsibilities across BlueSea Mobile services.',
    category: 'User Agreements',
    version: '2.4.0',
    lastUpdated: 'July 25, 2026',
    effectiveDate: 'January 1, 2026',
    estimatedReadingTime: '18 min read',
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
  sections: refundPolicySections
};

function RefundHeaderBadges() {
  const badges = [
    { icon: <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />, label: 'Automated 15-Min Reversals' },
    { icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />, label: '100% Guaranteed Unfulfilled Refunds' },
    { icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />, label: 'Transparent Resolution SLAs' },
    { icon: <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />, label: 'CBN & FCCPC Aligned' },
    { icon: <Clock className="w-3.5 h-3.5 text-blue-400" />, label: 'Real-Time Reversal Tracking' }
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

function RefundFeatureGrid() {
  const features = [
    { icon: <RefreshCw className="w-4 h-4 text-emerald-500" />, label: 'Auto-Recredit Engine' },
    { icon: <ShieldCheck className="w-4 h-4 text-sky-500" />, label: 'Protected Balances' },
    { icon: <AlertCircle className="w-4 h-4 text-amber-500" />, label: 'Pending Hold Limits' },
    { icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />, label: 'Delivered Value Rules' },
    { icon: <Clock className="w-4 h-4 text-blue-500" />, label: 'SLA Timeframe Controls' },
    { icon: <Wallet className="w-4 h-4 text-emerald-600" />, label: 'Wallet Refund Direct' },
    { icon: <Smartphone className="w-4 h-4 text-sky-600" />, label: 'Telco Airtime Audits' },
    { icon: <Zap className="w-4 h-4 text-yellow-500" />, label: 'DisCo Power Token Checks' },
    { icon: <Tv className="w-4 h-4 text-indigo-500" />, label: 'Cable TV Smartcard Checks' },
    { icon: <Wifi className="w-4 h-4 text-teal-500" />, label: 'ISP Broadband Refunds' },
    { icon: <GraduationCap className="w-4 h-4 text-rose-500" />, label: 'Exam PIN Finality Rules' },
    { icon: <Briefcase className="w-4 h-4 text-amber-600" />, label: 'Payroll Error Recalls' },
    { icon: <Ticket className="w-4 h-4 text-purple-400" />, label: 'Event Ticket Returns' },
    { icon: <Coins className="w-4 h-4 text-yellow-600" />, label: 'Crypto Ledger Finality' },
    { icon: <Store className="w-4 h-4 text-blue-400" />, label: 'Merchant Escrow Claims' },
    { icon: <HelpCircle className="w-4 h-4 text-emerald-400" />, label: 'In-App Dispute Tickets' },
    { icon: <PhoneCall className="w-4 h-4 text-sky-400" />, label: 'Support Hotline Help' },
    { icon: <FileText className="w-4 h-4 text-slate-500" />, label: 'RRN & Session ID Audit' },
    { icon: <Lock className="w-4 h-4 text-teal-400" />, label: 'Fraud Shield Checks' },
    { icon: <Scale className="w-4 h-4 text-purple-500" />, label: 'FCCPC Compliance' },
    { icon: <Building2 className="w-4 h-4 text-slate-600" />, label: 'Interbank NIBSS Cleared' },
    { icon: <Search className="w-4 h-4 text-sky-500" />, label: 'API Payload Verification' },
    { icon: <Mail className="w-4 h-4 text-indigo-400" />, label: 'Refund Desk Emails' },
    { icon: <Share2 className="w-4 h-4 text-rose-400" />, label: 'Payment Gateway Sync' },
    { icon: <History className="w-4 h-4 text-amber-500" />, label: 'Versioned Reversal Logs' },
    { icon: <Sparkles className="w-4 h-4 text-yellow-400" />, label: 'Instant Recredit System' },
    { icon: <Server className="w-4 h-4 text-slate-400" />, label: 'Switch Uptime Protection' },
    { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, label: 'Chargeback Defense' },
    { icon: <Database className="w-4 h-4 text-emerald-500" />, label: 'Ledger Rollback Rules' },
    { icon: <Users className="w-4 h-4 text-blue-600" />, label: 'Blue Connect Link Disputes' },
    { icon: <CreditCard className="w-4 h-4 text-purple-600" />, label: 'Card Gateway Arbitration' },
    { icon: <Send className="w-4 h-4 text-teal-600" />, label: 'Outward Transfer Bounces' },
    { icon: <Slash className="w-4 h-4 text-rose-600" />, label: 'No Duplicate Debits' },
    { icon: <Eye className="w-4 h-4 text-sky-400" />, label: 'Real-Time Queue Audits' },
    { icon: <HardDrive className="w-4 h-4 text-slate-500" />, label: 'Permanent Audit Trail' },
    { icon: <FileCheck className="w-4 h-4 text-emerald-400" />, label: 'Proof of Delivery Check' },
    { icon: <Bell className="w-4 h-4 text-amber-400" />, label: 'Reversal Push Alerts' }
  ];

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 my-6">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
        <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
        Core Refund, Reversal &amp; Payment Settlement Safeguards
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

export function RefundPolicy() {
  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-4 pt-4 -mb-4">
        <RefundHeaderBadges />
        <RefundFeatureGrid />
      </div>

      <LegalDocumentTemplate config={refundPolicyConfig} />
    </div>
  );
}

export default RefundPolicy;