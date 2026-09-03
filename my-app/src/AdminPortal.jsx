import { useEffect, useState } from "react";
import "./AdminPortal.css";

function AdminPortal({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");

  // =========================
  // BILLING STATE
  // =========================

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [billItems, setBillItems] = useState([]);
  const [billLoading, setBillLoading] = useState(false);
  const [billMessage, setBillMessage] = useState("");


  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customers"
      );

      const data = await response.json();

      if (response.ok) {
        setCustomers(data.customers || []);
      } else {
        setCustomerError(
          data.message || "Failed to load customers"
        );
      }
    } catch (error) {
      console.error(error);

      setCustomerError(
        "Unable to connect to backend"
      );
    }
  };

  // Load customers when portal opens
  useEffect(() => {
    fetchCustomers();
  }, []);


  // =========================
  // ADD CUSTOMER
  // =========================

  const handleAddCustomer = async (e) => {
    e.preventDefault();

    setCustomerError("");

    if (!customerName.trim()) {
      setCustomerError("Please enter customer name");
      return;
    }

    if (!whatsappNumber.trim()) {
      setCustomerError(
        "Please enter WhatsApp number"
      );
      return;
    }

    if (!/^\d{10}$/.test(whatsappNumber.trim())) {
      setCustomerError(
        "Please enter a valid 10 digit WhatsApp number"
      );
      return;
    }

    try {
      setCustomerLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/customers",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: customerName.trim(),
            whatsappNumber:
              whatsappNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setCustomerError(
          data.message || "Failed to add customer"
        );
        return;
      }

      // Add new customer to list
      setCustomers((previous) => [
        data.customer,
        ...previous,
      ]);

      // Clear form
      setCustomerName("");
      setWhatsappNumber("");

      // Close popup
      setShowAddCustomer(false);

    } catch (error) {
      console.error(error);

      setCustomerError(
        "Unable to connect to backend"
      );
    } finally {
      setCustomerLoading(false);
    }
  };


  // =========================
  // DELETE CUSTOMER
  // =========================

  const handleDeleteCustomer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to delete customer"
        );
        return;
      }

      setCustomers((previous) =>
        previous.filter(
          (customer) =>
            customer._id !== id
        )
      );

    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to backend"
      );
    }
  };


  // =========================
  // NAVIGATION
  // =========================

  const handleNavigation = (page) => {
    setActivePage(page);

    if (page === "customers") {
      fetchCustomers();
    }
  };


  // =========================
  // FILTER CUSTOMERS
  // =========================

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customer.whatsappNumber.includes(search)
  );


  // =========================
  // SIDEBAR
  // =========================

  const renderSidebar = () => {
    return (
      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            B
          </div>

          <span>
            BizFlow
          </span>

        </div>


        <div className="sidebar-menu">

          <button
            className={`menu-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("dashboard")
            }
          >
            <span>▣</span>
            Dashboard
          </button>


          <button
            className={`menu-item ${
              activePage === "customers"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("customers")
            }
          >
            <span>👥</span>
            Customers
          </button>


          <button
            className={`menu-item ${
              activePage === "billing"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("billing")
            }
          >
            <span>🧾</span>
            Billing
          </button>


          <button
            className={`menu-item ${
              activePage === "messages"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("messages")
            }
          >
            <span>💬</span>
            Messages
          </button>


          <button
            className={`menu-item ${
              activePage === "history"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("history")
            }
          >
            <span>📋</span>
            History
          </button>


          <button
            className={`menu-item ${
              activePage === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

        </div>


        <div className="sidebar-bottom">

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>
    );
  };


  // =========================
  // TOPBAR
  // =========================

  const renderTopbar = (title, subtitle) => {
    return (
      <header className="topbar">

        <div>
          <h1>{title}</h1>

          <p>
            {subtitle}
          </p>
        </div>


        <div className="admin-profile">

          <div className="profile-avatar">
            {user?.username
              ?.charAt(0)
              .toUpperCase() || "A"}
          </div>

          <div className="profile-info">

            <strong>
              {user?.username || "Admin"}
            </strong>

            <span>
              {user?.role || "Admin"}
            </span>

          </div>

        </div>

      </header>
    );
  };


  // =========================
  // DASHBOARD
  // =========================

  const renderDashboard = () => {
    return (
      <>
        {renderTopbar(
          "Dashboard",
          "Manage your business from one place."
        )}


        <section className="welcome-card">

          <div>

            <span className="welcome-small">
              Welcome back
            </span>

            <h2>
              Hello, {user?.username || "Admin"} 👋
            </h2>

            <p>
              Here's what's happening with your
              business today.
            </p>

          </div>


          <div className="welcome-icon">
            B
          </div>

        </section>


        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div>
              <span>
                Total Customers
              </span>

              <h3>
                {customers.length}
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🧾
            </div>

            <div>
              <span>
                Total Bills
              </span>

              <h3>
                0
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              💬
            </div>

            <div>
              <span>
                Messages Sent
              </span>

              <h3>
                0
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>
                Delivered
              </span>

              <h3>
                0
              </h3>
            </div>

          </div>

        </section>


        <section className="dashboard-grid">

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h3>
                  Quick Actions
                </h3>

                <p>
                  Common business operations
                </p>
              </div>

            </div>


            <div className="quick-actions">

              <button
                className="action-card"
                onClick={() => {
                  setActivePage("customers");
                  setShowAddCustomer(true);
                }}
              >
                <div>👤</div>

                <span>
                  Add Customer
                </span>
              </button>


              <button
                className="action-card"
                onClick={() =>
                  setActivePage("billing")
                }
              >
                <div>🧾</div>

                <span>
                  Create Bill
                </span>
              </button>


              <button
                className="action-card"
                onClick={() =>
                  setActivePage("messages")
                }
              >
                <div>💬</div>

                <span>
                  Send Message
                </span>
              </button>

            </div>

          </div>


          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h3>
                  Recent Activity
                </h3>

                <p>
                  Your latest business activity
                </p>
              </div>

            </div>


            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h4>
                No activity yet
              </h4>

              <p>
                Your recent customers, bills and
                messages will appear here.
              </p>

            </div>

          </div>

        </section>
      </>
    );
  };


  // =========================
  // CUSTOMERS
  // =========================

  const renderCustomers = () => {
    return (
      <>
        {renderTopbar(
          "Customers",
          "Manage your business customers."
        )}


        <div className="page-toolbar">

          <div className="search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <button
            className="primary-btn"
            onClick={() => {
              setCustomerError("");
              setShowAddCustomer(true);
            }}
          >
            + Add Customer
          </button>

        </div>


        {customerError && (
          <div className="customer-error">
            {customerError}
          </div>
        )}


        <div className="customer-table-card">

          <div className="customer-table-header">

            <h3>
              Customer List
            </h3>

            <span>
              {customers.length} customers
            </span>

          </div>


          {filteredCustomers.length === 0 ? (

            <div className="customer-empty">

              <div className="customer-empty-icon">
                👥
              </div>

              <h3>
                No customers found
              </h3>

              <p>
                Add your first customer to get started.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  setShowAddCustomer(true)
                }
              >
                + Add Customer
              </button>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Customer Name</th>
                    <th>WhatsApp Number</th>
                    <th>Added On</th>
                    <th>Action</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredCustomers.map(
                    (customer) => (

                      <tr key={customer._id}>

                        <td>
                          <div className="customer-name-cell">

                            <div className="customer-avatar">
                              {customer.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {customer.name}
                            </strong>

                          </div>
                        </td>


                        <td>
                          +91 {customer.whatsappNumber}
                        </td>


                        <td>
                          {customer.createdAt
                            ? new Date(
                                customer.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>


                        <td>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteCustomer(
                                customer._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ADD CUSTOMER MODAL */}

        {showAddCustomer && (

          <div className="modal-overlay">

            <div className="modal-card">

              <div className="modal-header">

                <div>
                  <h2>
                    Add New Customer
                  </h2>

                  <p>
                    Save customer details for billing
                    and messaging.
                  </p>
                </div>


                <button
                  className="close-btn"
                  onClick={() =>
                    setShowAddCustomer(false)
                  }
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={handleAddCustomer}
              >

                <div className="modal-form-group">

                  <label>
                    Customer Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="modal-form-group">

                  <label>
                    WhatsApp Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter 10 digit number"
                    value={whatsappNumber}
                    onChange={(e) =>
                      setWhatsappNumber(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        ).slice(0, 10)
                      )
                    }
                  />

                </div>


                {customerError && (
                  <div className="modal-error">
                    {customerError}
                  </div>
                )}


                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowAddCustomer(false)
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={customerLoading}
                  >
                    {customerLoading
                      ? "Adding..."
                      : "Add Customer"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </>
    );
  };


  // =========================
// BILLING
// =========================

const addBillItem = () => {
  if (!productName.trim()) {
    setBillMessage("Please enter product name");
    return;
  }

  if (!quantity || Number(quantity) < 1) {
    setBillMessage("Please enter a valid quantity");
    return;
  }

  if (price === "" || Number(price) < 0) {
    setBillMessage("Please enter a valid price");
    return;
  }

  const item = {
    productName: productName.trim(),
    quantity: Number(quantity),
    price: Number(price),
    total: Number(quantity) * Number(price),
  };

  setBillItems((previous) => [...previous, item]);
  setProductName("");
  setQuantity(1);
  setPrice("");
  setBillMessage("");
};


const removeBillItem = (index) => {
  setBillItems((previous) =>
    previous.filter((_, i) => i !== index)
  );
};


const createBill = async () => {
  if (!selectedCustomer) {
    setBillMessage("Please select a customer");
    return;
  }

  if (billItems.length === 0) {
    setBillMessage("Please add at least one product");
    return;
  }

  const subtotal = billItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // Find selected customer
  const customer = customers.find(
    (c) => c._id === selectedCustomer
  );

  if (!customer) {
    setBillMessage("Customer details not found");
    return;
  }

  try {
    setBillLoading(true);
    setBillMessage("");

    // =========================
    // CREATE BILL
    // =========================

    const response = await fetch(
      "http://localhost:5000/api/bills",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: selectedCustomer,
          items: billItems,
          subtotal,
          grandTotal: subtotal,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setBillMessage(
        data.message || "Failed to create bill"
      );
      return;
    }

    console.log("Bill created:", data.bill);

    // =========================
    // CREATE WHATSAPP MESSAGE
    // =========================

    const whatsappMessage = `Hello ${customer.name} 👋

Your bill has been created successfully.

Bill Details:

${billItems
  .map(
    (item) =>
      `${item.productName} - Qty: ${item.quantity} - ₹${item.total.toFixed(2)}`
  )
  .join("\n")}

Grand Total: ₹${subtotal.toFixed(2)}

Thank you for choosing BizFlow!`;


    // =========================
    // SEND WHATSAPP MESSAGE
    // =========================

    const whatsappResponse = await fetch(
      "http://localhost:5000/api/whatsapp/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: `91${customer.whatsappNumber}`,
          message: whatsappMessage,
        }),
      }
    );

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error(
        "WhatsApp sending failed:",
        whatsappData
      );

      setBillMessage(
        "Bill created, but WhatsApp message failed ❌"
      );

      return;
    }

    console.log(
      "WhatsApp message sent:",
      whatsappData
    );


    // =========================
    // SUCCESS
    // =========================

    setBillMessage(
      "Bill created & WhatsApp message sent successfully! ✅"
    );

    setSelectedCustomer("");
    setProductName("");
    setQuantity(1);
    setPrice("");
    setBillItems([]);

  } catch (error) {
    console.error(
      "Create bill error:",
      error
    );

    setBillMessage(
      "Unable to connect to backend"
    );

  } finally {
    setBillLoading(false);
  }
};


const renderBilling = () => {
  const subtotal = billItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <>
      {renderTopbar(
        "Billing",
        "Create and manage customer bills."
      )}

      <div className="billing-container">

        <div className="billing-card">

          <h2>Create New Bill</h2>

          <p className="billing-subtitle">
            Select a customer and add products.
          </p>


          {billMessage && (
            <div className="customer-error">
              {billMessage}
            </div>
          )}


          {/* CUSTOMER */}

          <div className="billing-form-group">

            <label>Customer</label>

            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(
                  e.target.value
                );

                setBillMessage("");
              }}
            >

              <option value="">
                Select Customer
              </option>

              {customers.map((customer) => (

                <option
                  key={customer._id}
                  value={customer._id}
                >
                  {customer.name} - +91{" "}
                  {customer.whatsappNumber}
                </option>

              ))}

            </select>

          </div>


          {/* PRODUCT */}

          <div className="billing-product-row">

            <div className="billing-form-group">

              <label>
                Product Name
              </label>

              <input
                type="text"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
              />

            </div>


            {/* QUANTITY */}

            <div className="billing-form-group">

              <label>
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
              />

            </div>


            {/* PRICE */}

            <div className="billing-form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                min="0"
                placeholder="₹ Price"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ADD BUTTON */}

            <button
              type="button"
              className="primary-btn billing-add-btn"
              onClick={addBillItem}
            >
              + Add
            </button>

          </div>


          {/* BILL ITEMS */}

          {billItems.length > 0 && (

            <div className="billing-items">

              <h3>
                Bill Items
              </h3>


              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Product
                      </th>

                      <th>
                        Qty
                      </th>

                      <th>
                        Price
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {billItems.map(
                      (item, index) => (

                        <tr key={index}>

                          <td>
                            {item.productName}
                          </td>

                          <td>
                            {item.quantity}
                          </td>

                          <td>
                            ₹
                            {item.price.toFixed(
                              2
                            )}
                          </td>

                          <td>
                            ₹
                            {item.total.toFixed(
                              2
                            )}
                          </td>

                          <td>

                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                removeBillItem(
                                  index
                                )
                              }
                            >
                              Remove
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* GRAND TOTAL */}

          <div className="billing-total">

            <span>
              Grand Total
            </span>

            <strong>
              ₹{subtotal.toFixed(2)}
            </strong>

          </div>


          {/* CREATE BILL */}

          <button
            type="button"
            className="primary-btn billing-create-btn"
            onClick={createBill}
            disabled={billLoading}
          >

            {billLoading
              ? "Creating..."
              : "Create Bill"}

          </button>

        </div>

      </div>
    </>
  );
};


  // =========================
  // SETTINGS
  // =========================

  const renderSettings = () => {
    return (
      <>
        {renderTopbar(
          "Settings",
          "Manage your BizFlow account."
        )}

        <div className="coming-card">

          <div className="coming-icon">
            ⚙
          </div>

          <h2>
            Settings
          </h2>

          <p>
            Business profile and account settings
            will be available here.
          </p>

        </div>
      </>
    );
  };


  // =========================
  // PAGE RENDER
  // =========================

  return (
    <div className="admin-page">

      {renderSidebar()}


      <main className="main-content">

        {activePage === "dashboard" &&
          renderDashboard()}

        {activePage === "customers" &&
          renderCustomers()}

        {activePage === "billing" &&
          renderBilling()}

        {activePage === "messages" &&
          renderMessages()}

        {activePage === "history" &&
          renderHistory()}

        {activePage === "settings" &&
          renderSettings()}

      </main>

    </div>
  );
}

export default AdminPortal;