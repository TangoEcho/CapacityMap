import { DecisionTree } from '../types';

export const SEED_DECISION_TREES: DecisionTree[] = [
  {
    id: 'dt-product-selector',
    title: 'Which TF Product Do I Need?',
    description: 'Answer a few questions to find the right trade finance product for your situation.',
    nodes: [
      {
        id: 'q1',
        question: 'What is your primary objective?',
        options: [
          { label: 'Secure payment for goods I am selling (export)', nextNodeId: 'q2-export' },
          { label: 'Facilitate a purchase from a supplier (import)', nextNodeId: 'q2-import' },
          { label: 'Provide a guarantee to a counterparty', nextNodeId: 'q2-guarantee' },
          { label: 'Improve working capital / cash flow', nextNodeId: 'q2-cashflow' },
        ],
      },
      // Export path
      {
        id: 'q2-export',
        question: 'Does the buyer\'s bank have an acceptable credit rating?',
        options: [
          { label: 'Yes, the buyer\'s bank is rated investment grade', nextNodeId: 'q3-export-good-bank' },
          { label: 'No, or I\'m unsure about the bank\'s creditworthiness', nextNodeId: 'q3-export-weak-bank' },
          { label: 'There is no LC involved — open account terms', nextNodeId: 'q3-export-open-account' },
        ],
      },
      {
        id: 'q3-export-good-bank',
        question: 'What payment terms are involved?',
        options: [
          { label: 'Payment at sight (immediately upon shipment)', nextNodeId: 'rec-sight-lc' },
          { label: 'Deferred payment (30-180 days)', nextNodeId: 'rec-usance-lc' },
          { label: 'Long-term (1+ years)', nextNodeId: 'rec-forfaiting' },
        ],
      },
      {
        id: 'q3-export-weak-bank',
        question: 'Are you willing to have the LC confirmed by a stronger bank?',
        options: [
          { label: 'Yes, I want a confirmed LC', nextNodeId: 'rec-confirmed-lc' },
          { label: 'I\'d prefer to sell the receivable without recourse', nextNodeId: 'rec-forfaiting' },
        ],
      },
      {
        id: 'q3-export-open-account',
        question: 'Do you want to receive early payment for your invoices?',
        options: [
          { label: 'Yes, I want early payment', nextNodeId: 'rec-receivables-finance' },
          { label: 'No, I just need a simple payment mechanism', nextNodeId: 'rec-doc-collection' },
        ],
      },
      // Import path
      {
        id: 'q2-import',
        question: 'Does your supplier require a bank payment guarantee?',
        options: [
          { label: 'Yes, the supplier requires an LC', nextNodeId: 'rec-import-lc' },
          { label: 'No, but I need financing to pay the supplier', nextNodeId: 'q3-import-finance' },
          { label: 'I want to extend payment terms to my suppliers', nextNodeId: 'rec-scf' },
        ],
      },
      {
        id: 'q3-import-finance',
        question: 'When do you need the financing?',
        options: [
          { label: 'Before the goods arrive (pre-import)', nextNodeId: 'rec-trade-loan' },
          { label: 'After receiving the goods (post-import)', nextNodeId: 'rec-trade-loan' },
        ],
      },
      // Guarantee path
      {
        id: 'q2-guarantee',
        question: 'What type of obligation do you need to guarantee?',
        options: [
          { label: 'Performance of a contract', nextNodeId: 'rec-performance-guarantee' },
          { label: 'Seriousness of a bid/tender', nextNodeId: 'rec-bid-bond' },
          { label: 'Return of an advance payment received', nextNodeId: 'rec-apg' },
          { label: 'Payment obligation', nextNodeId: 'rec-sblc' },
        ],
      },
      // Cash flow path
      {
        id: 'q2-cashflow',
        question: 'Are you a buyer or a seller?',
        options: [
          { label: 'I am a buyer and want to extend payment terms', nextNodeId: 'rec-scf' },
          { label: 'I am a seller and want early payment', nextNodeId: 'q3-seller-early' },
          { label: 'I need pre-shipment funding to fulfil orders', nextNodeId: 'rec-pre-shipment' },
        ],
      },
      {
        id: 'q3-seller-early',
        question: 'Do you have a large anchor buyer who could support an SCF program?',
        options: [
          { label: 'Yes, my buyer is a large creditworthy company', nextNodeId: 'rec-scf-supplier' },
          { label: 'No, I want to finance individual invoices', nextNodeId: 'rec-receivables-finance' },
        ],
      },
      // Recommendations
      {
        id: 'rec-sight-lc',
        recommendation: 'Sight Letter of Credit — You will receive payment immediately upon presenting compliant documents. This is the safest and fastest way to get paid in international trade.',
        articleId: 'letters-of-credit/overview',
      },
      {
        id: 'rec-usance-lc',
        recommendation: 'Usance (Deferred Payment) Letter of Credit — The issuing bank will accept your documents and pay at maturity. You can discount the accepted draft for early payment.',
        articleId: 'letters-of-credit/overview',
      },
      {
        id: 'rec-confirmed-lc',
        recommendation: 'Confirmed Letter of Credit — A strong international bank adds its guarantee to the LC, eliminating issuing bank and country risk. Recommended for high-risk countries.',
        articleId: 'letters-of-credit/overview',
      },
      {
        id: 'rec-forfaiting',
        recommendation: 'Forfaiting — Sell your trade receivable (LC, accepted draft, or promissory note) to a forfaiter without recourse. Ideal for medium/long-term receivables.',
        articleId: 'letters-of-credit/overview',
      },
      {
        id: 'rec-receivables-finance',
        recommendation: 'Receivables Finance — Sell or pledge your invoices to a bank or factor for early payment. Can be with or without recourse.',
        articleId: 'supply-chain-finance/overview',
      },
      {
        id: 'rec-doc-collection',
        recommendation: 'Documentary Collection (D/P or D/A) — A simple, low-cost mechanism where your bank sends documents to the buyer\'s bank for payment or acceptance. No bank payment guarantee.',
        articleId: 'letters-of-credit/overview',
      },
      {
        id: 'rec-import-lc',
        recommendation: 'Import Letter of Credit — Your bank issues an LC to guarantee payment to your supplier. Consumes credit capacity and provides the supplier with payment security.',
        articleId: 'letters-of-credit/import-lcs',
      },
      {
        id: 'rec-scf',
        recommendation: 'Supply Chain Finance (Reverse Factoring) — Set up an SCF program where your bank pays your suppliers early at a discount based on your credit rating, while you pay the bank at extended terms.',
        articleId: 'supply-chain-finance/overview',
      },
      {
        id: 'rec-trade-loan',
        recommendation: 'Trade Loan — Short-term financing to fund your import purchases. Can be structured as pre-import or post-import financing.',
        articleId: 'letters-of-credit/overview',
      },
      {
        id: 'rec-performance-guarantee',
        recommendation: 'Performance Guarantee — Your bank guarantees to the beneficiary that you will perform your contractual obligations. Typically 5-15% of contract value.',
        articleId: 'bank-guarantees/overview',
      },
      {
        id: 'rec-bid-bond',
        recommendation: 'Bid/Tender Bond — Your bank guarantees you will honor your bid if awarded. Typically 1-5% of bid value. Released after contract signing.',
        articleId: 'bank-guarantees/overview',
      },
      {
        id: 'rec-apg',
        recommendation: 'Advance Payment Guarantee — Guarantees repayment of the advance if you fail to deliver. Required when receiving upfront payments from buyers.',
        articleId: 'bank-guarantees/overview',
      },
      {
        id: 'rec-sblc',
        recommendation: 'Standby Letter of Credit (SBLC) — Functions as a payment guarantee. Common in US markets. Drawn only if you fail to pay under the underlying contract.',
        articleId: 'bank-guarantees/overview',
      },
      {
        id: 'rec-pre-shipment',
        recommendation: 'Pre-Shipment Finance — Bank financing to fund production costs before shipment, secured by a confirmed order or LC. Repaid from export proceeds.',
        articleId: 'supply-chain-finance/overview',
      },
      {
        id: 'rec-scf-supplier',
        recommendation: 'SCF Program (as Supplier) — Join your buyer\'s SCF program to receive early payment at attractive rates based on your buyer\'s credit quality.',
        articleId: 'supply-chain-finance/overview',
      },
    ],
  },
];
