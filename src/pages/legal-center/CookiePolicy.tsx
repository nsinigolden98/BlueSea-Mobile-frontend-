import type { LegalDocumentConfig, LegalSectionData } from '@/types/legal';
import { LegalDocumentTemplate } from '@/components/legal/LegalDocumentTemplate';

const cookiePolicySections: LegalSectionData[] = [
  {
    id: 'sec-01-introduction',
    chapterNumber: '01',
    title: 'Introduction',
    subtitle: 'Tracking Technologies & User Privacy Commitment',
    body: (
      <div className="space-y-4">
        <p>
          At <strong>BlueSea Mobile Technologies Limited</strong> (&quot;BlueSea Mobile&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we are committed to upholding the highest standards of data protection, transparency, and user privacy across our digital ecosystem.
        </p>
        <p>
          This Cookie &amp; Tracking Technology Policy (&quot;Cookie Policy&quot;) explains how and why we utilize cookies, web beacons, local storage, mobile software development kits (SDKs), and related tracking technologies when you access our websites, web applications, customer portals, and mobile financial services applications (collectively, the &quot;Services&quot;).
        </p>
        <p>
          As a regulated financial technology platform operating under the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act 2023 (NDPA) and Central Bank of Nigeria (CBN) guidelines, we use tracking technologies primarily to secure customer sessions, prevent identity fraud, maintain transaction integrity, and continuously optimize user experience.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'important',
        title: 'Privacy & Security Guarantee',
        description: (
          <p>
            BlueSea Mobile does not sell your personal data or cookie telemetry to third-party data brokers or advertising networks. Every cookie and local storage key deployed across our platforms is governed by strict cryptographic access controls and privacy principles.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-02-purpose-of-policy',
    chapterNumber: '02',
    title: 'Purpose of This Cookie Policy',
    subtitle: 'Transparency, Control, and Compliance',
    body: (
      <div className="space-y-4">
        <p>
          The purpose of this Cookie Policy is to provide clear, accessible, and comprehensive information regarding:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>The nature and operational mechanics of cookies and similar tracking tools.</li>
          <li>The specific categories of cookies deployed across BlueSea Mobile web and mobile platforms.</li>
          <li>How tracking technologies enhance account security, anti-fraud controls, and system performance.</li>
          <li>Your rights and practical mechanisms for managing, customizing, or disabling cookie preferences.</li>
          <li>How cookie governance integrates with our broader Privacy Policy and Security Architecture.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-03-what-are-cookies',
    chapterNumber: '03',
    title: 'What Are Cookies?',
    subtitle: 'Technical Definition & Mechanics',
    body: (
      <div className="space-y-4">
        <p>
          Cookies are small text files containing alphanumeric strings that are transferred to your web browser, computer, or mobile device when you visit a website or web-based application. They allow the platform to recognize your device, preserve your active login session, remember language or interface preferences, and understand how you interact with our Services over time.
        </p>
        <p>
          Cookies are generally classified into two primary operational lifecycles:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Session Cookies:</strong> Temporary cookies that remain active only during your active browsing session. They automatically expire and are cleared from your device memory as soon as you close your web browser or log out of the platform.</li>
          <li><strong>Persistent Cookies:</strong> Cookies that remain stored on your device for a specified retention period (or until manually deleted). They enable the platform to recognize your device on subsequent visits, remember security settings, and maintain device trust profiles.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-04-similar-technologies',
    chapterNumber: '04',
    title: 'What Are Similar Technologies?',
    subtitle: 'Web Beacons, Local Storage, and SDKs',
    body: (
      <div className="space-y-4">
        <p>
          In addition to standard HTTP cookies, BlueSea Mobile utilizes complementary browser and application technologies to deliver seamless financial services:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>HTML5 Local Storage &amp; Session Storage:</strong> Web storage objects built into modern web browsers that allow web applications to store up to several megabytes of non-sensitive data locally on your device for improved performance, offline caching, and instant state hydration.</li>
          <li><strong>IndexedDB:</strong> A client-side transactional database embedded in modern browsers, used by our web application to store structured data required for high-speed offline capabilities and encrypted temporary records.</li>
          <li><strong>Pixel Tags &amp; Web Beacons:</strong> Small transparent graphic images or code snippets embedded in our emails or web pages that allow us to confirm email receipt, verify delivery success, and measure user engagement with customer support alerts.</li>
        <li><strong>Mobile Software Development Kits (SDKs):</strong> Native code libraries embedded within our iOS and Android mobile applications that perform functions analogous to cookies, enabling secure device binding, push notifications, and crash report diagnostics.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-05-why-we-use-cookies',
    chapterNumber: '05',
    title: 'Why BlueSea Mobile Uses Cookies',
    subtitle: 'Core Operational Motives',
    body: (
      <div className="space-y-4">
        <p>
          BlueSea Mobile operates a high-frequency financial platform processing transfers, bill payments, airtime recharges, payroll distributions, and utility services. We rely on cookies and similar technologies for four primary operational purposes:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li><strong>Authentication &amp; Session Continuity:</strong> Verifying your identity when you log in and maintaining your authenticated session across different screens and financial microservices.</li>
          <li><strong>Cybersecurity &amp; Fraud Prevention:</strong> Identifying suspicious connection patterns, preventing credential stuffing, mitigating automated bot attacks, and enforcing multi-factor authentication (MFA) step-up prompts.</li>
          <li><strong>Performance Optimization &amp; Analytics:</strong> Monitoring system response times, measuring API endpoint latency, tracking error rates, and understanding user workflows to upgrade platform infrastructure.</li>
          <li><strong>User Personalization:</strong> Remembering your UI theme preferences, selected account dashboards, default payment channels, and language configurations.</li>
        </ol>
      </div>
    )
  },
  {
    id: 'sec-06-essential-cookies',
    chapterNumber: '06',
    title: 'Essential Cookies',
    subtitle: 'Strictly Necessary Infrastructure Cookies',
    body: (
      <div className="space-y-4">
        <p>
          Essential cookies are strictly required for the fundamental operation of the BlueSea Mobile platform. Without these cookies, basic financial functions—such as accessing your digital wallet, making internal wallet transfers, processing utility payments, or loading secure banking pages—cannot be provided.
        </p>
        <p>
          Because these cookies are technically necessary for system operation and regulatory compliance, they cannot be disabled through our cookie preference toggles without breaking service availability.
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Cookie Name</th>
                <th className="p-2.5 border-b">Purpose</th>
                <th className="p-2.5 border-b">Lifespan</th>
                <th className="p-2.5 border-b">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">__bsm_sess</td>
                <td className="p-2.5">Maintains active encrypted user session state across payment gateways</td>
                <td className="p-2.5">Session</td>
                <td className="p-2.5">Essential</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">__bsm_csrf</td>
                <td className="p-2.5">Prevents Cross-Site Request Forgery (CSRF) attacks on transaction endpoints</td>
                <td className="p-2.5">Session</td>
                <td className="p-2.5">Essential</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">__bsm_lb</td>
                <td className="p-2.5">Routes API requests to the nearest cloud server node for load balancing</td>
                <td className="p-2.5">30 Minutes</td>
                <td className="p-2.5">Essential</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'sec-07-authentication-cookies',
    chapterNumber: '07',
    title: 'Authentication Cookies',
    subtitle: 'Identity Verification & Access Tokens',
    body: (
      <div className="space-y-4">
        <p>
          Authentication cookies store cryptographically signed, short-lived session identifiers (such as JSON Web Tokens or refresh token keys) that allow you to navigate through BlueSea Mobile without re-entering your master password on every page transition.
        </p>
        <p>
          These cookies are configured with strict security flags, including <code>HttpOnly</code> (preventing client-side JavaScript access), <code>Secure</code> (forcing transmission exclusively over TLS 1.3 encrypted connections), and <code>SameSite=Strict</code> (blocking cross-site token transmission).
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'security',
        title: 'Cryptographic Protection Standard',
        description: (
          <p>
            All authentication cookies deployed by BlueSea Mobile are encrypted using military-grade AES-256 standards. Plaintext user credentials, passwords, or transaction PINs are NEVER stored inside cookies.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-08-security-cookies',
    chapterNumber: '08',
    title: 'Security & Anti-Fraud Cookies',
    subtitle: 'Risk Detection & Device Fingerprinting',
    body: (
      <div className="space-y-4">
        <p>
          Security cookies enable our 24/7 Security Operations Center (SOC) and automated fraud engines to detect, prevent, and respond to cyber threats in real time.
        </p>
        <p>
          These cookies perform vital safety checks, such as:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Device Recognition:</strong> Confirming whether a login request originates from a previously verified device or an unknown hardware signature.</li>
          <li><strong>Brute-Force Shielding:</strong> Tracking rapid failed PIN or password attempts to trigger automated temporary lockouts.</li>
          <li><strong>Bot &amp; Scraper Detection:</strong> Identifying automated scripts attempting to scrape utility rates or execute unauthorized API polling.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-09-session-cookies',
    chapterNumber: '09',
    title: 'Session Cookies',
    subtitle: 'Short-Lived Memory Safeguards',
    body: (
      <div className="space-y-4">
        <p>
          Session cookies are transient files stored in your browser&apos;s volatile memory. They act as temporary memory keys during an active session, ensuring that actions taken on one screen (such as selecting a utility provider or drafting a payroll disbursement batch) are preserved while navigating to the confirmation screen.
        </p>
        <p>
          Session cookies are automatically erased when you log out, close your browser tab, or when your session expires after two (2) minutes of inactivity.
        </p>
      </div>
    )
  },
  {
    id: 'sec-10-preference-cookies',
    chapterNumber: '10',
    title: 'Preference & Customization Cookies',
    subtitle: 'Personalized User Interface Settings',
    body: (
      <div className="space-y-4">
        <p>
          Preference cookies allow the BlueSea Mobile platform to remember choices you make during your interactions with our interface. They ensure that your customized preferences persist across browser restarts.
        </p>
        <p>
          Stored preferences include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Visual display mode choices (e.g., Dark Mode vs. Light Mode).</li>
          <li>Default wallet views and balance visibility toggles (e.g., hiding wallet balance by default).</li>
          <li>Preferred utility bill notification reminders and payment recipient shortcodes.</li>
          <li>Default display language and regional formatting choices.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-11-performance-cookies',
    chapterNumber: '11',
    title: 'Performance & Reliability Cookies',
    subtitle: 'System Health & Latency Optimization',
    body: (
      <div className="space-y-4">
        <p>
          Performance cookies collect technical diagnostics regarding how our servers and applications respond under varying operational loads. They help us identify network bottlenecks, measure page load speeds, and monitor API request fulfillment rates across Nigerian telecommunication networks.
        </p>
        <p>
          All technical data gathered by performance cookies is aggregated, anonymized, and used strictly for infrastructure scaling and reliability engineering.
        </p>
      </div>
    )
  },
  {
    id: 'sec-12-analytics-cookies',
    chapterNumber: '12',
    title: 'Analytics & Insights Cookies',
    subtitle: 'Understanding Platform Usage Patterns',
    body: (
      <div className="space-y-4">
        <p>
          Analytics cookies assist us in understanding how users interact with BlueSea Mobile services—such as which features are accessed most frequently (e.g., Airtime Purchase, Cable TV, Blue Connect transfers), where navigation drop-offs occur, and how effective our product tutorials are.
        </p>
        <p>
          We utilize privacy-focused, self-hosted or privacy-compliant analytics frameworks that obscure individual IP addresses (IP anonymization) and strip personal identifiers before generating statistical reports.
        </p>
      </div>
    )
  },
  {
    id: 'sec-13-functional-cookies',
    chapterNumber: '13',
    title: 'Functional Cookies',
    subtitle: 'Enhanced Feature Capabilities',
    body: (
      <div className="space-y-4">
        <p>
          Functional cookies power advanced interactive features across our web portal, such as live customer support chat widgets, interactive help center guides, embedded instructional videos, and dynamic bill calculator tools.
        </p>
        <p>
          Disabling functional cookies may render certain interactive features unavailable or cause non-critical user interface elements to load degraded static fallbacks.
        </p>
      </div>
    )
  },
  {
    id: 'sec-14-third-party-cookies',
    chapterNumber: '14',
    title: 'Third-Party Cookies & Service Integrations',
    subtitle: 'Payment Switch & Partner Network Cookies',
    body: (
      <div className="space-y-4">
        <p>
          In specific operational scenarios, BlueSea Mobile integrates trusted third-party services to process payments, verify identities, or prevent fraud. These partner integrations may place specialized cookies on your device when executing related functions:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>PCI-DSS Card Processing Partners:</strong> Licensed payment gateways (such as Interswitch, Paystack, or Flutterwave) deploy secure cookies to process direct debit card processing or 3D-Secure card verification.</li>
          <li><strong>Identity Verification Providers:</strong> Biometric and KYC partners deploy temporary cookies during live facial liveness checks or document verification flows.</li>
          <li><strong>Infrastructure Protection Services:</strong> Cloud security networks (such as Cloudflare or AWS CloudFront) set security cookies to protect against distributed denial-of-service (DDoS) attacks.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-15-browser-storage',
    chapterNumber: '15',
    title: 'Browser Storage Technologies',
    subtitle: 'HTML5 LocalStorage, SessionStorage & IndexedDB',
    body: (
      <div className="space-y-4">
        <p>
          Modern web applications frequently utilize HTML5 Local Storage and Session Storage in conjunction with or as an alternative to traditional cookies.
        </p>
        <p>
          BlueSea Mobile utilizes client-side web storage to cache non-sensitive web assets, user theme preferences, offline receipt templates, and localized translation dictionaries. Unlike cookies, browser local storage objects are not sent automatically in HTTP header requests, reducing network overhead and improving application response speeds.
        </p>
      </div>
    )
  },
  {
    id: 'sec-16-mobile-considerations',
    chapterNumber: '16',
    title: 'Mobile Application Considerations',
    subtitle: 'iOS Keychain, Android Keystore & Mobile SDKs',
    body: (
      <div className="space-y-4">
        <p>
          Standard HTTP cookies operate primarily within web browser environments. On the BlueSea Mobile iOS and Android native mobile applications, equivalent functions are performed using secure operating system storage mechanisms:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>iOS Secure Keychain &amp; Android Keystore:</strong> Encrypted hardware-backed storage used to securely store device tokens and biometric authentication preferences.</li>
          <li><strong>Mobile Analytics SDKs:</strong> Encapsulated software kits used to log application crashes, measure frame rates, and optimize mobile memory utilization without tracking activities outside the BlueSea app.</li>
          <li><strong>Advertising Identifiers:</strong> BlueSea Mobile does NOT read, track, or share iOS Identifier for Advertisers (IDFA) or Android Advertising IDs (AAID) for targeted ad profiling.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-17-account-protection',
    chapterNumber: '17',
    title: 'How Cookies Help Protect Your Account',
    subtitle: 'Active Defense Mechanism',
    body: (
      <div className="space-y-4">
        <p>
          Cookies are an integral part of our defense-in-depth cybersecurity architecture. They protect your account by:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Ensuring that unauthorized third-party websites cannot hijack active banking sessions or execute unauthorized transfer commands.</li>
          <li>Validating that financial transactions originate from the specific browser or mobile app instance that authorized the login.</li>
          <li>Flagging suspicious session migration attempts—such as an active session abruptly changing IP addresses mid-transaction.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-18-fraud-prevention',
    chapterNumber: '18',
    title: 'Fraud Prevention Technologies',
    subtitle: 'Risk Telemetry & Threat Abatement',
    body: (
      <div className="space-y-4">
        <p>
          To protect our community against syndicate fraud, account takeover (ATO), and identity theft, our fraud detection cookies evaluate risk signals during key user interactions.
        </p>
        <p>
          These risk signals include connection entropy, browser plugin integrity, screen resolution consistency, and request timing. If an anomaly is detected, our platform automatically triggers step-up verification (such as mandatory OTP or biometric re-authentication) before executing sensitive wallet withdrawals.
        </p>
      </div>
    ),
    callouts: [
      {
        type: 'warning',
        title: 'Anti-Fraud Enforcement Warning',
        description: (
          <p>
            Attempting to bypass, manipulate, or inject artificial payloads into BlueSea Mobile security cookies or anti-fraud telemetry tokens will trigger immediate automated session suspension and initiate a manual fraud investigation.
          </p>
        )
      }
    ]
  },
  {
    id: 'sec-19-personalisation',
    chapterNumber: '19',
    title: 'Personalisation & User Experience',
    subtitle: 'Tailoring Financial Workflows',
    body: (
      <div className="space-y-4">
        <p>
          Cookies enable BlueSea Mobile to customize product workflows based on your interaction history. For example, preference cookies allow us to display your frequently recharged utility meters (e.g., Ikeja Electric or Eko Electricity), favorite airtime mobile numbers, or regular Blue Connect user handles directly on your quick-action homepage dashboard.
        </p>
      </div>
    )
  },
  {
    id: 'sec-20-managing-preferences',
    chapterNumber: '20',
    title: 'Managing Cookie Preferences',
    subtitle: 'Granular Preference Toggles & Consent Center',
    body: (
      <div className="space-y-4">
        <p>
          We believe users should maintain complete control over their non-essential digital footprint. When you first visit the BlueSea Mobile web portal, you are presented with our transparent Cookie Banner allowing you to accept all, reject non-essential, or customize your preferences.
        </p>
        <p>
          You can modify your non-essential cookie choices at any time by accessing the <strong>Privacy &amp; Security Settings</strong> menu in your account dashboard or clicking the &quot;Cookie Preferences&quot; link in our web footer.
        </p>
      </div>
    )
  },
  {
    id: 'sec-21-browser-controls',
    chapterNumber: '21',
    title: 'Browser Cookie Controls',
    subtitle: 'Managing Cookies via Web Browsers',
    body: (
      <div className="space-y-4">
        <p>
          Most modern web browsers allow you to view, manage, block, or delete cookies through their built-in preference menus. Instructions for managing cookies on major web browsers can be found below:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Third-party cookies.</li>
          <li><strong>Mozilla Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and Site Data.</li>
          <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Prevent cross-site tracking &amp; Block all cookies.</li>
          <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage and delete cookies.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-22-disabling-cookies',
    chapterNumber: '22',
    title: 'Disabling Cookies & Opt-Out Methods',
    subtitle: 'Opt-Out Directives & Do Not Track Signals',
    body: (
      <div className="space-y-4">
        <p>
          You have the right to refuse or disable non-essential analytics, functional, and performance cookies at any time.
        </p>
        <p>
          Please note that BlueSea Mobile systems automatically respect browser-level Privacy Signals, such as Global Privacy Control (GPC). Where a recognized GPC signal is detected, non-essential tracking cookies are automatically disabled for that browsing session.
        </p>
      </div>
    )
  },
  {
    id: 'sec-23-effect-of-disabling',
    chapterNumber: '23',
    title: 'Effect of Disabling Cookies',
    subtitle: 'Impact on System Functionality & Login Persistence',
    body: (
      <div className="space-y-4">
        <p>
          Before choosing to disable cookies at the browser level, please understand the functional impact on your user experience:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Blocking Essential / Authentication Cookies:</strong> Blocking strictly necessary cookies will prevent you from logging into your account, viewing wallet balances, or executing financial transactions.</li>
          <li><strong>Blocking Preference Cookies:</strong> Interface settings (such as Dark Mode or saved bill quick-codes) will reset to factory defaults on every page reload.</li>
          <li><strong>Blocking Security Cookies:</strong> System risk scores may increase, triggering frequent step-up MFA verification requests during routine payments.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sec-24-updates-to-policy',
    chapterNumber: '24',
    title: 'Updates to This Cookie Policy',
    subtitle: 'Policy Evolution & Regulatory Alignment',
    body: (
      <div className="space-y-4">
        <p>
          We may update this Cookie Policy periodically to reflect changes in our operational technologies, privacy legislation, Central Bank directives, or new platform features.
        </p>
        <p>
          When material revisions occur, we will notify users by updating the &quot;Last Updated&quot; date at the top of this document and publishing a prominent notification banner across our platform.
        </p>
      </div>
    )
  },
  {
    id: 'sec-25-relationship-to-privacy-policy',
    chapterNumber: '25',
    title: 'Relationship to the Privacy Policy',
    subtitle: 'Unified Data Governance',
    body: (
      <div className="space-y-4">
        <p>
          This Cookie Policy forms an integral part of and should be read in conjunction with the main <strong>BlueSea Mobile Privacy Policy</strong>.
        </p>
        <p>
          Where personal data (such as IP addresses, unique device hashes, or verified account IDs) is collected or processed via cookies or local storage, such processing is governed strictly by the terms, rights, and retention schedules outlined in our Privacy Policy.
        </p>
      </div>
    )
  },
  {
    id: 'sec-26-contact-us',
    chapterNumber: '26',
    title: 'Contacting BlueSea Mobile Privacy Office',
    subtitle: 'Data Protection Officer & Privacy Inquiries',
    body: (
      <div className="space-y-4">
        <p>
          If you have questions, comments, or technical inquiries regarding our use of cookies, tracking technologies, or personal data privacy practices, please contact our Data Protection Officer (DPO):
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
          <p><strong>Data Protection Officer:</strong> Privacy &amp; Data Governance Desk</p>
          <p><strong>Official Privacy Email:</strong> privacy@blueseamobile.com</p>
          <p><strong>General Customer Care:</strong> support@blueseamobile.com</p>
          <p><strong>Corporate Head Office:</strong> BlueSea Mobile Cyber Tower, Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    )
  },
  {
    id: 'sec-27-effective-date',
    chapterNumber: '27',
    title: 'Effective Date',
    subtitle: 'Legal Enforcement Date',
    body: (
      <div className="space-y-4">
        <p>
          This Cookie &amp; Tracking Technology Policy is effective as of <strong>January 1, 2026</strong>, and replaces all prior versions governing cookie usage on BlueSea Mobile web and mobile platforms.
        </p>
      </div>
    )
  },
  {
    id: 'sec-28-version-history',
    chapterNumber: '28',
    title: 'Version History & Audit Log',
    subtitle: 'Historical Tracking Policy Revisions',
    body: (
      <div className="space-y-4">
        <p>
          Audit history log of revisions made to the BlueSea Mobile Cookie Policy:
        </p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">
              <tr>
                <th className="p-2.5 border-b">Version</th>
                <th className="p-2.5 border-b">Effective Date</th>
                <th className="p-2.5 border-b">Summary of Key Revisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-bold">v3.0.0</td>
                <td className="p-2.5">Jan 01, 2026</td>
                <td className="p-2.5">Comprehensive upgrade detailing Global Privacy Control (GPC) support, native iOS Keychain / Android Keystore specifications, and NDPA 2023 alignment.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v2.1.0</td>
                <td className="p-2.5">Aug 15, 2025</td>
                <td className="p-2.5">Added technical definitions for HTML5 LocalStorage, SessionStorage, and anti-fraud telemetry cookies.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">v1.0.0</td>
                <td className="p-2.5">Mar 01, 2024</td>
                <td className="p-2.5">Initial launch of the BlueSea Mobile Platform Cookie &amp; Tracking Policy.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
];

const cookiePolicyConfig: LegalDocumentConfig = {
  metadata: {
    id: 'cookie-policy',
    title: 'Cookie & Tracking Technology Policy',
    shortDescription: 'Comprehensive details on how BlueSea Mobile uses cookies, web storage, SDKs, and tracking technologies to secure account sessions, prevent fraud, optimize app performance, and deliver personalized digital financial services.',
    category: 'User Agreements',
    version: '3.0.0',
    lastUpdated: 'July 25, 2026',
    effectiveDate: 'January 1, 2026',
    estimatedReadingTime: '18 min read',
    applicableRegion: 'Federal Republic of Nigeria',
    status: 'active'
  },
  previousDoc: {
    title: 'Security Policy',
    path: '/legal/security'
  },
  nextDoc: {
    title: 'Acceptable Use Policy',
    path: '/legal/acceptable-use'
  },
  sections: cookiePolicySections
};



export function CookiePolicy() {
  return (
    <div className="relative">
            <LegalDocumentTemplate config={cookiePolicyConfig} />
    </div>
  );
}

export default CookiePolicy;