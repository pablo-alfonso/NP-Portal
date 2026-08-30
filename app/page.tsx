"use client";

import { useEffect, useMemo, useState } from "react";
import "./portal.css";
import { PortalNavigation } from "./components/PortalNavigation";
import { CorrectionEditor } from "./components/CorrectionEditor";

type Bill = {
  number: string; status: "Awaiting approval" | "Awaiting corrected draft" | "Awaiting final" | "Completed"; customerReference: string;
  product: string; receipt: string; loading: string; discharge: string; delivery: string; created: string;
};

const bills: Bill[] = [
  { number: "60232482", status: "Awaiting approval", customerReference: "538182", product: "Palm kernel fatty acid", receipt: "Emmerich, Germany", loading: "Antwerp, Belgium", discharge: "Yilport, Turkey", delivery: "Yilport, Turkey", created: "26 Aug 2026" },
  { number: "60659478", status: "Awaiting corrected draft", customerReference: "PL4-2601309", product: "Automotive components", receipt: "Rotterdam, Netherlands", loading: "Rotterdam, Netherlands", discharge: "Houston, USA", delivery: "Houston, USA", created: "25 Jun 2026" },
  { number: "60655690", status: "Completed", customerReference: "5601186", product: "PL 444", receipt: "Gonfreville-l'Orcher, France", loading: "Le Havre, France", discharge: "Jeddah, Saudi Arabia", delivery: "Jeddah, Saudi Arabia", created: "14 May 2026" },
  { number: "60655689", status: "Completed", customerReference: "5601185", product: "Base Oil SN500", receipt: "Antwerp, Belgium", loading: "Antwerp, Belgium", discharge: "Singapore, Singapore", delivery: "Singapore, Singapore", created: "14 May 2026" },
];

const columns: { label: string; key: keyof Bill }[] = [
  { label: "BL number", key: "number" }, { label: "Status", key: "status" }, { label: "Customer reference", key: "customerReference" },
  { label: "Product", key: "product" }, { label: "Place of receipt", key: "receipt" }, { label: "Port of loading", key: "loading" },
  { label: "Port of discharge", key: "discharge" }, { label: "Place of delivery", key: "delivery" }, { label: "Created", key: "created" },
];

function humanStatus(status: Bill["status"]) { return status.replace(/\b\w/g, letter => letter.toUpperCase()); }
function createdDateKey(value: string) {
  const [day, month, year] = value.split(" ");
  const months: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
  return `${year}-${months[month]}-${day.padStart(2, "0")}`;
}

