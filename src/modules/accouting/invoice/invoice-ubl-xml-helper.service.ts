import { Injectable } from "@nestjs/common";
import { XMLParser } from "fast-xml-parser";
import { InvoiceType } from "./enums/InvoiceType";

@Injectable()
export class InvoiceUBLXMLHelperService {
  private parser: XMLParser;
  protected DOCUMENT_KEY = "Invoice";
  protected DOCUMENT_TYPE_CODE = "InvoiceTypeCode";
  protected DOCUMENT_LINE = "InvoiceLine";

  protected MAP_TYPE_CODE = {
    388: InvoiceType.TAX_INVOICE,
    280: InvoiceType.COMMERCIAL_INVOICE,
    381: "CREDIT_NOTE",
  };

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
    });
  }

  parseXML(xml: string): any {
    const jsonObj = this.parser.parse(xml);
    const invoice = jsonObj[this.DOCUMENT_KEY];

    const nsSafe = (path: any) => path || null;
    const getNumericValue = (value: any) => {
      if (!value) return 0;
      if (typeof value === 'object' && value['#text']) {
        return Number(value['#text']) || 0;
      }
      return Number(value) || 0;
    };

    const headerAllowance = invoice["cac:AllowanceCharge"] || {};
    const legalMonetaryTotal = invoice["cac:LegalMonetaryTotal"] || {};
    const taxExchangeRate = invoice["cac:TaxExchangeRate"] || {};
  
    const taxSubtotals = invoice["cac:TaxTotal"]?.["cac:TaxSubtotal"] || [];
    const taxSubtotalsArray = Array.isArray(taxSubtotals) ? taxSubtotals : [taxSubtotals];
    
    const result = {
      ubl_version: invoice["cbc:UBLVersionID"] || null,
      document_number: invoice["cbc:ID"] || null,
      document_type: "INVOICE",
      issue_date: invoice["cbc:IssueDate"] || null,
      due_date: invoice["cbc:DueDate"] || null,
      currency: invoice["cbc:DocumentCurrencyCode"] || null,
      exchange_rate: {
        source_currency: taxExchangeRate["cbc:SourceCurrencyCode"] || null,
        target_currency: taxExchangeRate["cbc:TargetCurrencyCode"] || null,
        rate: getNumericValue(taxExchangeRate["cbc:CalculationRate"]),
      },
      document_reference_id: nsSafe(
        invoice["cac:BillingReference"]?.["cac:InvoiceDocumentReference"]?.["cbc:UUID"]
      ),
      document_reference_number: nsSafe(
        invoice["cac:BillingReference"]?.["cac:InvoiceDocumentReference"]?.["cbc:ID"]
      ),
      invoice_type_code: invoice[`cbc:${this.DOCUMENT_TYPE_CODE}`] || null,
      invoice_type: this.MAP_TYPE_CODE[invoice[`cbc:${this.DOCUMENT_TYPE_CODE}`]],
      supplier: {
        endpoint_id: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cbc:EndpointID"]
        ),
        id: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PartyIdentification"]?.["cbc:ID"]
        ),
        entity_name_kh: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PartyName"]?.["cbc:Name"]
        ),
        address: [
          nsSafe(
            invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cbc:StreetName"]
          ),
          nsSafe(
            invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cbc:AdditionalStreetName"]
          ),
        ]
          .filter((item) => item)
          .join(","),
        phone_number: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:Contact"]?.["cbc:Telephone"]
        ),
        email: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:Contact"]?.["cbc:ElectronicMail"]
        ),
        city: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cbc:CityName"]
        ),
        country: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cac:Country"]?.["cbc:IdentificationCode"]
        ),
        tin: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PartyTaxScheme"]?.["cbc:CompanyID"]
        ),
        entity_name_en: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]?.["#text"] ||
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]
        ),
        entity_id: nsSafe(
          invoice["cac:AccountingSupplierParty"]?.["cac:Party"]?.["cac:PartyLegalEntity"]?.["cbc:CompanyID"]
        ),
      },
      customer: {
        endpoint_id: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cbc:EndpointID"]
        ),
        id: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PartyIdentification"]?.["cbc:ID"]
        ),
        entity_name_kh: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PartyName"]?.["cbc:Name"]
        ),
        address: [
          nsSafe(
            invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cbc:StreetName"]
          ),
          nsSafe(
            invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cbc:AdditionalStreetName"]
          ),
        ]
          .filter((item) => item)
          .join(","),
        phone_number: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:Contact"]?.["cbc:Telephone"]
        ),
        email: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:Contact"]?.["cbc:ElectronicMail"]
        ),
        city: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cbc:CityName"]
        ),
        country: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PostalAddress"]?.["cac:Country"]?.["cbc:IdentificationCode"]
        ),
        tin: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PartyTaxScheme"]?.["cbc:CompanyID"]
        ),
        entity_name_en: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]?.["#text"] ||
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]
        ),
        entity_id: nsSafe(
          invoice["cac:AccountingCustomerParty"]?.["cac:Party"]?.["cac:PartyLegalEntity"]?.["cbc:CompanyID"]
        ),
      },
      payment_term: nsSafe(invoice["cac:PaymentTerms"]?.["cbc:Note"]),
      prepaid_payment: {
        paid_amount: Number(invoice["cac:PrepaidPayment"]?.["cbc:PaidAmount"]?._text || 0),
      },
      allowance_charges: headerAllowance
        ? [
            {
              charge_indicator: headerAllowance["cbc:ChargeIndicator"] === "true",
              reason: headerAllowance["cbc:AllowanceChargeReason"] || null,
              amount: getNumericValue(headerAllowance["cbc:Amount"]),
              tax_categories: [
                {
                  id: headerAllowance["cac:TaxScheme"]?.["cbc:ID"] || null,
                  percent: 0,
                },
              ],
            },
          ]
        : [],
      tax_total: {
        tax_amount: Number(invoice["cac:TaxTotal"]?.["cbc:TaxAmount"]?._text || 0),
        tax_subtotals: taxSubtotalsArray.map((subtotal: any) => {
          return {
            taxable_amount: Number(subtotal["cbc:TaxableAmount"]?._text || 0),
            tax_amount: Number(subtotal["cbc:TaxAmount"]?._text || 0),
            tax_category: {
              id: subtotal["cac:TaxCategory"]?.["cbc:ID"] || null,
              percent: Number(subtotal["cac:TaxCategory"]?.["cbc:Percent"] || 0),
              tax_scheme: subtotal["cac:TaxCategory"]?.["cac:TaxScheme"]?.["cbc:ID"] || null,
            },
          };
        }),
      },
      legal_monetary_total: {
        line_extension_amount: getNumericValue(legalMonetaryTotal["cbc:LineExtensionAmount"]),
        tax_exclusive_amount: getNumericValue(legalMonetaryTotal["cbc:TaxExclusiveAmount"]),
        tax_inclusive_amount: getNumericValue(legalMonetaryTotal["cbc:TaxInclusiveAmount"]),
        allowance_total_amount: getNumericValue(legalMonetaryTotal["cbc:AllowanceTotalAmount"]),
        prepaid_amount: getNumericValue(legalMonetaryTotal["cbc:PrepaidAmount"]),
        payable_amount: getNumericValue(legalMonetaryTotal["cbc:PayableAmount"]),
      },
      invoice_lines: (Array.isArray(invoice[`cac:${this.DOCUMENT_LINE}`])
        ? invoice["cac:InvoiceLine"]
        : [invoice[`cac:${this.DOCUMENT_LINE}`]]
      ).map((line: any) => {
        const lineAllowance = line["cac:AllowanceCharge"] || {};
        const lineTaxSubtotals = line["cac:TaxTotal"]?.["cac:TaxSubtotal"] || [];
        const lineTaxSubtotalsArray = Array.isArray(lineTaxSubtotals) ? lineTaxSubtotals : [lineTaxSubtotals];
        return {
          id: line["cbc:ID"] || null,
          quantity: getNumericValue(line["cbc:InvoicedQuantity"]),
          quantity_unit_code: line["cbc:InvoicedQuantity"]?.["@_unitCode"] || null,
          line_extension_amount: getNumericValue(line["cbc:LineExtensionAmount"]),
          price: getNumericValue(line["cac:Price"]?.["cbc:PriceAmount"]),
          item: {
            name: line["cac:Item"]?.["cbc:Name"] || null,
            description: line["cac:Item"]?.["cbc:Description"] || null,
          },
          allowance_charges: Array.isArray(lineAllowance) ? lineAllowance.map((allowance: any) => ({
            charge_indicator: allowance["cbc:ChargeIndicator"] === "true",
            reason: allowance["cbc:AllowanceChargeReason"] || null,
            amount: getNumericValue(allowance["cbc:Amount"]),
            tax_categories: [
              {
                id: allowance["cac:TaxScheme"]?.["cbc:ID"] || null,
                percent: 0,
              },
            ],
          })) : [],
          tax: {
            tax_amount: getNumericValue(line["cac:TaxTotal"]?.["cbc:TaxAmount"]),
            tax_subtotals: lineTaxSubtotalsArray.map((subtotal: any) => ({
              taxable_amount: getNumericValue(subtotal["cbc:TaxableAmount"]),
              tax_amount: getNumericValue(subtotal["cbc:TaxAmount"]),
              tax_category: {
                id: subtotal["cac:TaxCategory"]?.["cbc:ID"] || null,
                percent: getNumericValue(subtotal["cac:TaxCategory"]?.["cbc:Percent"]),
                tax_scheme: subtotal["cac:TaxCategory"]?.["cac:TaxScheme"]?.["cbc:ID"] || null,
              },
            })),
          },
        };
      }),
    };

    return result;
  }

  private getAmount(amount: any): number {
    if (!amount) return 0;
    return parseFloat(amount) || 0;
  }

  private getTaxSubtotals(invoice: any): any[] {
    const taxTotal = invoice["cac:TaxTotal"];
    if (!taxTotal) return [];

    // Handle both single and multiple tax subtotals
    const taxSubtotals = Array.isArray(taxTotal["cac:TaxSubtotal"]) 
      ? taxTotal["cac:TaxSubtotal"] 
      : [taxTotal["cac:TaxSubtotal"]].filter(Boolean);

    return taxSubtotals.map(subtotal => ({
      taxAmount: this.getAmount(subtotal["cbc:TaxAmount"]),
      taxCategory: {
        id: subtotal["cac:TaxCategory"]?.["cbc:ID"],
        percent: this.getAmount(subtotal["cac:TaxCategory"]?.["cbc:Percent"]),
        taxScheme: {
          id: subtotal["cac:TaxCategory"]?.["cac:TaxScheme"]?.["cbc:ID"]
        }
      }
    }));
  }
}
