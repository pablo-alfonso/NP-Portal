"use client";

import { useEffect, useState, type ReactNode } from "react";
import "./correction-editor.css";

type Step = "Parties" | "Routing" | "Cargo details" | "Container & weights" | "References";

const steps: Step[] = ["Parties", "Routing", "Cargo details", "Container & weights", "References"];

function ChangeNotice({ onUndo }: { onUndo: () => void }) {
  return <div className="field-change"><small>● Changed in this session</small><button type="button" onClick={onUndo}>Undo</button></div>;
}

function SelectField({ label, value, options = [value], onChange }: { label: string; value: string; options?: string[]; onChange: (active?: boolean, label?: string, from?: string, to?: string) => void }) {
  const [selected, setSelected] = useState(value); const [edited, setEdited] = useState(false);
  const update = (next: string) => { const active = next !== value; if (active !== edited) onChange(active, label, value, next); setEdited(active); setSelected(next); };
  return <label className={`bl-field ${edited ? "is-changed" : ""}`}><span>{label}</span><select value={selected} onChange={event => update(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select>{edited && <ChangeNotice onUndo={() => update(value)} />}</label>;
}

function LocationField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (active?: boolean, label?: string, from?: string, to?: string) => void }) {
  const [locations, setLocations] = useState(options); const [selected, setSelected] = useState(value); const [edited, setEdited] = useState(false); const [requestOpen, setRequestOpen] = useState(false); const [request, setRequest] = useState(""); const [proposed, setProposed] = useState(false);
  const update = (next: string, isProposed = false) => { const active = next !== value; if (active !== edited) onChange(active, label, value, next); setEdited(active); setSelected(next); setProposed(isProposed); };
  const addLocation = () => { const next = request.trim(); if (!next) return; setLocations(current => current.includes(next) ? current : [...current, next]); update(next, true); setRequestOpen(false); setRequest(""); };
  const undo = () => { setLocations(options); update(value); };
  return <div className={`bl-field location-field ${edited ? "is-changed" : ""}`}><span>{label}</span><select value={selected} onChange={event => update(event.target.value)}>{locations.map(option => <option key={option}>{option}</option>)}</select>{proposed && <small className="address-pending">● Proposed location — pending NewPort review</small>}{edited && <ChangeNotice onUndo={undo} />}<div className="address-actions"><button type="button" onClick={() => setRequestOpen(open => !open)}>+ Request new {label.toLowerCase()}</button></div>{requestOpen && <div className="address-request"><b>Request a new {label.toLowerCase()}</b><p>Enter the location you need. NewPort will review it with this correction request.</p><input value={request} onChange={event => setRequest(event.target.value)} placeholder="City, country" autoFocus /><div><button type="button" onClick={() => { setRequestOpen(false); setRequest(""); }}>Cancel</button><button type="button" disabled={!request.trim()} onClick={addLocation}>Add requested location</button></div></div>}</div>;
}

function InputField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (active?: boolean, label?: string, from?: string, to?: string) => void; type?: string }) {
  const [current, setCurrent] = useState(value); const [edited, setEdited] = useState(false);
  const update = (next: string) => { const active = next !== value; if (active !== edited) onChange(active, label, value, next); setEdited(active); setCurrent(next); };
  return <label className={`bl-field ${edited ? "is-changed" : ""}`}><span>{label}</span><input type={type} value={current} onChange={event => update(event.target.value)} />{edited && <ChangeNotice onUndo={() => update(value)} />}</label>;
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (active?: boolean, label?: string, from?: string, to?: string) => void }) {
  const [current, setCurrent] = useState(value); const [edited, setEdited] = useState(false);
  const update = (next: string) => { const active = next !== value; if (active !== edited) onChange(active, label, value, next); setEdited(active); setCurrent(next); };
  return <label className={`bl-field ${edited ? "is-changed" : ""}`}><span>{label}</span><textarea value={current} onChange={event => update(event.target.value)} />{edited && <ChangeNotice onUndo={() => update(value)} />}</label>;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <div className="bl-field"><span>{label}</span><div className="bl-readonly">{value}</div></div>;
}

