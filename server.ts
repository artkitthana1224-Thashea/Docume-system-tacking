import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

// MOCK DATABASE
const users = [
  { id: "u1", name: "Somchai (Officer)", role: "Officer", department: "Loan" },
  { id: "u2", name: "Suda (Unit Head)", role: "Unit Head", department: "Loan" },
  { id: "u3", name: "Mana (Manager)", role: "Manager", department: "Loan" },
  { id: "u4", name: "Wichai (Admin)", role: "Admin", department: "IT" },
];

let documents: any[] = [];
let auditLogs: any[] = [];
let runningNumberCounter = 1;

// Seed initial data
documents.push({
  id: "d1",
  runningNumber: `DOC-${format(new Date(), "yyyyMMdd")}-001`,
  title: "Loan Approval Request - 001",
  content: "Customer A requested a 5M THB loan for business expansion.",
  status: "Pending Unit Head",
  ownerId: "u1",
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // due tomorrow
  versions: [
    { version: 1, content: "Customer A requested a 5M THB loan for business expansion.", updatedBy: "u1", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  signatures: []
});
runningNumberCounter++;

documents.push({
  id: "d2",
  runningNumber: `DOC-${format(new Date(), "yyyyMMdd")}-002`,
  title: "Monthly Expense Report",
  content: "Total expenses for last month: 150,000 THB.",
  status: "Approved",
  ownerId: "u1",
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
  versions: [
    { version: 1, content: "Total expenses for last month: 150,000 THB.", updatedBy: "u1", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  signatures: [
    { role: "Unit Head", signedBy: "u2", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), hash: "sig-hash-123" },
    { role: "Manager", signedBy: "u3", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), hash: "sig-hash-456" }
  ]
});
runningNumberCounter++;

documents.push({
  id: "d3",
  runningNumber: `DOC-${format(new Date(), "yyyyMMdd")}-003`,
  title: "Overdue Loan Case - B",
  content: "Customer B missed 3 payments.",
  status: "Pending Manager",
  ownerId: "u2",
  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // overdue
  versions: [
    { version: 1, content: "Customer B missed 3 payments.", updatedBy: "u2", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  signatures: [
    { role: "Unit Head", signedBy: "u2", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), hash: "sig-hash-789" }
  ]
});
runningNumberCounter++;

function generateRunningNumber() {
  const dateStr = format(new Date(), "yyyyMMdd");
  const num = runningNumberCounter.toString().padStart(3, "0");
  runningNumberCounter++;
  return `DOC-${dateStr}-${num}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to get current user based on header
  app.use((req, res, next) => {
    const userId = req.headers["x-user-id"] as string || "u1";
    req.user = users.find(u => u.id === userId) || users[0];
    next();
  });

  // --- API ROUTES ---

  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.get("/api/me", (req, res) => {
    res.json(req.user);
  });

  app.get("/api/dashboard", (req, res) => {
    const role = req.user.role;
    
    // Filter docs based on role (simple RBAC simulation)
    let visibleDocs = documents;
    if (role === "Officer") {
      visibleDocs = documents.filter(d => d.ownerId === req.user.id || d.status === "Approved");
    }

    const pending = visibleDocs.filter(d => d.status.includes("Pending")).length;
    const approved = visibleDocs.filter(d => d.status === "Approved").length;
    const overdue = visibleDocs.filter(d => new Date(d.dueDate) < new Date() && d.status !== "Approved").length;

    res.json({
      kpis: { pending, approved, overdue, total: visibleDocs.length },
      recentDocs: visibleDocs.slice(0, 5)
    });
  });

  app.get("/api/documents", (req, res) => {
    const role = req.user.role;
    let visibleDocs = documents;
    
    // Simple RBAC: Officers see their own + approved. Managers see all.
    if (role === "Officer") {
      visibleDocs = documents.filter(d => d.ownerId === req.user.id || d.status === "Approved");
    } else if (role === "Unit Head") {
      visibleDocs = documents.filter(d => d.status.includes("Unit Head") || d.status === "Approved" || d.ownerId === req.user.id || documents.find(doc => doc.signatures.some((s:any) => s.signedBy === req.user.id)));
    }
    
    // Sort by created desc
    visibleDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(visibleDocs);
  });

  app.get("/api/documents/:id", (req, res) => {
    const doc = documents.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    const logs = auditLogs.filter(l => l.docId === doc.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ doc, logs });
  });

  app.post("/api/documents", (req, res) => {
    const { title, content, dueDate } = req.body;
    const newDoc = {
      id: uuidv4(),
      runningNumber: generateRunningNumber(),
      title,
      content,
      status: "Pending Unit Head",
      ownerId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      versions: [
        { version: 1, content, updatedBy: req.user.id, timestamp: new Date().toISOString() }
      ],
      signatures: []
    };
    documents.push(newDoc);
    
    auditLogs.push({ id: uuidv4(), docId: newDoc.id, userId: req.user.id, action: "Create", timestamp: new Date().toISOString(), details: "Document created" });
    
    res.json(newDoc);
  });

  app.put("/api/documents/:id", (req, res) => {
    const docIndex = documents.findIndex(d => d.id === req.params.id);
    if (docIndex === -1) return res.status(404).json({ error: "Not found" });
    
    const { title, content } = req.body;
    const doc = documents[docIndex];
    
    // Create new version
    const newVersion = {
      version: doc.versions.length + 1,
      content,
      updatedBy: req.user.id,
      timestamp: new Date().toISOString()
    };
    
    documents[docIndex] = {
      ...doc,
      title: title || doc.title,
      content: content || doc.content,
      updatedAt: new Date().toISOString(),
      versions: [...doc.versions, newVersion]
    };
    
    auditLogs.push({ id: uuidv4(), docId: doc.id, userId: req.user.id, action: "Edit", timestamp: new Date().toISOString(), details: `Updated to version ${newVersion.version}` });
    
    res.json(documents[docIndex]);
  });

  app.post("/api/documents/:id/action", (req, res) => {
    const { action } = req.body; // 'approve', 'reject'
    const docIndex = documents.findIndex(d => d.id === req.params.id);
    if (docIndex === -1) return res.status(404).json({ error: "Not found" });
    
    const doc = documents[docIndex];
    let newStatus = doc.status;
    let signature = null;
    
    if (action === "approve") {
      signature = {
        role: req.user.role,
        signedBy: req.user.id,
        timestamp: new Date().toISOString(),
        hash: `sig-${uuidv4().substring(0,8)}` // Simulate digital signature hash
      };
      
      if (req.user.role === "Unit Head") {
        newStatus = "Pending Manager";
      } else if (req.user.role === "Manager") {
        newStatus = "Approved";
      }
    } else if (action === "reject") {
      newStatus = "Rejected";
    }

    const updatedDoc = {
      ...doc,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      signatures: signature ? [...doc.signatures, signature] : doc.signatures
    };
    
    documents[docIndex] = updatedDoc;
    auditLogs.push({ id: uuidv4(), docId: doc.id, userId: req.user.id, action: action === "approve" ? "Approve" : "Reject", timestamp: new Date().toISOString(), details: `Status changed to ${newStatus}` });
    
    res.json(updatedDoc);
  });

  app.post("/api/audit", (req, res) => {
    const { docId, action, details } = req.body;
    const log = { id: uuidv4(), docId, userId: req.user.id, action, timestamp: new Date().toISOString(), details };
    auditLogs.push(log);
    res.json(log);
  });

  app.get("/api/audit-logs", (req, res) => {
    const logs = auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(logs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

startServer();
