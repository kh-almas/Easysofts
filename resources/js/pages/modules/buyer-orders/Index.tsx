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
    sku: string;
    name: string;
};

type BuyerOrderRow = {
    id: number;
    factory_id: number;
    buyer_name: string;
    buyer_order_no: string;
    order_date: string;
    delivery_date?: string | null;
    fg_product_id: number;
    order_qty: string | number;
    planned_start_date?: string | null;
    planned_end_date?: string | null;
    status: "draft" | "confirmed" | "in_production" | "ready" | "shipped" | "cancelled";
    produced_qty: string | number;
    shipped_qty: string | number;
    created_by: number;
    factory?: {
        id: number;
        name: string;
        code: string;
    };
    fg_product?: {
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

type BuyerOrdersPageProps = {
    buyerOrders: {
        data: BuyerOrderRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
    factories: FactoryOption[];
    fgProducts: ProductOption[];
    filters: {
        q?: string;
        factory_id?: number | string;
        status?: string;
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
        title: "Buyer Orders",
        href: "/buyer-orders",
    },
];

const defaultFormData = {
    factory_id: "",
    buyer_name: "",
    buyer_order_no: "",
    order_date: "",
    delivery_date: "",
    fg_product_id: "",
    order_qty: "0",
    planned_start_date: "",
    planned_end_date: "",
    status: "draft",
    produced_qty: "0",
    shipped_qty: "0",
};

export default function Index({
                                  buyerOrders,
                                  factories,
                                  fgProducts,
                                  filters,
                              }: BuyerOrdersPageProps) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters?.q || "");
    const [searchFactoryId, setSearchFactoryId] = useState(filters?.factory_id ?? "");
    const [searchStatus, setSearchStatus] = useState(filters?.status || "");

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingRow, setEditingRow] = useState<BuyerOrderRow | null>(null);

    const createForm = useForm({
        factory_id: "",
        buyer_name: "",
        buyer_order_no: "",
        order_date: "",
        delivery_date: "",
        fg_product_id: "",
        order_qty: "0",
        planned_start_date: "",
        planned_end_date: "",
        status: "draft",
        produced_qty: "0",
        shipped_qty: "0",
    });

    const editForm = useForm({
        factory_id: "",
        buyer_name: "",
        buyer_order_no: "",
        order_date: "",
        delivery_date: "",
        fg_product_id: "",
        order_qty: "0",
        planned_start_date: "",
        planned_end_date: "",
        status: "draft",
        produced_qty: "0",
        shipped_qty: "0",
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

    const openEditModal = (row: BuyerOrderRow) => {
        setEditingRow(row);
        editForm.setData({
            factory_id: String(row.factory_id ?? ""),
            buyer_name: row.buyer_name || "",
            buyer_order_no: row.buyer_order_no || "",
            order_date: row.order_date || "",
            delivery_date: row.delivery_date || "",
            fg_product_id: String(row.fg_product_id ?? ""),
            order_qty: String(row.order_qty ?? "0"),
            planned_start_date: row.planned_start_date || "",
            planned_end_date: row.planned_end_date || "",
            status: row.status || "draft",
            produced_qty: String(row.produced_qty ?? "0"),
            shipped_qty: String(row.shipped_qty ?? "0"),
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
            "/buyer-orders",
            {
                q: search,
                factory_id: searchFactoryId,
                status: searchStatus,
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
        setSearchStatus("");

        router.get(
            "/buyer-orders",
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();

        createForm.post("/buyer-orders", {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingRow) return;

        editForm.put(`/buyer-orders/${editingRow.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const handleDelete = (row: BuyerOrderRow) => {
        if (!confirm(`Are you sure you want to delete buyer order "${row.buyer_order_no}"?`)) {
            return;
        }

        router.delete(`/buyer-orders/${row.id}`, {
            preserveScroll: true,
        });
    };

    const paginationLinks = useMemo(() => {
        return buyerOrders?.links || [];
    }, [buyerOrders]);

    const selectedCreateFactoryId = Number(createForm.data.factory_id || 0);
    const selectedEditFactoryId = Number(editForm.data.factory_id || 0);

    const filteredCreateFgProducts = fgProducts.filter(
        (item) => Number(item.factory_id) === selectedCreateFactoryId
    );

    const filteredEditFgProducts = fgProducts.filter(
        (item) => Number(item.factory_id) === selectedEditFactoryId
    );

    const statusColor = (
        status: string
    ): "default" | "warning" | "info" | "success" | "error" => {
        if (status === "draft") return "default";
        if (status === "confirmed") return "info";
        if (status === "in_production") return "warning";
        if (status === "ready") return "success";
        if (status === "shipped") return "success";
        return "error";
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buyer Orders" />

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
                                Buyer Order Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create, update, search and delete buyer orders
                            </Typography>
                        </Box>

                        <Button variant="contained" onClick={openCreateModal}>
                            Add Buyer Order
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
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Search by buyer, order no, FG name or SKU"
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
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            label="Status"
                                            value={searchStatus}
                                            onChange={(e) => setSearchStatus(e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="draft">Draft</MenuItem>
                                            <MenuItem value="confirmed">Confirmed</MenuItem>
                                            <MenuItem value="in_production">In Production</MenuItem>
                                            <MenuItem value="ready">Ready</MenuItem>
                                            <MenuItem value="shipped">Shipped</MenuItem>
                                            <MenuItem value="cancelled">Cancelled</MenuItem>
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
                                    <TableCell>Buyer</TableCell>
                                    <TableCell>Order No</TableCell>
                                    <TableCell>FG Product</TableCell>
                                    <TableCell width={110}>Order Qty</TableCell>
                                    <TableCell width={120}>Produced Qty</TableCell>
                                    <TableCell width={120}>Shipped Qty</TableCell>
                                    <TableCell width={120}>Order Date</TableCell>
                                    <TableCell width={120}>Delivery</TableCell>
                                    <TableCell width={140}>Status</TableCell>
                                    <TableCell align="right" width={150}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {buyerOrders.data.length > 0 ? (
                                    buyerOrders.data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                {row.factory ? `${row.factory.name} (${row.factory.code})` : "-"}
                                            </TableCell>
                                            <TableCell>{row.buyer_name}</TableCell>
                                            <TableCell>{row.buyer_order_no}</TableCell>
                                            <TableCell>
                                                {row.fg_product
                                                    ? `${row.fg_product.name} (${row.fg_product.sku})`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>{row.order_qty}</TableCell>
                                            <TableCell>{row.produced_qty}</TableCell>
                                            <TableCell>{row.shipped_qty}</TableCell>
                                            <TableCell>{row.order_date}</TableCell>
                                            <TableCell>{row.delivery_date || "-"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    color={statusColor(row.status)}
                                                    size="small"
                                                />
                                            </TableCell>
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
                                                No buyer orders found.
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
                            Showing {buyerOrders.from ?? 0} to {buyerOrders.to ?? 0} of {buyerOrders.total} entries
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
                <DialogTitle>Add Buyer Order</DialogTitle>
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
                                                fg_product_id: "",
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
                                    error={!!createForm.errors.fg_product_id}
                                    disabled={!createForm.data.factory_id}
                                >
                                    <InputLabel>FG Product</InputLabel>
                                    <Select
                                        label="FG Product"
                                        value={createForm.data.fg_product_id}
                                        onChange={(e) => createForm.setData("fg_product_id", String(e.target.value))}
                                    >
                                        {filteredCreateFgProducts.length > 0 ? (
                                            filteredCreateFgProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {createForm.data.factory_id
                                                    ? "No FG products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{createForm.errors.fg_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Buyer Name"
                                    value={createForm.data.buyer_name}
                                    onChange={(e) => createForm.setData("buyer_name", e.target.value)}
                                    error={!!createForm.errors.buyer_name}
                                    helperText={createForm.errors.buyer_name}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Buyer Order No"
                                    value={createForm.data.buyer_order_no}
                                    onChange={(e) => createForm.setData("buyer_order_no", e.target.value)}
                                    error={!!createForm.errors.buyer_order_no}
                                    helperText={createForm.errors.buyer_order_no}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Order Date"
                                    type="date"
                                    value={createForm.data.order_date}
                                    onChange={(e) => createForm.setData("order_date", e.target.value)}
                                    error={!!createForm.errors.order_date}
                                    helperText={createForm.errors.order_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Delivery Date"
                                    type="date"
                                    value={createForm.data.delivery_date}
                                    onChange={(e) => createForm.setData("delivery_date", e.target.value)}
                                    error={!!createForm.errors.delivery_date}
                                    helperText={createForm.errors.delivery_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Order Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.order_qty}
                                    onChange={(e) => createForm.setData("order_qty", e.target.value)}
                                    error={!!createForm.errors.order_qty}
                                    helperText={createForm.errors.order_qty}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Planned Start Date"
                                    type="date"
                                    value={createForm.data.planned_start_date}
                                    onChange={(e) => createForm.setData("planned_start_date", e.target.value)}
                                    error={!!createForm.errors.planned_start_date}
                                    helperText={createForm.errors.planned_start_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Planned End Date"
                                    type="date"
                                    value={createForm.data.planned_end_date}
                                    onChange={(e) => createForm.setData("planned_end_date", e.target.value)}
                                    error={!!createForm.errors.planned_end_date}
                                    helperText={createForm.errors.planned_end_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!createForm.errors.status}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={createForm.data.status}
                                        onChange={(e) => createForm.setData("status", e.target.value)}
                                    >
                                        <MenuItem value="draft">Draft</MenuItem>
                                        <MenuItem value="confirmed">Confirmed</MenuItem>
                                        <MenuItem value="in_production">In Production</MenuItem>
                                        <MenuItem value="ready">Ready</MenuItem>
                                        <MenuItem value="shipped">Shipped</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                    <FormHelperText>{createForm.errors.status}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Produced Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.produced_qty}
                                    onChange={(e) => createForm.setData("produced_qty", e.target.value)}
                                    error={!!createForm.errors.produced_qty}
                                    helperText={createForm.errors.produced_qty}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Shipped Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={createForm.data.shipped_qty}
                                    onChange={(e) => createForm.setData("shipped_qty", e.target.value)}
                                    error={!!createForm.errors.shipped_qty}
                                    helperText={createForm.errors.shipped_qty}
                                    fullWidth
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
                <DialogTitle>Edit Buyer Order</DialogTitle>
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
                                                fg_product_id: "",
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
                                    error={!!editForm.errors.fg_product_id}
                                    disabled={!editForm.data.factory_id}
                                >
                                    <InputLabel>FG Product</InputLabel>
                                    <Select
                                        label="FG Product"
                                        value={editForm.data.fg_product_id}
                                        onChange={(e) => editForm.setData("fg_product_id", String(e.target.value))}
                                    >
                                        {filteredEditFgProducts.length > 0 ? (
                                            filteredEditFgProducts.map((product) => (
                                                <MenuItem key={product.id} value={String(product.id)}>
                                                    {product.name} ({product.sku})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">
                                                {editForm.data.factory_id
                                                    ? "No FG products found for this factory"
                                                    : "Select factory first"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText>{editForm.errors.fg_product_id}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Buyer Name"
                                    value={editForm.data.buyer_name}
                                    onChange={(e) => editForm.setData("buyer_name", e.target.value)}
                                    error={!!editForm.errors.buyer_name}
                                    helperText={editForm.errors.buyer_name}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Buyer Order No"
                                    value={editForm.data.buyer_order_no}
                                    onChange={(e) => editForm.setData("buyer_order_no", e.target.value)}
                                    error={!!editForm.errors.buyer_order_no}
                                    helperText={editForm.errors.buyer_order_no}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Order Date"
                                    type="date"
                                    value={editForm.data.order_date}
                                    onChange={(e) => editForm.setData("order_date", e.target.value)}
                                    error={!!editForm.errors.order_date}
                                    helperText={editForm.errors.order_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Delivery Date"
                                    type="date"
                                    value={editForm.data.delivery_date}
                                    onChange={(e) => editForm.setData("delivery_date", e.target.value)}
                                    error={!!editForm.errors.delivery_date}
                                    helperText={editForm.errors.delivery_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Order Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.order_qty}
                                    onChange={(e) => editForm.setData("order_qty", e.target.value)}
                                    error={!!editForm.errors.order_qty}
                                    helperText={editForm.errors.order_qty}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Planned Start Date"
                                    type="date"
                                    value={editForm.data.planned_start_date}
                                    onChange={(e) => editForm.setData("planned_start_date", e.target.value)}
                                    error={!!editForm.errors.planned_start_date}
                                    helperText={editForm.errors.planned_start_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Planned End Date"
                                    type="date"
                                    value={editForm.data.planned_end_date}
                                    onChange={(e) => editForm.setData("planned_end_date", e.target.value)}
                                    error={!!editForm.errors.planned_end_date}
                                    helperText={editForm.errors.planned_end_date}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth error={!!editForm.errors.status}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData("status", e.target.value)}
                                    >
                                        <MenuItem value="draft">Draft</MenuItem>
                                        <MenuItem value="confirmed">Confirmed</MenuItem>
                                        <MenuItem value="in_production">In Production</MenuItem>
                                        <MenuItem value="ready">Ready</MenuItem>
                                        <MenuItem value="shipped">Shipped</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                    <FormHelperText>{editForm.errors.status}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Produced Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.produced_qty}
                                    onChange={(e) => editForm.setData("produced_qty", e.target.value)}
                                    error={!!editForm.errors.produced_qty}
                                    helperText={editForm.errors.produced_qty}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Shipped Qty"
                                    type="number"
                                    inputProps={{ step: "0.000001", min: 0 }}
                                    value={editForm.data.shipped_qty}
                                    onChange={(e) => editForm.setData("shipped_qty", e.target.value)}
                                    error={!!editForm.errors.shipped_qty}
                                    helperText={editForm.errors.shipped_qty}
                                    fullWidth
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
