// ... trong component Admin
async function save() {
  const r = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hosts: data.hosts })
  });
  alert(r.ok ? "Saved!" : "Save failed");
  if (r.ok) load();
}
