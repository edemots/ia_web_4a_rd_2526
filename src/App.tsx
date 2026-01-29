import { useState } from "react";
import "./App.css";

const defaultFormValue = {
  label: "",
  amount: 0,
  date: new Date(),
  notes: "",
};

function App() {
  const [form, setForm] = useState(defaultFormValue);
  const [transactions, setTransactions] = useState(() =>
    JSON.parse(localStorage.getItem("transactions") ?? "[]"),
  );

  function createTransaction(e: React.SubmitEvent) {
    e.preventDefault();
    // On ajoute les données du formulaire aux anciennes transactions et on tri
    const newTransactions = [...transactions, form].sort((t1, t2) => {
        return t1.date - t2.date > 0 ? -1 : 1
    });
    // On modifie la clé transactions du localStorage avec les nouvelles valeurs
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
    // On modifie le state avec les nouvelles valeurs aussi
    setTransactions(newTransactions)
    // On reset le form avec les valeurs pas défaut
    setForm(defaultFormValue);
  }

  return (
    <>
      <form onSubmit={createTransaction}>
        {JSON.stringify(form)}

        <div>
          <label htmlFor="label">Libelle</label>
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
        </div>
        <div>
          <label htmlFor="amount">Montant</label>
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
        </div>
        <div>
          <label htmlFor="date">Date</label>
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
        </div>
        <div>
          <label htmlFor="notes">Notes</label>
          <textarea
            name="notes"
            id="notes"
            required
            value={form.notes}
            onChange={(e) => {
              setForm((form) => ({ ...form, notes: e.target.value }));
            }}
          ></textarea>
        </div>

        <button>Créer la transaction</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Libelle</th>
            <th>Montant €</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            return (
              <tr key={`${transaction.label}-${Number(new Date(transaction.date))}`}>
                <td>{transaction.label}</td>
                <td>{transaction.amount} €</td>
                <td>{new Date(transaction.date).toDateString()}</td>
                <td>{transaction.notes}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default App;
