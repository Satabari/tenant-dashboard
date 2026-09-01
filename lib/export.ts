export function exportUsageCSV(data: any): string {
  const headers = ["Module", "Spend", "Calls", "Cost Per Call"];
  const rows = data.usage.byModule.map((m: any) => [
    data.modules.find((mod: any) => mod.id === m.moduleId)?.name || m.moduleId,
    `$${(m.spendCents / 100).toFixed(2)}`,
    m.calls.toString(),
    `$${(m.spendCents / m.calls / 100).toFixed(4)}`,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDFReport(data: any): void {
  const report = `
USAGE REPORT
============
Tenant: ${data.tenant.name}
Plan: ${data.tenant.plan}
Period: ${data.usage.periodStart} to ${data.usage.periodEnd}

USAGE SUMMARY
=============
Total Spend: $${(data.usage.spendCents / 100).toFixed(2)}
Monthly Cap: $${(data.usage.capCents / 100).toFixed(2)}
Usage: ${Math.round((data.usage.spendCents / data.usage.capCents) * 100)}%

MODULE BREAKDOWN
================
${data.usage.byModule
  .map(
    (m: any) => `
${data.modules.find((mod: any) => mod.id === m.moduleId)?.name}:
  Spend: $${(m.spendCents / 100).toFixed(2)}
  Calls: ${m.calls.toLocaleString()}
  Cost/Call: $${(m.spendCents / m.calls / 100).toFixed(4)}
`
  )
  .join("\n")}
  `;

  const blob = new Blob([report], { type: "text/plain" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `usage-report-${Date.now()}.txt`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
