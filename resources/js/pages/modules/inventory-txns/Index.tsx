import React, { FormEvent, useMemo, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";

type FactoryOption = {
    id: number;
    name: string;
    code: string;
};

type ProductOption = {
    id: number;
    factory_id: number;
    type: string;
    sku: string;
    name: string;
};

type BuyerOrderOption = {
    id: number;
    factory_id: number;
    buyer_order_no: string;
};

type PurchaseOption = {
    id: number;
    factory_id: number;
    purchase_no: string;
};

type InventoryTxnRow = {
    id: number;
    factory_id: number;
    txn_date: string;
    txn_type: string;
    product_id: number;
    qty_in: string | number;
    qty_out: string | number;
    unit_cost: string | number;
    amount: string | number;
    ref_table: string;
    ref_id?: number | null;
    buyer_order_id?: number | null;
    step_id?: number | null;
    purchase_id?: number | null;
    shipment_id?: number | null;
    note?: string | null;
    created_by: number;
    factory?: {
        id: number;
        name: string;
        code: string;
    };
    product?: {
        id: number;
        factory_id: number;
        type: string;
        sku: string;
        name: string;
    };
    buyer_order?: {
        id: number;
        buyer_order_no: string;
    };
    purchase?: {
        id: number;
        purchase_no: string;
    };
    creator?: {
        id: number;
        name: string;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type InventoryTxnsPageProps = {
    inventoryTxns: {
        data: InventoryTxnRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
    factories: FactoryOption[];
    products: ProductOption[];
    buyerOrders: BuyerOrderOption[];
    purchases: PurchaseOption[];
    filters: {
        q?: string;
        factory_id?: number | string;
        txn_type?: string;
    };
};

type PageProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Inventory Transactions",
        href: "/inventory-txns",
    },
];

const txnTypes = [
    "PURCHASE_IN",
    "PRODUCTION_RAW_OUT",
    "FG_IN",
    "SHIPMENT_OUT",
    "DAMAGE_OUT",
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT",
];

const refTables = [
    "purchases",
    "buyer_orders",
    "production_steps",
    "shipments",
    "manual",
];

const defaultFormData = {
    factory_id: "",
    txn_date: "",
    txn_type: "PURCHASE_IN",
    product_id: "",
    qty_in: "0",
    qty_out: "0",
    unit_cost: "0",
    ref_table: "manual",
    ref_id: "",
    buyer_order_id: "",
    step_id: "",
    purchase_id: "",
    shipment_id: "",
    note: "",
};

export default function Index({
                                  inventoryTxns,
                                  factories,
                                  products,
                                  buyerOrders,
                                  purchases,
                                  filters,
                              }: InventoryTxnsPageProps) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.q || "");
    const [searchFactoryId, setSearchFactoryId] = useState(filters?.factory_id ?? "");
    const [searchTxnType, setSearchTxnType] = useState(filters?.txn_type || "");

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingRow, setEditingRow] = useState<InventoryTxnRow | null>(null);

    const createForm = useForm({
        factory_id: "",
        txn_date: "",
        txn_type: "PURCHASE_IN",
        product_id: "",
        qty_in: "0",
        qty_out: "0",
        unit_cost: "0",
        ref_table: "manual",
        ref_id: "",
        buyer_order_id: "",
        step_id: "",
        purchase_id: "",
        shipment_id: "",
        note: "",
    });

    const editForm = useForm({
        factory_id: "",
        txn_date: "",
        txn_type: "PURCHASE_IN",
        product_id: "",
        qty_in: "0",
        qty_out: "0",
        unit_cost: "0",
        ref_table: "manual",
        ref_id: "",
        buyer_order_id: "",
        step_id: "",
        purchase_id: "",
        shipment_id: "",
        note: "",
    });

    const openCreateModal = () => {
        createForm.setData(defaultFormData);
        createForm.clearErrors();
        setOpenCreate(true);
    };

    const closeCreateModal = () => {
        setOpenCreate(false);
        createForm.reset();
        createForm.clearErrors();
    };

    const openEditModal = (row: InventoryTxnRow) => {
        setEditingRow(row);
        editForm.setData({
            factory_id: String(row.factory_id ?? ""),
            txn_date: row.txn_date ? row.txn_date.slice(0, 16) : "",
            txn_type: row.txn_type || "PURCHASE_IN",
            product_id: String(row.product_id ?? ""),
            qty_in: String(row.qty_in ?? "0"),
            qty_out: String(row.qty_out ?? "0"),
            unit_cost: String(row.unit_cost ?? "0"),
            ref_table: row.ref_table || "manual",
            ref_id: row.ref_id ? String(row.ref_id) : "",
            buyer_order_id: row.buyer_order_id ? String(row.buyer_order_id) : "",
            step_id: row.step_id ? String(row.step_id) : "",
            purchase_id: row.purchase_id ? String(row.purchase_id) : "",
            shipment_id: row.shipment_id ? String(row.shipment_id) : "",
            note: row.note || "",
        });
        editForm.clearErrors();
        setOpenEdit(true);
    };

    const closeEditModal = () => {
        setOpenEdit(false);
        setEditingRow(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            "/inventory-txns",
            {
                q: search,
                factory_id: searchFactoryId,
                txn_type: searchTxnType,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const resetSearch = () => {
        setSearch("");
        setSearchFactoryId("");
        setSearchTxnType("");

        router.get(
            "/inventory-txns",
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();

        createForm.post("/inventory-txns", {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingRow) return;

        editForm.put(`/inventory-txns/${editingRow.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const handleDelete = (row: InventoryTxnRow) => {
        if (!confirm(`Are you sure you want to delete inventory transaction #${row.id}?`)) {
            return;
        }

        router.delete(`/inventory-txns/${row.id}`, {
            preserveScroll: true,
        });
    };

    const paginationLinks = useMemo(() => {
        return inventoryTxns?.links || [];
    }, [inventoryTxns]);

    const selectedCreateFactoryId = Number(createForm.data.factory_id || 0);
    const selectedEditFactoryId = Number(editForm.data.factory_id || 0);

    const filteredCreateProducts = products.filter(
        (item) => Number(item.factory_id) === selectedCreateFactoryId
    );

    const filteredEditProducts = products.filter(
        (item) => Number(item.factory_id) === selectedEditFactoryId
    );

    const filteredCreateBuyerOrders = buyerOrders.filter(
        (item) => Number(item.factory_id) === selectedCreateFactoryId
    );

    const filteredEditBuyerOrders = buyerOrders.filter(
        (item) => Number(item.factory_id) === selectedEditFactoryId
    );

    const filteredCreatePurchases = purchases.filter(
        (item) => Number(item.factory_id) === selectedCreateFactoryId
    );

    const filteredEditPurchases = purchases.filter(
        (item) => Number(item.factory_id) === selectedEditFactoryId
    );

    const createQtyIn = Number(createForm.data.qty_in || 0);
    const createQtyOut = Number(createForm.data.qty_out || 0);
    const createUnitCost = Number(createForm.data.unit_cost || 0);
    const createAmount = ((createQtyIn - createQtyOut) * createUnitCost).toFixed(6);

    const editQtyIn = Number(editForm.data.qty_in || 0);
    const editQtyOut = Number(editForm.data.qty_out || 0);
    const editUnitCost = Number(editForm.data.unit_cost || 0);
    const editAmount = ((editQtyIn - editQtyOut) * editUnitCost).toFixed(6);

    const txnTypeColor = (
        type: string
    ): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
        if (type === "PURCHASE_IN") return "success";
        if (type === "PRODUCTION_RAW_OUT") return "warning";
        if (type === "FG_IN") return "primary";
        if (type === "SHIPMENT_OUT") return "secondary";
        if (type === "DAMAGE_OUT") return "error";
        if (type === "ADJUSTMENT_IN") return "success";
        return "warning";
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Transactions" />

            <Box sx={{ p: 3 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ xs: "stretch", md: "center" }}
                        justifyContent="space-between"
                        spacing={2}
                        mb={3}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                Inventory Transaction Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create, update, search and delete inventory transactions
                            </Typography>
                        </Box>

                        <Button variant="contained" onClick={openCreateModal}>
                            Add Inventory Transaction
                        </Button>
                    </Stack>

                    {(flash?.success || flash?.error) && (
                        <Stack spacing={2} mb={3}>
                            {flash?.success && <Alert severity="success">{flash.success}</Alert>}
                            {flash?.error && <Alert severity="error">{flash.error}</Alert>}
                        </Stack>
                    )}

                    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                        <form onSubmit={submitSearch}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <TextField
                                        fullWidth
                                        label="Search by product, sku, order no, purchase no or note"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Factory</InputLabel>
                                        <Select
                                            label="Factory"
                                            value={searchFactoryId}
                                            onChange={(e) => setSearchFactoryId(e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {factories.map((factory) => (
                                                <MenuItem key={factory.id} value={factory.id}>
                                                    {factory.name} ({factory.code})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Txn Type</InputLabel>
                                        <Select
                                            label="Txn Type"
                                            value={searchTxnType}
                                            onChange={(e) => setSearchTxnType(e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {txnTypes.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SearchIcon />}
                                        sx={{ height: 56 }}
                                    >
                                        Search
                                    </Button>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                                    <Button
                                        fullWidth
                                        type="button"
                                        variant="outlined"
                                        startIcon={<RestartAltIcon />}
                                        onClick={resetSearch}
                                        sx={{ height: 56 }}
                                    >
                                        Reset
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={70}>ID</TableCell>
                                    <TableCell>Factory</TableCell>
                                    <TableCell width={170}>Txn Date</TableCell>
                                    <TableCell width={180}>Txn Type</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell width={90}>Qty In</TableCell>
                                    <TableCell width={90}>Qty Out</TableCell>
                                    <TableCell width={100}>Unit Cost</TableCell>
                                    <TableCell width={110}>Amount</TableCell>
                                    <TableCell width={110}>Ref Table</TableCell>
                                    <TableCell width={90}>Ref ID</TableCell>
                                    <TableCell align="right" width={150}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {inventoryTxns.data.length > 0 ? (
                                    inventoryTxns.data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                {row.factory ? `${row.factory.name} (${row.factory.code})` : "-"}
                                            </TableCell>
                                            <TableCell>{row.txn_date}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.txn_type}
                                                    color={txnTypeColor(row.txn_type)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.product ? `${row.product.name} (${row.product.sku})` : "-"}
                                            </TableCell>
                                            <TableCell>{row.qty_in}</TableCell>
                                            <TableCell>{row.qty_out}</TableCell>
                                            <TableCell>{row.unit_cost}</TableCell>
                                            <TableCell>{row.amount}</TableCell>
                                            <TableCell>{row.ref_table}</TableCell>
                                            <TableCell>{row.ref_id || "-"}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => openEditModal(row)}
                                                >
                                                    <EditIcon />
                                                </IconButton>

                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(row)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={12} align="center">
                                            <Typography py={3} color="text.secondary">
                                                No inventory transactions found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={2}
                        mt={3}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {inventoryTxns.from ?? 0} to {inventoryTxns.to ?? 0} of {inventoryTxns.total} entries
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {paginationLinks.map((link, index) => {
                                const label = link.label
                                    .replace("&laquo; Previous", "Previous")
                                    .replace("Next &raquo;", "Next")
                                    .replace("&laquo;", "")
                                    .replace("&raquo;", "");

                                return (
                                    <Button
                                        key={index}
                                        size="small"
                                        variant={link.active ? "contained" : "outlined"}
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </Stack>
                    </Stack>
                </Paper>
            </Box>

            <Dialog open={openCreate} onClose={closeCreateModal} fullWidth maxWidth="lg">
                <DialogTitle>Add Inventory Transaction</DialogTitle>
                <form onSubmit={submitCreate}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!createForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={createForm.data.factory_id}
                                        onChange={(e) => {
                                            createForm.setData({
                                                ...createForm.data,
                                                factory_id: String(e.target.value),
                                                product_id: "",
                                                buyer_order_id: "",
                                                purchase_id: "",
                                            });
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Select Factory</em>
                                        </MenuItem>

                                        {factories.map((factory) => (
                                            <MenuItem key={factory.id} value={String(factory.id)}>
                                                {factory.name} ({factory.code})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{createForm.errors.factory_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Txn Date"
                                    type="datetime-local"
                                    value={createForm.data.txn_date}
                                    onChange={(e) => createForm.setData("txn_date", e.target.value)}
                                    error={!!createForm.errors.txn_date}
                                    helperText={createForm.errors.txn_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!createForm.errors.txn_type}>
                                    <InputLabel>Txn Type</InputLabel>
                                    <Select
                                        label="Txn Type"
                                        value={createForm.data.txn_type}
                                        onChange={(e) => createForm.setData("txn_type", e.target.value)}
                                    >
                                        {txnTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{createForm.errors.txn_type}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!createForm.errors.product_id}
                                    disabled={!createForm.data.factory_id}
                                >
                                    <InputLabel>Product</InputLabel>
                                    <Select
                                        label="Product"
                                        value={createForm.data.product_id}
                                        onChange={(e) => createForm.setData("product_id", String(e.target.value))}
                                    >
                                        {filteredCreateProducts.length > 0 ? (
                                            filteredCreateProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku}) [{product.type}]
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {createForm.data.factory_id
                                                    ? "No products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{createForm.errors.product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Qty In"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.qty_in}
                                    onChange={(e) => createForm.setData("qty_in", e.target.value)}
                                    error={!!createForm.errors.qty_in}
                                    helperText={createForm.errors.qty_in}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Qty Out"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.qty_out}
                                    onChange={(e) => createForm.setData("qty_out", e.target.value)}
                                    error={!!createForm.errors.qty_out}
                                    helperText={createForm.errors.qty_out}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Unit Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.unit_cost}
                                    onChange={(e) => createForm.setData("unit_cost", e.target.value)}
                                    error={!!createForm.errors.unit_cost}
                                    helperText={createForm.errors.unit_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Amount"
                                    value={createAmount}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!createForm.errors.ref_table}>
                                    <InputLabel>Ref Table</InputLabel>
                                    <Select
                                        label="Ref Table"
                                        value={createForm.data.ref_table}
                                        onChange={(e) => createForm.setData("ref_table", e.target.value)}
                                    >
                                        {refTables.map((item) => (
                                            <MenuItem key={item} value={item}>
                                                {item}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{createForm.errors.ref_table}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Ref ID"
                                    type="number"
                                    value={createForm.data.ref_id}
                                    onChange={(e) => createForm.setData("ref_id", e.target.value)}
                                    error={!!createForm.errors.ref_id}
                                    helperText={createForm.errors.ref_id}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!createForm.errors.buyer_order_id}>
                                    <InputLabel>Buyer Order</InputLabel>
                                    <Select
                                        label="Buyer Order"
                                        value={createForm.data.buyer_order_id}
                                        onChange={(e) => createForm.setData("buyer_order_id", String(e.target.value))}
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        {filteredCreateBuyerOrders.map((item) => (
                                            <MenuItem key={item.id} value={String(item.id)}>
                                                {item.buyer_order_no}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{createForm.errors.buyer_order_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Step ID"
                                    type="number"
                                    value={createForm.data.step_id}
                                    onChange={(e) => createForm.setData("step_id", e.target.value)}
                                    error={!!createForm.errors.step_id}
                                    helperText={createForm.errors.step_id || "Production step module not created yet"}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!createForm.errors.purchase_id}>
                                    <InputLabel>Purchase</InputLabel>
                                    <Select
                                        label="Purchase"
                                        value={createForm.data.purchase_id}
                                        onChange={(e) => createForm.setData("purchase_id", String(e.target.value))}
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        {filteredCreatePurchases.map((item) => (
                                            <MenuItem key={item.id} value={String(item.id)}>
                                                {item.purchase_no}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{createForm.errors.purchase_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Shipment ID"
                                    type="number"
                                    value={createForm.data.shipment_id}
                                    onChange={(e) => createForm.setData("shipment_id", e.target.value)}
                                    error={!!createForm.errors.shipment_id}
                                    helperText={createForm.errors.shipment_id || "Shipment module not created yet"}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Note"
                                    value={createForm.data.note}
                                    onChange={(e) => createForm.setData("note", e.target.value)}
                                    error={!!createForm.errors.note}
                                    helperText={createForm.errors.note}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={closeCreateModal}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={createForm.processing}>
                            {createForm.processing ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="lg">
                <DialogTitle>Edit Inventory Transaction</DialogTitle>
                <form onSubmit={submitEdit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!editForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={editForm.data.factory_id}
                                        onChange={(e) => {
                                            editForm.setData({
                                                ...editForm.data,
                                                factory_id: String(e.target.value),
                                                product_id: "",
                                                buyer_order_id: "",
                                                purchase_id: "",
                                            });
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Select Factory</em>
                                        </MenuItem>

                                        {factories.map((factory) => (
                                            <MenuItem key={factory.id} value={String(factory.id)}>
                                                {factory.name} ({factory.code})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{editForm.errors.factory_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Txn Date"
                                    type="datetime-local"
                                    value={editForm.data.txn_date}
                                    onChange={(e) => editForm.setData("txn_date", e.target.value)}
                                    error={!!editForm.errors.txn_date}
                                    helperText={editForm.errors.txn_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!editForm.errors.txn_type}>
                                    <InputLabel>Txn Type</InputLabel>
                                    <Select
                                        label="Txn Type"
                                        value={editForm.data.txn_type}
                                        onChange={(e) => editForm.setData("txn_type", e.target.value)}
                                    >
                                        {txnTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{editForm.errors.txn_type}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!editForm.errors.product_id}
                                    disabled={!editForm.data.factory_id}
                                >
                                    <InputLabel>Product</InputLabel>
                                    <Select
                                        label="Product"
                                        value={editForm.data.product_id}
                                        onChange={(e) => editForm.setData("product_id", String(e.target.value))}
                                    >
                                        {filteredEditProducts.length > 0 ? (
                                            filteredEditProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku}) [{product.type}]
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {editForm.data.factory_id
                                                    ? "No products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{editForm.errors.product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Qty In"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.qty_in}
                                    onChange={(e) => editForm.setData("qty_in", e.target.value)}
                                    error={!!editForm.errors.qty_in}
                                    helperText={editForm.errors.qty_in}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Qty Out"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.qty_out}
                                    onChange={(e) => editForm.setData("qty_out", e.target.value)}
                                    error={!!editForm.errors.qty_out}
                                    helperText={editForm.errors.qty_out}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Unit Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.unit_cost}
                                    onChange={(e) => editForm.setData("unit_cost", e.target.value)}
                                    error={!!editForm.errors.unit_cost}
                                    helperText={editForm.errors.unit_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Amount"
                                    value={editAmount}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!editForm.errors.ref_table}>
                                    <InputLabel>Ref Table</InputLabel>
                                    <Select
                                        label="Ref Table"
                                        value={editForm.data.ref_table}
                                        onChange={(e) => editForm.setData("ref_table", e.target.value)}
                                    >
                                        {refTables.map((item) => (
                                            <MenuItem key={item} value={item}>
                                                {item}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{editForm.errors.ref_table}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Ref ID"
                                    type="number"
                                    value={editForm.data.ref_id}
                                    onChange={(e) => editForm.setData("ref_id", e.target.value)}
                                    error={!!editForm.errors.ref_id}
                                    helperText={editForm.errors.ref_id}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!editForm.errors.buyer_order_id}>
                                    <InputLabel>Buyer Order</InputLabel>
                                    <Select
                                        label="Buyer Order"
                                        value={editForm.data.buyer_order_id}
                                        onChange={(e) => editForm.setData("buyer_order_id", String(e.target.value))}
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        {filteredEditBuyerOrders.map((item) => (
                                            <MenuItem key={item.id} value={String(item.id)}>
                                                {item.buyer_order_no}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{editForm.errors.buyer_order_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Step ID"
                                    type="number"
                                    value={editForm.data.step_id}
                                    onChange={(e) => editForm.setData("step_id", e.target.value)}
                                    error={!!editForm.errors.step_id}
                                    helperText={editForm.errors.step_id || "Production step module not created yet"}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!editForm.errors.purchase_id}>
                                    <InputLabel>Purchase</InputLabel>
                                    <Select
                                        label="Purchase"
                                        value={editForm.data.purchase_id}
                                        onChange={(e) => editForm.setData("purchase_id", String(e.target.value))}
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        {filteredEditPurchases.map((item) => (
                                            <MenuItem key={item.id} value={String(item.id)}>
                                                {item.purchase_no}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{editForm.errors.purchase_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Shipment ID"
                                    type="number"
                                    value={editForm.data.shipment_id}
                                    onChange={(e) => editForm.setData("shipment_id", e.target.value)}
                                    error={!!editForm.errors.shipment_id}
                                    helperText={editForm.errors.shipment_id || "Shipment module not created yet"}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Note"
                                    value={editForm.data.note}
                                    onChange={(e) => editForm.setData("note", e.target.value)}
                                    error={!!editForm.errors.note}
                                    helperText={editForm.errors.note}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={closeEditModal}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={editForm.processing}>
                            {editForm.processing ? "Updating..." : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AppLayout>
    );
}