function DetailPage({ bill, accountLabel, onBack, onApproved, onCorrectionsSubmitted }: { bill: Bill; accountLabel: string; onBack: () => void; onApproved: () => void; onCorrectionsSubmitted: () => void }) {
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [approved, setApproved] = useState(false);
  const [hasCorrections, setHasCorrections] = useState(false);
  const canApprove = bill.status === "Awaiting approval" && !approved && !hasCorrections;

  return <section className="detail-shell">
    <header className="topbar detail-accountbar"><span>Customer portal</span><button className="account">{accountLabel} ▾</button></header>
    <header className="detail-top" style={{ height: 52 }}>
      <button className="back" onClick={onBack}>←&nbsp; Back to Bills of Lading</button>
    </header>
    <div className="detail-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}><div><strong>Combined Transport Bill of Lading</strong><small>B/L no. {bill.number} · Draft 2 · Updated 26 Aug 2026</small></div><div className="detail-status" style={{ display: "flex", alignItems: "center", gap: 8 }}><span className={`status ${(approved ? "Awaiting final" : bill.status).replaceAll(" ", "-")}`}>{approved ? "Awaiting Final" : humanStatus(bill.status)}</span>{(approved || bill.status === "Awaiting final") && <span className="approved-chip">✓ Approved</span>}</div></div>
    <div className="split">
      <section className="pdf-area" aria-label="Bill of Lading document preview">
        <div className="zoom">− &nbsp;&nbsp; 72% &nbsp;&nbsp; + &nbsp;&nbsp; ⛶</div>
        <article className="paper">
          <div className="paper-logo">N <em>NewPort</em></div><h2>COMBINED TRANSPORT BILL OF LADING</h2>
          <div className="paper-grid"><span><b>Shipper</b><br />KLK EMMERICH GmbH<br />Düsseldorf, Germany</span><span><b>Booking no.</b><br />840083245</span><span><b>Bill of lading no.</b><br />{bill.number}</span><span><b>Consignee</b><br />LAM GLOBAL TASIMACILIK<br />Istanbul, Turkey</span><span><b>Port of loading</b><br />{bill.loading}</span><span><b>Port of discharge</b><br />{bill.discharge}</span></div>
          <div className="paper-lines" /><div className="watermark">DRAFT SEAWAY BILL OF LADING</div>
        </article>
      </section>
      <CorrectionEditor onChangesChange={setHasCorrections} onSubmitted={() => { onCorrectionsSubmitted(); onBack(); }} footerActions={<><button className="download">⇩&nbsp; Download PDF</button>{bill.status === "Awaiting approval" && !approved && <button className="approve-button" disabled={!canApprove} title={hasCorrections ? "Submit or discard your requested changes before approving." : undefined} onClick={() => setApprovalOpen(true)}>✓&nbsp; Approve</button>}</>} />
    </div>
    {approvalOpen && <div className="approval-overlay" role="dialog" aria-modal="true" aria-labelledby="approval-title">
      <section className="approval-dialog">
        <span className="eyebrow">APPROVE BILL OF LADING</span>
        <h2 id="approval-title">Approve this draft?</h2>
        <p>Please confirm that you have checked the Bill of Lading. Your approval will be sent to NewPort.</p>
        <label className="terms-check"><input type="checkbox" checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} /> <span>I agree to the <a href="#terms">Terms &amp; Agreement</a>.</span></label>
        <div className="approval-actions"><button className="secondary-action" onClick={() => { setApprovalOpen(false); setAcceptedTerms(false); }}>Cancel</button><button className="primary-action" disabled={!acceptedTerms} onClick={() => { onApproved(); setApproved(true); setApprovalOpen(false); }}>Approve Bill of Lading</button></div>
      </section>
    </div>}
    {approved && <div className="approval-overlay" role="status"><section className="approval-dialog approval-success"><span className="success-icon">✓</span><span className="eyebrow">APPROVAL SENT</span><h2>Thank you</h2><p>Your approval has been recorded. NewPort will receive the approval and continue the Bill of Lading process.</p><button className="primary-action" onClick={onBack}>Done</button></section></div>}
  </section>;
}

