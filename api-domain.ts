
type Flavoring<FlavorT> = {
    _type?: FlavorT;
};
export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type OperationsApiToken = string & { __operationstoken__: void };
export type AccessToken = string & { __acccesstoken__: void };
export type PuppetmasterToken = string & { __puppetmastertoken__: void };
export type UserToken = string & { __usertoken__: void };
export type ClientToken = string & { __clientToken__: void };
export type TenantUserToken = string & { __tenantusertoken__: void };
export type Token = UserToken | PuppetmasterToken | OperationsApiToken | ClientToken | TenantUserToken | AccessToken;

export type Id<Key extends string, IdValue extends string = string> = Flavor<[Key, IdValue], Key>;

export type HTML = Flavor<string, 'HTML'>;

export const bankIds = {
    absa: 'absa',
    african_bank: 'african_bank',
    capitec: 'capitec',
    discovery_bank: 'discovery_bank',
    fnb: 'fnb',
    grindrod_bank: 'grindrod_bank',
    investec: 'investec',
    nedbank: 'nedbank',
    sasfin_bank: 'sasfin_bank',
    standard_bank: 'standard_bank',
    tymebank: 'tymebank',
    za_access_bank: 'za_access_bank',

    access_bank: 'access_bank',
    first_bank_of_nigeria: 'first_bank_of_nigeria',
    gtbank: 'gtbank',
    providus_bank: 'providus_bank',
    sterling_bank: 'sterling_bank',
    united_bank_for_africa: 'united_bank_for_africa',
    vfd_microfinance_bank: 'vfd_microfinance_bank',
    wema_bank: 'wema_bank',
    zenith_bank: 'zenith_bank'
};

export type BankMapping = {
    name: string;
    country: BankCountry;
    supportedCurrencies: Array<CurrencyCode>;
};

export type BankCountry = {
    name: string,
    code: CountryCode
};

export type BranchCode = Flavor<string, 'BranchCode'>;
export type AccountNumber = Flavor<string, 'AccountNumber'>;
export type ShortHash = string & { __shortHash__: void };
export type RegistrationNumber = Flavor<string, 'RegistrationNumber'>;

export type Hostname = Flavor<string, 'Hostname'>;
export type CategorySet = 'consumer';
export const CategorySets: { [K in CategorySet]: CategorySet } = {
    consumer: 'consumer'
};


export type Scope =
    | 'openid'
    | 'accounts'
    | 'transactions'
    | 'balances'
    | 'bankstatements'
    | 'pci_unsafe'
    | 'client_imageupload'
    | 'accountholders'
    | 'paymentinitiationrequest'
    | 'client_paymentrequest'
    | 'client_paymentauthorizationrequest'
    | 'client_bankaccountverification'
    | 'client_businesslookup'
    | 'IdentityServerApi'
    | 'tenant_clientcreate'
    | 'client_refund'
    ;

export type ClientId = Id<'client'>;
export type TenantId = Id<'tenant'>;
export type SubscriptionId = Id<'subscription'>;


export type UserId = Flavor<string, 'UserId'>;
export type PaymentRequestId = Id<'PaymentRequest'>;
export type TransactionId = ['txn', AccountNumber, Date, ShortHash];

export type TransactionCategoryId = ['txncategory', CategorySet, string];

export type TransactionCursor = [Date, ShortHash];

export type DebitOrderPaymentId = ['dop', AccountNumber, Date, ShortHash];

export type DebitOrderPaymentCursor = [Date, ShortHash];

export type DebiCheckMandateId = ['debi', AccountNumber, string, ShortHash];

export type DebiCheckStatus = 'active';

export const debiCheckStatuses: { [K in DebiCheckStatus]: K } = {
    active: 'active'
};

export type DebiCheckMandateCursor = [string, ShortHash];

export type CountryCode = string & { __countryCode__: void };
export type CurrencyCode = string & { __currencyCode__: void };
export type Money = { currency: CurrencyCode };
export type IdentityDocument = { country: string, number: string };

export const scopes: { [S in Scope]: S } = {
    openid: 'openid',
    accounts: 'accounts',
    transactions: 'transactions',
    balances: 'balances',
    accountholders: 'accountholders',
    bankstatements: 'bankstatements',
    paymentinitiationrequest: 'paymentinitiationrequest',
    pci_unsafe: 'pci_unsafe',
    client_paymentrequest: 'client_paymentrequest',
    client_paymentauthorizationrequest: 'client_paymentauthorizationrequest',
    client_bankaccountverification: 'client_bankaccountverification',
    client_imageupload: 'client_imageupload',
    client_businesslookup: 'client_businesslookup',
    IdentityServerApi: 'IdentityServerApi',
    tenant_clientcreate: 'tenant_clientcreate',
    client_refund: 'client_refund'
};

