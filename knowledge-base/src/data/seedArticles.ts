import { Article } from '../types';

export const SEED_ARTICLES: Article[] = [
  {
    id: 'art-lc-overview',
    slug: 'letters-of-credit/overview',
    title: 'Letters of Credit: Overview & Basics',
    category: 'Trade Finance Products',
    subcategory: 'Letters of Credit',
    summary: 'A comprehensive introduction to letters of credit — the cornerstone of international trade finance. Learn how LCs work, why they exist, and when to use them.',
    tags: ['LC', 'letters of credit', 'documentary credit', 'UCP 600', 'trade finance basics'],
    relatedArticles: ['art-lc-import', 'art-lc-lifecycle', 'art-bg-overview'],
    order: 1,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## What is a Letter of Credit?

A **Letter of Credit (LC)** is a written undertaking by a bank (the issuing bank), given to the seller (beneficiary) at the request of the buyer (applicant), to make payment up to a stated amount, within a prescribed time limit, against stipulated documents.

LCs are governed by the **Uniform Customs and Practice for Documentary Credits (UCP 600)**, published by the International Chamber of Commerce (ICC).

## Why Use Letters of Credit?

In international trade, the buyer and seller often don't know each other and operate in different legal jurisdictions. An LC bridges this trust gap:

| Party | Without LC | With LC |
|-------|-----------|---------|
| **Seller** | Risk of non-payment | Bank guarantee of payment |
| **Buyer** | Risk of non-delivery | Payment only against conforming documents |
| **Banks** | No involvement | Fee income, trade facilitation |

## Types of Letters of Credit

### By Function
- **Commercial (Documentary) LC** — Used for trade in goods/services
- **Standby LC (SBLC)** — Functions as a guarantee; payment only if the applicant defaults

### By Payment Terms
- **Sight LC** — Payment upon presentation of conforming documents
- **Usance (Deferred Payment) LC** — Payment at a future date (e.g., 90 days after sight)
- **Acceptance LC** — Bank accepts a time draft drawn by the beneficiary

### By Revocability
- **Irrevocable** — Cannot be amended/cancelled without consent of all parties (standard under UCP 600)
- **Revocable** — Can be modified by the issuing bank (rarely used today)

### By Confirmation
- **Confirmed LC** — A second bank (confirming bank) adds its undertaking
- **Unconfirmed LC** — Only the issuing bank's undertaking

## Key Parties in an LC Transaction

1. **Applicant** (Buyer/Importer) — Requests the LC from the issuing bank
2. **Issuing Bank** — Issues the LC; bears primary payment obligation
3. **Beneficiary** (Seller/Exporter) — Receives the LC; ships goods and presents documents
4. **Advising Bank** — Advises (notifies) the LC to the beneficiary; verifies authenticity
5. **Confirming Bank** — Adds its own payment undertaking (if confirmed)
6. **Nominated Bank** — Authorized to pay, accept, or negotiate

## Basic LC Flow

\`\`\`mermaid
sequenceDiagram
    participant Buyer as Applicant (Buyer)
    participant IB as Issuing Bank
    participant AB as Advising Bank
    participant Seller as Beneficiary (Seller)

    Buyer->>IB: 1. Apply for LC
    IB->>AB: 2. Issue LC
    AB->>Seller: 3. Advise LC
    Seller->>Seller: 4. Ship goods
    Seller->>AB: 5. Present documents
    AB->>IB: 6. Forward documents
    IB->>IB: 7. Examine documents
    IB->>Buyer: 8. Release documents (on payment/acceptance)
    IB->>AB: 9. Pay/Accept
    AB->>Seller: 10. Pay beneficiary
\`\`\`

## When to Use an LC

- First-time trade relationships with unknown counterparties
- High-value transactions where non-payment risk is significant
- Trades involving countries with political or economic instability
- When the seller requires a bank's payment undertaking before shipping
- Regulatory requirements in certain countries mandate LC usage

## Cost Considerations

LC costs typically include:
- **Issuance fee**: 0.1% – 2% of LC value (depends on bank, tenor, country risk)
- **Advising fee**: Flat fee or small percentage
- **Confirmation fee**: 0.1% – 3% (depends on issuing bank risk and country)
- **Amendment fees**: Per amendment
- **Discrepancy fees**: If documents don't comply

> **Tip:** LCs are more expensive than open account terms but significantly reduce risk. The cost should be weighed against the risk of non-payment.
`,
  },
  {
    id: 'art-lc-import',
    slug: 'letters-of-credit/import-lcs',
    title: 'Import (Documentary) Letters of Credit',
    category: 'Trade Finance Products',
    subcategory: 'Letters of Credit',
    summary: 'How import LCs work from the buyer\'s perspective — application process, document requirements, and best practices for managing import LC transactions.',
    tags: ['import LC', 'documentary credit', 'buyer', 'applicant', 'trade finance'],
    relatedArticles: ['art-lc-overview', 'art-lc-lifecycle'],
    order: 2,
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## Import Letters of Credit

An **Import LC** is issued at the request of the importer (buyer/applicant) to guarantee payment to the overseas exporter (beneficiary) upon presentation of compliant shipping documents.

## Application Process

### Step 1: Agree Commercial Terms
Before applying for an LC, the buyer and seller should agree on:
- Goods description, quantity, and unit price
- Incoterms (e.g., FOB, CIF, DAP)
- Payment terms (sight or usance)
- Required documents
- Latest shipment date and LC expiry date

### Step 2: Submit LC Application
The buyer submits an LC application to their bank including:
- Full beneficiary details (name, address, bank)
- LC amount and currency
- Goods description (matching the commercial contract)
- Documents required
- Shipping terms and deadlines
- Special conditions

### Step 3: Bank Credit Assessment
The issuing bank assesses:
- Buyer's creditworthiness and LC facility limits
- Country risk of the beneficiary's country
- Transaction structure and documentation

### Step 4: LC Issuance
Upon approval, the issuing bank transmits the LC via SWIFT (MT700) to the advising bank in the seller's country.

## Key Documents in Import LCs

| Document | Purpose |
|----------|---------|
| Commercial Invoice | Describes goods, price, terms |
| Bill of Lading | Evidence of shipment / title document |
| Packing List | Details of packaging and contents |
| Certificate of Origin | Country where goods were manufactured |
| Insurance Certificate | Proof of cargo insurance |
| Inspection Certificate | Third-party quality verification |

## Best Practices for Importers

1. **Match LC terms precisely to the purchase contract** — Mismatches cause discrepancies
2. **Keep goods descriptions simple but accurate** — Overly detailed descriptions increase discrepancy risk
3. **Allow sufficient time** — Build in buffer between latest shipment date and LC expiry
4. **Review documents promptly** — Banks have 5 banking days to examine under UCP 600
5. **Manage your LC facility** — Monitor utilization against credit limits
6. **Consider usance terms** — Deferred payment LCs improve cash flow but may cost more

## Import LC Impact on Capacity

Import LCs consume the buyer's credit facility with the issuing bank. The full LC amount is typically allocated against the buyer's credit limit from issuance until payment. This is a key consideration for **capacity management**.

> **Important:** Even after goods arrive and are sold, the LC facility remains committed until all bank obligations are settled. Factor this into your capacity planning.
`,
  },
  {
    id: 'art-lc-lifecycle',
    slug: 'letters-of-credit/lifecycle',
    title: 'LC Lifecycle & Document Flow',
    category: 'Trade Finance Products',
    subcategory: 'Letters of Credit',
    summary: 'End-to-end walkthrough of the LC lifecycle from application to settlement, including document examination standards and common timelines.',
    tags: ['LC lifecycle', 'document flow', 'UCP 600', 'document examination', 'settlement'],
    relatedArticles: ['art-lc-overview', 'art-lc-import'],
    order: 3,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## The LC Lifecycle

The lifecycle of a letter of credit can be broken into distinct phases:

\`\`\`mermaid
graph LR
    A[Application] --> B[Issuance]
    B --> C[Advising]
    C --> D[Shipment]
    D --> E[Presentation]
    E --> F[Examination]
    F --> G{Compliant?}
    G -->|Yes| H[Payment/Acceptance]
    G -->|No| I[Discrepancy Handling]
    I --> J[Waiver/Rejection]
    J --> H
    H --> K[Settlement]
\`\`\`

## Phase 1: Application & Issuance (Days 1-3)

The buyer submits an LC application to the issuing bank. After credit approval, the bank issues the LC via SWIFT MT700 message. Key fields include:

- **Field 31D**: Date and place of expiry
- **Field 32B**: Currency and amount
- **Field 39A**: Percentage tolerance
- **Field 41A**: Available with/by (nominated bank)
- **Field 42C/42M**: Payment terms (sight/deferred)
- **Field 44E**: Port of loading
- **Field 44F**: Port of discharge
- **Field 45A**: Description of goods
- **Field 46A**: Documents required
- **Field 47A**: Additional conditions

## Phase 2: Advising (Days 2-5)

The advising bank in the beneficiary's country:
1. Verifies the LC's authenticity via SWIFT
2. Advises the LC to the beneficiary
3. Adds confirmation if requested and agreed

## Phase 3: Shipment (Days 5-30+)

The beneficiary ships the goods per LC terms and obtains the required documents from:
- Shipping company (Bill of Lading)
- Insurance company (Insurance Certificate)
- Chamber of Commerce (Certificate of Origin)
- Inspection company (if required)

## Phase 4: Document Presentation (Day 30+)

The beneficiary presents documents to the nominated/advising bank. Under UCP 600:
- Documents must be presented within **21 calendar days** after shipment (unless otherwise specified)
- Presentation must be within the LC's validity period

## Phase 5: Document Examination (5 Banking Days)

Banks examine documents under UCP 600 Article 14:
- Maximum **5 banking days** following the day of presentation
- Documents are examined on their face for compliance with LC terms
- Documents must be consistent with each other

### Common Examination Checks
- Does the invoice match the LC goods description?
- Is the bill of lading clean and on board?
- Are all required documents present?
- Do quantities and amounts match within tolerance?
- Are dates consistent (shipment before presentation before expiry)?

## Phase 6: Payment & Settlement

### If Documents Comply:
- **Sight LC**: Issuing bank pays immediately
- **Usance LC**: Issuing bank accepts the draft and pays at maturity
- **Deferred Payment LC**: Payment at the specified future date

### If Discrepancies Found:
The issuing bank sends a refusal notice listing all discrepancies. Options:
1. **Buyer waives discrepancies** — Bank proceeds to pay
2. **Documents returned** — No payment, goods in limbo
3. **Documents held pending** — Await buyer's instructions

## Timeline Summary

| Phase | Typical Duration |
|-------|-----------------|
| Application to issuance | 1-3 business days |
| Advising | 1-2 business days |
| Manufacturing & shipment | 2-8 weeks |
| Document preparation | 3-7 days after shipment |
| Document examination | Up to 5 banking days |
| Payment (sight) | Same day as acceptance |
| Payment (usance) | 30-180 days after acceptance |

> **Key Takeaway:** The entire LC lifecycle from issuance to final settlement can range from 30 days (sight, nearby trade) to 9+ months (long usance, distant trade). This duration directly impacts capacity utilization.
`,
  },
  {
    id: 'art-bg-overview',
    slug: 'bank-guarantees/overview',
    title: 'Bank Guarantees: Overview & Types',
    category: 'Trade Finance Products',
    subcategory: 'Bank Guarantees',
    summary: 'Introduction to bank guarantees — what they are, how they differ from LCs, the main types, and when to use them in trade and project contexts.',
    tags: ['bank guarantee', 'guarantee', 'URDG 758', 'performance guarantee', 'bid bond'],
    relatedArticles: ['art-lc-overview', 'art-bg-demand'],
    order: 1,
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## What is a Bank Guarantee?

A **Bank Guarantee (BG)** is a written undertaking by a bank (the guarantor) to pay a specified amount to the beneficiary if the applicant (principal) fails to fulfil a contractual obligation.

Unlike letters of credit (which facilitate payment for trade), guarantees protect against **non-performance** or **default**.

## Guarantees vs. Letters of Credit

| Aspect | Letter of Credit | Bank Guarantee |
|--------|-----------------|----------------|
| **Purpose** | Facilitate payment | Protect against default |
| **Primary expectation** | Will be drawn upon | Should NOT be drawn upon |
| **Payment trigger** | Presentation of documents | Claim of default/non-performance |
| **Governing rules** | UCP 600 | URDG 758 or local law |
| **Typical use** | Trade in goods | Construction, services, tenders |

## Types of Bank Guarantees

### 1. Performance Guarantee
Guarantees that the contractor/supplier will perform their obligations under the contract. Typically 5-15% of contract value.

**Example:** A construction company wins a project. The employer requires a performance guarantee ensuring the project will be completed per contract terms.

### 2. Bid/Tender Bond
Guarantees that the bidder will honor their bid if awarded the contract. Typically 1-5% of bid value.

**Example:** A company bidding on a government contract provides a bid bond. If they win and refuse to sign, the guarantee can be called.

### 3. Advance Payment Guarantee
Protects the buyer who makes an advance payment. If the seller fails to deliver, the buyer can claim back the advance.

**Example:** A buyer pays 30% upfront for custom equipment. The advance payment guarantee ensures recovery if the manufacturer fails to deliver.

### 4. Retention Money Guarantee
Replaces cash retention held by the employer. Allows the contractor to receive full payment while the employer retains protection during the defects liability period.

### 5. Payment Guarantee
Guarantees that the buyer will pay the seller. Functions similarly to a standby LC.

### 6. Customs/Tax Guarantee
Guarantees payment of customs duties, taxes, or excise obligations.

## Key Considerations

### Tenor and Expiry
- Guarantees can be **open-ended** (no expiry) or have a **fixed expiry date**
- Open-ended guarantees consume credit capacity indefinitely — avoid where possible
- Always include an expiry date and clear claim conditions

### Capacity Impact
Guarantees consume bank credit capacity from issuance until expiry (or release). Key factors:

- **Long-dated guarantees** (e.g., 3-year performance guarantee) tie up capacity for extended periods
- **Reducing balance guarantees** decrease as milestones are met
- **Counter-guarantees** may be needed when indirect guarantees are issued through local banks

### URDG 758
The **Uniform Rules for Demand Guarantees (URDG 758)**, published by the ICC, provide standardised rules. Key provisions:

- Guarantees are independent of the underlying contract
- Demand must be supported by a statement of default
- Guarantor has 5 business days to examine a demand
- Expiry is mandatory (unlike some older guarantee forms)

> **Best Practice:** Always issue guarantees subject to URDG 758 for consistency and predictability. Avoid local law-governed guarantees unless required by regulation.
`,
  },
  {
    id: 'art-bg-demand',
    slug: 'bank-guarantees/demand-vs-conditional',
    title: 'Demand vs Conditional Guarantees',
    category: 'Trade Finance Products',
    subcategory: 'Bank Guarantees',
    summary: 'Understanding the critical difference between demand (first-demand) guarantees and conditional (accessory) guarantees, with implications for risk and calling procedures.',
    tags: ['demand guarantee', 'conditional guarantee', 'surety', 'first demand', 'URDG 758'],
    relatedArticles: ['art-bg-overview'],
    order: 7,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## Demand vs Conditional Guarantees

The distinction between demand and conditional guarantees is one of the most important concepts in guarantee practice.

## Demand (First-Demand) Guarantees

A **demand guarantee** is payable upon the beneficiary's written demand, typically accompanied only by a statement that the principal is in breach. The guarantor bank:

- **Does not** investigate whether a breach actually occurred
- **Must pay** if the demand is compliant on its face
- Pays regardless of disputes between buyer and seller

This is the most common form in international trade and is governed by **URDG 758**.

### Advantages
- **Beneficiary**: Quick, reliable access to funds
- **Simplicity**: No need to prove breach to the bank

### Risks
- **Applicant**: Vulnerable to unfair or abusive calls
- The bank pays first; disputes are resolved later between the parties

## Conditional (Accessory) Guarantees

A **conditional guarantee** (also called a suretyship or accessory guarantee) is payable only when the beneficiary **proves** that the principal has actually breached the underlying contract. The guarantor can:

- Investigate the alleged breach
- Raise defenses available to the principal
- Refuse payment if the breach is not established

### Advantages
- **Applicant**: Better protected against unfair calls
- **Guarantor**: Lower risk of wrongful payment

### Disadvantages
- **Beneficiary**: Slower, more uncertain recovery
- May need to go through arbitration or litigation to prove breach

## Comparison

| Feature | Demand Guarantee | Conditional Guarantee |
|---------|-----------------|----------------------|
| Payment trigger | Written demand + default statement | Proof of actual breach |
| Bank's role | Pays on compliant demand | Investigates breach |
| Speed of payment | Fast (5 business days) | Slow (may take months) |
| Governing rules | URDG 758 | Local law, contract terms |
| Common in | International trade | Domestic markets, some EU countries |
| Applicant protection | Low (pay first, argue later) | High |
| Beneficiary preference | Strongly preferred | Less preferred |

## Practical Implications

### For Capacity Management
Both types consume credit capacity equally. However:
- Demand guarantees carry higher **risk weighting** because the probability of call is higher
- Some banks may require higher margins or collateral for demand guarantees

### Preventing Unfair Calls
To mitigate the risk of unfair calls on demand guarantees:
1. **Include an ICC dispute resolution clause**
2. **Require supporting documents** in the guarantee text (e.g., an engineer's certificate)
3. **Negotiate reducing balance mechanisms** linked to project milestones
4. **Court injunctions** — In extreme cases, courts may restrain fraudulent calls

> **Key Takeaway:** In international practice, demand guarantees are the standard. Conditional guarantees are more common in domestic European markets. Always clarify which type is required before issuance.
`,
  },
  {
    id: 'art-scf-overview',
    slug: 'supply-chain-finance/overview',
    title: 'Supply Chain Finance: Overview',
    category: 'Trade Finance Products',
    subcategory: 'Supply Chain Finance',
    summary: 'Introduction to supply chain finance (SCF) — what it is, how the main programs work, and the benefits for buyers, suppliers, and banks.',
    tags: ['SCF', 'supply chain finance', 'reverse factoring', 'payables finance', 'receivables finance'],
    relatedArticles: ['art-lc-overview'],
    order: 1,
    createdAt: '2025-03-15T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## What is Supply Chain Finance?

**Supply Chain Finance (SCF)** is a set of technology-based solutions that optimize cash flow by allowing businesses to extend payment terms to suppliers while providing suppliers with early payment.

The most common form is **Reverse Factoring** (also called Approved Payables Finance), where a buyer's bank offers early payment to the buyer's suppliers at a discount.

## How Reverse Factoring Works

\`\`\`mermaid
sequenceDiagram
    participant Supplier
    participant Buyer
    participant Bank as SCF Provider (Bank)

    Buyer->>Supplier: 1. Purchase goods/services
    Supplier->>Buyer: 2. Send invoice
    Buyer->>Bank: 3. Approve invoice for early payment
    Bank->>Supplier: 4. Pay supplier early (minus small discount)
    Buyer->>Bank: 5. Pay bank at extended maturity
\`\`\`

## Key SCF Products

### Reverse Factoring / Payables Finance
- Bank pays the supplier early based on the buyer's approved invoices
- Supplier gets paid in days instead of 60-120 days
- Buyer extends payment terms to the bank
- Pricing based on the **buyer's credit risk** (cheaper for the supplier)

### Receivables Finance
- Supplier sells its receivables (invoices) to a bank or factor
- Can be **with recourse** or **without recourse**
- Pricing based on the **debtor's (buyer's) credit risk**

### Distributor Finance
- Bank provides financing to a buyer's downstream distributors
- Enables distributors to pay the buyer promptly while receiving extended terms from the bank

### Pre-shipment Finance
- Financing provided to the supplier before shipment, secured by a confirmed purchase order or LC
- Helps suppliers fund production

## Benefits

| Stakeholder | Benefits |
|-------------|----------|
| **Buyer** | Extend payment terms, improve working capital, strengthen supply chain |
| **Supplier** | Faster payment, improved cash flow, lower financing cost (buyer's credit rate) |
| **Bank** | Fee income, deeper client relationships, low risk (buyer credit) |

## SCF vs. Traditional Trade Finance

| Feature | SCF | Traditional LC/Guarantee |
|---------|-----|-------------------------|
| Trigger | Approved invoice | Shipping documents |
| Automation | High (platform-based) | Lower (document-heavy) |
| Volume | Many small transactions | Fewer large transactions |
| Risk basis | Buyer's credit | Transaction/country risk |
| Capacity impact | Off-balance-sheet possible | On-balance-sheet |

## Setting Up an SCF Program

1. **Buyer assessment** — Bank evaluates buyer's creditworthiness
2. **Platform selection** — Choose SCF technology platform
3. **Supplier onboarding** — Invite suppliers to join the program
4. **Legal documentation** — Master agreements, assignment of receivables
5. **Go-live** — Begin approving invoices and processing payments

## Capacity Considerations

SCF programs may have **lower capacity impact** compared to LCs because:
- Exposure is based on approved invoices (actual trade)
- Tenors are typically short (30-90 days)
- Some structures achieve off-balance-sheet treatment

However, large SCF programs can still consume significant bank capacity and may require dedicated credit limits.

> **Tip:** SCF is ideal for companies with large supplier bases and strong credit ratings. The buyer's credit quality is the key driver of the program's economics.
`,
  },
  {
    id: 'art-how-to-request',
    slug: 'internal-processes/how-to-request-tf-support',
    title: 'How to Request Trade Finance Support',
    category: 'Internal Processes',
    subcategory: 'Internal Processes',
    summary: 'Step-by-step guide for business teams on how to request trade finance support, what information to provide, and expected timelines.',
    tags: ['internal process', 'TF request', 'workflow', 'approval', 'how-to'],
    relatedArticles: ['art-lc-overview', 'art-bg-overview'],
    order: 1,
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## How to Request Trade Finance Support

This guide explains how to request trade finance instruments (LCs, guarantees, SCF, etc.) from the TF team.

## Before You Start

Before submitting a request, gather the following information:

### For Letters of Credit
- [ ] Supplier/beneficiary name, address, and bank details
- [ ] Goods/services description and value
- [ ] Incoterms and payment terms
- [ ] Required documents list
- [ ] Desired shipment and expiry dates
- [ ] Copy of the purchase order or contract

### For Bank Guarantees
- [ ] Beneficiary name and address
- [ ] Guarantee type (performance, bid, advance payment, etc.)
- [ ] Guarantee amount and currency
- [ ] Tenor/expiry date
- [ ] Copy of the underlying contract
- [ ] Any specific wording requirements

### For Supply Chain Finance
- [ ] List of suppliers to be onboarded
- [ ] Typical invoice values and volumes
- [ ] Current payment terms and desired extended terms

## Submission Process

\`\`\`mermaid
graph TD
    A[Business need identified] --> B[Gather required information]
    B --> C[Submit TF request form]
    C --> D[TF team reviews request]
    D --> E{Capacity available?}
    E -->|Yes| F[Bank selection & pricing]
    E -->|No| G[Escalate / find alternatives]
    F --> H[Draft instrument]
    H --> I[Business review & approval]
    I --> J[Bank issuance]
    J --> K[Instrument issued]
\`\`\`

## Step 1: Submit the Request

Send your request to the Trade Finance team via:
- **Email**: tf-support@company.com
- **Service portal**: Internal TF Request Portal (link)
- **Direct contact**: Your designated TF relationship manager

Include all the information from the relevant checklist above.

## Step 2: TF Team Review

The TF team will:
1. Validate the request and commercial terms
2. Check bank capacity availability
3. Assess the optimal bank based on pricing, tenor, and country coverage
4. Confirm the estimated cost

**Typical turnaround:** 1-2 business days for standard requests.

## Step 3: Bank Selection

The TF team selects the optimal bank considering:
- Available capacity under existing credit facilities
- Bank's country coverage and local presence
- Pricing competitiveness
- Tenor capability
- Relationship considerations

## Step 4: Instrument Issuance

Once bank selection is confirmed and approvals obtained:
- The TF team instructs the bank to issue the instrument
- The bank issues the LC/guarantee (typically 1-3 business days)
- The TF team provides confirmation to the requestor

## Expected Timelines

| Request Type | Standard Processing | Urgent Processing |
|-------------|-------------------|-------------------|
| Letter of Credit | 3-5 business days | 1-2 business days |
| Bank Guarantee | 3-7 business days | 2-3 business days |
| SCF Onboarding | 2-4 weeks | 1-2 weeks |
| Amendment | 1-3 business days | Same day |

## Tips for Faster Processing

1. **Provide complete information upfront** — Incomplete requests cause delays
2. **Flag urgent requests** — Mention urgency in the subject line
3. **Align with your counterparty** — Ensure the beneficiary's details are accurate
4. **Plan ahead** — Submit requests well before the commercial deadline
5. **Use the TF request template** — Ensures all required fields are captured

## Escalation

If your request is taking longer than expected:
1. Contact your TF relationship manager directly
2. If unresolved, escalate to the Head of Trade Finance
3. For capacity-related delays, the TF team will propose alternatives

> **Remember:** Planning ahead is the single most effective way to ensure smooth TF support. Last-minute requests may face capacity constraints or higher costs.
`,
  },
  {
    id: 'art-credit-risk',
    slug: 'risk-compliance/credit-risk',
    title: 'Credit Risk in Trade Finance',
    category: 'Risk & Compliance',
    summary: 'Understanding credit risk in trade finance — bank risk, counterparty risk, country risk, and how these factors influence bank selection and pricing.',
    tags: ['credit risk', 'counterparty risk', 'country risk', 'risk assessment', 'trade finance risk'],
    relatedArticles: ['art-lc-overview', 'art-bg-overview'],
    order: 1,
    createdAt: '2025-04-15T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## Credit Risk in Trade Finance

Credit risk is the primary risk in trade finance — the risk that a counterparty (bank, buyer, or seller) fails to meet its financial obligations.

## Types of Credit Risk

### 1. Bank Risk (Issuing Bank Risk)
When an LC is issued by a bank, the confirming/advising bank takes on the risk that the **issuing bank** may fail to pay. Key factors:
- Issuing bank's credit rating
- Issuing bank's country of domicile
- Regulatory environment

### 2. Counterparty Risk
The risk that the buyer or seller fails to perform:
- **Buyer risk**: Won't pay or take delivery
- **Seller risk**: Won't ship goods or delivers substandard quality

### 3. Country Risk
The risk that political, economic, or regulatory events in a country affect the ability to complete a trade:
- Transfer risk (inability to convert/transfer currency)
- Expropriation risk
- Political violence
- Sanctions

### 4. Documentation Risk
The risk of non-compliant documents leading to payment delays or disputes.

## Risk Mitigation Tools

| Risk Type | Mitigation Tool |
|-----------|----------------|
| Bank risk | LC confirmation, credit insurance |
| Buyer risk | LC, advance payment, credit insurance |
| Seller risk | Performance guarantee, advance payment guarantee |
| Country risk | LC confirmation, ECA cover, political risk insurance |
| Documentation risk | Document checking services, UCP 600 compliance |

## Credit Risk Assessment Framework

When evaluating a trade finance transaction, consider:

1. **Who is the obligor?** — Identify the party whose credit risk you are taking
2. **What is their credit quality?** — Rating, financial strength, payment history
3. **Where are they?** — Country risk assessment
4. **What is the tenor?** — Longer tenor = higher risk
5. **What security exists?** — Collateral, guarantees, insurance
6. **What is the structure?** — Self-liquidating trade (lower risk) vs. open exposure

## Credit Ratings in Trade Finance

Credit ratings (from S&P, Moody's, Fitch) are widely used:

| Rating | Risk Level | Typical LC Pricing |
|--------|-----------|-------------------|
| AAA/AA | Very low | 0.10 - 0.30% p.a. |
| A | Low | 0.20 - 0.50% p.a. |
| BBB | Moderate | 0.40 - 1.00% p.a. |
| BB | Elevated | 0.80 - 2.00% p.a. |
| B | High | 1.50 - 4.00% p.a. |
| CCC and below | Very high | Case by case |

> **Note:** These are indicative ranges. Actual pricing depends on bank relationship, tenor, country, and market conditions.

## Impact on Capacity Management

Credit risk directly affects capacity:
- Higher-risk transactions consume more risk-weighted capacity
- Banks may impose concentration limits by country, sector, or counterparty
- Diversification across banks reduces concentration risk

Understanding credit risk is essential for effective capacity management and bank relationship optimization.
`,
  },
  {
    id: 'art-bank-capacity',
    slug: 'bank-relationships/capacity-management',
    title: 'Bank Capacity Management',
    category: 'Bank Relationships & Capacity',
    summary: 'How to manage trade finance capacity across banking relationships — understanding credit limits, utilization, and optimization strategies.',
    tags: ['capacity management', 'credit limits', 'bank relationships', 'utilization', 'optimization'],
    relatedArticles: ['art-credit-risk', 'art-lc-overview'],
    order: 1,
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    author: 'TF Knowledge Team',
    content: `## What is Bank Capacity Management?

**Bank Capacity Management** is the process of monitoring, allocating, and optimizing the credit facilities (capacity) that banks make available for trade finance instruments.

Every LC, guarantee, or other trade finance instrument consumes a portion of the available credit limit with the issuing bank. Managing this capacity effectively ensures you can support all business needs.

## Key Concepts

### Credit Facility / Limit
A bank grants a total credit facility for trade finance. This limit caps the total outstanding exposure at any time.

### Utilization
The amount of the facility currently in use. For example:
- Total facility: $100M
- Outstanding LCs: $60M
- Outstanding guarantees: $25M
- **Utilization: $85M (85%)**
- **Available capacity: $15M**

### Tenor Impact
Longer-tenor instruments block capacity for longer. A 3-year guarantee ties up capacity much longer than a 90-day LC.

## Capacity Optimization Strategies

### 1. Multi-Bank Strategy
Spread exposure across multiple banks to:
- Avoid single-bank concentration
- Access competitive pricing
- Ensure capacity availability

### 2. Tenor Management
- Reduce guarantee tenors where contractually possible
- Use reducing-balance guarantees for construction projects
- Set clear expiry dates — avoid open-ended guarantees

### 3. Facility Monitoring
- Track utilization weekly/monthly
- Forecast upcoming requirements
- Identify facilities approaching limits early

### 4. Instrument Cancellation
- Proactively cancel instruments when underlying obligations are fulfilled
- Don't let expired-but-uncancelled guarantees consume phantom capacity

### 5. Risk Participation
For large transactions, banks can share capacity through:
- **Syndication**: Multiple banks share one instrument
- **Risk participation**: One bank issues, others take risk participation

## Capacity Planning Framework

\`\`\`mermaid
graph TD
    A[Review current utilization] --> B[Forecast pipeline requirements]
    B --> C[Identify capacity gaps]
    C --> D{Gap exists?}
    D -->|Yes| E[Options analysis]
    D -->|No| F[Monitor and maintain]
    E --> G[Request facility increase]
    E --> H[Redistribute across banks]
    E --> I[Explore alternative structures]
    G --> F
    H --> F
    I --> F
\`\`\`

## Reporting & Metrics

Key metrics to track:
- **Utilization rate** by bank (%  of facility used)
- **Available capacity** by bank and product type
- **Pipeline** of upcoming TF requirements
- **Tenor profile** of outstanding instruments
- **Cost of capacity** (pricing per bank)

## Common Challenges

| Challenge | Solution |
|-----------|----------|
| Capacity exhausted at primary bank | Redirect to secondary banks or request limit increase |
| Long-dated guarantees blocking capacity | Negotiate reducing balance or earlier expiry |
| Fragmented tracking | Centralize capacity data in single system |
| Last-minute requests | Implement forward planning process |
| Rising costs | Benchmark pricing and maintain competitive tension |

> **Best Practice:** Treat bank capacity as a strategic resource. Regular reviews, proactive planning, and diversification are the keys to ensuring your business always has access to the trade finance support it needs.
`,
  },
];