export default function Home() {
  const [selected, setSelected] = useState<Bill | null>(null);
  const [billList, setBillList] = useState<Bill[]>(bills);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Bill["status"] | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [loadingFilter, setLoadingFilter] = useState("");
  const [dischargeFilter, setDischargeFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [sort, setSort] = useState<keyof Bill>("created");
  const [ascending, setAscending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { setIsAdmin(localStorage.getItem("newport-demo-role") === "admin"); }, []);
  const setDemoRole = (admin: boolean) => { localStorage.setItem("newport-demo-role", admin ? "admin" : "customer"); setIsAdmin(admin); setAccountOpen(false); };
  const visibleBills = useMemo(() => billList.filter(bill => {
    const matchesSearch = Object.values(bill).join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    const created = createdDateKey(bill.created);
    const matchesFrom = !dateFrom || created >= dateFrom;
    const matchesTo = !dateTo || created <= dateTo;
    const matchesProduct = !productFilter || bill.product === productFilter;
    const matchesLoading = !loadingFilter || bill.loading === loadingFilter;
    const matchesDischarge = !dischargeFilter || bill.discharge === dischargeFilter;
    const matchesDelivery = !deliveryFilter || bill.delivery === deliveryFilter;
    return matchesSearch && matchesStatus && matchesFrom && matchesTo && matchesProduct && matchesLoading && matchesDischarge && matchesDelivery;
  }).sort((a, b) => {
    const result = sort === "created" ? createdDateKey(a.created).localeCompare(createdDateKey(b.created)) : String(a[sort]).localeCompare(String(b[sort])); return ascending ? result : -result;
  }), [billList, query, statusFilter, dateFrom, dateTo, productFilter, loadingFilter, dischargeFilter, deliveryFilter, sort, ascending]);
  const changeSort = (key: keyof Bill) => { if (sort === key) setAscending(value => !value); else { setSort(key); setAscending(key !== "created"); } };
  const optionsFor = (key: "product" | "loading" | "discharge" | "delivery") => [...new Set(billList.map((bill) => bill[key]))].sort();

  return <main className={`portal-shell ${collapsed ? "portal-collapsed" : ""}`}>
    <PortalNavigation isAdmin={isAdmin} active="bill" collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} onBillOfLading={() => setSelected(null)} />
    <section className="portal-content">
      {selected ? <DetailPage bill={selected} accountLabel={isAdmin ? "Pablo Alfonso · NewPort" : "Afton Chemicals"} onBack={() => setSelected(null)} onApproved={() => setBillList(current => current.map(item => item.number === selected.number ? { ...item, status: "Awaiting final" } : item))} onCorrectionsSubmitted={() => setBillList(current => current.map(item => item.number === selected.number ? { ...item, status: "Awaiting corrected draft" } : item))} /> : <>
        <header className="topbar"><span>Customer portal</span><div className="account-wrap"><button className="account" onClick={() => setAccountOpen(value => !value)}>{isAdmin ? "Pablo Alfonso · NewPort" : "Afton Chemicals"} ▾</button>{accountOpen && <div className="account-menu"><span>Demo account</span><button onClick={() => setDemoRole(false)}>Afton Chemicals<small>Customer portal</small></button><button onClick={() => setDemoRole(true)}>Pablo Alfonso<small>NewPort administrator</small></button></div>}</div></header>
        <section className="page"><div className="heading"><h1>Bill of Lading</h1><p>All drafts and issued Bills of Lading available to your organisation.</p></div>
          <div className="controls"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search BL number, customer reference, product…" /><button className={filtersOpen ? "filters-active" : ""} onClick={() => setFiltersOpen(value => !value)}>☷&nbsp; Filters</button></div>
          {filtersOpen && <section className="filter-panel" aria-label="Bill of Lading filters">
            <label>Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value as Bill["status"] | "all")}><option value="all">All statuses</option><option value="Awaiting approval">Awaiting approval</option><option value="Awaiting corrected draft">Awaiting corrected draft</option><option value="Awaiting final">Awaiting final</option><option value="Completed">Completed</option></select></label>
            <label>Created from<input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} /></label><label>Created to<input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} /></label>
            <label>Product<select value={productFilter} onChange={event => setProductFilter(event.target.value)}><option value="">All products</option>{optionsFor("product").map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Port of loading<select value={loadingFilter} onChange={event => setLoadingFilter(event.target.value)}><option value="">All ports</option>{optionsFor("loading").map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Port of discharge<select value={dischargeFilter} onChange={event => setDischargeFilter(event.target.value)}><option value="">All ports</option>{optionsFor("discharge").map(option => <option key={option}>{option}</option>)}</select></label>
            <label>Place of delivery<select value={deliveryFilter} onChange={event => setDeliveryFilter(event.target.value)}><option value="">All places</option>{optionsFor("delivery").map(option => <option key={option}>{option}</option>)}</select></label>
            <button className="clear-filters" onClick={() => { setStatusFilter("all"); setDateFrom(""); setDateTo(""); setProductFilter(""); setLoadingFilter(""); setDischargeFilter(""); setDeliveryFilter(""); }}>Reset filters</button>
          </section>}
          <div className="table-wrap"><table><thead><tr>{columns.map(column => <th key={column.key}><button onClick={() => changeSort(column.key)}>{column.label} <i>{sort === column.key ? (ascending ? "↑" : "↓") : "↕"}</i></button></th>)}</tr></thead><tbody>{visibleBills.map(bill => <tr key={bill.number}>{columns.map(column => <td key={column.key}>{column.key === "number" ? <button className="link" onClick={() => setSelected(bill)}>{bill.number}</button> : column.key === "status" ? <span className={`status ${bill.status.replaceAll(" ", "-")}`}>{humanStatus(bill.status)}</span> : bill[column.key]}</td>)}</tr>)}</tbody></table></div>
          <div className="table-footer"><span>Showing 1 to {visibleBills.length} of {visibleBills.length} entries</span><span>10 results per page ▾</span></div>
        </section>
      </>}
    </section>
  </main>;
}
