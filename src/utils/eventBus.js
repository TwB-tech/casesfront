// Global event bus for real-time data synchronization
// Uses CustomEvent on window for cross-component communication

const eventBus = {
  /**
   * Emit an event with optional data
   * @param {string} eventName - Name of the event
   * @param {object} data - Data to pass with the event
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
  },

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event
   * @param {function} callback - Function to call when event fires
   * @returns {function} Unsubscribe function
   */
  on(eventName, callback) {
    window.addEventListener(eventName, callback);
    // Return unsubscribe function
    return () => window.removeEventListener(eventName, callback);
  },

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {function} callback - Function to remove
   */
  off(eventName, callback) {
    window.removeEventListener(eventName, callback);
  },
};

// Standard event names
export const EVENT_NAMES = {
  // Tasks
  TASK_CREATED: 'taskCreated',
  TASK_UPDATED: 'taskUpdated',
  TASK_DELETED: 'taskDeleted',
  // Cases
  CASE_CREATED: 'caseCreated',
  CASE_UPDATED: 'caseUpdated',
  CASE_DELETED: 'caseDeleted',
  // Clients
  CLIENT_CREATED: 'clientCreated',
  CLIENT_UPDATED: 'clientUpdated',
  CLIENT_DELETED: 'clientDeleted',
  // Documents
  DOCUMENT_CREATED: 'documentCreated',
  DOCUMENT_UPDATED: 'documentUpdated',
  DOCUMENT_DELETED: 'documentDeleted',
  // Invoices
  INVOICE_CREATED: 'invoiceCreated',
  INVOICE_UPDATED: 'invoiceUpdated',
  INVOICE_DELETED: 'invoiceDeleted',
  // Expenses
  EXPENSE_CREATED: 'expenseCreated',
  EXPENSE_UPDATED: 'expenseUpdated',
  EXPENSE_DELETED: 'expenseDeleted',
  // Chats
  CHAT_MESSAGE_SENT: 'chatMessageSent',
};

export default eventBus;
