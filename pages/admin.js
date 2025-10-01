import { useEffect, useState, Fragment } from "react";

export default function Admin() {
  const [pass, setPass] = useState("");
  const [data, setData] = useState({ hosts: {} });
  const [newHost, setNewHost] = useState("");

  async function load() {
    const r = await fetch("/api/list");
    const j = await r.json();
    setData(j || { hosts: {} });
  }
  useEffect(() => { load(); }, []);

  const hosts = Object.keys(data.hosts || {}).sort();

  function setActive(h, val) {
    const copy = structuredClone(data);
    copy.hosts[h].active = val;
    setData(copy);
  }

  function setLink(h, key, url) {
    const copy = structuredClone(data);
    copy.hosts[h].links[key] = url;
    setData(copy);
  }

  function addHost() {
    const h = newHost.trim();
    if (!h) return;
    const copy = structuredClone(data);
    copy.hosts[h] = { active: "A", links: {} };
    setData(copy);
    setNewHost("");
  }

  function removeHost(h) {
    const copy = structuredClone(data);
    delete copy.hosts[h];
    setData(copy);
  }

  async function save() {
    const r = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-pass": pass },
      body: JSON.stringify(data)
    });
    alert(r.ok ? "Saved!" : "Save failed");
    if (r.ok) load();
  }

  return (
    <div style={{maxWidth:900, margin:"40px auto", fontFamily:"system-ui"}}>
      <h2>Ads Gateway Admin</h2>

      <div style={{display:"flex", gap:12, margin:"12px 0"}}>
        <input type="password" placeholder="Admin password"
               value={pass} onChange={e=>setPass(e.target.value)}
               style={{flex:1, padding:8}}/>
        <button onClick={save} style={{padding:"8px 14px"}}>Save</button>
      </div>

      <div style={{display:"flex", gap:8, margin:"16px 0"}}>
        <input placeholder="Thêm domain (vd: ad3.com)" value={newHost}
               onChange={e=>setNewHost(e.target.value)} style={{flex:1, padding:8}}/>
        <button onClick={addHost}>Add domain</button>
      </div>

      {hosts.length === 0 ? <p>Chưa có domain nào.</p> : hosts.map(h => (
        <div key={h} style={{border:"1px solid #ddd", padding:12, borderRadius:8, margin:"12px 0"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <strong>{h}</strong>
            <div>
              <label>Active:&nbsp;</label>
              <select value={data.hosts[h].active || "A"} onChange={e=>setActive(h, e.target.value)}>
                {["A","B","C","D"].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <button onClick={()=>removeHost(h)} style={{marginLeft:12}}>Remove</button>
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"60px 1fr", gap:8, marginTop:10}}>
            {["A","B","C","D"].map(k => (
              <Fragment key={k}>
                <div style={{textAlign:"right", paddingTop:6}}>{k}:</div>
                <input placeholder={`https://... (${k})`}
                       value={(data.hosts[h].links && data.hosts[h].links[k]) || ""}
                       onChange={e=>setLink(h, k, e.target.value)}
                       style={{padding:8}}/>
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
