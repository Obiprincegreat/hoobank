import { useState } from "react";
import { RedirectToSignIn, Show, useUser } from "@clerk/react";
import DashboardSidebar, { navItems } from "./DashboardSidebar";
import AccountsPage from "./AccountsPage";

const transactionRows = [
  { merchant: "PlayStation", initials: "P", color: "text-white", card: "•••• 0224", date: "31 Mar, 3:20 PM", amount: "$19.99", mark: "◉" },
  { merchant: "Netflix", initials: "N", color: "text-red-500", card: "•••• 0224", date: "29 Mar, 5:11 PM", amount: "$30.00", mark: "N" },
  { merchant: "Airbnb", initials: "A", color: "text-rose-400", card: "•••• 4432", date: "29 Mar, 1:11 PM", amount: "$300.00", mark: "A" },
  { merchant: "Tommy C.", initials: "TC", color: "text-amber-200", card: "•••• 0224", date: "27 Mar, 2:31 AM", amount: "+$327.00", mark: "TC", incoming: true },
  { merchant: "Apple", initials: "●", color: "text-white", card: "•••• 4432", date: "27 Mar, 11:04 PM", amount: "$10.00", mark: "●" },
];

const Card = ({ children, className = "" }) => (
  <section className={`min-w-0 rounded-[18px] border border-white/[0.055] bg-[#0b0d17] shadow-[0_10px_28px_rgba(0,0,0,0.16)] ${className}`}>{children}</section>
);

