import {Card} from "../../../types/trueLayer/dataAPI/cards";

export const TRUELAYER_MASTERCARD: Card = {
  account_id: "mastercard-1",
  card_network: "MASTERCARD",
  card_type: "CREDIT",
  currency: "GBP",
  display_name: "My epic mastercard",
  partial_card_number: "1234",
  name_on_card: "Jelly Belly",
  update_timestamp: "2023-09-11T08:48:18.6355522Z",
  provider: {
    display_name: "Hey a cool display name",
    provider_id: "provider-id",
    logo_uri: "https://test-url.com"
  }
};

export const TRUELAYER_VISA: Card = {
  account_id: "visa-1",
  card_network: "VISA",
  card_type: "DEBIT",
  currency: "EUR",
  display_name: "Bob's Debit Card",
  partial_card_number: "5678",
  name_on_card: "Bob La Cruz",
  update_timestamp: "2022-12-01T00:48:18.5355222Z",
  provider: {
    display_name: "Another display name",
    provider_id: "provider-id-2",
    logo_uri: "https://test-url-2.com"
  }
};
