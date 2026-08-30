import "./portal-navigation.css";

type Props = { isAdmin: boolean; active: "bill" | "settings"; collapsed: boolean; onToggle: () => void };

export function PortalNavigation({ isAdmin, active, collapsed, onToggle }: Props) {
  return <aside className={`portal-navigation ${collapsed ? "collapsed" : ""}`} aria-label="Portal navigation">
    <a href="/" className="portal-logo"><span>N</span><b>NewPort</b></a>
    <p className="portal-section">Workspace</p>
    <a className={active === "bill" ? "portal-item active" : "portal-item"} href="/">▤<b>Bill of Lading</b></a>
    {isAdmin && <><p className="portal-section administration">Administration</p><a className={active === "settings" ? "portal-item active" : "portal-item"} href="/admin/users">⚙<b>Settings</b></a></>}
    <div className="portal-user"><span>{isAdmin ? "NP" : "AC"}</span><div><strong>{isAdmin ? "NewPort" : "Afton Chemicals"}</strong><small>{isAdmin ? "Administrator" : "Customer Portal"}</small></div></div>
    <button className="portal-collapse" onClick={onToggle} aria-label={collapsed ? "Expand menu" : "Collapse menu"}>{collapsed ? "›" : "‹"}<span>Collapse menu</span></button>
  </aside>;
}