const downloadCsv = (filename, headers, rows) => {
  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const content = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const sectionContent = {
  Transactions: { eyebrow: "ACTIVITY", title: "Transactions", description: "Review and search the latest activity across your accounts.", action: "Download CSV", stats: [["Total spent", "$5,275.10", "This month"], ["Money in", "$8,420.00", "This month"], ["Transactions", "44", "Across 4 accounts"]], rows: [["PlayStation", "•••• 0224", "Mar 31 · 3:20 PM", "−$19.99", "Completed"], ["Netflix", "•••• 0224", "Mar 29 · 5:11 PM", "−$30.00", "Completed"], ["Airbnb", "•••• 4432", "Mar 29 · 1:11 PM", "−$300.00", "Completed"], ["Tommy C.", "•••• 0224", "Mar 27 · 2:31 AM", "+$327.00", "Received"], ["Apple", "•••• 4432", "Mar 27 · 11:04 PM", "−$10.00", "Completed"]], columns: ["Merchant", "Account", "Date", "Amount", "Status"] },
  Reports: { eyebrow: "YOUR FINANCIAL PICTURE", title: "Reports", description: "Understand your cash flow and spending trends over time.", action: "Export report", stats: [["Income", "$8,420.00", "+8.4% vs last month"], ["Expenses", "$5,275.10", "−2.1% vs last month"], ["Net cash flow", "$3,144.90", "Positive this month"]], rows: [["Housing", "$1,850.00", "35%", "On track"], ["Food & dining", "$1,124.50", "21%", "On track"], ["Transport", "$680.20", "13%", "On track"], ["Shopping", "$920.40", "17%", "Review"], ["Subscriptions", "$180.00", "3%", "On track"]], columns: ["Category", "Spent", "Share", "Budget status"] },
};

const SectionPage = ({ name }) => {
  const section = sectionContent[name];
  const [filter, setFilter] = useState("");
  const [reportRange, setReportRange] = useState("6 months");
  const rows = section.rows.filter((row) => row.join(" ").toLowerCase().includes(filter.toLowerCase()));
  const exportData = () => {
    const headers = name === "Reports" ? ["Type", "Name", "Value", "Details", "Status"] : section.columns;
    const exportRows = name === "Reports"
      ? [...section.stats.map(([label, value, note]) => ["Summary", label, value, note, ""]), ...rows.map((row) => ["Category", ...row])]
      : rows;
    downloadCsv(`${name.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`, headers, exportRows);
  };
  return <div className="h-full overflow-y-auto pb-8 pr-1">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 font-poppins text-[9px] font-medium tracking-[0.2em] text-indigo-300">{section.eyebrow}</p><h2 className="font-poppins text-2xl font-semibold tracking-tight sm:text-[30px]">{name}</h2><p className="mt-2 max-w-xl font-poppins text-xs text-white/45 sm:text-sm">{section.description}</p></div>
      <button type="button" onClick={exportData} className="rounded-lg bg-gradient-to-r from-[#4b5bff] to-[#3157f6] px-4 py-2.5 font-poppins text-[11px] font-medium text-white hover:brightness-110">↓ {section.action}</button>
    </div>
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{section.stats.map(([label, value, note]) => <Card key={label} className="p-4"><p className="font-poppins text-[10px] text-white/45">{label}</p><p className="mt-2 font-poppins text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 font-poppins text-[9px] text-emerald-300/80">{note}</p></Card>)}</div>
    {name === "Reports" && <Card className="mb-5 p-4"><div className="flex items-center justify-between"><div><p className="font-poppins text-xs font-medium">Monthly cash flow</p><p className="mt-1 font-poppins text-[9px] text-white/40">Income compared with expenses</p></div><select aria-label="Report date range" value={reportRange} onChange={(event) => setReportRange(event.target.value)} className="rounded-md border border-white/[0.08] bg-[#171a25] px-2.5 py-1.5 font-poppins text-[9px] text-white/65 outline-none"><option>6 months</option><option>3 months</option></select></div><div className="mt-5 flex h-32 items-end gap-3 border-b border-white/[0.07] px-2">{[[65,38],[78,48],[54,43],[89,58],[72,49],[96,61]].slice(reportRange === "3 months" ? 3 : 0).map(([a,b],i)=><div key={i} className="flex h-full flex-1 items-end justify-center gap-1"><i style={{height:`${a}%`}} className="w-3 rounded-t bg-indigo-500/80"/><i style={{height:`${b}%`}} className="w-3 rounded-t bg-violet-400/40"/></div>)}</div><div className="mt-2 flex justify-between px-1 font-poppins text-[8px] text-white/35">{(reportRange === "3 months" ? ["Jan","Feb","Mar"] : ["Oct","Nov","Dec","Jan","Feb","Mar"]).map((m)=><span key={m}>{m}</span>)}</div></Card>}
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 p-4"><div><h3 className="font-poppins text-sm font-medium">{name === "Transactions" ? "Recent activity" : "Spending by category"}</h3><p className="mt-1 font-poppins text-[9px] text-white/40">{rows.length} {name === "Transactions" ? "transactions" : "records"}</p></div><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder={`Search ${name.toLowerCase()}…`} className="w-full rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 font-poppins text-[10px] text-white outline-none placeholder:text-white/30 focus:border-indigo-400/50 sm:w-48" /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left font-poppins text-[10px]"><thead className="bg-white/[0.025] text-[8px] uppercase tracking-wider text-white/35"><tr>{section.columns.map((column)=><th key={column} className="px-4 py-3 font-medium">{column}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={row.join("-")} className="border-t border-white/[0.055] text-white/65">{row.map((cell,i)=><td key={cell+i} className={`px-4 py-3.5 ${i===0 ? "font-medium text-white/90" : ""} ${cell.startsWith("+") ? "text-emerald-300" : ""}`}><span className={i===row.length-1 && ["Active","Completed","Received","Ready","On track"].includes(cell) ? "rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] text-emerald-300" : ""}>{cell}</span></td>)}</tr>)}{!rows.length && <tr><td colSpan={section.columns.length} className="px-4 py-10 text-center text-white/40">No matching records.</td></tr>}</tbody></table></div>
    </Card>
  </div>;
};

const TransactionRow = ({ item }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-white/[0.045] px-3 py-[9px] text-[10px] sm:grid-cols-[minmax(90px,1.15fr)_minmax(70px,0.85fr)_minmax(96px,1fr)_58px] sm:text-[11px]">
    <div className="flex min-w-0 items-center gap-2.5">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.075] text-[11px] font-semibold ${item.color}`}>{item.mark}</span>
      <span className="truncate text-white/85">{item.merchant}</span>
    </div>
    <span className="hidden truncate text-white/40 sm:block">{item.card}</span>
    <span className="hidden truncate text-white/45 sm:block">{item.date}</span>
    <span className={`text-right tabular-nums ${item.incoming ? "text-emerald-400" : "text-white/75"}`}>{item.amount}</span>
  </div>
);

const DashboardView = () => {
  const { user } = useUser();
  const active = navItems.find(([label]) => label !== "Dashboard" && window.location.pathname.toLowerCase().includes(`/${label.toLowerCase()}`))?.[0] || "Dashboard";
  const [period, setPeriod] = useState("This Month");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("hoobank-theme") || "dark");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [transactionFilterOpen, setTransactionFilterOpen] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState("");
  const visibleTransactions = transactionRows.filter((item) => `${item.merchant} ${item.card} ${item.date} ${item.amount}`.toLowerCase().includes(transactionFilter.toLowerCase()));
  const initials = [user?.firstName, user?.lastName].filter(Boolean).map((part) => part[0]).join("").toUpperCase() || "HB";
  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();

  return (
    <main data-theme={theme} className="dashboard-shell min-h-screen bg-[#070811] text-white lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[198px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)]">
        <DashboardSidebar active={active} user={user} initials={initials} today={today} theme={theme}
          onToggleTheme={() => { const nextTheme = theme === "dark" ? "light" : "dark"; setTheme(nextTheme); window.localStorage.setItem("hoobank-theme", nextTheme); }}
          onOpenSettings={() => setSettingsOpen(true)} mobileOpen={mobileNavOpen} onToggleMobile={() => setMobileNavOpen(!mobileNavOpen)} />

        <section className="relative min-w-0 bg-[#0b0d16] px-3 py-3 sm:px-4 sm:py-4 lg:h-screen lg:overflow-y-auto lg:px-4 lg:py-4">
          {active === "Accounts" ? <AccountsPage holderName={user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "HooBank Account Holder"} /> : active === "Dashboard" ? <><div className="relative z-[2] mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="relative">
              <button type="button" onClick={() => setPeriodOpen(!periodOpen)} aria-expanded={periodOpen} className="flex items-center gap-2 rounded-lg bg-[#181b27] px-3 py-2 font-poppins text-[10px] text-white/85 hover:bg-[#202431]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>{period}<span className="text-white/40">⌄</span>
              </button>
              {periodOpen && <div className="absolute left-0 top-full mt-1 min-w-32 rounded-lg border border-white/10 bg-[#171a25] p-1 shadow-xl">{["This Month", "Last Month", "This Year"].map((label) => <button key={label} type="button" onClick={() => { setPeriod(label); setPeriodOpen(false); }} className="block w-full rounded-md px-3 py-2 text-left font-poppins text-[10px] text-white/75 hover:bg-white/[0.07]">{label}</button>)}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 lg:grid-cols-12 lg:gap-3">
            <Card className="dashboard-insight relative min-h-[210px] overflow-hidden p-4 sm:col-span-2 xl:col-span-4 lg:col-span-4 lg:min-h-0 lg:h-[min(36vh,236px)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_75%,rgba(68,80,255,0.72),transparent_46%),linear-gradient(135deg,#0a0d18_15%,#111627_60%,#080a12)]" />
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(133,147,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(133,147,255,.12) 1px, transparent 1px)", backgroundSize: "18px 18px", maskImage: "linear-gradient(to top right, black, transparent 75%)" }} />
              <div className="relative z-[1] flex h-full flex-col justify-between">
                <span className="self-start rounded-full border border-white/[0.12] bg-black/20 px-2.5 py-1 font-poppins text-[9px] text-white/85">Insights</span>
                <div>
                  <div className="mb-3 flex gap-1.5" aria-hidden="true"><i className="h-1.5 w-1.5 rounded-full bg-white"/><i className="h-1.5 w-1.5 rounded-full bg-white/30"/><i className="h-1.5 w-1.5 rounded-full bg-white/30"/><i className="h-1.5 w-1.5 rounded-full bg-white/30"/></div>
                  <p className="max-w-[245px] font-poppins text-[15px] font-medium leading-[1.35] text-white">Your transaction volume has increased by 5% since last month</p>
                </div>
              </div>
              <a href="/dashboard/reports" aria-label="View reports" title="View reports" className="absolute bottom-3 right-3 z-[1] grid h-7 w-7 place-items-center rounded-lg bg-black/35 text-white/85 hover:bg-black/55">↗</a>
            </Card>

            <Card className="min-h-[210px] p-4 sm:col-span-1 xl:col-span-4 lg:col-span-4 lg:min-h-0 lg:h-[min(36vh,236px)]">
              <div className="flex items-start justify-between"><h2 className="font-poppins text-sm font-medium text-white/90">Balance Overview</h2><a href="/dashboard/accounts" aria-label="Open accounts" title="Open accounts" className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-white/60 hover:text-white">↗</a></div>
              <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1"><span className="font-poppins text-[15px] font-semibold tabular-nums">$155,045</span><span className="font-poppins text-[9px] text-emerald-400">↑ 12%</span><span className="font-poppins text-[9px] text-white/45">From last month</span></div>
              <div className="mt-2 flex gap-1.5"><span className="rounded-full bg-white/[0.07] px-2 py-1 font-poppins text-[8px] text-white/65">⇄ &nbsp;44 transactions</span><span className="rounded-full bg-white/[0.07] px-2 py-1 font-poppins text-[8px] text-white/65">◇ &nbsp;12 categories</span></div>
              <div className="mt-3 h-[76px] border-b border-white/[0.06]">
                <svg viewBox="0 0 360 80" preserveAspectRatio="none" className="h-full w-full">
                  <defs><linearGradient id="balanceFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#365cff" stopOpacity=".36"/><stop offset="1" stopColor="#365cff" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 54 C18 54 20 47 36 49 S59 61 77 52 S100 45 115 49 S142 63 160 50 S186 42 201 47 S227 53 244 43 S272 46 286 35 S313 45 326 32 S346 37 360 25 V80 H0Z" fill="url(#balanceFill)"/>
                  <path d="M0 54 C18 54 20 47 36 49 S59 61 77 52 S100 45 115 49 S142 63 160 50 S186 42 201 47 S227 53 244 43 S272 46 286 35 S313 45 326 32 S346 37 360 25" fill="none" stroke="#4965ff" strokeWidth="2"/>
                </svg>
              </div>
              <div className="mt-1 flex justify-between font-poppins text-[7px] text-white/35"><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span></div>
            </Card>

            <Card className="min-h-[210px] p-4 sm:col-span-1 xl:col-span-4 lg:col-span-4 lg:min-h-0 lg:h-[min(36vh,236px)]">
              <div className="flex items-start justify-between"><h2 className="font-poppins text-sm font-medium text-white/90">Earnings</h2><a href="/dashboard/reports" aria-label="Open reports" title="Open reports" className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-white/60 hover:text-white">↗</a></div>
              <div className="mt-3 flex items-center gap-2"><span className="font-poppins text-[15px] font-semibold tabular-nums">$155,045</span><span className="font-poppins text-[9px] text-emerald-400">↑ 7%</span><span className="font-poppins text-[9px] text-white/45">From last month</span></div>
              <div className="relative mx-auto mt-2 h-[105px] max-w-[220px] overflow-hidden">
                <svg viewBox="0 0 220 125" className="h-[125px] w-full" aria-label="58 percent of monthly goal">
                  <path d="M18 112 A92 92 0 0 1 202 112" fill="none" stroke="#343847" strokeWidth="18" strokeLinecap="round" />
                  <path d="M18 112 A92 92 0 0 1 150 25" fill="none" stroke="#365cff" strokeWidth="18" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-x-0 bottom-0 text-center"><p className="font-poppins text-[9px] text-white/45">Percentage</p><p className="font-poppins text-base font-semibold">58%</p></div>
              </div>
              <div className="mt-0.5 flex justify-center gap-4 font-poppins text-[8px] text-white/45"><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#365cff]"/>Current</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#555967]"/>Month goal</span></div>
            </Card>

            <Card className="min-h-[230px] overflow-hidden p-4 sm:col-span-2 xl:col-span-8 lg:col-span-8 lg:min-h-0 lg:h-[min(36vh,236px)] lg:flex lg:flex-col">
              <div className="mb-2 flex items-center justify-between"><h2 className="font-poppins text-sm font-medium text-white/90">Transactions</h2><div className="flex gap-1.5"><button type="button" onClick={() => setTransactionFilterOpen(!transactionFilterOpen)} aria-label="Filter transactions" aria-expanded={transactionFilterOpen} title="Filter transactions" className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-white/60 hover:text-white">☰</button><a href="/dashboard/transactions" aria-label="Open all transactions" title="Open all transactions" className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-white/60 hover:text-white">↗</a></div></div>
              {transactionFilterOpen && <input autoFocus value={transactionFilter} onChange={(event) => setTransactionFilter(event.target.value)} placeholder="Filter merchant, card or amount" aria-label="Filter transactions" className="mb-2 w-full rounded-lg border border-white/[0.1] bg-white/[0.035] px-3 py-2 font-poppins text-[10px] text-white outline-none placeholder:text-white/35 focus:border-indigo-400/50" />}
              <div className="hidden grid-cols-[minmax(90px,1.15fr)_minmax(70px,0.85fr)_minmax(96px,1fr)_58px] gap-2 px-3 pb-1 font-poppins text-[8px] uppercase tracking-wide text-white/30 sm:grid"><span>Merchant</span><span>Card</span><span>Date</span><span className="text-right">Amount</span></div>
              <div className="sm:hidden">{visibleTransactions.slice(0, 3).map((item) => <TransactionRow key={item.merchant} item={item} />)}</div>
              <div className="hidden min-h-0 flex-1 overflow-y-auto sm:block">{visibleTransactions.map((item) => <TransactionRow key={item.merchant} item={item} />)}</div>
              {visibleTransactions.length === 0 && <p className="py-5 text-center font-poppins text-[10px] text-white/40">No matching transactions.</p>}
            </Card>

            <Card className="min-h-[230px] p-4 sm:col-span-2 xl:col-span-4 lg:col-span-4 lg:min-h-0 lg:h-[min(36vh,236px)]">
              <div className="flex items-start justify-between"><h2 className="font-poppins text-sm font-medium text-white/90">Spending</h2><a href="/dashboard/reports" aria-label="Open spending report" title="Open spending report" className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-white/60 hover:text-white">↗</a></div>
              <div className="mt-3 flex items-center gap-2"><span className="font-poppins text-[14px] font-semibold tabular-nums">$5,275.10</span><span className="font-poppins text-[9px] text-rose-400">↓ 2%</span><span className="font-poppins text-[9px] text-white/45">From last month</span></div>
              <div className="relative mt-3 h-[91px] overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 flex h-[70px] items-end gap-1.5 opacity-70">
                  {[20, 34, 27, 42, 25, 51, 34, 61, 39, 31, 55, 43, 68, 49, 36, 58, 46, 63, 41, 53, 72, 44, 62, 48].map((height, index) => <i key={index} style={{ height: `${height}%` }} className={`flex-1 rounded-t-[2px] ${index > 15 ? "bg-[#31364a]" : "bg-[#272c3e]"}`} />)}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/[0.08]" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[8px]">
                {["Clothing", "Groceries", "Pets", "Bills"].map((category, index) => <span key={category} className="text-white/45"><i className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${["bg-indigo-400", "bg-amber-400", "bg-rose-400", "bg-emerald-400"][index]}`} />{category}</span>)}
                <div className="ml-auto flex gap-1"><span className="rounded-md bg-white/[0.06] px-1.5 py-1 text-white/60">⌂</span><span className="rounded-md bg-white/[0.06] px-1.5 py-1 text-white/60">▤</span><span className="rounded-md bg-white/[0.06] px-1.5 py-1 text-white/60">♧</span><span className="rounded-md bg-white/[0.06] px-1.5 py-1 text-white/60">+8</span></div>
              </div>
            </Card>
          </div></> : <SectionPage name={active} />}
        </section>
      </div>
      {settingsOpen && <div className="fixed inset-0 z-30 grid place-items-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="settings-title" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111522] p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between"><div><p className="font-poppins text-[9px] uppercase tracking-[0.18em] text-indigo-300">Preferences</p><h2 id="settings-title" className="mt-1 font-poppins text-lg font-semibold">Settings</h2></div><button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings" className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-white/65 hover:text-white">×</button></div>
          <div className="mt-6"><p className="font-poppins text-xs font-medium">Appearance</p><p className="mt-1 font-poppins text-[10px] text-white/45">Choose how HooBank looks on this device.</p><div className="mt-3 grid grid-cols-2 gap-2">{["dark", "light"].map((option) => <button key={option} type="button" onClick={() => { setTheme(option); window.localStorage.setItem("hoobank-theme", option); }} aria-pressed={theme === option} className={`rounded-xl border p-3 text-left font-poppins text-[11px] capitalize ${theme === option ? "border-indigo-400 bg-indigo-500/10 text-white" : "border-white/[0.08] bg-white/[0.025] text-white/60"}`}><span className="mb-2 block h-10 rounded-lg border border-white/10" style={{ background: option === "dark" ? "linear-gradient(135deg,#080a13 50%,#20243a 50%)" : "linear-gradient(135deg,#fff 50%,#e6e9f3 50%)" }} />{option} theme</button>)}</div></div>
          <p className="mt-5 border-t border-white/[0.07] pt-4 font-poppins text-[9px] text-white/35">Your appearance preference is saved on this device.</p>
        </section>
      </div>}
    </main>
  );
};

const Dashboard = () => (
  <Show when="signed-in" fallback={<Show when="signed-out"><RedirectToSignIn /></Show>}>
    <DashboardView />
  </Show>
);

export default Dashboard;
