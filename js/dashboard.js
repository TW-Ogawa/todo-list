/**
 * Dashboard Logic
 */

Chart.defaults.animation = false;

// --- Chart Instances ---
let categoryChartInstance = null;
let priorityChartInstance = null;

// --- Main Update Function ---
function updateDashboard() {
  const todos = getTodos(); // Assumes getTodos() is available from app.js

  // 1. Calculate Statistics
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.checked).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Aggregate data by category and priority
  const categoryCounts = todos.reduce((acc, todo) => {
    const category = todo.category || '未分類';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = todos.reduce((acc, todo) => {
    const priority = todo.priority || '未設定';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const categoryData = {
    labels: Object.keys(categoryCounts),
    data: Object.values(categoryCounts)
  };

  const priorityData = {
      labels: ['高', '中', '低'], // Keep a fixed order for priorities
      data: [
          priorityCounts['高'] || 0,
          priorityCounts['中'] || 0,
          priorityCounts['低'] || 0,
      ]
  };

  // 2. Update DOM Elements
  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('completedTasks').textContent = completedTasks;
  document.getElementById('completionRate').textContent = `${completionRate}%`;

  // 3. Render Charts
  renderCategoryChart(categoryData);
  renderPriorityChart(priorityData);
}

// --- Chart Rendering Functions ---

function renderCategoryChart(data) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }
  categoryChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'カテゴリ別',
        data: data.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false, // Hide the default title
            }
        }
    }
  });
}

function renderPriorityChart(data) {
  const ctx = document.getElementById('priorityChart').getContext('2d');
  if (priorityChartInstance) {
    priorityChartInstance.destroy();
  }
  priorityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: '優先度別',
        data: data.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: {
                display: false // Hide legend for bar chart
            }
        }
    }
  });
}

// Initial render on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
});
