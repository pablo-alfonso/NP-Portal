import Link from "next/link";
import Image from "next/image";
import "./portal-navigation.css";

type Props = { isAdmin: boolean; active: "bill" | "settings"; collapsed: boolean; onToggle: () => void; onBillOfLading?: () => void };

export function PortalNavigation({ isAdmin, active, collapsed, onToggle, onBillOfLading }: Props) {
  return <aside className={`portal-navigation ${collapsed ? "collapsed" : ""}`} aria-label="Portal navigation">
    <Link href="/" onClick={(event) => { if (onBillOfLading) { event.preventDefault(); onBillOfLading(); } }} className="portal-logo"><Image src="/NP-Portal/brand/newport-logo.png" alt="NewPort" width={150} height={40} priority /></Link>
    <p className="portal-section">Workspace</p>
    <Link className={active === "bill" ? "portal-item active" : "portal-item"} href="/" onClick={(event) => { if (onBillOfLading) { event.preventDefault(); onBillOfLading(); } }}>▤<b>Bill of Lading</b></Link>
    {isAdmin && <><p className="portal-section administration">Administration</p><Link className={active === "settings" ? "portal-item active" : "portal-item"} href="/admin/users">⚙<b>Settings</b></Link></>}
    <div className="portal-user"><span>{isAdmin ? "NP" : "AC"}</span><div><strong>{isAdmin ? "NewPort" : "Afton Chemicals"}</strong><small>{isAdmin ? "Administrator" : "Customer Portal"}</small></div></div>
    <button className="portal-collapse" onClick={onToggle} aria-label={collapsed ? "Expand menu" : "Collapse menu"}>{collapsed ? "›" : "‹"}<span>Collapse menu</span></button>
  </aside>;
}
