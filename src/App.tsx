import { useEffect, useState } from "react";
import "./App.css";
import TransactionRow from "./TransactionRow";

export type Category = {
  name: string;
  icon: string;
};

export type Transaction = {
  id: number;
  type: "expense" | "revenue";
  label: string;
  amount: number;
  date: Date;
  notes: string;
  category: Category;
};

const defaultFormValue = {
  type: "expense",
  label: "",
  amount: 0,
  date: new Date(),
  notes: "",
};

function App() {
  const [form, setForm] = useState(defaultFormValue);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    JSON.parse(localStorage.getItem("transactions") ?? "[]"),
  );

  /**
   * A chaque fois qu'on modifie `transactions`,
   * on les sauvegarde dans le localStorage par effet de bord
   */
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  function createTransaction(e: React.SubmitEvent) {
    e.preventDefault();
    const newTransaction = {
      id: Date.now(),
      ...form,
    } as Transaction;
    // On ajoute les données du formulaire aux anciennes transactions et on tri
    const newTransactions = [...transactions, newTransaction].sort((t1, t2) => {
      return +t1.date - +t2.date > 0 ? -1 : 1;
    });
    // On modifie le state avec les nouvelles valeurs aussi
    setTransactions(newTransactions);
    // On reset le form avec les valeurs pas défaut
    setForm(defaultFormValue);
  }

  async function categorizeTransaction(transaction: Transaction) {
    const context = JSON.stringify(transactions.slice(0, 20));

    const req = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "gpt-oss:20b",
        stream: false,
        prompt: `Tu es un outil de catégorisation de transactions bancaires, ton rôle est d'attribuer une catégorie pertinente pour une transaction donnée écrite en JSON.

          Attribue à cette transaction une catégorie : "${JSON.stringify(transaction)}".
          Utilise des catégories de la vie courante.
          Tu te baseras sur le libelle, le montant, le type de la transaction et les notes pour en déduire la catégorie.
          Tu attribueras à la catégorie trouvée un emoji pertinent représentant cette dernière.

          Base toi sur le contexte de mes 20 dernières transactions pour faire ta déduction et utiliser le plus possible les mêmes catégories pour des transactions similaires :
          "${context}".

          Renvoie uniquement du JSON pouvant être parsé sous le format suivant : { "name": string, "icon": string }, par exemple { "name": "Supermarché", "icon": "🛒" }`,
      }),
    });
    const res = await req.json();

    // Récupérer la clé response du retour api et parser le JSON
    const categoryFromResponse = JSON.parse(res.response) as Category;
    // Modifier la transaction à partir de la réponse
    setTransactions((oldTransactions) =>
      oldTransactions.map((oldTransaction) => {
        if (oldTransaction.id === transaction.id) {
          return {
            ...oldTransaction,
            category: categoryFromResponse,
          };
        }
        return oldTransaction;
      }),
    );
  }

  return (
    <>
      <form onSubmit={createTransaction}>
        <div>
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
        </div>
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
            value={form.notes}
            onChange={(e) => {
              setForm((form) => ({ ...form, notes: e.target.value }));
            }}
          />
        </div>

        <button type="submit">Créer la transaction</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Libelle</th>
            <th>Montant €</th>
            <th>Date</th>
            <th>Catégorie</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            return (
              <TransactionRow
                key={`${transaction.id}`}
                transaction={transaction}
                onTransactionChange={(data) => {
                  setTransactions((oldTransactions) =>
                    oldTransactions.map((oldTransaction) => {
                      if (oldTransaction.id === transaction.id) {
                        return {
                          ...oldTransaction,
                          ...data,
                        };
                      }
                      return oldTransaction;
                    }),
                  );
                }}
                onTransactionDelete={(transactionId) => {
                  setTransactions((oldTransactions) =>
                    oldTransactions.filter((t) => t.id !== transactionId),
                  );
                }}
                onCategorizeTransaction={categorizeTransaction}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default App;
