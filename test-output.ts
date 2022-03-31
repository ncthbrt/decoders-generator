import * as decoders from "decoders";

const flavoringDecoder = decoders.object({
});

const flavorDecoder;

const operationsApiTokenDecoder;

const accessTokenDecoder;

const puppetmasterTokenDecoder;

const userTokenDecoder;

const clientTokenDecoder;

const tenantUserTokenDecoder;

const tokenDecoder = decoders.either(userTokenDecoder, puppetmasterTokenDecoder, operationsApiTokenDecoder, clientTokenDecoder, tenantUserTokenDecoder, accessTokenDecoder);

const idDecoder = flavorDecoder;

const hTMLDecoder = flavorDecoder;

const bankMappingDecoder = decoders.object({
    name: decoders.string,
    country: bankCountryDecoder,
    supportedCurrencies: arrayDecoder
});

const bankCountryDecoder = decoders.object({
    name: decoders.string,
    code: countryCodeDecoder
});

const branchCodeDecoder = flavorDecoder;

const accountNumberDecoder = flavorDecoder;

const shortHashDecoder;

const registrationNumberDecoder = flavorDecoder;

const hostnameDecoder = flavorDecoder;

const categorySetDecoder = decoders.constant("consumer");

const scopeDecoder = decoders.either(decoders.constant("openid"), decoders.constant("accounts"), decoders.constant("transactions"), decoders.constant("balances"), decoders.constant("bankstatements"), decoders.constant("pci_unsafe"), decoders.constant("client_imageupload"), decoders.constant("accountholders"), decoders.constant("paymentinitiationrequest"), decoders.constant("client_paymentrequest"), decoders.constant("client_paymentauthorizationrequest"), decoders.constant("client_bankaccountverification"), decoders.constant("client_businesslookup"), decoders.constant("IdentityServerApi"), decoders.constant("tenant_clientcreate"), decoders.constant("client_refund"));

const clientIdDecoder = idDecoder;

const tenantIdDecoder = idDecoder;

const subscriptionIdDecoder = idDecoder;

const userIdDecoder = flavorDecoder;

const paymentRequestIdDecoder = idDecoder;

const transactionIdDecoder = decoders.tuple(decoders.constant("txn"), accountNumberDecoder, dateDecoder, shortHashDecoder);

const transactionCategoryIdDecoder = decoders.tuple(decoders.constant("txncategory"), categorySetDecoder, decoders.string);

const transactionCursorDecoder = decoders.tuple(dateDecoder, shortHashDecoder);

const debitOrderPaymentIdDecoder = decoders.tuple(decoders.constant("dop"), accountNumberDecoder, dateDecoder, shortHashDecoder);

const debitOrderPaymentCursorDecoder = decoders.tuple(dateDecoder, shortHashDecoder);

const debiCheckMandateIdDecoder = decoders.tuple(decoders.constant("debi"), accountNumberDecoder, decoders.string, shortHashDecoder);

const debiCheckStatusDecoder = decoders.constant("active");

const debiCheckMandateCursorDecoder = decoders.tuple(decoders.string, shortHashDecoder);

const countryCodeDecoder;

const currencyCodeDecoder;

const moneyDecoder = decoders.object({
    currency: currencyCodeDecoder
});

const identityDocumentDecoder = decoders.object({
    country: decoders.string,
    number: decoders.string
});

const queryIdDecoder = idDecoder;

const beneficiaryDetailsDecoder = decoders.object({
    beneficiaryReference: decoders.string,
    beneficiaryName: decoders.string,
    beneficiaryAccountNumber: accountNumberDecoder,
    beneficiaryBranchCode: decoders.either(branchCodeDecoder)
});

const businessTypeDecoder = decoders.either(decoders.constant("private_company"), decoders.constant("public_company"), decoders.constant("non_profit_company"), decoders.constant("limited"), decoders.constant("external_company"), decoders.constant("personal_liability_company"), decoders.constant("unlimited"), decoders.constant("primary_co-operative"), decoders.constant("secondary_co-operative"), decoders.constant("tertiary_co-operative"), decoders.constant("state_owned_company"), decoders.constant("statutory_body"), decoders.constant("close_corporation"));

const clientInfoDecoder = decoders.object({
    clientId: decoders.string,
    clientName: decoders.string,
    payInAccounts: decoders.array(intermediaryAccountDecoder),
    payOutAccounts: decoders.array(intermediaryAccountDecoder)
});

