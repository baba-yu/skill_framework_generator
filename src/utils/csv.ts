// CSV文字列を作る
export function toCsv(headers: string[], rows: (string | number)[][]): string {
    const esc = (v: string | number) => {
      const s = (v ?? "").toString();
      const needQuote = /[",\n\r]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needQuote ? `"${escaped}"` : escaped;
    };
    return [headers, ...rows].map(cols => cols.map(esc).join(",")).join("\r\n");
  }
  
  // CSVを即ダウンロードさせる
  export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  