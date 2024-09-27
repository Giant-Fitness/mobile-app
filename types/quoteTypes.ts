// types/quoteTypes.ts

export interface Quote {
    QuoteType: string;
    QuoteId: string;
    QuoteText: string;
    Author?: string;
    Context: string;
    Active: boolean;
    CreatedAt: string;
    UpdatedAt: string;
}
