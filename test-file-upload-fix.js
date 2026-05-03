import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testFileUpload() {
  console.log("Testing file upload with fixed Cloudinary configuration...\n");

  const testFiles = [
    { content: "This is a test PDF content", filename: "test-document.pdf", type: "application/pdf" },
    { content: "Column1,Column2\nValue1,Value2", filename: "test-data.csv", type: "text/csv" },
    { content: "Plain text file content for testing", filename: "test-file.txt", type: "text/plain" },
  ];

  for (const testFile of testFiles) {
    try {
      console.log(`📤 Uploading ${testFile.filename}...`);
      
      const blob = new Blob([testFile.content], { type: testFile.type });
      const formData = new FormData();
      
      // Add test announcement ID
      formData.append("announcementId", "test-announcement-" + Date.now());
      
      // Create a File object from Blob
      formData.append("file", blob, testFile.filename);

      const response = await fetch("http://localhost:5000/api/upload/file", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": "Bearer test-token"
        },
        credentials: "omit"
      });

      const data = await response.text();
      
      if (response.ok) {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Upload successful!`);
          console.log(`   - URL: ${jsonData.url}`);
          console.log(`   - Type: ${jsonData.type}`);
          console.log(`   - Name: ${jsonData.name}\n`);
        } catch {
          console.log(`   Response: ${data}\n`);
        }
      } else {
        console.log(`❌ Upload failed with status ${response.status}`);
        console.log(`   Response: ${data}\n`);
      }
    } catch (err) {
      console.error(`❌ Error uploading ${testFile.filename}:`, err.message);
    }
  }

  console.log("Test complete! Check the URLs above in Cloudinary to verify files are properly stored.");
}

testFileUpload();
