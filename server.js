const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'leads.json');
const FINANCE_FILE = path.join(__dirname, 'finance.json');
const GOALS_FILE = path.join(__dirname, 'goals.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB files
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
if (!fs.existsSync(FINANCE_FILE)) fs.writeFileSync(FINANCE_FILE, JSON.stringify([]));
if (!fs.existsSync(GOALS_FILE)) fs.writeFileSync(GOALS_FILE, JSON.stringify({}));

// --- LEADS API ---
app.get('/api/leads', (req, res) => {
    try {
        res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
    } catch (err) { res.status(500).json({ error: 'Erro ao ler leads.' }); }
});

app.post('/api/leads', (req, res) => {
    try {
        const { name, phone, device, service_type, city, status } = req.body;
        if (!name || !phone || !device || !service_type) return res.status(400).json({ error: 'Faltam campos.' });

        const cities = ["Cruz", "Bela Cruz", "Marco"];
        const selectedCity = city && cities.includes(city) ? city : cities[Math.floor(Math.random() * cities.length)];

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const newLead = {
            id: Date.now().toString(),
            name, phone, device, service_type,
            status: status || 'pending',
            city: selectedCity,
            createdAt: new Date().toISOString()
        };
        data.unshift(newLead);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Lead adicionado', lead: newLead });
    } catch (err) { res.status(500).json({ error: 'Erro ao salvar lead.' }); }
});

app.patch('/api/leads/:id', (req, res) => {
    try {
        const { status } = req.body;
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const idx = data.findIndex(l => l.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Não encontrado.' });
        
        data[idx].status = status;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ message: 'Status atualizado', lead: data[idx] });
    } catch (err) { res.status(500).json({ error: 'Erro ao atualizar.' }); }
});

app.delete('/api/leads/:id', (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data = data.filter(l => l.id !== req.params.id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ message: 'Removido' });
    } catch (err) { res.status(500).json({ error: 'Erro ao remover.' }); }
});

// --- FINANCE API ---
app.get('/api/finance', (req, res) => {
    try {
        res.json(JSON.parse(fs.readFileSync(FINANCE_FILE, 'utf8')));
    } catch (err) { res.status(500).json({ error: 'Erro ao ler finanças.' }); }
});

app.post('/api/finance', (req, res) => {
    try {
        const { description, amount, type, method } = req.body;
        if (!description || !amount || !type) return res.status(400).json({ error: 'Faltam campos.' });

        const data = JSON.parse(fs.readFileSync(FINANCE_FILE, 'utf8'));
        const newTx = {
            id: Date.now().toString(),
            description,
            amount: parseFloat(amount),
            type, // 'income' or 'expense'
            method: method || 'PIX',
            date: new Date().toISOString()
        };
        data.unshift(newTx);
        fs.writeFileSync(FINANCE_FILE, JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Registro adicionado', tx: newTx });
    } catch (err) { res.status(500).json({ error: 'Erro ao salvar.' }); }
});

app.delete('/api/finance/:id', (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync(FINANCE_FILE, 'utf8'));
        data = data.filter(t => t.id !== req.params.id);
        fs.writeFileSync(FINANCE_FILE, JSON.stringify(data, null, 2));
        res.json({ message: 'Removido' });
    } catch (err) { res.status(500).json({ error: 'Erro ao remover.' }); }
});

// --- GOALS API ---
app.get('/api/goals', (req, res) => {
    try {
        res.json(JSON.parse(fs.readFileSync(GOALS_FILE, 'utf8')));
    } catch (err) { res.status(500).json({ error: 'Erro ao ler metas.' }); }
});

app.post('/api/goals', (req, res) => {
    try {
        const { month, target } = req.body;
        if (!month || target === undefined) return res.status(400).json({ error: 'Faltam campos.' });

        const data = JSON.parse(fs.readFileSync(GOALS_FILE, 'utf8'));
        data[month] = parseFloat(target);
        
        fs.writeFileSync(GOALS_FILE, JSON.stringify(data, null, 2));
        res.status(200).json({ message: 'Meta salva com sucesso', goals: data });
    } catch (err) { res.status(500).json({ error: 'Erro ao salvar meta.' }); }
});

app.listen(PORT, () => {
    console.log(`KRYPTON Dashboard rodando na porta ${PORT}`);
});