function AddressField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (active?: boolean, label?: string, from?: string, to?: string) => void }) {
  const [address, setAddress] = useState(value);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [requested, setRequested] = useState(false);
  const [edited, setEdited] = useState(false);
  const matches = options.filter(option => option.toLowerCase().includes(search.toLowerCase()));
  const update = (next: string, isRequest = false) => { const active = next !== value; if (active !== edited) onChange(active, label, value, next); setEdited(active); setRequested(isRequest); setAddress(next); };
  const choose = (option: string) => { update(option); setShowSearch(false); setSearch(""); };
  return <div className={`bl-field bl-address ${edited ? "is-changed" : ""}`}><span>{label}</span>
    <textarea value={address} readOnly aria-label={label} />
    {requested && <small className="address-pending">● Proposed address — pending NewPort review</small>}
    {edited && <ChangeNotice onUndo={() => update(value)} />}
    <div className="address-actions"><button type="button" onClick={() => setShowSearch(open => !open)}>⌕&nbsp; Change address</button><button type="button" onClick={() => setRequestOpen(open => !open)}>{requested ? "Address request added" : "+ Request new address"}</button></div>
    {showSearch && <div className="address-search"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search available addresses…" autoFocus />
      <small>Only addresses available for this organisation are shown.</small>{matches.length ? matches.map(option => <button type="button" key={option} onClick={() => choose(option)}>{option}</button>) : <p>No matching address. Request a new address instead.</p>}
    </div>}
    {requestOpen && <div className="address-request"><b>Request a new or amended {label.toLowerCase()}</b><p>Enter the complete address and explain what needs to change. NewPort will review it with this correction request.</p><textarea value={requestText} onChange={event => setRequestText(event.target.value)} placeholder={"Company name\nStreet and number\nPostcode, city, country\n\nReason for request"} /><div><button type="button" onClick={() => { setRequestOpen(false); setRequestText(""); }}>Cancel</button><button type="button" disabled={!requestText.trim()} onClick={() => { update(requestText, true); setRequestOpen(false); }}>Add address request</button></div></div>}
  </div>;
}

function ToggleField({ label, checked, onChange, onValueChange }: { label: string; checked: boolean; onChange: (active?: boolean, label?: string, from?: string, to?: string) => void; onValueChange?: (value: boolean) => void }) {
  const [current, setCurrent] = useState(checked); const [edited, setEdited] = useState(false);
  const update = (next: boolean) => { const active = next !== checked; if (active !== edited) onChange(active, label, checked ? "Included" : "Not included", next ? "Included" : "Not included"); setEdited(active); setCurrent(next); onValueChange?.(next); };
  return <div className={`toggle-wrap ${edited ? "is-changed" : ""}`}><label className="bl-toggle"><input type="checkbox" checked={current} onChange={event => update(event.target.checked)} /><span aria-hidden="true" /><b>{label}</b></label>{edited && <ChangeNotice onUndo={() => update(checked)} />}</div>;
}

export function CorrectionEditor({ onChangesChange = () => {}, onSubmitted = () => {}, footerActions }: { onChangesChange?: (hasChanges: boolean) => void; onSubmitted?: () => void; footerActions?: ReactNode }) {
  const [resetKey, setResetKey] = useState(0);
  return <CorrectionEditorForm key={resetKey} onChangesChange={onChangesChange} onSubmitted={onSubmitted} footerActions={footerActions} onDiscard={() => setResetKey(key => key + 1)} />;
}

