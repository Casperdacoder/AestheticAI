// server/server.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ROUTE: Fetch all consultants for approval
app.get("/consultants", async (req, res) => {
  try {
    const snapshot = await db.collection("consultants").get();
    const consultants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(consultants);
  } catch (error) {
    console.error("Error fetching consultants:", error);
    res.status(500).send("Error fetching consultants");
  }
});

// ROUTE: Approve consultant
app.post("/consultants/:id/approve", async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection("consultants").doc(id).update({ status: "approved" });
    res.send("Consultant approved!");
  } catch (error) {
    console.error("Error approving consultant:", error);
    res.status(500).send("Error approving consultant");
  }
});

// ROUTE: Reject consultant
app.post("/consultants/:id/reject", async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection("consultants").doc(id).update({ status: "rejected" });
    res.send("Consultant rejected!");
  } catch (error) {
    console.error("Error rejecting consultant:", error);
    res.status(500).send("Error rejecting consultant");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
