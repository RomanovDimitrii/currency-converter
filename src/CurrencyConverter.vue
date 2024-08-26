<template>
  <div class="currency-converter">
    <div class="currency-converter__row">
      <div class="currency-converter__group">
        <label :id="fromCurrencyLabelId" class="currency-converter__label">продать:</label>
        <v-select
          :aria-labelledby="fromCurrencyLabelId"
          v-model="fromCurrency"
          :options="currencies"
          :reduce="currency => currency"
          placeholder="Выберите валюту"
          class="currency-converter__select"
        ></v-select>
      </div>

      <button @click="swapCurrencies" class="currency-converter__swap-button">
        &#x21c4; <span class="visually-hidden">поменять местами</span>
      </button>

      <div class="currency-converter__group">
        <label :id="toCurrencyLabelId" class="currency-converter__label">купить:</label>
        <v-select
          :aria-labelledby="toCurrencyLabelId"
          v-model="toCurrency"
          :options="currencies"
          :reduce="currency => currency"
          placeholder="Выберите валюту"
          class="currency-converter__select"
        ></v-select>
      </div>
    </div>

    <div class="currency-converter__group">
      <label for="amount" class="currency-converter__label">количество:</label>
      <input
        id="amount"
        type="number"
        v-model.number="amount"
        @input="convertCurrency"
        placeholder="Введите сумму"
        class="currency-converter__input"
      />
    </div>

    <div class="currency-converter__result">
      <h3>{{ conversionText }}</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import axios from 'axios';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'CurrencyConverter',
  components: { vSelect },
  setup() {
    const amount = ref<number>(0);
    const fromCurrency = ref<string>('USD');
    const toCurrency = ref<string>('RUB');
    const result = ref<number>(0);
    const currencies = ref<string[]>([
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'RUB',
      'CNY',
      'CAD',
      'AUD',
      'CHF'
    ]);
    const conversionText = ref<string>('');

    const fromCurrencyLabelId = 'fromCurrencyLabel';
    const toCurrencyLabelId = 'toCurrencyLabel';

    const convertCurrency = async () => {
      if (amount.value === 0) return;
      try {
        const response = await axios.get<{ rates: { [key: string]: number } }>(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency.value}`
        );

        if (response.data && response.data.rates && response.data.rates[toCurrency.value]) {
          const rate = response.data.rates[toCurrency.value];
          result.value = (amount.value * rate).toFixed(2);
          conversionText.value = `${amount.value} ${fromCurrency.value} равно ${result.value} ${toCurrency.value}`;
        } else {
          throw new Error('Некорректный ответ от API');
        }
      } catch (error) {
        console.error('Ошибка при получении курсов валют');
        conversionText.value = 'Ошибка при получении курсов валют';
      }
    };

    const swapCurrencies = async () => {
      const temp = fromCurrency.value;
      fromCurrency.value = toCurrency.value;
      toCurrency.value = temp;

      // await nextTick(); // Ждем обновления DOM и состояния

      // Вызов пересчета после смены валют
      await convertCurrency();
    };

    watch([fromCurrency, toCurrency], async () => {
      if (fromCurrency.value !== toCurrency.value) {
        await convertCurrency();
      }
    });

    onMounted(() => {
      const userCurrency = navigator.language.split('-')[1] || 'USD';
      if (currencies.value.includes(userCurrency)) {
        fromCurrency.value = userCurrency;
      }
      convertCurrency();
    });

    return {
      amount,
      fromCurrency,
      toCurrency,
      result,
      currencies,
      conversionText,
      convertCurrency,
      swapCurrencies,
      fromCurrencyLabelId,
      toCurrencyLabelId
    };
  }
};
</script>

<style scoped>
.currency-converter {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.currency-converter__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
}

.currency-converter__group {
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
}

.currency-converter__label {
  display: block;
  margin-bottom: 5px;
  text-align: start;
}

.currency-converter__input {
  width: calc(100% - 25px);
  border-radius: 5px;
  padding: 10px;
  border: 2px solid #ccc;
}

.currency-converter__select {
  width: 100%;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.currency-converter__swap-button {
  margin-top: 30px;
  padding: 5px;
  background-color: #f13227;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  text-align: center;
  align-self: center;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.currency-converter__swap-button:hover {
  transform: scale(1.05) translateY(-2px);
  outline: none;
}

.visually-hidden {
  display: none;
}

.currency-converter__result {
  display: block;
  height: 30px;
}
</style>