const intermediaryAccountDecoder = decoders.object({
    accountNumber: decoders.string,
    bankId: decoders.string
});

const apiQueryContextDecoder = decoders.object({
    user: decoders.either(decoders.object({})),
    userCreatedAt: decoders.either(decoders.number),
    sub: decoders.either(userIdDecoder),
    globalAlpha: decoders.boolean,
    clientId: decoders.either(clientIdDecoder),
    tenantId: decoders.either(tenantIdDecoder),
    isTestClient: decoders.optional(decoders.boolean),
    alphaFlags: decoders.array(decoders.string),
    featureFlags: decoders.array(decoders.string),
    token: decoders.either(tokenDecoder),
    usagePerField: decoders.object({})
});

const apolloServerContextDecoder = decoders.object({
    bearerToken: decoders.string,
    user: decoders.optional(decoders.object({
        scope: decoders.optional(decoders.either(decoders.array(decoders.string), decoders.string)),
        userCreatedAt: decoders.optional(decoders.number),
        accounts: decoders.optional(decoders.either(decoders.string, decoders.array(decoders.string))),
        sub: decoders.optional(decoders.string),
        client_id: decoders.optional(decoders.string),
        tenant_id: decoders.optional(decoders.string)
    }))
});

const authorizationPolicyEvaluatorDecoder;

const logLevelTypeDecoder = decoders.either(decoders.constant("TRACE"), decoders.constant("DEBUG"), decoders.constant("INFO"), decoders.constant("WARN"), decoders.constant("ERROR"));

const appInsightsEventTypeDecoder = decoders.either(decoders.constant("BAVS"), decoders.constant("LOOKUP_BUSINESS_BY_NAME"), decoders.constant("LOOKUP_BUSINESS_BY_DIRECTOR"), decoders.constant("LOOKUP_BUSINESS_BY_REGISTRATION_NUMBER"), decoders.constant("RETRIEVE_BANK_ACCOUNTS"));

const tenantClientCertificateDecoder = decoders.object({
    id: decoders.string,
    expiry: dateDecoder,
    value: decoders.string
});

const tenantClientSecretDecoder = decoders.object({
    description: decoders.string,
    expiration: dateDecoder
});

const tenantClientDecoder = decoders.object({
    enabled: decoders.boolean,
    clientId: decoders.string,
    clientSecrets: decoders.array(tenantClientSecretDecoder),
    clientName: decoders.string,
    description: decoders.either(decoders.string),
    clientUri: decoders.string,
    allowedGrantTypes: decoders.array(decoders.string),
    redirectUris: decoders.array(decoders.string),
    identityTokenLifetime: decoders.number,
    accessTokenLifetime: decoders.number,
    authorizationCodeLifetime: decoders.number,
    absoluteRefreshTokenLifetime: decoders.number,
    slidingRefreshTokenLifetime: decoders.number,
    refreshTokenUsage: decoders.number,
    refreshTokenExpiration: decoders.number,
    accessTokenType: decoders.number,
    properties: decoders.object({
        countryCodes: decoders.array(countryCodeDecoder),
        userInteractionRedirectUrls: decoders.string
    })
});

const authorizationRequestResponseDecoder = decoders.object({
    requestId: decoders.string,
    userInteractionUrl: decoders.string
});

const authorizationRequestDecoder;

const operationsPaymentAuthorizationRequestDecoder = decoders.object({
    id: decoders.string,
    beneficiary: bankBeneficiaryDecoder,
    payerReference: decoders.string,
    initialPayment: decoders.optional(decoders.either(initialPaymentDecoder))
});

const paymentAuthorizationRequestDecoder;

const bankBeneficiaryDecoder = decoders.object({
    bankAccount: decoders.object({
        name: decoders.string,
        accountNumber: decoders.string,
        reference: decoders.string,
        beneficiaryType: decoders.string
    })
});

const initialPaymentDecoder = decoders.object({
    amount: moneyDecoder,
    externalReference: decoders.optional(decoders.either(decoders.string))
});

const destinationAccountDetailsDecoder = decoders.object({
    destinationAccountNumber: decoders.string,
    destinationReference: decoders.string
});

const sourceAccountDetailsDecoder = decoders.object({
    sourceAccountNumber: decoders.string,
    sourceReference: decoders.string
});