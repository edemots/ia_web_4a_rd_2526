import { useState, useTransition } from "react";
import type { Transaction } from "./App";

function TransactionRow({
  transaction,
  onTransactionChange,
  onTransactionDelete,
  onCategorizeTransaction,
}: {
  transaction: Transaction;
  onTransactionChange: (data: Omit<Transaction, "id">) => void;
  onTransactionDelete: (transactionId: number) => void;
  onCategorizeTransaction: (transaction: Transaction) => Promise<void>;
}) {
  // Permet de définir l'état d'une transaction lecture/modification
  const [editing, setEditing] = useState(false);
  // Permet de créer un état "d'attente" lorsqu'on catégorise une transaction
  const [isSearchingCategory, startSearchingCategory] = useTransition();

  /**
   * On défini les valeurs par défaut du formulaire
   */
  const [form, setForm] = useState(() => ({
    type: transaction.type, // expense | revenue
    label: transaction.label, // string
    amount: Number(transaction.amount), // number
    date: new Date(transaction.date), // Date
    category: transaction.category, // Category
    notes: transaction.notes, // string
  }));

  /**
   * Quand on valide la modification, on appelle `onTransactionChange` pour impacter
   * l'état du composant parent et on passe `editing` à false
   */
  function editTransaction() {
    onTransactionChange(form);
    setEditing(false);
  }

  function categorizeTransaction() {
    startSearchingCategory(async () => {
      await onCategorizeTransaction(transaction);
    });
  }

  if (editing) {
    return (
      <tr>
        <td>
          <label htmlFor="expense">Dépense</label>
          <input
            id="expense"
            type="radio"
            name="type"
            required
            checked={form.type === "expense"}
            onChange={() => {
              setForm((form) => ({ ...form, type: "expense" }));
            }}
          />
          <label htmlFor="revenue">Revenu</label>
          <input
            id="revenue"
            type="radio"
            name="type"
            required
            checked={form.type === "revenue"}
            onChange={() => {
              setForm((form) => ({ ...form, type: "revenue" }));
            }}
          />
        </td>
        <td>
          <input
            id="label"
            type="text"
            name="label"
            value={form.label}
            required
            onChange={(e) => {
              setForm((form) => ({ ...form, label: e.target.value }));
            }}
          />
        </td>
        <td>
          <input
            id="amount"
            type="number"
            name="amount"
            value={form.amount}
            required
            onChange={(e) => {
              setForm((form) => ({ ...form, amount: Number(e.target.value) }));
            }}
          />
        </td>
        <td>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date.toISOString().slice(0, 10)}
            required
            onChange={(e) => {
              setForm((form) => ({ ...form, date: new Date(e.target.value) }));
            }}
          />
        </td>
        <td></td>
        <td>
          <textarea
            name="notes"
            id="notes"
            value={form.notes}
            onChange={(e) => {
              setForm((form) => ({ ...form, notes: e.target.value }));
            }}
          />
        </td>
        <td>
          <button type="button" onClick={editTransaction}>
            💾
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{transaction.type === "expense" ? "Dépense" : "Revenu"}</td>
      <td>{transaction.label}</td>
      <td>{transaction.amount} €</td>
      <td>{new Date(transaction.date).toDateString()}</td>
      <td>
        {transaction.category ? (
          <p>
            {transaction.category.icon} {transaction.category.name}
          </p>
        ) : (
          <button
            type="button"
            disabled={isSearchingCategory}
            onClick={categorizeTransaction}
          >
            Catégoriser
          </button>
        )}
      </td>
      <td>{transaction.notes}</td>
      <td>
        <button type="button" onClick={() => setEditing(true)}>
          ✏️
        </button>
        <button
          type="button"
          onClick={() => onTransactionDelete(transaction.id)}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

export default TransactionRow;
