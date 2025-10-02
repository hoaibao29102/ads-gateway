import { useEffect, useState, Fragment } from "react";

// clone an toàn, không phụ thuộc structuredClone
const clone = (o) => JSON.parse(JSON.stringify(o ?? {}));
// chuẩn hoá domain người dùng nhập
const normHost = (h) => (h || "")
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .replace(/^www\./, "")
  .replace(/\/.*$/, "");

export default function Admin() {
  const [data, setData] = useState({ hosts: {} });
  const [newHost, setNewHost] = useState("");

  // tải config hiện tại
  async function load() {
    try {
      const r = await fetch("/api/list");
      const j = await r.json();
      setData({ hosts: j?.hosts ?? {} });
    } catch {
      setData({ hosts: {} });
    }
  }
  useEffect(() => { load(); }, []);

  const hosts = Object.keys(data.hosts || {}).sort();

  // helpers cập nhật state
  function setActive(h, val) {
    const d = clone(data);
    (d.hosts[h] ||= { active: "A", links: {} }).active = val;
    setData(d);
  }
  function setLink(h, key, url) {
    const d = clone(data);
    (d.hosts[h] ||= { active: "A", links: {} }).links[key] = url;
    setData(d);
  }
  function addHost() {
    const h = normHost(newHost);
    if (!h) return alert("Nhập domain (vd: ad1.com)");
    const d = clone(data);
    if (d.hosts[h]) {
      alert("Domain đã tồn tại");
    } else {
      d.hosts[h] = { active: "A", links: {} };
      setData(d);
    }
    setNewHost("");
  }
  function removeHost(h) {
    const d = clone(data);
    delete d.hosts[h];
    setData(d);
  }

  // ghi lên Edge Config (không cần pass)
  async function save() {
    try {
      const r = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hosts: data.hosts })
      });
      if (!r.ok) {
        const t = await r.text();
        alert("Save failed: " + t);
      } else {
        alert("Saved!");
        load(); // reload lại để đồng bộ với Edge Config
      }
    } catch (e) {
      console.error(e);
      alert("Save failed (network error)");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Ads Gateway Admin</h2>

      <div style={{ margin: "12px 0" }}>
        <button onClick={save} style={{ padding: "8px 14px" }}>Save</button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          placeholder="Thêm domain (vd: ad3.com)"
          value={newHost}
          onChange={e => setNewHost(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addHost}>Add domain</button>
      </div>

      {hosts.length === 0 ? (
        <p>Chưa có domain nào.</p>
      ) : (
        hosts.map(h => (
          <div key={h} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, margin: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{h}</strong>
              <div>
                <label>Active:&nbsp;</label>
                <select value={data.hosts[h].active || "A"} onChange={e => setActive(h, e.target.value)}>
                  {["A", "B", "C", "D"].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <button onClick={() => removeHost(h)} style={{ marginLeft: 12 }}>Remove</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 8, marginTop: 10 }}>
              {["A", "B", "C", "D"].map(k => (
                <Fragment key={k}>
                  <div style={{ textAlign: "right", paddingTop: 6 }}>{k}:</div>
                  <input
                    placeholder={`https://... (${k})`}
                    value={(data.hosts[h].links && data.hosts[h].links[k]) || ""}
                    onChange={e => setLink(h, k, e.target.value)}
                    style={{ padding: 8 }}
                  />
                </Fragment>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
