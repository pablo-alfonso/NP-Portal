"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalNavigation } from "../components/PortalNavigation";
import "./quotes.css";

type Status = "Draft" | "Requested" | "Proposed" | "Accepted" | "Declined" | "Cancelled" | "Closed";
type Quote = {
  id: string; quoteNumber: string; status: Status; created: string; deadline: string; expiry: string;
  customer: string; product: string; hazardous: string; commodity: string; activity: string; deliveryTerm: string;
  loadingPlace: string; loadingPort: string; dischargePort: string; dischargePlace: string;
  oceanFreight: string; thcOrigin: string; thcDestination: string; startTerm: string; endTerm: string;
  freeTimeOrigin: string; freeTimeDestination: string; baffled: string; minCapacity: string; maxCapacity: string;
  notes: string; comments: string[];
};
const template: Quote = {
  id: "132940", quoteNumber: "5229103", status: "Proposed", created: "21 Apr 2026", deadline: "30 Apr 2026", expiry: "31 Jul 2026",
  customer: "Dow Europe GmbH", product: "ORITES DS 270", hazardous: "No", commodity: "Chemical", activity: "Spot", deliveryTerm: "Door To Port",
  loadingPlace: "Dow Benelux B.V., Hoek", loadingPort: "Antwerp, Belgium", dischargePort: "Jubail, Saudi Arabia", dischargePlace: "Jubail, Saudi Arabia",
  oceanFreight: "Yes", thcOrigin: "No", thcDestination: "No", startTerm: "1 Feb 2026", endTerm: "30 Apr 2026",
  freeTimeOrigin: "7", freeTimeDestination: "8", baffled: "No", minCapacity: "26,000", maxCapacity: "26,000",
  notes: "", comments: [],
};
const seed: Quote[] = [
  template,
  { ...template, id: "132939", quoteNumber: "5229102", status: "Proposed", created: "21 Apr 2026" },
  { ...template, id: "132938", quoteNumber: "5229101", status: "Requested", created: "20 Apr 2026" },
  { ...template, id: "166722", quoteNumber: "5267773", status: "Accepted", created: "15 Jun 2026", product: "DOWANOL PMA Glycol Ether Acetate", dischargePort: "Gebze, Turkey", dischargePlace: "Gebze, Turkey", expiry: "30 Jun 2026" },
  { ...template, id: "166727", quoteNumber: "5267783", status: "Closed", created: "18 Jun 2026" },
  { ...template, id: "166726", quoteNumber: "—", status: "Cancelled", created: "18 Jun 2026" },
];
const storageKey = "newport-demo-quotes-v1";
const groups: { title: string; fields: { key: keyof Quote; label: string; required?: boolean; kind?: "select" | "date" | "text" | "textarea"; options?: string[] }[] }[] = [
  { title: "Product", fields: [
    { key: "customer", label: "Customer", required: true, kind: "select", options: ["Dow Europe GmbH", "Afton Chemicals", "BP"] },
    { key: "product", label: "Product", required: true }, { key: "hazardous", label: "Is it hazardous?", kind: "select", options: ["No", "Yes"] },
    { key: "commodity", label: "Commodity", required: true, kind: "select", options: ["Chemical", "Food", "Other"] },
  ] },
  { title: "Logistics", fields: [
    { key: "activity", label: "Activity", required: true, kind: "select", options: ["Spot", "Contract"] },
    { key: "deliveryTerm", label: "Delivery term", required: true, kind: "select", options: ["Door To Port", "Port To Port", "Door To Door", "Port To Door"] },
    { key: "loadingPlace", label: "Loading place", required: true }, { key: "loadingPort", label: "Port of loading", required: true },
    { key: "dischargePort", label: "Port of discharge", required: true }, { key: "dischargePlace", label: "Discharge place" },
    { key: "oceanFreight", label: "Ocean freight included", kind: "select", options: ["Yes", "No"] },
    { key: "thcOrigin", label: "THC included at origin", kind: "select", options: ["No", "Yes"] },
    { key: "thcDestination", label: "THC included at destination", kind: "select", options: ["No", "Yes"] },
  ] },
  { title: "Dates & days", fields: [
    { key: "startTerm", label: "Start term of quotation request" }, { key: "endTerm", label: "End term of quotation request" },
    { key: "freeTimeOrigin", label: "Preferred free time origin", required: true },
    { key: "freeTimeDestination", label: "Preferred free time destination", required: true },
  ] },
  { title: "Equipment specification", fields: [
    { key: "baffled", label: "Baffled", kind: "select", options: ["No", "Yes"] },
    { key: "minCapacity", label: "Minimum tank capacity" }, { key: "maxCapacity", label: "Maximum tank capacity" },
  ] },
  { title: "Additional information", fields: [{ key: "notes", label: "Additional information", kind: "textarea" }] },
];
type Modal = "request" | "accept" | "decline" | "cancel" | null;

