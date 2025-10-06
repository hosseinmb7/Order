const sections = document.querySelectorAll(".section");
const customerSelect = document.getElementById("customerSelect");
const customerList = document.getElementById("customerList");
const successIcon = document.getElementById("successIcon");
const todayOrdersTable = document.querySelector("#todayOrders tbody");
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function showSection(id) {
  sections.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === 'customers') refreshCustomerList();
  if (id === 'orders') { fillCustomerSelect(); refreshTodayOrders(); }
}

function fillCustomerSelect() {
  customerSelect.innerHTML = "";
  customers.forEach(c => {
    const o = document.createElement("option");
    o.textContent = c; o.value = c;
    customerSelect.appendChild(o);
  });
}

document.getElementById("addCustomer").onclick = () => {
  const name = document.getElementById("newCustomer").value.trim();
  if (!name) return;
  customers.push(name);
  localStorage.setItem("customers", JSON.stringify(customers));
  document.getElementById("newCustomer").value = "";
  refreshCustomerList();
  fillCustomerSelect();
};

function refreshCustomerList() {
  customerList.innerHTML = "";
  customers.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${c}</span>`;
    const ctr = document.createElement("div"); ctr.className = "controls";
    const delBtn = document.createElement("button"); delBtn.className = "delete"; delBtn.title = "حذف"; delBtn.innerHTML = "🗑";
    delBtn.onclick = () => {
      if (confirm(`آیا از حذف "${c}" مطمئن هستید؟`)) {
        customers.splice(i, 1);
        localStorage.setItem("customers", JSON.stringify(customers));
        refreshCustomerList(); fillCustomerSelect(); refreshTodayOrders();
      }
    };
    ctr.appendChild(delBtn); li.appendChild(ctr); customerList.appendChild(li);
  });
}

function refreshTodayOrders() {
  const date = document.getElementById("date").value;
  todayOrdersTable.innerHTML = "";
  if (!date) return;
  orders.forEach((o, i) => {
    if (o.date === date) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${o.customer}</td><td>${o.qty}</td><td><button onclick="deleteOrder(${i})">🗑</button></td>`;
      todayOrdersTable.appendChild(tr);
    }
  });
}

document.getElementById("saveOrder").onclick = () => {
  const date = document.getElementById("date").value;
  const customer = customerSelect.value;
  const qty = Number(document.getElementById("quantity").value);
  if (!date || !customer || qty < 1) return;

  // بررسی تکراری بودن نام مشتری در همان روز
  const exists = orders.some(o => o.date === date && o.customer === customer);
  if (exists) {
    alert("این مشتری در این تاریخ قبلاً سفارش داده است!");
    return;
  }

  orders.push({ date, customer, qty });
  localStorage.setItem("orders", JSON.stringify(orders));
  successIcon.classList.add("show");
  setTimeout(() => successIcon.classList.remove("show"), 1800);
  refreshTodayOrders();
  document.getElementById("quantity").value = 1;
};

function deleteOrder(i) {
  if (confirm("آیا از حذف این سفارش مطمئن هستید؟")) {
    orders.splice(i, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    refreshTodayOrders();
  }
}

// لایو آپدیت جدول با تغییر تاریخ
document.getElementById("date").addEventListener("input", refreshTodayOrders);

document.getElementById("generateReport").onclick = () => {
  const date = document.getElementById("reportDate").value; 
  if (!date) return;
  const filtered = orders.filter(o => o.date === date);
  const tbody = document.querySelector("#reportTable tbody");
  const tfoot = document.querySelector("#reportTable tfoot");
  tbody.innerHTML = ""; 
  let total = 0;
  filtered.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${o.customer}</td><td>${o.qty}</td>`;
    tbody.appendChild(tr); 
    total += o.qty;
  });
  tfoot.innerHTML = `<tr><td>جمع</td><td>${total}</td></tr>`;
};

function printReport() {
  const div = document.createElement("div");
  const table = document.getElementById("reportTable").cloneNode(true);
  div.appendChild(table);
  const w = window.open("", "", "width=800,height=600");
  w.document.write(div.innerHTML);
  w.document.close();
  w.print();
}

// Persian datepicker با انتخاب لایو
$(".pdate").persianDatepicker({
  format: 'YYYY/MM/DD',
  onSelect: function() { refreshTodayOrders(); }
});

fillCustomerSelect(); 
refreshCustomerList(); 
refreshTodayOrders();
