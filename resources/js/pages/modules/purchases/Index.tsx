import React, { FormEvent, useMemo, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";

import {
    Alert,
    Box,
    Button,
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
    sku: string;
    name: string;
};

type PurchaseRow = {
    id: number;
    factory_id: number;
    purchase_no: string;
    supplier_name: string;
    purchase_date: string;
    raw_product_id: number;
    qty: string | number;
    unit_price: string | number;
    total_amount: string | number;
    other_cost: string | number;
    grand_total: string | number;
    notes?: string | null;
    created_by: number;
    factory?: {
        id: number;
        name: string;
        code: string;
    };
    raw_product?: {
        id: number;
        factory_id: number;
        type: string;
        sku: string;
        name: string;
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

type PurchasesPageProps = {
    purchases: {
        data: PurchaseRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
    factories: FactoryOption[];
    rawProducts: ProductOption[];
    filters: {
        q?: string;
        factory_id?: number | string;
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
        title: "Purchases",
        href: "/purchases",
    },
];

const defaultFormData = {
    factory_id: "",
    purchase_no: "",
    supplier_name: "",
    purchase_date: "",
    raw_product_id: "",
    qty: "0",
    unit_price: "0",
    other_cost: "0",
    notes: "",
};

export default function Index({
                                  purchases,
                                  factories,
                                  rawProducts,
                                  filters,
                              }: PurchasesPageProps) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.q || "");
    const [searchFactoryId, setSearchFactoryId] = useState(filters?.factory_id ?? "");

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingRow, setEditingRow] = useState<PurchaseRow | null>(null);

    const createForm = useForm({
        factory_id: "",
        purchase_no: "",
        supplier_name: "",
        purchase_date: "",
        raw_product_id: "",
        qty: "0",
        unit_price: "0",
        other_cost: "0",
        notes: "",
    });

    const editForm = useForm({
        factory_id: "",
        purchase_no: "",
        supplier_name: "",
        purchase_date: "",
        raw_product_id: "",
        qty: "0",
        unit_price: "0",
        other_cost: "0",
        notes: "",
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

    const openEditModal = (row: PurchaseRow) => {
        setEditingRow(row);
        editForm.setData({
            factory_id: String(row.factory_id ?? ""),
            purchase_no: row.purchase_no || "",
            supplier_name: row.supplier_name || "",
            purchase_date: row.purchase_date || "",
            raw_product_id: String(row.raw_product_id ?? ""),
            qty: String(row.qty ?? "0"),
            unit_price: String(row.unit_price ?? "0"),
            other_cost: String(row.other_cost ?? "0"),
            notes: row.notes || "",
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
            "/purchases",
            {
                q: search,
                factory_id: searchFactoryId,
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

        router.get(
            "/purchases",
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();

        createForm.post("/purchases", {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingRow) return;

        editForm.put(`/purchases/${editingRow.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const handleDelete = (row: PurchaseRow) => {
        if (!confirm(`Are you sure you want to delete purchase "${row.purchase_no}"?`)) {
            return;
        }

        router.delete(`/purchases/${row.id}`, {
            preserveScroll: true,
        });
    };

    const paginationLinks = useMemo(() => {
        return purchases?.links || [];
    }, [purchases]);

    const selectedCreateFactoryId = Number(createForm.data.factory_id || 0);
    const selectedEditFactoryId = Number(editForm.data.factory_id || 0);

    const filteredCreateRawProducts = rawProducts.filter(
        (item) => Number(item.factory_id) === selectedCreateFactoryId
    );

    const filteredEditRawProducts = rawProducts.filter(
        (item) => Number(item.factory_id) === selectedEditFactoryId
    );

    const createQty = Number(createForm.data.qty || 0);
    const createUnitPrice = Number(createForm.data.unit_price || 0);
    const createOtherCost = Number(createForm.data.other_cost || 0);
    const createTotalAmount = (createQty * createUnitPrice).toFixed(6);
    const createGrandTotal = (createQty * createUnitPrice + createOtherCost).toFixed(6);

    const editQty = Number(editForm.data.qty || 0);
    const editUnitPrice = Number(editForm.data.unit_price || 0);
    const editOtherCost = Number(editForm.data.other_cost || 0);
    const editTotalAmount = (editQty * editUnitPrice).toFixed(6);
    const editGrandTotal = (editQty * editUnitPrice + editOtherCost).toFixed(6);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchases" />

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
                                Purchase Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create, update, search and delete purchases
                            </Typography>
                        </Box>

                        <Button variant="contained" onClick={openCreateModal}>
                            Add Purchase
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
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Search by purchase no, supplier, RAW product or SKU"
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

                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
                                    <TableCell>Purchase No</TableCell>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell>RAW Product</TableCell>
                                    <TableCell width={100}>Qty</TableCell>
                                    <TableCell width={110}>Unit Price</TableCell>
                                    <TableCell width={120}>Total Amount</TableCell>
                                    <TableCell width={100}>Other Cost</TableCell>
                                    <TableCell width={120}>Grand Total</TableCell>
                                    <TableCell width={120}>Date</TableCell>
                                    <TableCell align="right" width={150}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {purchases.data.length > 0 ? (
                                    purchases.data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                {row.factory ? `${row.factory.name} (${row.factory.code})` : "-"}
                                            </TableCell>
                                            <TableCell>{row.purchase_no}</TableCell>
                                            <TableCell>{row.supplier_name}</TableCell>
                                            <TableCell>
                                                {row.raw_product
                                                    ? `${row.raw_product.name} (${row.raw_product.sku})`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>{row.qty}</TableCell>
                                            <TableCell>{row.unit_price}</TableCell>
                                            <TableCell>{row.total_amount}</TableCell>
                                            <TableCell>{row.other_cost}</TableCell>
                                            <TableCell>{row.grand_total}</TableCell>
                                            <TableCell>{row.purchase_date}</TableCell>
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
                                                No purchases found.
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
                            Showing {purchases.from ?? 0} to {purchases.to ?? 0} of {purchases.total} entries
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

            <Dialog open={openCreate} onClose={closeCreateModal} fullWidth maxWidth="md">
                <DialogTitle>Add Purchase</DialogTitle>
                <form onSubmit={submitCreate}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!createForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={createForm.data.factory_id}
                                        onChange={(e) => {
                                            createForm.setData({
                                                ...createForm.data,
                                                factory_id: String(e.target.value),
                                                raw_product_id: "",
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

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!createForm.errors.raw_product_id}
                                    disabled={!createForm.data.factory_id}
                                >
                                    <InputLabel>RAW Product</InputLabel>
                                    <Select
                                        label="RAW Product"
                                        value={createForm.data.raw_product_id}
                                        onChange={(e) => createForm.setData("raw_product_id", String(e.target.value))}
                                    >
                                        {filteredCreateRawProducts.length > 0 ? (
                                            filteredCreateRawProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {createForm.data.factory_id
                                                    ? "No RAW products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{createForm.errors.raw_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Purchase No"
                                    value={createForm.data.purchase_no}
                                    onChange={(e) => createForm.setData("purchase_no", e.target.value)}
                                    error={!!createForm.errors.purchase_no}
                                    helperText={createForm.errors.purchase_no}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Supplier Name"
                                    value={createForm.data.supplier_name}
                                    onChange={(e) => createForm.setData("supplier_name", e.target.value)}
                                    error={!!createForm.errors.supplier_name}
                                    helperText={createForm.errors.supplier_name}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Purchase Date"
                                    type="date"
                                    value={createForm.data.purchase_date}
                                    onChange={(e) => createForm.setData("purchase_date", e.target.value)}
                                    error={!!createForm.errors.purchase_date}
                                    helperText={createForm.errors.purchase_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.qty}
                                    onChange={(e) => createForm.setData("qty", e.target.value)}
                                    error={!!createForm.errors.qty}
                                    helperText={createForm.errors.qty}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Unit Price"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.unit_price}
                                    onChange={(e) => createForm.setData("unit_price", e.target.value)}
                                    error={!!createForm.errors.unit_price}
                                    helperText={createForm.errors.unit_price}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Other Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.other_cost}
                                    onChange={(e) => createForm.setData("other_cost", e.target.value)}
                                    error={!!createForm.errors.other_cost}
                                    helperText={createForm.errors.other_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Total Amount"
                                    value={createTotalAmount}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Grand Total"
                                    value={createGrandTotal}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Notes"
                                    value={createForm.data.notes}
                                    onChange={(e) => createForm.setData("notes", e.target.value)}
                                    error={!!createForm.errors.notes}
                                    helperText={createForm.errors.notes}
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

            <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="md">
                <DialogTitle>Edit Purchase</DialogTitle>
                <form onSubmit={submitEdit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={!!editForm.errors.factory_id}>
                                    <InputLabel>Factory</InputLabel>
                                    <Select
                                        label="Factory"
                                        value={editForm.data.factory_id}
                                        onChange={(e) => {
                                            editForm.setData({
                                                ...editForm.data,
                                                factory_id: String(e.target.value),
                                                raw_product_id: "",
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

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl
                                    fullWidth
                                    error={!!editForm.errors.raw_product_id}
                                    disabled={!editForm.data.factory_id}
                                >
                                    <InputLabel>RAW Product</InputLabel>
                                    <Select
                                        label="RAW Product"
                                        value={editForm.data.raw_product_id}
                                        onChange={(e) => editForm.setData("raw_product_id", String(e.target.value))}
                                    >
                                        {filteredEditRawProducts.length > 0 ? (
                                            filteredEditRawProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {editForm.data.factory_id
                                                    ? "No RAW products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{editForm.errors.raw_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Purchase No"
                                    value={editForm.data.purchase_no}
                                    onChange={(e) => editForm.setData("purchase_no", e.target.value)}
                                    error={!!editForm.errors.purchase_no}
                                    helperText={editForm.errors.purchase_no}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Supplier Name"
                                    value={editForm.data.supplier_name}
                                    onChange={(e) => editForm.setData("supplier_name", e.target.value)}
                                    error={!!editForm.errors.supplier_name}
                                    helperText={editForm.errors.supplier_name}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Purchase Date"
                                    type="date"
                                    value={editForm.data.purchase_date}
                                    onChange={(e) => editForm.setData("purchase_date", e.target.value)}
                                    error={!!editForm.errors.purchase_date}
                                    helperText={editForm.errors.purchase_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.qty}
                                    onChange={(e) => editForm.setData("qty", e.target.value)}
                                    error={!!editForm.errors.qty}
                                    helperText={editForm.errors.qty}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Unit Price"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.unit_price}
                                    onChange={(e) => editForm.setData("unit_price", e.target.value)}
                                    error={!!editForm.errors.unit_price}
                                    helperText={editForm.errors.unit_price}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Other Cost"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.other_cost}
                                    onChange={(e) => editForm.setData("other_cost", e.target.value)}
                                    error={!!editForm.errors.other_cost}
                                    helperText={editForm.errors.other_cost}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Total Amount"
                                    value={editTotalAmount}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Grand Total"
                                    value={editGrandTotal}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Notes"
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData("notes", e.target.value)}
                                    error={!!editForm.errors.notes}
                                    helperText={editForm.errors.notes}
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
