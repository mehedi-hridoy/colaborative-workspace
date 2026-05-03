import cloudinary from "./apps/api/src/config/cloudinary.js";

cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", { folder: "attachments" })
  .then(console.log)
  .catch(console.error);
