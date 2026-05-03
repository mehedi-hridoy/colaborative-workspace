import fs from "fs";

async function test() {
  const form = new FormData();
  form.append("announcementId", "test-id");
  form.append("file", new Blob(["hello"]), "test.txt");

  const res = await fetch("http://localhost:5000/api/upload/file", {
    method: "POST",
    body: form
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

test();
