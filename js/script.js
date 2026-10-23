// Khởi tạo danh sách giao dịch từ LocalStorage hoặc mảng trống
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const currentBalanceEl = document.getElementById('current-balance');
const transactionListEl = document.getElementById('transaction-list');
const transactionForm = document.getElementById('transaction-form');
const formErrorEl = document.getElementById('form-error');
const expenseProgress = document.getElementById('expense-progress');
const progressText = document.getElementById('progress-text');

// Bài 4: Chức năng chống XSS cơ bản (Escape HTML strings)
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Định dạng tiền tệ VNĐ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Tính toán tự động tổng thu, tổng chi, số dư và vẽ thanh progress bar (Bài 3)
function updateFinanceSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += Number(t.amount);
        } else {
            totalExpense += Number(t.amount);
        }
    });

    const balance = totalIncome - totalExpense;

    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpenseEl.textContent = formatCurrency(totalExpense);
    currentBalanceEl.textContent = formatCurrency(balance);

    // Tính progress bar tỷ lệ chi tiêu so với thu nhập
    let percentage = 0;
    if (totalIncome > 0) {
        percentage = Math.min(Math.round((totalExpense / totalIncome) * 100), 100);
    }
    expenseProgress.style.width = percentage + '%';
    progressText.textContent = `${percentage}% tổng thu nhập đã chi tiêu`;
}

// Render bảng lịch sử giao dịch (Bài 1 & Bài 4)
function renderTransactions() {
    transactionListEl.innerHTML = '';

    if (transactions.length === 0) {
        transactionListEl.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Chưa có giao dịch nào được ghi nhận.</td></tr>`;
        return;
    }

    transactions.forEach((t, index) => {
        const tr = document.createElement('tr');
        
        // Escape dữ liệu chống XSS
        const safeName = escapeHtml(t.name);
        const safeDate = escapeHtml(t.date);
        
        const typeLabel = t.type === 'income' ? '<span class="text-income">Thu</span>' : '<span class="text-expense">Chi</span>';
        const amountFormatted = (t.type === 'income' ? '+ ' : '- ') + formatCurrency(t.amount);
        const amountClass = t.type === 'income' ? 'text-income' : 'text-expense';

        tr.innerHTML = `
            <td>${safeDate}</td>
            <td>${safeName}</td>
            <td>${typeLabel}</td>
            <td class="${amountClass}">${amountFormatted}</td>
            <td><button class="btn-delete" onclick="deleteTransaction(${index})">Xóa</button></td>
        `;
        transactionListEl.appendChild(tr);
    });
}

// Lưu dữ liệu vào LocalStorage (Bài 3)
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Xóa giao dịch
function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveToLocalStorage();
    init();
}

// Bài 2: Lập trình form thêm giao dịch với Validation không để trống & số tiền > 0
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    formErrorEl.textContent = '';

    const type = document.getElementById('trans-type').value;
    const name = document.getElementById('trans-name').value.trim();
    const amount = Number(document.getElementById('trans-amount').value);
    const date = document.getElementById('trans-date').value;

    // Validation kiểm tra dữ liệu
    if (!name) {
        formErrorEl.textContent = 'Tên danh mục không được để trống!';
        return;
    }

    if (!amount || amount <= 0) {
        formErrorEl.textContent = 'Số tiền phải là số lớn hơn 0!';
        return;
    }

    if (!date) {
        formErrorEl.textContent = 'Vui lòng chọn ngày tháng giao dịch!';
        return;
    }

    // Tạo đối tượng giao dịch mới
    const newTransaction = {
        type,
        name,
        amount,
        date
    };

    transactions.push(newTransaction);
    saveToLocalStorage();
    init();

    // Reset form
    transactionForm.reset();
});

// Khởi chạy ứng dụng
function init() {
    renderTransactions();
    updateFinanceSummary();
}

// Thiết lập ngày mặc định là hôm nay cho input date
document.getElementById('trans-date').valueAsDate = new Date();

init();