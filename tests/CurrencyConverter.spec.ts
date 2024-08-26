import { render, fireEvent, waitFor } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CurrencyConverter from '../src/CurrencyConverter.vue';
import axios from 'axios';

// Мокаем axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Мокирование API-ответа
const mockApiResponse = {
  data: {
    provider: 'https://www.exchangerate-api.com',
    WARNING_UPGRADE_TO_V6: 'https://www.exchangerate-api.com/docs/free',
    terms: 'https://www.exchangerate-api.com/terms',
    base: 'USD',
    date: '2024-08-25',
    time_last_updated: 1724544001,
    rates: {
      USD: 1,
      RUB: 91.45
    }
  }
};

describe('CurrencyConverter.vue', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    vi.clearAllMocks(); // Очищаем все моки после каждого теста
  });

  it('отображает начальное значение и валюты по умолчанию', () => {
    const { getByLabelText, getByText } = render(CurrencyConverter);

    expect(getByLabelText('количество:')).toBeTruthy();
    expect(getByText('USD')).toBeTruthy();
    expect(getByText('RUB')).toBeTruthy();
  });

  it('корректно конвертирует валюты', async () => {
    const { getByLabelText, getByText } = render(CurrencyConverter);

    const amountInput = getByLabelText('количество:') as HTMLInputElement;
    await fireEvent.update(amountInput, '100');

    // Используем waitFor для ожидания обновления DOM
    await waitFor(() => {
      expect(getByText('100 USD равно 9145.00 RUB')).toBeTruthy();
    });
  });

  it('меняет валюты местами при нажатии на кнопку "поменять местами"', async () => {
    const { getByRole, getByText } = render(CurrencyConverter);

    const swapButton = getByRole('button', { name: /поменять местами/i });
    await fireEvent.click(swapButton);

    // Проверяем, что валюты поменялись местами
    await waitFor(() => {
      expect(getByText('RUB')).toBeTruthy();
      expect(getByText('USD')).toBeTruthy();
    });
  });

  it('обрабатывает ошибки API корректно', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Ошибка при получении курсов валют'));

    const { getByLabelText, getByText } = render(CurrencyConverter);

    const amountInput = getByLabelText('количество:') as HTMLInputElement;
    await fireEvent.update(amountInput, '100');

    // Проверяем отображение ошибки
    await waitFor(() => {
      expect(getByText(/Ошибка при получении курсов валют/i)).toBeTruthy();
    });
  });
});
