import { useState, useEffect, useRef } from "react";
import "./App.css";
const initialTransactions = [
  {
    id: 1,
    title: "Hostel Mess",
    category: "Food",
    amount: 250,
    type: "expense",
    date: "2026-11-19",
  },
  {
    id: 2,
    title: "College Bus",
    category: "Travel",
    amount: 80,
    type: "expense",
    date: "2026-11-19",
  },
  {
    id: 3,
    title: "Freelance Project",
    category: "Income",
    amount: 2500,
    type: "income",
    date: "2026-11-18",
  },
  {
    id: 4,
    title: "Shopping",
    category: "Shopping",
    amount: 650,
    type: "expense",
    date: "2026-11-17",
  },
  {
    id: 5,
    title: "Recharge",
    category: "Bills",
    amount: 299,
    type: "expense",
    date: "2026-11-16",
  },
];

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Education",
  "Entertainment",
  "Health",
  "Other",
];

const icons = {
  Food: "🍔",
  Travel: "🚗",
  Shopping: "🛍️",
  Bills: "📱",
  Education: "📚",
  Entertainment: "🎬",
  Health: "💊",
  Other: "📦",
  Income: "💰",
};
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App() {
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem("spendwise_workspaces");
    return saved ? JSON.parse(saved) : [{ id: "personal", name: "My Page" }];
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() =>
    localStorage.getItem("spendwise_active_workspace") || "personal"
  );

  const getWorkspaceTransactions = (workspaceId) => {
    const saved = localStorage.getItem(`spendwise_workspace_${workspaceId}_transactions`);
    if (saved) return JSON.parse(saved);
    if (workspaceId === "personal") {
      const legacySaved = localStorage.getItem("spendwise_transactions");
      return legacySaved ? JSON.parse(legacySaved) : initialTransactions;
    }
    return [];
  };

  const getWorkspaceBudgets = (workspaceId) => {
    const saved = localStorage.getItem(`spendwise_workspace_${workspaceId}_budgets`);
    if (saved) return JSON.parse(saved);
    if (workspaceId === "personal") {
      const legacySaved = localStorage.getItem("spendwise_budgets");
      return legacySaved ? JSON.parse(legacySaved) : {};
    }
    return {};
  };

  const [transactions, setTransactions] = useState(() =>
    getWorkspaceTransactions(localStorage.getItem("spendwise_active_workspace") || "personal")
  );

  const [showForm, setShowForm] = useState(false);
  const transactionFormRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [dateFilter, setDateFilter] = useState("All Time");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [budgets, setBudgets] = useState(() =>
    getWorkspaceBudgets(localStorage.getItem("spendwise_active_workspace") || "personal")
  );
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("spendwise_theme") || "light";
  });
  const [reportMonth, setReportMonth] = useState(
    `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`
  );

  // Keep the theme synchronized with the saved preference.
  // index.html applies the saved theme before React starts to prevent refresh flash.
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("spendwise_theme", theme);
  }, [theme]);

  // Save each workspace's transactions and budgets separately.
  useEffect(() => {
    localStorage.setItem("spendwise_workspaces", JSON.stringify(workspaces));
    localStorage.setItem("spendwise_active_workspace", activeWorkspaceId);
  }, [workspaces, activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem(
      `spendwise_workspace_${activeWorkspaceId}_transactions`,
      JSON.stringify(transactions)
    );
    if (activeWorkspaceId === "personal") {
      localStorage.setItem("spendwise_transactions", JSON.stringify(transactions));
    }
  }, [transactions, activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem(
      `spendwise_workspace_${activeWorkspaceId}_budgets`,
      JSON.stringify(budgets)
    );
    if (activeWorkspaceId === "personal") {
      localStorage.setItem("spendwise_budgets", JSON.stringify(budgets));
    }
  }, [budgets, activeWorkspaceId]);

  const createWorkspace = () => {
    const newWorkspace = {
      id: `workspace_${Date.now()}`,
      name: `Page ${workspaces.length + 1}`,
    };

    localStorage.setItem(
      `spendwise_workspace_${activeWorkspaceId}_transactions`,
      JSON.stringify(transactions)
    );
    localStorage.setItem(
      `spendwise_workspace_${activeWorkspaceId}_budgets`,
      JSON.stringify(budgets)
    );

    setWorkspaces((prev) => [...prev, newWorkspace]);
    setActiveWorkspaceId(newWorkspace.id);
    setTransactions([]);
    setBudgets({});
    setForm({
      title: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: getLocalDateString(),
    });
    setEditingId(null);
    setShowForm(false);
    setActiveSection("dashboard");
    setSearch("");
    setFilter("All");
    setDateFilter("All Time");
    setCustomStartDate("");
    setCustomEndDate("");
    setBudgetCategory("Food");
    setBudgetAmount("");
  };

  const deleteWorkspace = () => {
    if (activeWorkspaceId === "personal") {
      alert("Your original My Page cannot be deleted.");
      return;
    }
    const currentWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
    const confirmed = window.confirm(`Delete ${currentWorkspace?.name || "this page"} and all its transactions and budgets? This cannot be undone.`);
    if (!confirmed) return;
    localStorage.removeItem(`spendwise_workspace_${activeWorkspaceId}_transactions`);
    localStorage.removeItem(`spendwise_workspace_${activeWorkspaceId}_budgets`);
    const remainingWorkspaces = workspaces.filter((workspace) => workspace.id !== activeWorkspaceId);
    const nextWorkspace = remainingWorkspaces.find((workspace) => workspace.id === "personal") || remainingWorkspaces[0];
    setWorkspaces(remainingWorkspaces);
    setActiveWorkspaceId(nextWorkspace.id);
    setTransactions(getWorkspaceTransactions(nextWorkspace.id));
    setBudgets(getWorkspaceBudgets(nextWorkspace.id));
    setForm({ title: "", amount: "", category: "Food", type: "expense", date: getLocalDateString() });
    setEditingId(null);
    setShowForm(false);
    setActiveSection("dashboard");
    setSearch("");
    setFilter("All");
    setDateFilter("All Time");
    setCustomStartDate("");
    setCustomEndDate("");
    setBudgetCategory("Food");
    setBudgetAmount("");
  };

  const switchWorkspace = (workspaceId) => {
    if (workspaceId === activeWorkspaceId) return;

    localStorage.setItem(
      `spendwise_workspace_${activeWorkspaceId}_transactions`,
      JSON.stringify(transactions)
    );
    localStorage.setItem(
      `spendwise_workspace_${activeWorkspaceId}_budgets`,
      JSON.stringify(budgets)
    );

    setActiveWorkspaceId(workspaceId);
    setTransactions(getWorkspaceTransactions(workspaceId));
    setBudgets(getWorkspaceBudgets(workspaceId));
    setForm({
      title: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: getLocalDateString(),
    });
    setEditingId(null);
    setShowForm(false);
    setActiveSection("dashboard");
    setSearch("");
    setFilter("All");
    setDateFilter("All Time");
    setCustomStartDate("");
    setCustomEndDate("");
    setBudgetCategory("Food");
    setBudgetAmount("");
  };

  // Automatically scroll to the transaction form whenever it opens.
  useEffect(() => {
    if (showForm) {
      transactionFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showForm]);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === "light" ? "dark" : "light"
    );
  };

  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgetAmount, setBudgetAmount] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: getLocalDateString(),
  });

  // Calculate total income
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate total expenses
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate balance
  const balance = income - expenses;

  // Search and filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || t.type === filter.toLowerCase();

    const transactionDate = new Date(t.date + "T00:00:00");
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    let matchesDate = true;

    if (dateFilter === "Today") {
      matchesDate = transactionDate.getTime() === today.getTime();
    }

    if (dateFilter === "This Week") {
      const startOfWeek = new Date(today);
      const day = today.getDay();

      startOfWeek.setDate(today.getDate() - day);
      startOfWeek.setHours(0, 0, 0, 0);

      matchesDate =
        transactionDate >= startOfWeek &&
        transactionDate <= today;
    }

    if (dateFilter === "This Month") {
      matchesDate =
        transactionDate.getMonth() === today.getMonth() &&
        transactionDate.getFullYear() === today.getFullYear();
    }

    if (dateFilter === "Last Month") {
      const lastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );

      matchesDate =
        transactionDate.getMonth() === lastMonth.getMonth() &&
        transactionDate.getFullYear() === lastMonth.getFullYear();
    }

    if (dateFilter === "Custom") {
      const startMatches =
        !customStartDate || t.date >= customStartDate;

      const endMatches =
        !customEndDate || t.date <= customEndDate;

      matchesDate = startMatches && endMatches;
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) {
      alert("Please enter a valid transaction.");
      return;
    }

    const transactionData = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.type === "income" ? "Income" : form.category,
      type: form.type,
      date: form.date,
    };

    if (editingId !== null) {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === editingId
            ? { ...transaction, ...transactionData }
            : transaction
        )
      );
    } else {
      setTransactions((prev) => [
        { id: Date.now(), ...transactionData },
        ...prev,
      ]);
    }

    setForm({
      title: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: getLocalDateString(),
    });

    setEditingId(null);
    setShowForm(false);
  }

  // Delete transaction
  function deleteTransaction(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  }

  // Edit transaction
  function editTransaction(transaction) {
    setForm({
      title: transaction.title,
      amount: String(transaction.amount),
      category: transaction.category === "Income" ? "Food" : transaction.category,
      type: transaction.type,
      date: transaction.date,
    });

    setEditingId(transaction.id);
    setShowForm(true);
  }
  // Export transactions to CSV
  function exportTransactions() {

    const csvHeaders = ["Date", "Title", "Category", "Type", "Amount"];

    const csvRows = filteredTransactions.map((transaction) => [
      transaction.date,
      transaction.title,
      transaction.category,
      transaction.type,
      transaction.amount,
    ]);

    const csvContent = [
      csvHeaders,
      ...csvRows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.download = `SpendWise_Transactions_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  }

  // Export complete SpendWise backup
  function exportBackup() {
    const backupData = {
      appName: "SpendWise",
      backupDate: new Date().toISOString(),
      transactions: transactions,
      budgets: budgets,
    };

    const data = JSON.stringify(backupData, null, 2);

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.download = `SpendWise_Backup_${new Date()
      .toISOString()
      .split("T")[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // Restore SpendWise backup
  function restoreBackup(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);

        // Validate transactions
        if (
          !backupData.transactions ||
          !Array.isArray(backupData.transactions)
        ) {
          alert("Invalid backup file.");
          return;
        }

        // Validate budgets
        if (
          backupData.budgets &&
          (typeof backupData.budgets !== "object" ||
            Array.isArray(backupData.budgets))
        ) {
          alert("Invalid budget data in backup file.");
          return;
        }

        const confirmed = window.confirm(
          "Restoring this backup will replace your current transactions and budgets. Continue?"
        );

        if (!confirmed) return;

        // Restore transactions
        setTransactions(backupData.transactions);

        // Restore budgets
        if (backupData.budgets) {
          setBudgets(backupData.budgets);
        }

        alert("Backup restored successfully! 🎉");
      } catch (error) {
        alert("Unable to restore backup. Please select a valid file.");
      }
    };

    reader.readAsText(file);

    // Reset file input so the same file can be selected again
    e.target.value = "";
  }
  // Format currency in Indian Rupees
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Calculate category-wise expenses
  const categoryTotals = categories
    .map((category) => ({
      name: category,
      amount: transactions
        .filter(
          (t) => t.category === category && t.type === "expense"
        )
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }))
    .filter((category) => category.amount > 0);

  const maxCategoryAmount = Math.max(
    ...categoryTotals.map((c) => c.amount),
    1
  );

  // Monthly expense analytics - last 6 months
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();

    date.setDate(1);
    date.setMonth(date.getMonth() - i);

    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const total = transactions
      .filter(
        (t) => t.type === "expense" && t.date.startsWith(month)
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    monthlyData.push({
      month,
      label: date.toLocaleString("en-IN", {
        month: "short",
      }),
      amount: total,
    });
  }

  const maxMonthlyExpense = Math.max(
    ...monthlyData.map((m) => m.amount),
    1
  );
  // Current month expenses
  const currentMonth = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;

  const currentMonthExpenses = transactions.filter(
    (t) =>
      t.type === "expense" &&
      t.date.startsWith(currentMonth)
  );
  // ===============================
  // MONTHLY FINANCIAL REPORT
  // ===============================

  const availableReportMonths = [
    ...new Set([
      currentMonth,
      ...transactions.map((t) => t.date.slice(0, 7)),
    ]),
  ].sort((a, b) => b.localeCompare(a));

  const reportTransactions = transactions.filter((t) =>
    t.date.startsWith(reportMonth)
  );

  const reportIncome = reportTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const reportExpenses = reportTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const reportSavings = reportIncome - reportExpenses;

  const reportSavingsRate =
    reportIncome > 0
      ? (reportSavings / reportIncome) * 100
      : 0;

  const reportCategoryTotals = categories
    .map((category) => ({
      name: category,
      amount: reportTransactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === category
        )
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const highestSpendingCategory =
    reportCategoryTotals.length > 0
      ? reportCategoryTotals[0]
      : null;

  const reportMonthLabel = new Date(
    `${reportMonth}-01T00:00:00`
  ).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  // Calculate spending for each budget category
  const budgetData = categories.map((category) => {
    const spent = currentMonthExpenses
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const budget = Number(budgets[category] || 0);

    return {
      category,
      budget,
      spent,
      remaining: budget - spent,
      percentage: budget > 0 ? (spent / budget) * 100 : 0,
    };
  });

  const totalBudget = Object.values(budgets).reduce(
    (sum, amount) => sum + Number(amount),
    0
  );

  const totalBudgetSpent = budgetData
    .filter((item) => item.budget > 0)
    .reduce((sum, item) => sum + item.spent, 0);

  const totalBudgetRemaining = totalBudget - totalBudgetSpent;

  // Add or update a budget
  function handleBudgetSubmit(e) {
    e.preventDefault();

    if (!budgetAmount || Number(budgetAmount) <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    setBudgets((prev) => ({
      ...prev,
      [budgetCategory]: Number(budgetAmount),
    }));

    setBudgetAmount("");
    alert("Budget saved successfully!");
  }

  // Delete a budget
  function deleteBudget(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${category} budget?`
    );

    if (!confirmed) return;

    setBudgets((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <span>SpendWise</span>
        </div>

        <div className="workspace-switcher">
          <label htmlFor="workspace-select">YOUR PAGES</label>
          <select
            id="workspace-select"
            value={activeWorkspaceId}
            onChange={(e) => switchWorkspace(e.target.value)}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <button className="new-workspace-btn" onClick={createWorkspace}>
            + Add New Page
          </button>
          <button className="delete-workspace-btn" onClick={deleteWorkspace} disabled={activeWorkspaceId === "personal"}>
            − Delete Page
          </button>
        </div>

        <div className="menu-label">MENU</div>

        <nav>
          <a
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""
              }`}
            href="#dashboard"
            onClick={() => setActiveSection("dashboard")}
          >
            <span>▦</span> Dashboard
          </a>

          <a
            className={`nav-item ${activeSection === "transactions" ? "active" : ""
              }`}
            href="#transactions"
            onClick={() => setActiveSection("transactions")}
          >
            <span>↔</span> Transactions
          </a>

          <a
            className={`nav-item ${activeSection === "analytics" ? "active" : ""
              }`}
            href="#analytics"
            onClick={() => setActiveSection("analytics")}
          >
            <span>◔</span> Analytics
          </a>
          <a
            className={`nav-item ${activeSection === "reports" ? "active" : ""
              }`}
            href="#reports"
            onClick={() => setActiveSection("reports")}
          >
            <span>📊</span> Reports
          </a>

          <a
            className={`nav-item ${activeSection === "budgets" ? "active" : ""
              }`}
            href="#budgets"
            onClick={() => setActiveSection("budgets")}
          >
            <span>▤</span> Budgets
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">💡</div>
            <strong>Smart spending</strong>
            <p>Keep track of where your money goes.</p>
          </div>

          <div className="profile">
            <div className="avatar">G</div>


            <div>
              <strong>My Account</strong>
              <small>Personal Finance</small>
            </div>
          </div>
        </div>
      </aside>
      {/* MOBILE NAVIGATION */}
      <nav className="mobile-nav">
        <a
          href="#dashboard"
          className={`mobile-nav-item ${activeSection === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveSection("dashboard")}
        >
          <span>▦</span>
          <small>Home</small>
        </a>

        <a
          href="#transactions"
          className={`mobile-nav-item ${activeSection === "transactions" ? "active" : ""}`}
          onClick={() => setActiveSection("transactions")}
        >
          <span>↔</span>
          <small>Transactions</small>
        </a>

        <a
          href="#analytics"
          className={`mobile-nav-item ${activeSection === "analytics" ? "active" : ""}`}
          onClick={() => setActiveSection("analytics")}
        >
          <span>◔</span>
          <small>Analytics</small>
        </a>

        <a
          href="#reports"
          className={`mobile-nav-item ${activeSection === "reports" ? "active" : ""}`}
          onClick={() => setActiveSection("reports")}
        >
          <span>▤</span>
          <small>Reports</small>
        </a>

        <a
          href="#budgets"
          className={`mobile-nav-item ${activeSection === "budgets" ? "active" : ""}`}
          onClick={() => setActiveSection("budgets")}
        >
          <span>◎</span>
          <small>Budgets</small>
        </a>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* HEADER */}
        <header className="topbar" id="dashboard">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>

          <div className="topbar-right">
            <div className="date-pill">
              📅{" "}
              {new Date().toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>

            <button
              className="primary-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + Add Transaction
            </button>
          </div>
        </header>

        {/* WELCOME SECTION */}
        <section className="welcome">
          <div>
            <h2>Welcome back 👋</h2>
            <p>Here's what's happening with your finances today.</p>
          </div>

          <div className="welcome-decoration">₹</div>
        </section>

        {/* STATISTICS */}
        <section className="stats-grid">
          <div className="stat-card balance-card">
            <div className="stat-top">
              <span>Total Balance</span>
              <div className="stat-icon purple">₹</div>
            </div>

            <h2>{formatCurrency(balance)}</h2>
            <p className="stat-note">Income minus expenses</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Total Income</span>
              <div className="stat-icon green">↗</div>
            </div>

            <h2 className="green-text">{formatCurrency(income)}</h2>
            <p className="stat-note">Money received</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Total Expenses</span>
              <div className="stat-icon red">↘</div>
            </div>

            <h2 className="red-text">{formatCurrency(expenses)}</h2>
            <p className="stat-note">Money spent</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Transactions</span>
              <div className="stat-icon blue">↔</div>
            </div>

            <h2>{transactions.length}</h2>
            <p className="stat-note">Total recorded</p>
          </div>
        </section>

        {/* ADD TRANSACTION FORM */}
        {showForm && (
          <section className="form-card" ref={transactionFormRef}>
            <div className="form-header">
              <h2>{editingId !== null ? "Edit Transaction" : "Add Transaction"}</h2>

              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);

                  setForm({
                    title: "",
                    amount: "",
                    category: "Food",
                    type: "expense",
                    date: getLocalDateString(),
                  });
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="type-toggle">
                <button
                  type="button"
                  className={
                    form.type === "expense"
                      ? "selected expense-option"
                      : ""
                  }
                  onClick={() =>
                    setForm({ ...form, type: "expense" })
                  }
                >
                  Expense
                </button>

                <button
                  type="button"
                  className={
                    form.type === "income"
                      ? "selected income-option"
                      : ""
                  }
                  onClick={() =>
                    setForm({ ...form, type: "income" })
                  }
                >
                  Income
                </button>
              </div>

              <div className="form-grid">
                <label>
                  Transaction Name

                  <input
                    type="text"
                    placeholder="e.g. Lunch, Salary"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Amount (₹)

                  <input
                    type="number"
                    placeholder="0"
                    min="1"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                {form.type === "expense" && (
                  <label>
                    Category

                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
                        })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  Date

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                    required
                  />
                </label>
              </div>

              <button
                className="primary-btn form-submit"
                type="submit"
              >
                {editingId !== null ? "Update Transaction" : "Save Transaction"}
              </button>
            </form>
          </section>
        )}

        {/* TRANSACTIONS AND CATEGORY ANALYTICS */}
        <section className="content-grid">
          {/* RECENT TRANSACTIONS */}
          <div className="panel transactions-panel" id="transactions">
            <div className="panel-header">
              <div>
                <h2>Recent Transactions</h2>
                <p>Your latest financial activity</p>
              </div>

              <button className="text-btn">View all →</button>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="transaction-controls">
              <input
                type="search"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                <option>Income</option>
                <option>Expense</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option>All Time</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Custom</option>
              </select>

              {dateFilter === "Custom" && (
                <>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />

                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </>
              )}

              <button
                className="export-btn"
                onClick={exportTransactions}
              >
                ↓ Export CSV
              </button>


            </div>
            {/* TRANSACTION LIST */}
            <div className="transaction-list">
              {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  No transactions found.
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    className="transaction-row"
                    key={transaction.id}
                  >
                    <div className="transaction-icon">
                      {icons[transaction.category] || "📦"}
                    </div>

                    <div className="transaction-info">
                      <strong>{transaction.title}</strong>

                      <small>
                        {transaction.category} · {transaction.date}
                      </small>
                    </div>

                    <div
                      className={`transaction-amount ${transaction.type}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>

                    <div className="transaction-actions">
                      <button
                        className="edit-btn"
                        title="Edit transaction"
                        onClick={() => editTransaction(transaction)}
                      >
                        ✏️
                      </button>

                      <button
                        className="delete-btn"
                        title="Delete transaction"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EXPENSE BREAKDOWN */}
          <div className="panel analytics-panel" id="analytics">
            <div className="panel-header">
              <div>
                <h2>Expense Breakdown</h2>
                <p>Spending by category</p>
              </div>
            </div>

            {categoryTotals.length === 0 ? (
              <div className="empty-state">
                Add expenses to see your breakdown.
              </div>
            ) : (
              <div className="category-list">
                {categoryTotals.map((category) => (
                  <div
                    className="category-item"
                    key={category.name}
                  >
                    <div className="category-heading">
                      <span>
                        {icons[category.name]} {category.name}
                      </span>

                      <strong>
                        {formatCurrency(category.amount)}
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(category.amount /
                            maxCategoryAmount) *
                            100
                            }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="analytics-footer">
              <div className="footer-icon">📊</div>

              <div>
                <strong>Expense insights</strong>

                <p>
                  You've spent {formatCurrency(expenses)} in total.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MONTHLY SPENDING CHART */}
        <section className="panel monthly-panel">
          <div className="panel-header">
            <div>
              <h2>Monthly Spending</h2>
              <p>Your expense trends over the last 6 months</p>
            </div>
          </div>

          <div className="monthly-chart">
            {monthlyData.map((month) => (
              <div className="chart-column" key={month.month}>
                <div className="chart-value">
                  {month.amount > 0
                    ? formatCurrency(month.amount)
                    : ""}
                </div>

                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(month.amount / maxMonthlyExpense) *
                        100
                        }%`,
                      minHeight:
                        month.amount > 0 ? "8px" : "0",
                    }}
                  />
                </div>

                <span className="chart-month">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </section>
        {/* MONTHLY FINANCIAL REPORTS */}
        <section className="panel reports-panel" id="reports">
          <div className="panel-header report-header">
            <div>
              <h2>Monthly Financial Report</h2>
              <p>Your financial summary and spending insights</p>
            </div>

            <select
              className="report-month-select"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
            >
              {availableReportMonths.map((month) => (
                <option key={month} value={month}>
                  {new Date(`${month}-01T00:00:00`).toLocaleString(
                    "en-IN",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </option>
              ))}
            </select>
          </div>

          <div className="report-summary-grid">
            <div className="report-card income-report">
              <span className="report-card-label">Total Income</span>
              <h3>{formatCurrency(reportIncome)}</h3>
              <span className="report-card-icon">💰</span>
            </div>

            <div className="report-card expense-report">
              <span className="report-card-label">Total Expenses</span>
              <h3>{formatCurrency(reportExpenses)}</h3>
              <span className="report-card-icon">💸</span>
            </div>

            <div className={`report-card savings-report ${reportSavings >= 0 ? "positive" : "negative"
              }`}>
              <span className="report-card-label">Net Savings</span>
              <h3>{formatCurrency(reportSavings)}</h3>
              <span className="report-card-icon">💵</span>
            </div>

            <div className="report-card rate-report">
              <span className="report-card-label">Savings Rate</span>
              <h3>{reportSavingsRate.toFixed(1)}%</h3>
              <span className="report-card-icon">📈</span>
            </div>
          </div>

          <div className="report-details-grid">
            <div className="report-detail-card">
              <h3>Income vs Expenses</h3>

              <div className="report-comparison">
                <div className="comparison-item">
                  <div className="comparison-label">
                    <span className="comparison-dot income-dot" />
                    Income
                  </div>

                  <strong>{formatCurrency(reportIncome)}</strong>

                  <div className="comparison-track">
                    <div
                      className="comparison-bar income-bar"
                      style={{
                        width: `${reportIncome + reportExpenses > 0
                          ? (reportIncome /
                            (reportIncome + reportExpenses)) *
                          100
                          : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="comparison-item">
                  <div className="comparison-label">
                    <span className="comparison-dot expense-dot" />
                    Expenses
                  </div>

                  <strong>{formatCurrency(reportExpenses)}</strong>

                  <div className="comparison-track">
                    <div
                      className="comparison-bar expense-bar"
                      style={{
                        width: `${reportIncome + reportExpenses > 0
                          ? (reportExpenses /
                            (reportIncome + reportExpenses)) *
                          100
                          : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="report-detail-card">
              <h3>Top Spending Category</h3>

              {highestSpendingCategory ? (
                <div className="top-category">
                  <div className="top-category-icon">
                    {icons[highestSpendingCategory.name] || "📦"}
                  </div>

                  <div>
                    <strong>{highestSpendingCategory.name}</strong>
                    <p>
                      {formatCurrency(
                        highestSpendingCategory.amount
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="report-empty">
                  No expenses recorded this month.
                </p>
              )}
            </div>
          </div>

          <div className="report-detail-card report-category-card">
            <h3>Category Breakdown</h3>

            {reportCategoryTotals.length === 0 ? (
              <div className="report-empty">
                No expenses for {reportMonthLabel}.
              </div>
            ) : (
              <div className="report-category-list">
                {reportCategoryTotals.map((category) => (
                  <div
                    className="report-category-item"
                    key={category.name}
                  >
                    <div className="report-category-heading">
                      <span>
                        {icons[category.name] || "📦"}{" "}
                        {category.name}
                      </span>

                      <strong>
                        {formatCurrency(category.amount)}
                      </strong>
                    </div>

                    <div className="report-category-track">
                      <div
                        className="report-category-bar"
                        style={{
                          width: `${reportExpenses > 0
                            ? (category.amount / reportExpenses) *
                            100
                            : 0
                            }%`,
                        }}
                      />
                    </div>

                    <span className="report-category-percent">
                      {reportExpenses > 0
                        ? (
                          (category.amount / reportExpenses) *
                          100
                        ).toFixed(1)
                        : 0}
                      % of expenses
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="report-insight">
            <span className="report-insight-icon">💡</span>

            <div>
              <strong>Monthly Insight</strong>

              <p>
                {reportIncome === 0 && reportExpenses === 0
                  ? `No transactions recorded for ${reportMonthLabel}.`
                  : reportSavings >= 0
                    ? `You saved ${formatCurrency(
                      reportSavings
                    )} during ${reportMonthLabel}. Your savings rate is ${reportSavingsRate.toFixed(
                      1
                    )}%.`
                    : `You spent ${formatCurrency(
                      Math.abs(reportSavings)
                    )} more than your income during ${reportMonthLabel}.`}
              </p>
            </div>
          </div>
        </section>
        {/* DATA MANAGEMENT */}
        <section className="panel data-management-panel">
          <div className="panel-header">
            <div>
              <h2>Data Management</h2>
              <p>Backup or restore your financial data</p>
            </div>
          </div>

          <div className="data-management-content">
            <div className="data-management-info">
              <div className="data-management-icon">💾</div>

              <div>
                <strong>Keep your data safe</strong>
                <p>
                  Create a backup of your transactions and budgets,
                  or restore your data from a previous backup.
                </p>
              </div>
            </div>

            <div className="data-management-actions">
              <button
                onClick={exportBackup}
                className="export-btn"
              >
                💾 Backup Data
              </button>

              <label className="export-btn restore-btn">
                📂 Restore Backup

                <input
                  type="file"
                  accept=".json"
                  onChange={restoreBackup}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </section>
        {/* BUDGET MANAGEMENT */}
        <section className="panel budgets-panel" id="budgets">
          <div className="panel-header">
            <div>
              <h2>Monthly Budgets</h2>
              <p>
                Manage your spending limits for{" "}
                {new Date().toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* BUDGET SUMMARY */}
          <div className="budget-summary-grid">
            <div className="budget-summary-card">
              <span>Total Budget</span>
              <h2>{formatCurrency(totalBudget)}</h2>
            </div>

            <div className="budget-summary-card">
              <span>Total Spent</span>
              <h2 className="red-text">
                {formatCurrency(totalBudgetSpent)}
              </h2>
            </div>

            <div className="budget-summary-card">
              <span>Remaining</span>
              <h2 className={totalBudgetRemaining < 0 ? "red-text" : "green-text"}>
                {formatCurrency(totalBudgetRemaining)}
              </h2>
            </div>
          </div>

          {/* ADD BUDGET FORM */}
          <form className="budget-form" onSubmit={handleBudgetSubmit}>
            <h3>Set Category Budget</h3>

            <div className="budget-form-grid">
              <label>
                Category
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {icons[category]} {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Monthly Limit (₹)
                <input
                  type="number"
                  min="1"
                  placeholder="Enter budget"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  required
                />
              </label>

              <button className="primary-btn" type="submit">
                Save Budget
              </button>
            </div>
          </form>

          {/* BUDGET LIST */}
          <div className="budget-list">
            {budgetData.filter((item) => item.budget > 0).length === 0 ? (
              <div className="empty-state">
                <p>No budgets set yet.</p>
                <p>Set a budget above to start tracking your spending.</p>
              </div>
            ) : (
              budgetData
                .filter((item) => item.budget > 0)
                .map((item) => (
                  <div className="budget-item" key={item.category}>
                    <div className="budget-item-header">
                      <div>
                        <strong>
                          {icons[item.category]} {item.category}
                        </strong>
                        <small>
                          {formatCurrency(item.spent)} of{" "}
                          {formatCurrency(item.budget)}
                        </small>
                      </div>

                      <button
                        className="delete-btn"
                        onClick={() => deleteBudget(item.category)}
                        title="Delete budget"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="budget-progress-track">
                      <div
                        className={`budget-progress-fill ${item.percentage >= 100
                          ? "over-budget"
                          : item.percentage >= 80
                            ? "warning-budget"
                            : ""
                          }`}
                        style={{
                          width: `${Math.min(item.percentage, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="budget-item-footer">
                      <span>
                        {Math.round(item.percentage)}% used
                      </span>

                      <strong
                        className={
                          item.remaining < 0
                            ? "red-text"
                            : item.remaining <= item.budget * 0.2
                              ? "warning-text"
                              : "green-text"
                        }
                      >
                        {item.remaining < 0
                          ? `${formatCurrency(Math.abs(item.remaining))} over budget`
                          : `${formatCurrency(item.remaining)} remaining`}
                      </strong>
                    </div>

                    {item.percentage >= 100 && (
                      <p className="budget-alert danger-alert">
                        ⚠️ You've exceeded this category's budget!
                      </p>
                    )}

                    {item.percentage >= 80 && item.percentage < 100 && (
                      <p className="budget-alert warning-alert">
                        ⚠️ You've used more than 80% of this budget.
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <span>© {new Date().getFullYear()} SpendWise</span>
          <span>Made with ❤️ to manage money smarter</span>
        </footer>
      </main>
    </div >
  );
}

export default App;