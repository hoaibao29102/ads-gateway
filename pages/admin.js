import { useEffect, useState, Fragment } from "react";
const clone = (o) => JSON.parse(JSON.stringify(o ?? {}));
const normHost = (h) => (h||"").trim().toLowerCase()
  .replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

export default function Admin() {
  const [pass, setPass] = useState(""); // nếu bỏ mật khẩu: xóa state này & header x-admin-pass ở hàm save()
  const [data, setData] = useState({ hosts: {} });
  const [newHost, setNewHost] = useState("");

  async function load() {
    try {
      const r = await fetch("/api/list");
      const j = await r.json();
      setData({ hosts: j?.hosts ?? {} });
    } catch { setData({ hosts: {} }); }
  }
  useEffect(() => { load(); }, []);

  const hosts = Object.keys(data.hosts || {}).sort();
  const setActive = (h, v) => { const d=clone(data); (d.hosts[h] ||= {active:"A",links:{}}).active=v; setData(d); };
  const setLink   = (h, k, u) => { const d=clone(data); (d.hosts[h] ||= {active:"A",links:{}}).links[k]=u; setData(d); };
  const addHost   = () => { const h=normHost(newHost); if(!h) return alert("Nhập domain"); const d=clone(data);
                            if(d.hosts[h]) alert("Domain đã tồn tại"); else d.hosts[h]={active:"A",links:{}};
                            setData(d); setNewHost(""); };
  const removeHost= (h) => { const d=clone(data); delete d.hosts[h]; setData(d); };

  async function save() {
    const r = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-admin-pass": pass }, // nếu bỏ mật khẩu: chỉ giữ Content-Type
      body: JSON.stringify({ hosts: data.hosts })
    });
    alert(r.ok ? "Saved!" : "Save failed");
    if (r.ok) load();
  }

  return (
    <div style={{maxWidth:900, margin:"40px auto", fontFamily:"system-ui"}}>
      <h2>Ads Gateway Admin</h2>

      <div style={{display:"flex", gap:12, margin:"12px 0"}}>
        <input type="password" placeholder="Admin password" value={pass}
               onChange={e=>setPass(e.target.value)} style={{flex:1, padding:8}}/>
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
                       onChange={e=>setLink(h, k, e.target.value)} style={{padding:8}}/>
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
