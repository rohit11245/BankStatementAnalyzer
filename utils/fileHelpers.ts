import { Transaction } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file as base64 string"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateCSV = (transactions: Transaction[]): string => {
  const headers = [
    "transaction_date",
    "transaction_title_or_description",
    "amount",
    "notes",
  ];

  const rows = transactions.map((t) => {
    return [
      t.transaction_date,
      t.transaction_title_or_description,
      t.amount.toString(),
      t.notes || "",
    ]
      .map((field) => {
        // Escape quotes by doubling them, and wrap field in quotes if it contains commas, quotes or newlines
        const stringField = String(field);
        if (
          stringField.includes(",") ||
          stringField.includes('"') ||
          stringField.includes("\n")
        ) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      })
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

export const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
