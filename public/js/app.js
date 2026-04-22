(() => {
  const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  if (csrfToken) {
    axios.defaults.headers.common['x-csrf-token'] = csrfToken;
  }

  const toastReload = async (message) => {
    window.alert(message);
    window.location.reload();
  };

  document.querySelectorAll('.js-delete-category').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!window.confirm('Delete this category?')) {
        return;
      }

      try {
        const { data } = await axios.delete(`/api/categories/${button.dataset.categoryId}`);
        await toastReload(data.message);
      } catch (error) {
        window.alert(error.response?.data?.message || 'Unable to delete category.');
      }
    });
  });

  document.querySelectorAll('.js-delete-expense').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!window.confirm('Delete this expense?')) {
        return;
      }

      try {
        const { data } = await axios.delete(`/api/expenses/${button.dataset.expenseId}`);
        await toastReload(data.message);
      } catch (error) {
        window.alert(error.response?.data?.message || 'Unable to delete expense.');
      }
    });
  });

  const expenseModalElement = document.getElementById('expenseModal');
  const expenseEditForm = document.getElementById('expenseEditForm');
  let expenseModal;

  if (expenseModalElement && expenseEditForm) {
    expenseModal = new bootstrap.Modal(expenseModalElement);

    document.querySelectorAll('.js-edit-expense').forEach((button) => {
      button.addEventListener('click', () => {
        expenseEditForm.expenseId.value = button.dataset.expenseId;
        expenseEditForm.title.value = button.dataset.title;
        expenseEditForm.amount.value = button.dataset.amount;
        expenseEditForm.expenseDate.value = button.dataset.date;
        expenseEditForm.categoryId.value = button.dataset.categoryId;
        expenseEditForm.notes.value = button.dataset.notes;
        expenseModal.show();
      });
    });

    expenseEditForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const payload = {
          title: expenseEditForm.title.value,
          amount: expenseEditForm.amount.value,
          expenseDate: expenseEditForm.expenseDate.value,
          categoryId: expenseEditForm.categoryId.value,
          notes: expenseEditForm.notes.value,
        };

        const { data } = await axios.put(`/api/expenses/${expenseEditForm.expenseId.value}`, payload);
        expenseModal.hide();
        await toastReload(data.message);
      } catch (error) {
        window.alert(error.response?.data?.message || 'Unable to update expense.');
      }
    });
  }

  const reportFilters = document.getElementById('reportFilters');

  if (reportFilters) {
    const categoryChartCtx = document.getElementById('categoryChart');
    const trendChartCtx = document.getElementById('trendChart');
    let categoryChart;
    let trendChart;

    const setStat = (key, value) => {
      const node = document.querySelector(`[data-stat="${key}"]`);
      if (node) {
        node.textContent = value;
      }
    };

    const renderCharts = (insights) => {
      if (categoryChart) {
        categoryChart.destroy();
      }

      if (trendChart) {
        trendChart.destroy();
      }

      categoryChart = new Chart(categoryChartCtx, {
        type: 'doughnut',
        data: {
          labels: insights.categoryBreakdown.map((item) => item.name),
          datasets: [
            {
              data: insights.categoryBreakdown.map((item) => item.totalAmount),
              backgroundColor: ['#123458', '#D4A373', '#2F4156', '#7E8A97', '#80A1C1', '#D8B4A0'],
            },
          ],
        },
      });

      trendChart = new Chart(trendChartCtx, {
        type: 'line',
        data: {
          labels: insights.dailyTrend.map((item) => item.date),
          datasets: [
            {
              label: 'Daily spend',
              data: insights.dailyTrend.map((item) => item.totalAmount),
              fill: false,
              borderColor: '#123458',
              tension: 0.3,
            },
          ],
        },
      });
    };

    const loadReport = async () => {
      try {
        const params = new URLSearchParams(new FormData(reportFilters));
        const { data } = await axios.get(`/api/reports/insights?${params.toString()}`);

        setStat('totalSpent', currency.format(data.totals.totalSpent));
        setStat('expenseCount', data.totals.expenseCount);
        setStat('averageSpend', currency.format(data.totals.averageSpend));
        setStat('topCategory', data.totals.topCategory);
        renderCharts(data);
      } catch (error) {
        window.alert(error.response?.data?.message || 'Unable to load report insights.');
      }
    };

    reportFilters.addEventListener('submit', async (event) => {
      event.preventDefault();
      await loadReport();
    });

    document.querySelectorAll('.js-export-report').forEach((button) => {
      button.addEventListener('click', () => {
        const params = new URLSearchParams(new FormData(reportFilters));
        const type = button.dataset.exportType;
        const target =
          type === 'pdf'
            ? '/reports/export/pdf'
            : '/reports/export/excel';
        window.location.href = `${target}?${params.toString()}`;
      });
    });

    loadReport();
  }

  const premiumUpgradeButton = document.querySelector('.js-premium-upgrade');

  if (premiumUpgradeButton) {
    premiumUpgradeButton.addEventListener('click', async () => {
      if (typeof Cashfree === 'undefined') {
        window.alert('Cashfree SDK could not be loaded.');
        return;
      }

      try {
        const { data } = await axios.post('/api/billing/premium/checkout');
        const cashfree = Cashfree({
          mode: data.mode,
        });

        await cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: '_self',
        });
      } catch (error) {
        window.alert(error.response?.data?.message || 'Unable to start checkout right now.');
      }
    });
  }

  document.querySelectorAll('.js-expense-export').forEach((button) => {
    button.addEventListener('click', () => {
      const expenseFilters = document.getElementById('expenseFilters');

      if (!expenseFilters) {
        return;
      }

      const params = new URLSearchParams(new FormData(expenseFilters));
      const target =
        button.dataset.exportType === 'pdf' ? '/expenses/export/pdf' : '/expenses/export/excel';
      window.location.href = `${target}?${params.toString()}`;
    });
  });
})();
