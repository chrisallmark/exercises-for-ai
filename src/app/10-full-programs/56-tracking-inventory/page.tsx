"use client";

import { Solution } from "@/components";
import { useSyncExternalStore, useState } from "react";
import { Button, Grid, Input, Message, Table } from "semantic-ui-react";

const STORAGE_KEY = "efp-inventory";

type Item = { id: number; name: string; serial: string; value: number };

const EMPTY_ITEMS: Item[] = [];
let _inventoryListeners: Array<() => void> = [];
let _inventoryCache: Item[] | null = null;

const inventoryStore = {
  subscribe: (listener: () => void) => {
    if (_inventoryCache === null) {
      const stored = localStorage.getItem(STORAGE_KEY);
      _inventoryCache = stored !== null ? JSON.parse(stored) : [];
    }
    _inventoryListeners.push(listener);
    return () => { _inventoryListeners = _inventoryListeners.filter((l) => l !== listener); };
  },
  getSnapshot: (): Item[] => _inventoryCache ?? EMPTY_ITEMS,
  getServerSnapshot: (): Item[] => EMPTY_ITEMS,
  set: (items: Item[]) => {
    _inventoryCache = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    _inventoryListeners.forEach((l) => l());
  },
};

const TrackingInventory = () => {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const items = useSyncExternalStore(inventoryStore.subscribe, inventoryStore.getSnapshot, inventoryStore.getServerSnapshot);
  const [form, setForm] = useState({ name: "", serial: "", value: "" });
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const value = parseFloat(form.value);
    if (!form.name.trim() || !form.serial.trim()) {
      setError("Name and serial number are required.");
      return;
    }
    if (isNaN(value) || value < 0) {
      setError("Value must be a non-negative number.");
      return;
    }
    inventoryStore.set([...items, { id: Date.now(), name: form.name.trim(), serial: form.serial.trim(), value }]);
    setForm({ name: "", serial: "", value: "" });
    setError(null);
  };

  const remove = (id: number) => inventoryStore.set(items.filter((i) => i.id !== id));

  const downloadCsv = () => {
    const header = "Name,Serial Number,Value";
    const rows = items.map((i) => `${i.name},${i.serial},${i.value.toFixed(2)}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalValue = items.reduce((sum, i) => sum + i.value, 0);

  const isFormValid = form.name.trim() && form.serial.trim() && form.value.trim();

  if (!mounted) return null;

  return (
    <Solution category="Full Programs" exercise="Tracking Inventory"
      markdown="/exercises/10-full-programs/56-tracking-inventory.md"
    >
      <Grid stackable>
        <Grid.Column width={6}>
          <Input
            fluid
            label="Name"
            placeholder="e.g. MacBook Pro"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </Grid.Column>
        <Grid.Column width={5}>
          <Input
            fluid
            label="Serial #"
            placeholder="e.g. A1B2C3"
            value={form.serial}
            onChange={(e) => setForm((f) => ({ ...f, serial: e.target.value }))}
          />
        </Grid.Column>
        <Grid.Column width={5}>
          <Input
            fluid
            label="$"
            labelPosition="left"
            placeholder="e.g. 1299.99"
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") add(); }}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Button primary disabled={!isFormValid} onClick={add}>
            Add Item
          </Button>
        </Grid.Column>

        {error && (
          <Grid.Column width={16}>
            <Message negative>{error}</Message>
          </Grid.Column>
        )}

        {items.length > 0 && (
          <>
            <Grid.Column width={16}>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Serial Number</Table.HeaderCell>
                    <Table.HeaderCell>Value</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {items.map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{item.serial}</Table.Cell>
                      <Table.Cell>${item.value.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Button size="small" negative onClick={() => remove(item.id)}>Remove</Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
                <Table.Footer>
                  <Table.Row>
                    <Table.HeaderCell colSpan={2}><strong>Total</strong></Table.HeaderCell>
                    <Table.HeaderCell><strong>${totalValue.toFixed(2)}</strong></Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
            </Grid.Column>
            <Grid.Column width={16}>
              <Button onClick={downloadCsv}>Download CSV</Button>
            </Grid.Column>
          </>
        )}

        {items.length === 0 && (
          <Grid.Column width={16}>
            <p style={{ color: "#999" }}>No items yet. Add one above.</p>
          </Grid.Column>
        )}
      </Grid>
    </Solution>
  );
};

export default TrackingInventory;