export type QueryId = Id<'query'>;

export type BeneficiaryDetails = {
    beneficiaryReference: string,
    beneficiaryName: string,
    beneficiaryAccountNumber: AccountNumber

    beneficiaryBranchCode: BranchCode | null
};

export type BusinessType
    = 'private_company'
    | 'public_company'
    | 'non_profit_company'
    | 'limited'
    | 'external_company'
    | 'personal_liability_company'
    | 'unlimited'
    | 'primary_co-operative'
    | 'secondary_co-operative'
    | 'tertiary_co-operative'
    | 'state_owned_company'
    | 'statutory_body'
    | 'close_corporation';

// * key may be incorrect. Haven't seen in the wild yet:
export const businessTypeCodes: { [K in BusinessType]: string } = {
    public_company: '06',
    private_company: '07',
    non_profit_company: '08',
    limited: '09', // *
    external_company: '10',
    personal_liability_company: '21',
    unlimited: '22', // *
    close_corporation: '23',
    'primary_co-operative': '24',
    'secondary_co-operative': '25', // *
    'tertiary_co-operative': '26', // *
    state_owned_company: '30',
    statutory_body: '31' // *
};

export type ClientInfo = {
    clientId: string,
    clientName: string,
    payInAccounts: IntermediaryAccount[],
    payOutAccounts: IntermediaryAccount[]
};

export type IntermediaryAccount = { accountNumber: string, bankId: string };

export type ApiQueryContext = {
    user: { [key: string]: unknown } | null,
    userCreatedAt: number | null,
    sub: UserId | null,
    globalAlpha: boolean,
    scopes: { [K in Scope]: boolean },
    clientId: ClientId | null,
    tenantId: TenantId | null,
    isTestClient?: boolean,
    alphaFlags: string[],
    featureFlags: string[],
    token: Token | null,
    usagePerField: {
        [key: string]: {
            fieldName: string
        }
    }
};

export type ApolloServerContext = {
    bearerToken: string,
    user?: {
        scope?: string[] | string,
        userCreatedAt?: number,
        accounts?: string | string[],
        sub?: string,
        client_id?: string,
        tenant_id?: string
    }
};

export type AuthorizationPolicyEvaluator<TParent, TArgs> = (ctx: ApiQueryContext, parent: TParent, args: TArgs) => { authorized: boolean, message?: string };

export enum LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    CRITICAL = 5
}

export type LogLevelType = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type AppInsightsEventType
    = 'BAVS'
    | 'LOOKUP_BUSINESS_BY_NAME'
    | 'LOOKUP_BUSINESS_BY_DIRECTOR'
    | 'LOOKUP_BUSINESS_BY_REGISTRATION_NUMBER'
    | 'RETRIEVE_BANK_ACCOUNTS';

export type TenantClientCertificate = {
    id: string,
    expiry: Date,
    value: string,
};

export type TenantClientSecret = {
    description: string,
    expiration: Date,
};

export type TenantClient = {
    enabled: boolean,
    clientId: string,
    clientSecrets: TenantClientSecret[],
    clientName: string,
    description: string | null,
    clientUri: string,
    allowedGrantTypes: string[],
    redirectUris: string[],
    identityTokenLifetime: number,
    accessTokenLifetime: number,
    authorizationCodeLifetime: number,
    absoluteRefreshTokenLifetime: number,
    slidingRefreshTokenLifetime: number,
    refreshTokenUsage: number,
    refreshTokenExpiration: number,
    accessTokenType: number,
    properties: {
        countryCodes: CountryCode[],
        userInteractionRedirectUrls: string,
    }
};

export type AuthorizationRequestResponse = {
    requestId: string,
    userInteractionUrl: string
};

export type AuthorizationRequest = AuthorizationRequestResponse & {
    userId: UserId,
    status: string,
    requestData: string
};

export type OperationsPaymentAuthorizationRequest = {
    id: string,
    beneficiary: BankBeneficiary,
    payerReference: string,
    initialPayment?: InitialPayment | null
};

export type PaymentAuthorizationRequest =
    OperationsPaymentAuthorizationRequest &
    AuthorizationRequest;

export type BankBeneficiary = {
    bankAccount: {
        name: string,
        accountNumber: string,
        reference: string,
        beneficiaryType: string
    }
};

export type InitialPayment = {
    amount: Money,
    externalReference?: string | null
};

export type DestinationAccountDetails = {
    destinationAccountNumber: string,
    destinationReference: string
};

export type SourceAccountDetails = {
    sourceAccountNumber: string,
    sourceReference: string
};