function CorrectionEditorForm({ onDiscard, onChangesChange, onSubmitted, footerActions }: { onDiscard: () => void; onChangesChange: (hasChanges: boolean) => void; onSubmitted: () => void; footerActions?: ReactNode }) {
  const [active, setActive] = useState<Step>("Parties");
  const [changedFields, setChangedFields] = useState<Record<string, { from: string; to: string }>>({});
  const [submissionStage, setSubmissionStage] = useState<"editing" | "review" | "submitted">("editing");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [includeTotalWeight, setIncludeTotalWeight] = useState(true);
  const [includeTareInGross, setIncludeTareInGross] = useState(true);
  const [includeProductVolume, setIncludeProductVolume] = useState(true);
  const [referenceVisibility, setReferenceVisibility] = useState({ customer: true, loading: true, customer2: true, discharge: false });
  const [separateBodyText, setSeparateBodyText] = useState(false);
  const changeEntries = Object.entries(changedFields);
  const changes = changeEntries.length;
  useEffect(() => { onChangesChange(changes > 0); }, [changes, onChangesChange]);
  const changed = (active = true, label = "Field", from = "", to = "") => setChangedFields(fields => { if (!active) { const { [label]: _, ...rest } = fields; return rest; } return { ...fields, [label]: { from, to } }; });
  const containerWeights = [{ nett: 20342, tare: 3395 }, { nett: 19880, tare: 3420 }];
  const totalNett = containerWeights.reduce((total, container) => total + container.nett, 0);
  const totalTare = containerWeights.reduce((total, container) => total + container.tare, 0);
  const totalGross = totalNett + (includeTareInGross ? totalTare : 0);
  const totalProductVolume = 22602.222 + 22084.778;
  const reviewOverlay = <div className="submission-overlay"><div className="submission-dialog"><div className="bl-editor-intro"><b>REVIEW CORRECTIONS</b><h1>Ready to submit?</h1><p>Review your {changes} requested change{changes === 1 ? "" : "s"}. NewPort will receive one consolidated request.</p></div><div className="submission-body"><div className="submission-summary"><b>Bill of Lading corrections</b>{changeEntries.map(([field, values]) => <details key={field}><summary>{field}</summary><div className="change-values"><span><small>Current value</small>{values.from}</span><span><small>Requested value</small>{values.to}</span></div></details>)}</div><label className="terms-check"><input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} /> <span>I agree to the <u>Terms &amp; Agreement</u>.</span></label></div><footer className="bl-editor-footer"><button onClick={() => setSubmissionStage("editing")}>Back to corrections</button><button className="primary" disabled={!termsAccepted} onClick={() => setSubmissionStage("submitted")}>Submit corrections</button></footer></div></div>;
  const successOverlay = <div className="submission-overlay"><div className="submission-dialog"><div className="submission-success"><i>✓</i><b>Corrections submitted</b><p>Your requested changes have been sent to NewPort for review. You will receive a confirmation by email.</p><button onClick={() => { onDiscard(); onSubmitted(); }}>Done</button></div></div></div>;

  return <section className="bl-editor" aria-label="Request corrections">
    <div className="bl-editor-intro">
      <b>REQUEST CORRECTIONS</b>
      <h1>What needs to change?</h1>
      <p>Update only the fields that are incorrect. The Bill of Lading remains visible for comparison.</p>
    </div>
    <div className="bl-editor-body">
      <nav className="bl-step-nav" aria-label="Correction sections">
        {steps.map((step, index) => <button key={step} className={active === step ? "active" : ""} onClick={() => setActive(step)}><i>{index + 1}</i><span>{step}</span></button>)}
      </nav>
      <div className="bl-fields">
        <section hidden={active !== "Parties"} className="editor-step-content">
          <h2>Parties</h2><p>Shipper, consignee and notify addresses</p>
          <div className="bl-field-grid">
            <AddressField label="Shipper" value={"KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany"} options={["KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany", "KLK OLEO GmbH\nHafenstraße 22\nDE-20457 Hamburg, Germany"]} onChange={changed} />
            <AddressField label="Consignee" value={"LAM GLOBAL TASIMACILIK COZUMLERI A.S.\nOMER AVNI MAH. INEBOLU SOK. NO:39/4\nHaktan Is Merkezi, Beyoglu, Turkey"} options={["LAM GLOBAL TASIMACILIK COZUMLERI A.S.\nOMER AVNI MAH. INEBOLU SOK. NO:39/4\nHaktan Is Merkezi, Beyoglu, Turkey", "LAM GLOBAL TASIMACILIK COZUMLERI A.S.\nAmbarli Liman Mah. 1. Cadde\nIstanbul, Turkey"]} onChange={changed} />
            <AddressField label="Notify party" value={"KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany"} options={["KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany", "KLK OLEO GmbH\nHafenstraße 22\nDE-20457 Hamburg, Germany"]} onChange={changed} />
            <AddressField label="Second notify party" value={"KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany"} options={["KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany", "Not included"]} onChange={changed} />
            <AddressField label="Export agent" value={"KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany"} options={["KLK EMMERICH GmbH\n37 Halbuschstr. - Tor 4\nDE-40591 Düsseldorf, Germany", "NewPort Tank Containers B.V.\nWaalhaven Zuidzijde 1\nNL-3089 JH Rotterdam, Netherlands"]} onChange={changed} />
            <ReadOnlyField label="Import agent" value="LAM GLOBAL TASIMACILIK COZUMLERI A.S. · OMER AVNI MAH. INEBOLU SOK. NO:39/4 · Haktan Is Merkezi, Beyoglu, Turkey" />
            <ReadOnlyField label="Additional detail" value="Managed by NewPort operational team" />
          </div>
        </section>
        <section hidden={active !== "Routing"} className="editor-step-content">
          <h2>Routing</h2><p>Movement details for this Bill of Lading</p>
          <div className="route-flow">
            <div className="route-stop"><span className="route-icon">▰</span><LocationField label="Place of receipt" value="Emmerich, Germany" options={["Emmerich, Germany", "Düsseldorf, Germany"]} onChange={changed} /></div>
            <div className="route-stop"><span className="route-icon">⚓</span><LocationField label="Port of loading" value="Antwerp, Belgium" options={["Antwerp, Belgium", "Rotterdam, Netherlands"]} onChange={changed} /></div>
            <div className="route-stop"><span className="route-icon">⚓</span><LocationField label="Port of discharge" value="Yilport, Turkey" options={["Yilport, Turkey", "Istanbul, Turkey"]} onChange={changed} /></div>
            <div className="route-stop"><span className="route-icon">▰</span><LocationField label="Place of delivery" value="Yilport, Turkey" options={["Yilport, Turkey", "Istanbul, Turkey"]} onChange={changed} /></div>
          </div>
        </section>
        <section hidden={active !== "Cargo details"} className="editor-step-content">
          <h2>Cargo details</h2><p>Permitted general and product specification fields</p>
          <div className="bl-field-grid">
            <SelectField label="B/L type" value="Combined Transport" options={["Combined Transport", "Seaway"]} onChange={changed} />
            <InputField label="No. of original" value="0" type="number" onChange={changed} />
            <InputField label="No. of copy" value="4" type="number" onChange={changed} />
            <ReadOnlyField label="Chemical name" value="Fatty acids, C12-18 and C18-unsatd." />
            <SelectField label="Trade name" value="PALMERA B1220(E) (LIQUID) MB DISTILLED PALM KERNEL FATTY ACID" options={["PALMERA B1220(E) (LIQUID) MB DISTILLED PALM KERNEL FATTY ACID", "Alternative approved trade name"]} onChange={changed} />
            <SelectField label="HS code" value="HS" options={["HS", "CN"]} onChange={changed} />
            <InputField label="Code" value="38231910" onChange={changed} />
          </div>
        </section>
        <section hidden={active !== "Container & weights"} className="editor-step-content">
          <h2>Container & weights</h2><p>Weight and seal values are legally sensitive and remain read-only.</p>
          <div className="bl-toggle-grid">
            <ToggleField label="Include product volume" checked={true} onChange={changed} onValueChange={setIncludeProductVolume} />
            <ToggleField label="Include tare weight (in gross)" checked={true} onChange={changed} onValueChange={setIncludeTareInGross} />
            <ToggleField label="Include total weight" checked={true} onChange={changed} onValueChange={setIncludeTotalWeight} />
            <ToggleField label="Remove tare weight from B/L" checked={false} onChange={changed} />
          </div>
          <div className="container-list">
            <article className="container-card"><header><strong>Container 1</strong><span>SIMU2410290</span></header><div className="bl-field-grid"><SelectField label="Description" value="20 FT ISO TANKCONTAINER(S) - SAID TO CONTAIN" options={["20 FT ISO TANKCONTAINER(S) - SAID TO CONTAIN", "Alternative approved description"]} onChange={changed} /><ReadOnlyField label="Seal no." value="H481354 / H481355 / H481358" /><ReadOnlyField label="Nett weight" value="20,342.000 KGS" /><ReadOnlyField label="Tare weight" value="3,395.000 KGS" /><ReadOnlyField label="Gross weight" value={`${(containerWeights[0].nett + (includeTareInGross ? containerWeights[0].tare : 0)).toLocaleString("en-US")}.000 KGS`} />{includeProductVolume && <ReadOnlyField label="Product volume" value="22,602.222 LTR" />}</div></article>
            <article className="container-card"><header><strong>Container 2</strong><span>TGHU6241812</span></header><div className="bl-field-grid"><SelectField label="Description" value="20 FT ISO TANKCONTAINER(S) - SAID TO CONTAIN" options={["20 FT ISO TANKCONTAINER(S) - SAID TO CONTAIN", "Alternative approved description"]} onChange={changed} /><ReadOnlyField label="Seal no." value="H481359 / H481360" /><ReadOnlyField label="Nett weight" value="19,880.000 KGS" /><ReadOnlyField label="Tare weight" value="3,420.000 KGS" /><ReadOnlyField label="Gross weight" value={`${(containerWeights[1].nett + (includeTareInGross ? containerWeights[1].tare : 0)).toLocaleString("en-US")}.000 KGS`} />{includeProductVolume && <ReadOnlyField label="Product volume" value="22,084.778 LTR" />}</div></article>
          </div>
          {includeTotalWeight ? <div className="weight-totals"><div><span>Total containers</span><b>{containerWeights.length}</b></div><div><span>Total nett weight</span><b>{totalNett.toLocaleString("en-US")}.000 KGS</b></div><div><span>Total tare weight</span><b>{totalTare.toLocaleString("en-US")}.000 KGS</b></div><div><span>Total gross weight</span><b>{totalGross.toLocaleString("en-US")}.000 KGS</b></div>{includeProductVolume && <div><span>Total product volume</span><b>{totalProductVolume.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} LTR</b></div>}</div> : <p className="weight-excluded">Total weights are not included on this Bill of Lading.</p>}
        </section>
        <section hidden={active !== "References"} className="editor-step-content">
          <h2>References</h2><p>Reference fields are supplied by NILS. You can amend the body text.</p>
          <div className="bl-toggle-grid reference-toggles"><ToggleField label="Include customer reference" checked={referenceVisibility.customer} onChange={changed} onValueChange={value => setReferenceVisibility(current => ({ ...current, customer: value }))} /><ToggleField label="Include loading reference" checked={referenceVisibility.loading} onChange={changed} onValueChange={value => setReferenceVisibility(current => ({ ...current, loading: value }))} /><ToggleField label="Include customer reference 2" checked={referenceVisibility.customer2} onChange={changed} onValueChange={value => setReferenceVisibility(current => ({ ...current, customer2: value }))} /><ToggleField label="Include discharge reference" checked={referenceVisibility.discharge} onChange={changed} onValueChange={value => setReferenceVisibility(current => ({ ...current, discharge: value }))} /></div>
          <div className="bl-field-grid">
            {referenceVisibility.customer && <ReadOnlyField label="Customer reference" value="538182" />}
            {referenceVisibility.customer2 && <ReadOnlyField label="Customer reference 2" value="TRL231108576" />}
            {referenceVisibility.loading && <ReadOnlyField label="Loading reference" value="538182" />}
            {referenceVisibility.discharge && <ReadOnlyField label="Discharge reference" value="Not included" />}
          </div>
          <ToggleField label="Add separate body text per unit" checked={false} onChange={changed} onValueChange={setSeparateBodyText} />
          {separateBodyText ? <div className="container-list reference-unit-list"><article className="container-card"><header><strong>Tank 1</strong><span>SIMU2410290</span></header><div className="bl-field-grid"><ReadOnlyField label="Tank specific" value="SIMU2410290" /></div><TextAreaField label="Body text for SIMU2410290" value={"Delivery Order: 8010626774\nCUC NUMBER: CU-RSPO SCC-845766\n--"} onChange={changed} /></article><article className="container-card"><header><strong>Tank 2</strong><span>TGHU6241812</span></header><div className="bl-field-grid"><ReadOnlyField label="Tank specific" value="TGHU6241812" /></div><TextAreaField label="Body text for TGHU6241812" value={"Delivery Order: 8010626774\nCUC NUMBER: CU-RSPO SCC-845767\n--"} onChange={changed} /></article></div> : <><ReadOnlyField label="Tank specific" value="2 tanks: SIMU2410290, TGHU6241812" /><TextAreaField label="Body text for all units" value={"Delivery Order: 8010626774\nCUC NUMBER: CU-RSPO SCC-845766\n--"} onChange={changed} /></>}
        </section>
      </div>
    </div>
    <footer className="bl-editor-footer"><span>{changes ? `${changes} change${changes === 1 ? "" : "s"} in this session` : "No changes yet"}</span><div className="editor-actions">{footerActions}<button onClick={onDiscard} disabled={!changes}>Discard all changes</button><button className="primary" disabled={!changes} onClick={() => setSubmissionStage("review")}>Submit corrections</button></div></footer>{submissionStage === "review" && reviewOverlay}{submissionStage === "submitted" && successOverlay}
  </section>;
}
