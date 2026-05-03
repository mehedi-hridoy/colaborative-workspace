import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

async function test() {
  // Login first
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "password" })
  });
  
  const loginJson = await loginRes.json();
  console.log("Login:", loginJson);
  
  const cookie = loginRes.headers.raw()['set-cookie'];
  if (!cookie) {
    console.log("No cookie returned");
    return;
  }
  
  const form = new FormData();
  form.append("announcementId", "fake-id");
  form.append("file", fs.createReadStream("package.json"));
  
  const uploadRes = await fetch("http://localhost:5000/api/upload/file", {
    method: "POST",
    headers: {
      cookie: cookie.join(';')
    },
    body: form
  });
  
  const text = await uploadRes.text();
  console.log("Upload Status:", uploadRes.status);
  console.log("Upload Response:", text);
}
test();