export default function QuotesPage() {
  const [quotes, setQuotes] = useState(seed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"quote" | "initial" | "proposal">("quote");
  const [draft, setDraft] = useState<Quote>(template);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [sortAsc, setSortAsc] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [terms, setTerms] = useState(false);
  const [checked, setChecked] = useState(false);
  const [comment, setComment] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    setIsAdmin(localStorage.getItem("newport-demo-role") === "admin");
    try { const stored = localStorage.getItem(storageKey); if (stored) setQuotes(JSON.parse(stored)); } catch { /* Keep demo seed. */ }
  }, []);
  const save = (updated: Quote[]) => { setQuotes(updated); localStorage.setItem(storageKey, JSON.stringify(updated)); };
  const selected = quotes.find(item => item.id === selectedId);
  const visible = useMemo(() => quotes.filter(item =>
    (statusFilter === "All" || item.status === statusFilter) &&
    [item.id, item.quoteNumber, item.product, item.customer, item.loadingPort, item.dischargePort].join(" ").toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)), [quotes, query, statusFilter, sortAsc]);
  const open = (item: Quote) => { setSelectedId(item.id); setDraft(item); setEditing(item.status === "Draft"); setTab("quote"); setNotice(""); };
  const newDraft = (source?: Quote) => {
    const item = { ...(source || template), id: String(Date.now()), quoteNumber: "—", status: "Draft" as Status, created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), comments: [], notes: source?.notes || "" };
    save([item, ...quotes]); open(item); setEditing(true); setNotice(source ? "Quote request duplicated as a draft." : "New quote request draft created.");
  };
  const update = (key: keyof Quote, value: string) => setDraft(current => ({ ...current, [key]: value }));
  const persistDraft = (status?: Status) => {
    if (!selected) return;
    const item = { ...draft, status: status || draft.status };
    save(quotes.map(entry => entry.id === item.id ? item : entry));
    setDraft(item); setEditing(status === "Draft" || (!status && editing));
    setNotice(status === "Requested" ? "Quote request submitted in this demo." : "Draft saved on this device.");
  };
  const setStatus = (status: Status) => {
    if (!selected) return;
    const item = { ...selected, status };
    save(quotes.map(entry => entry.id === item.id ? item : entry)); setDraft(item); setModal(null); setTerms(false); setChecked(false);
    setNotice(status === "Accepted" ? "Proposal accepted in this demo. You can now request a booking." : `Proposal ${status.toLowerCase()} in this demo.`);
  };
  const addComment = () => {
    if (!selected || !comment.trim()) return;
    const item = { ...selected, comments: [...selected.comments, comment.trim()] };
    save(quotes.map(entry => entry.id === item.id ? item : entry)); setComment(""); setCommentOpen(false); setNotice("Comment added to this demo request.");
  };
  return <main className={`portal-shell quote-shell ${collapsed ? "portal-collapsed" : ""}`}>
    <PortalNavigation isAdmin={isAdmin} active="quotes" collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
    <section className="portal-content">
      <header className="topbar"><span>Customer portal <small className="demo-mark">Interactive demo · no NILS connection</small></span><span className="quote-account">{isAdmin ? "Pablo Alfonso · NewPort" : "Afton Chemicals"} ▾</span></header>
      {!selected ? <section className="quote-page">
        <div className="quote-heading"><div><span className="quote-eyebrow">CUSTOMER WORKSPACE</span><h1>Quotes</h1><p>Request a quote, review proposals and follow your quotation requests.</p></div><button className="quote-primary" onClick={() => newDraft()}>+ Request new quote</button></div>
        <div className="quote-controls"><input aria-label="Search quotes" placeholder="Search request, quote, product or port…" value={query} onChange={event => setQuery(event.target.value)} /><button onClick={() => setFiltersOpen(value => !value)}>☷ Filters</button></div>
        {filtersOpen && <div className="quote-filters"><label>Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value as Status | "All")}><option>All</option>{(["Draft", "Requested", "Proposed", "Accepted", "Declined", "Cancelled", "Closed"] as Status[]).map(value => <option key={value}>{value}</option>)}</select></label><button onClick={() => { setStatusFilter("All"); setQuery(""); }}>Reset filters</button></div>}
        <div className="quote-table-wrap"><table className="quote-table"><thead><tr><th><button onClick={() => setSortAsc(value => !value)}>Request ID {sortAsc ? "↑" : "↓"}</button></th><th>Quote no.</th><th>Status</th><th>Product</th><th>Commodity</th><th>Activity</th><th>Loading place</th><th>Port of loading</th><th>Port of discharge</th><th>Discharge place</th><th>Delivery term</th><th>Expiry</th><th>Comments</th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><button className="quote-link" onClick={() => open(item)}>{item.status === "Draft" ? "Draft" : item.id}</button></td><td>{item.quoteNumber}</td><td><span className={`quote-status status-${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.product}</td><td>{item.commodity}</td><td>{item.activity}</td><td>{item.loadingPlace}</td><td>{item.loadingPort}</td><td>{item.dischargePort}</td><td>{item.dischargePlace}</td><td>{item.deliveryTerm}</td><td>{item.expiry}</td><td>{item.comments.length}</td></tr>)}</tbody></table></div><p className="quote-count">Showing {visible.length} of {quotes.length} quotation requests</p>
      </section> : <section className="quote-page">
        <button className="quote-back" onClick={() => { setSelectedId(null); setEditing(false); }}>← Back to Quotes</button>
        <div className="quote-heading detail"><div><span className="quote-eyebrow">QUOTATION REQUEST</span><h1>{selected.status === "Draft" ? "New quote request" : `Request #${selected.id}`}</h1><p>Quote no. {selected.quoteNumber} · Created {selected.created} · Proposal deadline {selected.deadline}</p></div><span className={`quote-status status-${selected.status.toLowerCase()}`}>{selected.status}</span></div>
        {notice && <div className="quote-notice" role="status">✓ {notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
        <div className="quote-actions"><button onClick={() => newDraft(selected)}>Duplicate as draft</button>{selected.status === "Requested" && <button className="danger-outline" onClick={() => setModal("cancel")}>Cancel request</button>}{selected.status === "Proposed" && <><button className="quote-primary" onClick={() => setModal("accept")}>Accept proposal</button><button className="danger-outline" onClick={() => setModal("decline")}>Decline proposal</button><button onClick={() => setTab("proposal")}>View proposal</button></>}{selected.status === "Accepted" && <button className="quote-primary" onClick={() => setNotice("Booking creation is the next customer module to build.")}>Create booking →</button>}</div>
        <nav className="quote-tabs" aria-label="Quote detail tabs"><button className={tab === "quote" ? "active" : ""} onClick={() => setTab("quote")}>Quote request</button>{selected.quoteNumber !== "—" && <button className={tab === "initial" ? "active" : ""} onClick={() => setTab("initial")}>Initial request</button>}{selected.status === "Proposed" || selected.status === "Accepted" || selected.status === "Declined" ? <button className={tab === "proposal" ? "active" : ""} onClick={() => setTab("proposal")}>Proposal</button> : null}</nav>
        {tab === "proposal" ? <article className="proposal-card"><div className="proposal-banner"><span>NewPort</span><strong>QUOTATION · {selected.quoteNumber}</strong></div><div className="proposal-grid"><div><small>CUSTOMER</small><b>{selected.customer}</b></div><div><small>PRODUCT</small><b>{selected.product}</b></div><div><small>ROUTE</small><b>{selected.loadingPort} → {selected.dischargePort}</b></div><div><small>VALID UNTIL</small><b>{selected.expiry}</b></div></div><h2>Our proposal</h2><p>This is a visual demo proposal based on the ACC workflow. The official quotation PDF and commercial rates will be supplied by NewPort/NILS in a future integration.</p><div className="proposal-placeholder">Official quotation PDF preview will appear here</div></article> :
        <div className="quote-groups">{groups.map(group => <section className="quote-group" key={group.title}><h2>{group.title}</h2><div className="quote-field-grid">{group.fields.map(field => <label key={field.key}><span>{field.label}{field.required && " *"}</span>{tab === "initial" || !editing ? <strong className="quote-field-value">{String(selected[field.key] || "—")}</strong> : field.kind === "select" ? <select value={String(draft[field.key])} onChange={event => update(field.key, event.target.value)}>{field.options?.map(option => <option key={option}>{option}</option>)}</select> : field.kind === "textarea" ? <textarea value={String(draft[field.key])} onChange={event => update(field.key, event.target.value)} /> : <input value={String(draft[field.key])} onChange={event => update(field.key, event.target.value)} />}</label>)}</div>{group.title === "Additional information" && <div className="quote-attachments"><span>Reference documents (demo)</span><label>Site / product safety requirements<input type="file" /></label><label>Material safety data sheet<input type="file" /></label><label>Other product documents<input type="file" /></label><small>Files are not uploaded or stored in this demo.</small></div>}</section>)}</div>}
        {tab === "quote" && editing && <div className="quote-footer"><button onClick={() => { setEditing(false); setDraft(selected); }}>Cancel</button><button onClick={() => persistDraft()}>Save draft</button><button className="quote-primary" onClick={() => setModal("request")}>Request quote</button></div>}
        <section className="quote-comments"><div><h2>Comments</h2><p>A conversation about this quotation request.</p></div><button onClick={() => setCommentOpen(true)}>+ New comment</button>{selected.comments.length ? selected.comments.map((entry, index) => <div className="quote-comment" key={index}><b>Afton Chemicals</b><p>{entry}</p></div>) : <div className="quote-empty">No comments yet</div>}</section>
      </section>}
    </section>
    {commentOpen && <div className="quote-modal-backdrop" role="dialog" aria-modal="true"><section className="quote-modal"><h2>New comment</h2><p>Add a note to this request.</p><textarea autoFocus value={comment} onChange={event => setComment(event.target.value)} /><div><button onClick={() => setCommentOpen(false)}>Cancel</button><button className="quote-primary" disabled={!comment.trim()} onClick={addComment}>Submit comment</button></div></section></div>}
    {modal && <div className="quote-modal-backdrop" role="dialog" aria-modal="true"><section className="quote-modal"><span className="quote-eyebrow">CONFIRM ACTION</span><h2>{modal === "request" ? "Request quote from NewPort?" : modal === "accept" ? "Accept proposal?" : modal === "decline" ? "Decline proposal?" : "Cancel this request?"}</h2><p>{modal === "request" ? "Check the details before sending your quotation request." : modal === "accept" ? "Confirm that you have reviewed the proposal and agree with the quotation terms." : "This changes the request status in the demo only."}</p>{modal === "accept" && <><label className="quote-check"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} /> I have checked the proposal details.</label><label className="quote-check"><input type="checkbox" checked={terms} onChange={event => setTerms(event.target.checked)} /> I agree to the terms & conditions.</label></>}<div><button onClick={() => { setModal(null); setChecked(false); setTerms(false); }}>Back</button><button className="quote-primary" disabled={modal === "accept" && (!checked || !terms)} onClick={() => { if (modal === "request") { persistDraft("Requested"); setModal(null); } else setStatus(modal === "accept" ? "Accepted" : modal === "decline" ? "Declined" : "Cancelled"); }}>Confirm {modal}</button></div></section></div>}
  </main>;
}
