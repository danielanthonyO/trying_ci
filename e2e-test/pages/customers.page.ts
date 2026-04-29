import { expect, Page } from '@playwright/test';
import { testCustomer } from '../fixtures/customer.fixture';

export class CustomersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async switchToFinnish() {
    await this.page.getByRole('button', { name: 'FI', exact: true }).click();
  }

  async switchToEnglish() {
    await this.page.getByRole('button', { name: 'EN', exact: true }).click();
  }

  async switchToSwedish() {
    await this.page.getByRole('button', { name: 'SV', exact: true }).click();
  }

  async expectFinnishText() {
    await expect(this.page.getByText(/asiakkaat/i)).toBeVisible();
  }

  async expectEnglishText() {
    await expect(this.page.getByText(/customers/i)).toBeVisible();
  }

  async expectSwedishText() {
    await expect(this.page.getByText(/kunder/i)).toBeVisible();
  }

  async openCustomersPage() {
    await this.page.getByText(/customers|asiakkaat|kunder/i).first().click();
  }

  // customer creation is tested in a separate test suite
  async createCustomer() {
    await this.page
      .getByRole('button', { name: /add|new|create|lisää|uusi|skapa|ny/i })
      .click();

    await this.page
      .locator(
        'input[name="name"], input[placeholder*="Name"], input[placeholder*="Nimi"], input[placeholder*="Namn"]'
      )
      .first()
      .fill(testCustomer.name);

    await this.page
      .locator(
        'input[name="email"], input[type="email"], input[placeholder*="Email"], input[placeholder*="Sähköposti"], input[placeholder*="E-post"]'
      )
      .first()
      .fill(testCustomer.email);

    await this.page
      .locator(
        'input[name="phone"], input[type="tel"], input[placeholder*="Phone"], input[placeholder*="Puhelin"], input[placeholder*="Telefon"]'
      )
      .first()
      .fill(testCustomer.phone);



  }
}